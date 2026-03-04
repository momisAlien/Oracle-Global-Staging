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
    creditsRemaining?: number;
    isFirstTrial?: boolean;
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
    errorCode: string | null;
    interpret: (params: InterpretParams) => Promise<void>;
    reset: () => void;
}

interface InterpretParams {
    system: 'saju' | 'astrology' | 'tarot' | 'synthesis' | 'today-report' | 'love' | 'compatibility';
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

/** Read a cookie value by name (client-side) */
function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
}

export function useInterpret(): UseInterpretReturn {
    const [result, setResult] = useState<InterpretResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);

    const interpret = useCallback(async (params: InterpretParams) => {
        setLoading(true);
        setError(null);
        setErrorCode(null);
        setResult(null);

        try {
            // Firebase Auth 토큰 가져오기
            const auth = getClientAuth();
            const user = auth.currentUser;

            let idToken = '';
            if (user) {
                idToken = await user.getIdToken();
            }

            // Read selected grade from cookie
            const grade = getCookie('tarotai_grade') || 'free';

            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
                },
                body: JSON.stringify({ ...params, grade }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const code = errData.code || errData.errorCode || '';
                setErrorCode(code);
                throw new Error(errData.error || errData.message || `HTTP ${response.status}`);
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
        setErrorCode(null);
        setLoading(false);
    }, []);

    return { result, loading, error, errorCode, interpret, reset };
}
