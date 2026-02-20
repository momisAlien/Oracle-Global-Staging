/* ===========================
   Tier Comparison API — tier-lab 전용
   POST /api/interpret-tiers
   ===========================
   
   Core 1회 생성 → 4티어 동시 expand → 결과 배열 반환
   TEST_MODE 게이트 (admin 체크 불필요)
*/

import { NextRequest, NextResponse } from 'next/server';
import { interpretAllTiers, type InterpretParams } from '@/lib/ai/coreExpand';
import type { FortuneSystem, Locale } from '@/lib/ai/prompts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // TEST_MODE 게이트
        const { isTestMode } = await import('@/lib/featureFlags');
        if (!isTestMode()) {
            return NextResponse.json(
                { error: 'Tier comparison is only available in test mode', code: 'TEST_MODE_REQUIRED' },
                { status: 403 }
            );
        }

        // 요청 body 파싱
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

        // 가드레일 체크
        if (question) {
            const { isFortuneQuery } = await import('@/lib/ai/guardrail');
            const guardrailResult = isFortuneQuery(question, locale);
            if (!guardrailResult.allowed) {
                return NextResponse.json(
                    { error: guardrailResult.reason, code: 'FORTUNE_DOMAIN_ONLY' },
                    { status: 403 }
                );
            }
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'AI 서비스 설정이 누락되었습니다', code: 'ENV_CONFIG_ERROR' },
                { status: 500 }
            );
        }

        const params: InterpretParams = {
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
        };

        const startTime = Date.now();
        const { tiers, seedKey } = await interpretAllTiers(params);
        const totalLatency = Date.now() - startTime;

        return NextResponse.json({
            tiers,
            seedKey,
            totalLatencyMs: totalLatency,
        });
    } catch (error) {
        console.error('[Interpret-Tiers API Error]', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : '티어 비교 처리 실패',
                code: 'INTERNAL_SERVER_ERROR',
            },
            { status: 500 }
        );
    }
}
