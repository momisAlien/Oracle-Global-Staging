'use client';

/* ===========================
   CreditBadge – 헤더/카드에 표시할 크레딧 잔액 뱃지
   =========================== */

import { useEffect, useState, useCallback } from 'react';
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

interface CreditBadgeProps {
    grade?: string;
    compact?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
    free: '#6b7280',
    plus: '#3b82f6',
    pro: '#a855f7',
    archmage: '#f59e0b',
};

export default function CreditBadge({ grade, compact = false }: CreditBadgeProps) {
    const [credits, setCredits] = useState<Record<string, number> | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const fetchCredits = useCallback(async (u: User) => {
        try {
            const token = await u.getIdToken();
            const res = await fetch('/api/me/credits', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits);
            }
        } catch (err) {
            console.warn('[CreditBadge] fetch error:', err);
        }
    }, []);

    useEffect(() => {
        const auth = getClientAuth();
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) fetchCredits(u);
            else setCredits(null);
        });
    }, [fetchCredits]);

    if (!user || !credits) return null;

    if (grade) {
        const count = credits[grade] || 0;
        const color = GRADE_COLORS[grade] || '#6b7280';
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: `${color}22`,
                color,
                padding: compact ? '2px 8px' : '4px 12px',
                borderRadius: '12px',
                fontSize: compact ? '11px' : '13px',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
            }}>
                💎 {count}
            </span>
        );
    }

    // Show all grades with credits > 0
    const entries = Object.entries(credits).filter(([, v]) => v > 0);
    if (entries.length === 0) return null;

    return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {entries.map(([g, count]) => (
                <span key={g} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: `${GRADE_COLORS[g] || '#6b7280'}22`,
                    color: GRADE_COLORS[g] || '#6b7280',
                    padding: compact ? '2px 8px' : '4px 12px',
                    borderRadius: '12px',
                    fontSize: compact ? '11px' : '13px',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    textTransform: 'capitalize',
                }}>
                    💎 {g}: {count}
                </span>
            ))}
        </div>
    );
}
