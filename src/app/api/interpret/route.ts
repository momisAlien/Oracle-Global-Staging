/* ===========================
   AI Interpretation API Route
   POST /api/interpret
   ===========================
   
   Firestore 기반 쿼터 + 엔타이틀먼트
   OpenAI (gpt-4o-mini) 기본 + Gemini 2차 검증 (Archmage)
   KST 자정 기준 일일 리셋
*/

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { entitlementPath } from '@/lib/db/paths';
import { EntitlementDoc, TierName } from '@/lib/db/schema';
import { checkAndIncrementQuota } from '@/lib/db/quota';
import { interpretFortune } from '@/lib/ai/openai';
import { verifyWithGemini } from '@/lib/ai/gemini';
import type { FortuneSystem, Locale } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
    try {
        // 1) 인증 확인 — Firebase ID 토큰 검증
        const authHeader = request.headers.get('Authorization');
        let uid: string | null = null;
        let tier: TierName = 'free';
        let quotaResult = { allowed: true, remaining: 5, used: 0, limit: 5, kstDateKey: '' };

        if (authHeader?.startsWith('Bearer ')) {
            try {
                const decoded = await adminAuth.verifyIdToken(
                    authHeader.replace('Bearer ', '')
                );
                uid = decoded.uid;
            } catch {
                return NextResponse.json(
                    { error: '유효하지 않은 토큰입니다', code: 'INVALID_TOKEN' },
                    { status: 401 }
                );
            }

            // 3) 엔타이틀먼트 조회
            const entDoc = await adminDb.doc(entitlementPath(uid)).get();
            if (entDoc.exists) {
                const entitlement = entDoc.data() as EntitlementDoc;
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
        if (tier === 'archmage') {
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
                // Gemini 오류 시 OpenAI 결과만 반환
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
            { error: error instanceof Error ? error.message : '해석 처리 실패' },
            { status: 500 }
        );
    }
}
