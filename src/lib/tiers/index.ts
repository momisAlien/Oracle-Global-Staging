/* ===========================
   RPG 티어 스탯 시스템
   ===========================
   
   각 티어의 RPG 스타일 능력치 매핑
*/

export interface TierStats {
    id: string;
    depth: number;        // 1–5 통찰 깊이 (최대 토큰 길이)
    synthesis: number;    // 0–5 크로스시스템 비전
    foresight: number;    // 1–5 시간적 예지력
    aiPower: number;      // 1–5 신비한 힘 (AI 모델 파워)
}

export const TIER_STATS: Record<string, TierStats> = {
    free: {
        id: 'free',
        depth: 1,
        synthesis: 0,
        foresight: 1,
        aiPower: 1,
    },
    plus: {
        id: 'plus',
        depth: 3,
        synthesis: 1,
        foresight: 2,
        aiPower: 2,
    },
    pro: {
        id: 'pro',
        depth: 4,
        synthesis: 4,
        foresight: 4,
        aiPower: 4,
    },
    archmage: {
        id: 'archmage',
        depth: 5,
        synthesis: 5,
        foresight: 5,
        aiPower: 5,
    },
};

/** 스탯 라벨 (다국어) */
export const STAT_LABELS: Record<string, Record<string, string>> = {
    depth: {
        ko: '통찰 깊이',
        ja: '洞察の深さ',
        en: 'Insight Depth',
        zh: '洞察深度',
    },
    synthesis: {
        ko: '교차 분석력',
        ja: 'クロス分析',
        en: 'Cross-System Vision',
        zh: '交叉分析',
    },
    foresight: {
        ko: '시간적 예지',
        ja: '時間的予知',
        en: 'Temporal Foresight',
        zh: '时间预知',
    },
    aiPower: {
        ko: '신비한 힘',
        ja: '神秘の力',
        en: 'Mystic Power',
        zh: '神秘力量',
    },
};

/** 스탯 아이콘 */
export const STAT_ICONS: Record<string, string> = {
    depth: '🔮',
    synthesis: '🌀',
    foresight: '⏳',
    aiPower: '⚡',
};

/** 티어 목록 */
export const TIER_ORDER = ['free', 'plus', 'pro', 'archmage'] as const;

/** 티어 이름 매핑 */
export const TIER_NAMES: Record<string, Record<string, string>> = {
    free: { ko: '견습 점술사', ja: '見習い占い師', en: 'Apprentice Seer', zh: '学徒占卜师' },
    plus: { ko: '10년 점술사', ja: '十年占い師', en: '10-Year Seer', zh: '十年占卜师' },
    pro: { ko: '100년 대도사', ja: '百年大師', en: '100-Year Grand Seer', zh: '百年大师' },
    archmage: { ko: '아크메이지', ja: 'アークメイジ', en: 'Archmage', zh: '大法师' },
};

/** 티어 색상 */
export const TIER_COLORS: Record<string, string> = {
    free: '#94a3b8',
    plus: '#a78bfa',
    pro: '#f59e0b',
    archmage: '#ef4444',
};

/** 오라 그라디언트 */
export const TIER_AURA: Record<string, string> = {
    free: 'rgba(148,163,184,0.15)',
    plus: 'rgba(167,139,250,0.25)',
    pro: 'rgba(245,158,11,0.3)',
    archmage: 'rgba(239,68,68,0.35)',
};

/* ===========================
   결제 연동용 타입 & 유틸
   (toss provider 등에서 사용)
   =========================== */

export type TierName = 'free' | 'plus' | 'pro' | 'archmage';

export interface PricePlan {
    regularKRW: number;
    launchKRW: number;
    renewalKRW: number;
    promoLabel?: string;
}

export const PRICE_PLANS: Record<string, PricePlan> = {
    free: { regularKRW: 0, launchKRW: 0, renewalKRW: 0 },
    plus: { regularKRW: 30000, launchKRW: 4900, renewalKRW: 19000, promoLabel: 'Plus' },
    pro: { regularKRW: 300000, launchKRW: 10000, renewalKRW: 59000, promoLabel: 'Pro' },
    archmage: { regularKRW: 990000, launchKRW: 49000, renewalKRW: 199000, promoLabel: 'Archmage' },
};

/**
 * 유효 가격 계산 (KRW)
 */
export function getEffectivePrice(
    tier: string,
    isFirstPurchase?: boolean,
    isPromoActive?: boolean,
    _promoUsedFlags?: Record<string, boolean>,
): number {
    const plan = PRICE_PLANS[tier];
    if (!plan) return 0;
    if (tier === 'free') return 0;

    // 런칭 프로모 활성 + 첫 구매
    if (isPromoActive && isFirstPurchase) return plan.launchKRW;
    // 갱신
    if (!isFirstPurchase) return plan.renewalKRW;
    // 정가
    return plan.regularKRW;
}

