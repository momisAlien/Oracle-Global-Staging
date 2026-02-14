/* ===========================
   Firestore 데이터 스키마 타입 정의
   =========================== */

import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// --- 사용자 ---
export interface UserDoc {
    displayName: string;
    email: string;
    locale: 'ko' | 'ja' | 'en' | 'zh';
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// --- 엔타이틀먼트 ---
export type TierName = 'free' | 'plus' | 'pro' | 'archmage';

export interface EntitlementDoc {
    tier: TierName;
    dailyQuestionLimit: number;
    canSynthesis: boolean;
    maxTokens: number;
    renewalAt: Timestamp | null;
    updatedAt: Timestamp | FieldValue;
}

// --- 일일 사용량 ---
export interface DailyQuotaDoc {
    usedQuestions: number;
    updatedAt: Timestamp | FieldValue;
}

// --- 출생 프로필 (Phase 3) ---
export interface ProfileDoc {
    uid: string;
    name: string;
    birthDate: string;       // YYYY-MM-DD
    birthTime?: string;      // HH:mm
    birthPlace?: string;
    isLunar?: boolean;
    latitude?: number;
    longitude?: number;
    createdAt: Timestamp | FieldValue;
}

// --- 운세 해석 기록 (Phase 3) ---
export interface ReadingDoc {
    uid: string;
    profileId?: string;
    system: 'astrology' | 'saju' | 'tarot' | 'synthesis';
    tier: TierName;
    model: string;
    question: string;
    chartData: Record<string, unknown>;
    interpretation: Record<string, unknown>;
    createdAt: Timestamp | FieldValue;
}

// --- 구독 (Phase 5) ---
export interface SubscriptionDoc {
    uid: string;
    tier: TierName;
    provider: 'toss' | 'stripe' | 'paypal';
    status: 'active' | 'canceled' | 'expired' | 'past_due';
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    createdAt: Timestamp | FieldValue;
}

// --- 구매 이력 (Phase 5) ---
export interface PurchaseDoc {
    uid: string;
    provider: 'toss' | 'stripe' | 'paypal';
    providerPaymentId: string;
    tier: TierName;
    amount: number;
    currency: string;
    status: 'completed' | 'refunded' | 'failed';
    createdAt: Timestamp | FieldValue;
}

// --- 티어 기본값 ---
export const TIER_DEFAULTS: Record<TierName, Omit<EntitlementDoc, 'updatedAt'>> = {
    free: {
        tier: 'free',
        dailyQuestionLimit: 5,
        canSynthesis: false,
        maxTokens: 500,
        renewalAt: null,
    },
    plus: {
        tier: 'plus',
        dailyQuestionLimit: 30,
        canSynthesis: false,
        maxTokens: 2000,
        renewalAt: null,
    },
    pro: {
        tier: 'pro',
        dailyQuestionLimit: 100,
        canSynthesis: true,
        maxTokens: 4000,
        renewalAt: null,
    },
    archmage: {
        tier: 'archmage',
        dailyQuestionLimit: -1, // unlimited
        canSynthesis: true,
        maxTokens: 8000,
        renewalAt: null,
    },
};
