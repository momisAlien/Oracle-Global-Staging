/* ===========================
   AI Interpretation API Route
   POST /api/interpret
   ===========================
   
   Core+Expand 파이프라인:
   - Core 1회 생성 (temperature=0) → seedKey 기반 캐싱
   - 티어별 Expand (temperature=0.3)
   - luckyElements는 seedKey 기반 결정론적 생성 (LLM 미사용)
   
   가드레일: 운세 도메인 외 질문 차단 (모든 티어 동일)
   테스트 모드: X-Tier-Override 헤더로 티어 시뮬레이션 (TEST_MODE만으로 허용)

   ★ Anti-Abuse 정책:
   - 익명 사용자 PRO/ARCHMAGE 차단
   - 디바이스 기반 1회 트라이얼 (30일)
   - IP 레이트 리밋 (시간당 5회)
   - 로그인 사용자 크레딧 기반 소비
*/

import { NextRequest, NextResponse } from 'next/server';
import { interpretWithCoreExpand } from '@/lib/ai/coreExpand';
import { verifyWithGemini } from '@/lib/ai/gemini';
import type { FortuneSystem, Locale, Tier } from '@/lib/ai/prompts';
import type { TierName } from '@/lib/db/schema';

// Amplify 등 서버리스 환경에서 Edge 대신 Node.js 런타임 강제
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // 1) 인증 확인 — Firebase ID 토큰 검증 (실패해도 free 티어로 계속 진행)
        const authHeader = request.headers.get('Authorization');
        let uid: string | null = null;
        let tier: TierName = 'free';
        let userTier: TierName = 'free'; // 실제 계정 티어
        let quotaResult = { allowed: true, remaining: 5, used: 0, limit: 5, kstDateKey: '' };
        let creditsRemaining = -1; // -1 = not applicable

        // Parse body early to check grade
        const body = await request.json();
        const requestedGrade = body.grade as TierName | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            try {
                // Firebase Admin을 동적 import로 지연 로드
                const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
                const adminAuth = getAdminAuth();

                const decoded = await adminAuth.verifyIdToken(
                    authHeader.replace('Bearer ', '')
                );
                uid = decoded.uid;

                // Determine effective tier: use requested grade if user has credits, else entitlement
                const adminDb = getAdminDb();

                // 3) 엔타이틀먼트 조회
                try {
                    const { entitlementPath } = await import('@/lib/db/paths');
                    const entDoc = await adminDb.doc(entitlementPath(uid)).get();

                    if (entDoc.exists) {
                        const entitlement = entDoc.data() as import('@/lib/db/schema').EntitlementDoc;
                        tier = entitlement.tier;
                        userTier = entitlement.tier;

                        // 4) 종합 분석 권한 체크
                        if (body.system === 'synthesis' && !entitlement.canSynthesis) {
                            return NextResponse.json(
                                {
                                    error: '종합 분석은 Pro 이상 티어에서만 사용 가능합니다',
                                    code: 'SYNTHESIS_DENIED',
                                    requiredTier: 'pro',
                                },
                                { status: 403 }
                            );
                        }

                        // 5) KST 기준 일일 쿼터 체크
                        const { checkAndIncrementQuota } = await import('@/lib/db/quota');
                        quotaResult = await checkAndIncrementQuota(
                            uid,
                            entitlement.dailyQuestionLimit
                        );

                        if (!quotaResult.allowed) {
                            return NextResponse.json(
                                {
                                    error: '오늘의 질문 횟수가 소진되었습니다',
                                    code: 'DAILY_LIMIT_REACHED',
                                    limit: quotaResult.limit,
                                    used: quotaResult.used,
                                    remaining: 0,
                                    kstDateKey: quotaResult.kstDateKey,
                                    resetAt: 'KST 자정 (Asia/Seoul)',
                                },
                                { status: 429 }
                            );
                        }
                    }
                } catch (entError) {
                    console.warn('[Interpret] Entitlement check failed, using free tier:', entError);
                }

                // ★ Credit consumption for requested grade
                if (requestedGrade && requestedGrade !== 'free') {
                    try {
                        const { consumeCredit, getRemainingCredits } = await import('@/lib/db/credits');
                        const creditResult = await consumeCredit(adminDb, uid, requestedGrade);
                        if (creditResult.success) {
                            tier = requestedGrade;
                            creditsRemaining = creditResult.remaining;
                        } else {
                            // No credits for requested grade — check if user has entitlement for it
                            if (userTier !== requestedGrade) {
                                const remaining = await getRemainingCredits(adminDb, uid, requestedGrade);
                                return NextResponse.json(
                                    {
                                        error: '크레딧이 부족합니다',
                                        code: 'CREDITS_EXHAUSTED',
                                        grade: requestedGrade,
                                        remaining: remaining,
                                        purchaseRequired: true,
                                    },
                                    { status: 402 }
                                );
                            }
                        }
                    } catch (creditError) {
                        console.warn('[Interpret] Credit check failed:', creditError);
                    }
                }
            } catch (authError) {
                console.warn('[Interpret] Auth verification failed, proceeding as anonymous:', authError);
            }
        } else {
            // ★ ========== ANONYMOUS USER ANTI-ABUSE ==========

            // 1) Block PRO/ARCHMAGE for anonymous
            if (requestedGrade && ['pro', 'archmage'].includes(requestedGrade)) {
                return NextResponse.json(
                    {
                        error: 'Pro/Archmage 등급은 로그인이 필요합니다',
                        code: 'LOGIN_REQUIRED_FOR_GRADE',
                        requestedGrade,
                    },
                    { status: 401 }
                );
            }

            // Apply requested grade if free/plus
            if (requestedGrade === 'plus') {
                tier = 'plus';
            }

            // 2) IP rate limit
            try {
                const { getAdminDb } = await import('@/lib/firebase/admin');
                const adminDb = getAdminDb();
                const { hashIp } = await import('@/lib/device/token');
                const { checkIpRateLimit } = await import('@/lib/device/abuse');

                const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || request.headers.get('x-real-ip')
                    || '0.0.0.0';
                const ipHash = hashIp(clientIp);

                const ipResult = await checkIpRateLimit(adminDb, ipHash);
                if (!ipResult.allowed) {
                    return NextResponse.json(
                        {
                            error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
                            code: 'IP_RATE_LIMITED',
                        },
                        { status: 429 }
                    );
                }

                // 3) Device-based trial enforcement
                const deviceCookie = request.cookies.get('ta_device')?.value;
                if (deviceCookie) {
                    const deviceId = deviceCookie.split('.')[0]; // Extract UUID part
                    const uaHash = hashIp(request.headers.get('user-agent') || 'unknown');

                    const { checkAnonymousTrial, markTrialUsed } = await import('@/lib/device/abuse');
                    const trialResult = await checkAnonymousTrial(adminDb, deviceId, ipHash, uaHash);

                    if (!trialResult.allowed) {
                        return NextResponse.json(
                            {
                                error: '무료 체험이 만료되었습니다. 로그인 후 이용해 주세요.',
                                code: 'TRIAL_EXHAUSTED',
                                loginRequired: true,
                            },
                            { status: 403 }
                        );
                    }

                    // Mark trial as used AFTER successful AI call (done below)
                    // Store deviceId for later marking
                    (request as unknown as Record<string, string>).__deviceId = deviceId;
                } else {
                    // No device cookie — very suspicious, but allow with strict rules
                    console.warn('[Interpret] Anonymous request without device cookie');
                }
            } catch (abuseError) {
                console.warn('[Interpret] Abuse check failed, proceeding with caution:', abuseError);
            }
        }

        // ★ X-Tier-Override: TEST_MODE만으로 허용 (admin 체크 완화)
        const tierOverride = request.headers.get('X-Tier-Override');
        if (tierOverride) {
            const { isTestMode } = await import('@/lib/featureFlags');
            if (isTestMode()) {
                const validTiers: TierName[] = ['free', 'plus', 'pro', 'archmage'];
                if (validTiers.includes(tierOverride as TierName)) {
                    tier = tierOverride as TierName;
                    console.log(`[Interpret] X-Tier-Override applied: ${tier}`);
                }
            }
        }

        // 2) 요청 body 파싱 (already parsed above)
        const {
            system,
            locale: reqLocale,
            question,
            birthDate,
            birthTime,
            birthPlace,
            isLunar,
            latitude,
            longitude,
            drawnCards,
            chartData,
            gender,
        } = body;

        if (!system) {
            return NextResponse.json(
                { error: 'system은 필수입니다', code: 'MISSING_PARAMS' },
                { status: 400 }
            );
        }

        const validSystems: FortuneSystem[] = ['saju', 'astrology', 'tarot', 'synthesis'];
        if (!validSystems.includes(system)) {
            return NextResponse.json(
                { error: '유효하지 않은 system입니다', code: 'INVALID_SYSTEM' },
                { status: 400 }
            );
        }

        const locale: Locale = ['ko', 'ja', 'en', 'zh'].includes(reqLocale) ? reqLocale : 'ko';

        // ★ 가드레일: 운세 도메인 외 질문 차단 (모든 티어 동일)
        if (question) {
            const { isFortuneQuery } = await import('@/lib/ai/guardrail');
            const guardrailResult = isFortuneQuery(question, locale);
            if (!guardrailResult.allowed) {
                return NextResponse.json(
                    {
                        error: guardrailResult.reason,
                        code: 'FORTUNE_DOMAIN_ONLY',
                    },
                    { status: 403 }
                );
            }
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('[Interpret API Error] Missing OPENAI_API_KEY');
            return NextResponse.json(
                { error: 'AI 서비스 설정이 누락되었습니다', code: 'ENV_CONFIG_ERROR' },
                { status: 500 }
            );
        }

        // 6) Core+Expand 파이프라인
        const aiResult = await interpretWithCoreExpand(
            {
                system: system as FortuneSystem,
                locale,
                question,
                birthDate,
                birthTime,
                birthPlace,
                isLunar,
                latitude,
                longitude,
                drawnCards,
                chartData,
                gender,
            },
            tier as Tier,
            userTier as Tier,
        );

        // ★ Mark anonymous trial as used AFTER successful AI call
        if (!uid) {
            const deviceId = (request as unknown as Record<string, string>).__deviceId;
            if (deviceId) {
                try {
                    const { getAdminDb } = await import('@/lib/firebase/admin');
                    const { markTrialUsed } = await import('@/lib/device/abuse');
                    await markTrialUsed(getAdminDb(), deviceId);
                } catch (markError) {
                    console.warn('[Interpret] Failed to mark trial used:', markError);
                }
            }
        }

        // 7) Archmage 티어 → Gemini 2차 검증
        let geminiVerification = undefined;
        if (tier === 'archmage' && process.env.GEMINI_API_KEY) {
            try {
                geminiVerification = await verifyWithGemini({
                    system: system as FortuneSystem,
                    locale,
                    originalResult: JSON.stringify(aiResult),
                    question,
                    birthDate,
                    birthTime,
                    birthPlace,
                    isLunar,
                    latitude,
                    longitude,
                    drawnCards,
                    chartData,
                });
            } catch (e) {
                console.warn('[Gemini 2nd pass failed]', e);
            }
        }

        const totalLatency = Date.now() - startTime;

        // 8) 응답 반환
        return NextResponse.json({
            ...aiResult,
            geminiVerification: geminiVerification || undefined,
            quotaRemaining: quotaResult.remaining,
            creditsRemaining,
            kstDateKey: quotaResult.kstDateKey,
            meta: {
                ...aiResult.meta,
                userTier,
                effectiveTier: tier,
                latencyMs: totalLatency,
            },
        });
    } catch (error) {
        console.error('[Interpret API Error]', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : '해석 처리 실패',
                code: 'INTERNAL_SERVER_ERROR',
            },
            { status: 500 }
        );
    }
}
