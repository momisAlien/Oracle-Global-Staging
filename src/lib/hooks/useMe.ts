'use client';

/* ===========================
   useMe — 유저 티어 조회 훅
   ===========================
   
   /api/me 호출 → userTier 반환
   Firebase 인증 토큰이 있으면 실제 티어, 없으면 'free'
   광고 노출 판단용
*/

import { useState, useEffect } from 'react';
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

interface MeData {
    userTier: string;
    authenticated: boolean;
}

export function useMe() {
    const [userTier, setUserTier] = useState<string>('free');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getClientAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (!user) {
                setUserTier('free');
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data: MeData = await res.json();
                    setUserTier(data.userTier);
                } else {
                    setUserTier('free');
                }
            } catch {
                setUserTier('free');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { userTier, loading, isFree: userTier === 'free' };
}
