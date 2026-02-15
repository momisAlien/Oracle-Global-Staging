/* ===========================
   AI Interpretation API Route
   POST /api/interpret
   ===========================
   
   Firestore 기반 쿼터 + 엔타이틀먼트
   OpenAI (gpt-4o-mini) 기본 + Gemini 2차 검증 (Archmage)
   KST 자정 기준 일일 리셋
*/

import { NextRequest, NextResponse } from 'next/server';
import { interpretFortune } from '@/lib/ai/openai';
import { verifyWithGemini } from '@/lib/ai/gemini';
import type { FortuneSystem, Locale } from '@/lib/ai/prompts';
import type { TierName } from '@/lib/db/schema';

// Amplify 등 서버리스 환경에서 Edge 대신 Node.js 런타임 강제
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // 1) 인증 확인 — Firebase ID 토큰 검증 (실패해도 free 티어로 계속 진행)
        const authHeader = request.headers.get('Authorization');
        let uid: string | null = null;
        let tier: TierName = 'free';
        let quotaResult = { allowed: true, remaining: 5, used: 0, limit: 5, kstDateKey: '' };

        if (authHeader?.startsWith('Bearer ')) {
            try {
                // Firebase Admin을 동적 import로 지연 로드
                const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
                const adminAuth = getAdminAuth();

                const decoded = await adminAuth.verifyIdToken(
                    authHeader.replace('Bearer ', '')
                );
                uid = decoded.uid;

                // 3) 엔타이틀먼트 조회
                try {
                    const { entitlementPath } = await import('@/lib/db/paths');
                    const adminDb = getAdminDb();
                    const entDoc = await adminDb.doc(entitlementPath(uid)).get();

                    if (entDoc.exists) {
                        const entitlement = entDoc.data() as import('@/lib/db/schema').EntitlementDoc;
                        tier = entitlement.tier;

                        // 4) 종합 분석 권한 체크
                        const body_peek = await request.clone().json();
                        if (body_peek.system === 'synthesis' && !entitlement.canSynthesis) {
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
                    // 엔타이틀먼트 조회 실패 시 free 티어로 계속 진행
                }
            } catch (authError) {
                console.warn('[Interpret] Auth verification failed, proceeding as anonymous:', authError);
                // 인증 실패 시 free 티어로 계속 진행 (500 대신 graceful fallback)
            }
        }

        // 2) 요청 body 파싱
        const body = await request.json();
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

        if (!process.env.OPENAI_API_KEY) {
            console.error('[Interpret API Error] Missing OPENAI_API_KEY');
            return NextResponse.json(
                { error: 'AI 서비스 설정이 누락되었습니다', code: 'ENV_CONFIG_ERROR' },
                { status: 500 }
            );
        }

        // 6) OpenAI 해석 호출
        const aiResult = await interpretFortune({
            system: system as FortuneSystem,
            locale,
            tier,
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
        });

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

        // 8) 응답 반환
        return NextResponse.json({
            ...aiResult,
            geminiVerification: geminiVerification || undefined,
            tier,
            quotaRemaining: quotaResult.remaining,
            kstDateKey: quotaResult.kstDateKey,
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
