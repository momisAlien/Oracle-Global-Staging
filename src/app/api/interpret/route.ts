/* ===========================
   AI Interpretation API Route
   POST /api/interpret
   ===========================
   
   실제 Firestore 기반 쿼터 + 엔타이틀먼트 적용
   KST 자정 기준 일일 리셋
*/

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { entitlementPath } from '@/lib/db/paths';
import { EntitlementDoc, TierName } from '@/lib/db/schema';
import { checkAndIncrementQuota } from '@/lib/db/quota';

// AI 응답 구조
interface InterpretationResponse {
    summary: string;
    key_points: string[];
    evidence: {
        system: 'astrology' | 'saju' | 'tarot' | 'synthesis';
        data: Record<string, unknown>;
    };
    guidance: string;
    disclaimers: string[];
    tier: TierName;
    remainingQuestions: number;
    kstDateKey: string;
}

export async function POST(request: NextRequest) {
    try {
        // 1) 인증 확인 — Firebase ID 토큰 검증
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '인증이 필요합니다', code: 'AUTH_REQUIRED' },
                { status: 401 }
            );
        }

        let uid: string;
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

        // 2) 요청 body 파싱
        const body = await request.json();
        const { system, question, birthData, chartData } = body as {
            system: string;
            question: string;
            birthData?: Record<string, unknown>;
            chartData?: Record<string, unknown>;
        };

        if (!system || !question) {
            return NextResponse.json(
                { error: 'system과 question은 필수입니다', code: 'MISSING_PARAMS' },
                { status: 400 }
            );
        }

        // 3) 엔타이틀먼트 조회
        const entDoc = await adminDb.doc(entitlementPath(uid)).get();
        if (!entDoc.exists) {
            return NextResponse.json(
                { error: '엔타이틀먼트를 찾을 수 없습니다. 계정을 먼저 프로비저닝하세요.', code: 'NO_ENTITLEMENT' },
                { status: 403 }
            );
        }

        const entitlement = entDoc.data() as EntitlementDoc;
        const tier = entitlement.tier;

        // 4) 종합 분석 권한 체크
        if (system === 'synthesis' && !entitlement.canSynthesis) {
            return NextResponse.json(
                {
                    error: '종합 분석은 Pro 이상 티어에서만 사용 가능합니다',
                    code: 'SYNTHESIS_DENIED',
                    requiredTier: 'pro',
                },
                { status: 403 }
            );
        }

        // 5) KST 기준 일일 쿼터 체크 + 원자적 증가
        const quotaResult = await checkAndIncrementQuota(
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
                    upgradeCta: tier === 'free'
                        ? '더 많은 질문을 하시려면 Plus 이상으로 업그레이드하세요'
                        : '더 높은 티어로 업그레이드하시면 질문 횟수가 늘어납니다',
                },
                { status: 429 }
            );
        }

        // 6) 티어 기반 깊이 설정
        const depthMap: Record<TierName, string> = {
            free: '간결하게 2-3문장으로 요약하세요.',
            plus: '구조화된 분석을 5-7문장으로 제공하세요.',
            pro: '상세한 분석을 제공하세요. 근거, 맥락, 구체적 조언을 포함하세요.',
            archmage: '1차 분석 후 2차 검증 패스를 수행하세요. 최대 깊이와 다각도 분석을 제공하세요.',
        };

        // 7) 스텁 응답 반환 (Phase 4에서 실제 AI 호출로 교체)
        const response: InterpretationResponse = {
            summary: `[${tier}] ${system} 분석이 처리되었습니다 — AI 연동 후 실제 응답으로 대체됩니다`,
            key_points: [
                'AI API 키 설정 후 실제 분석 결과가 표시됩니다',
                `현재 티어: ${tier}`,
                `최대 토큰: ${entitlement.maxTokens}`,
            ],
            evidence: {
                system: system as 'astrology' | 'saju' | 'tarot',
                data: chartData || {},
            },
            guidance: depthMap[tier],
            disclaimers: [
                '본 서비스는 오락 및 개인적 성찰 목적으로만 제공됩니다.',
            ],
            tier,
            remainingQuestions: quotaResult.remaining,
            kstDateKey: quotaResult.kstDateKey,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('[Interpret API Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '해석 처리 실패' },
            { status: 500 }
        );
    }
}
