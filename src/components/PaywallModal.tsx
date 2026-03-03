'use client';

/* ===========================
   PaywallModal — 크레딧 부족 시 구매 유도 모달
   =========================== */

import { useParams, useRouter } from 'next/navigation';
import { User } from 'firebase/auth';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    grade: string;
    user: User | null;
    remaining?: number;
}

const LABELS: Record<string, Record<string, string>> = {
    title: {
        ko: '크레딧이 부족합니다',
        ja: 'クレジットが不足しています',
        en: 'Insufficient Credits',
        zh: '积分不足',
    },
    description: {
        ko: '이 등급의 크레딧을 구매하면 더 깊은 분석을 받을 수 있습니다.',
        ja: 'このグレードのクレジットを購入すると、より深い分析を受けられます。',
        en: 'Purchase credits for this grade to get deeper analysis.',
        zh: '购买该等级的积分以获得更深入的分析。',
    },
    buyCredits: {
        ko: '크레딧 구매',
        ja: 'クレジット購入',
        en: 'Buy Credits',
        zh: '购买积分',
    },
    subscribe: {
        ko: '월정액 구독',
        ja: '月額サブスクリプション',
        en: 'Subscribe Monthly',
        zh: '月度订阅',
    },
    close: {
        ko: '닫기',
        ja: '閉じる',
        en: 'Close',
        zh: '关闭',
    },
    loginFirst: {
        ko: '크레딧 구매를 위해 먼저 로그인해 주세요.',
        ja: 'クレジット購入にはまずログインしてください。',
        en: 'Please log in first to purchase credits.',
        zh: '请先登录以购买积分。',
    },
    login: {
        ko: '로그인',
        ja: 'ログイン',
        en: 'Login',
        zh: '登录',
    },
};

const GRADE_COLORS: Record<string, string> = {
    plus: '#3b82f6',
    pro: '#a855f7',
    archmage: '#f59e0b',
};

const GRADE_ICONS: Record<string, string> = {
    plus: '⚔️',
    pro: '🔮',
    archmage: '👑',
};

export default function PaywallModal({ isOpen, onClose, grade, user, remaining = 0 }: PaywallModalProps) {
    const { locale } = useParams();
    const router = useRouter();
    const loc = (locale as string) || 'ko';
    const L = (obj: Record<string, string>) => obj[loc] || obj.en;
    const color = GRADE_COLORS[grade] || '#6b7280';

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                maxWidth: '440px',
                width: '90%',
                textAlign: 'center',
                border: `1px solid ${color}44`,
                boxShadow: `0 0 40px ${color}22`,
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    {GRADE_ICONS[grade] || '💎'}
                </div>

                <h3 style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-xl)',
                    marginBottom: '0.5rem',
                    color,
                }}>
                    {L(LABELS.title)}
                </h3>

                <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.6,
                }}>
                    {L(LABELS.description)}
                </p>

                <p style={{
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: '2rem',
                }}>
                    💎 {remaining} {loc === 'ko' ? '크레딧 남음' : loc === 'ja' ? 'クレジット残り' : loc === 'zh' ? '积分剩余' : 'credits remaining'}
                </p>

                {user ? (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => router.push(`/${loc}/pricing`)}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {L(LABELS.buyCredits)}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                background: 'transparent',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {L(LABELS.close)}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                            {L(LABELS.loginFirst)}
                        </p>
                        <button
                            onClick={() => router.push(`/${loc}/account`)}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                background: 'var(--color-accent-primary)',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {L(LABELS.login)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
