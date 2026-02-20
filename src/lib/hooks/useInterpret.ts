'use client';

/* ===========================
   useInterpret — AI 해석 호출 훅
   =========================== */

import { useState, useCallback } from 'react';
import { getClientAuth } from '@/lib/firebase/client';

export interface InterpretSection {
    title: string;
    content: string;
    icon: string;
}

export interface InterpretResponse {
    summary: string;
    sections: InterpretSection[];
    keyPoints: string[];
    guidance: string;
    luckyElements?: { color?: string; number?: string; direction?: string };
    model: string;
    geminiVerification?: {
        additionalInsights: string;
        crossValidation: string;
        hiddenPatterns: string[];
    };
    tier: string;
    quotaRemaining: number;
    meta?: {
        userTier: string;
        effectiveTier: string;
        seedKey: string;
        latencyMs: number;
        cacheHit: boolean;
    };
}

interface UseInterpretReturn {
    result: InterpretResponse | null;
    loading: boolean;
    error: string | null;
    interpret: (params: InterpretParams) => Promise<void>;
    reset: () => void;
}

interface InterpretParams {
    system: 'saju' | 'astrology' | 'tarot' | 'synthesis';
    locale: string;
    question?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    isLunar?: boolean;
    latitude?: number;
    longitude?: number;
    drawnCards?: { name: string; reversed: boolean }[];
    chartData?: Record<string, unknown>;
    gender?: 'male' | 'female';
}

export function useInterpret(): UseInterpretReturn {
    const [result, setResult] = useState<InterpretResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const interpret = useCallback(async (params: InterpretParams) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Firebase Auth 토큰 가져오기
            const auth = getClientAuth();
            const user = auth.currentUser;

            let idToken = '';
            if (user) {
                idToken = await user.getIdToken();
            }

            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return { result, loading, error, interpret, reset };
}
