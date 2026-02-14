'use client';

/* ===========================
   Account Page — 로그인/회원가입/계정 관리
   /[locale]/account
   =========================== */

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { User } from 'firebase/auth';
import {
    signUpWithEmailPassword,
    signInWithEmailPassword,
    signInWithGoogle,
    signOut,
    onAuthChange,
    getIdToken,
} from '@/lib/firebase/auth';

type AuthMode = 'signin' | 'signup';

interface EntitlementInfo {
    tier: string;
    dailyQuestionLimit: number;
    canSynthesis: boolean;
    maxTokens: number;
}

interface UsageInfo {
    usedQuestions: number;
    kstDateKey: string;
}

export default function AccountPage() {
    const t = useTranslations('account');
    const tCommon = useTranslations('common');
    const locale = useLocale();

    const [user, setUser] = useState<User | null>(null);
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [entitlement, setEntitlement] = useState<EntitlementInfo | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);

    // 인증 상태 리스너
    useEffect(() => {
        const unsubscribe = onAuthChange((u) => {
            setUser(u);
            if (u) {
                loadEntitlement(u);
            } else {
                setEntitlement(null);
                setUsage(null);
            }
        });
        return unsubscribe;
    }, []);

    // 엔타이틀먼트 + 사용량 로드
    const loadEntitlement = useCallback(async (u: User) => {
        try {
            const token = await u.getIdToken();
            const res = await fetch('/api/account/info', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setEntitlement(data.entitlement);
                setUsage(data.usage);
            }
        } catch (err) {
            console.error('Failed to load entitlement:', err);
        }
    }, []);

    // 프로비저닝 호출
    const provisionUser = async () => {
        const token = await getIdToken();
        if (!token) return;

        try {
            await fetch('/api/auth/provision', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ locale }),
            });
        } catch (err) {
            console.error('Provision failed:', err);
        }
    };

    // 이메일/비밀번호 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                await signUpWithEmailPassword(email, password);
                await provisionUser();
            } else {
                await signInWithEmailPassword(email, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    // Google 로그인
    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            await provisionUser();
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    // 로그아웃
    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        setEntitlement(null);
        setUsage(null);
    };

    // 티어별 색상
    const tierColor: Record<string, string> = {
        free: 'var(--tier-free)',
        plus: 'var(--tier-plus)',
        pro: 'var(--tier-pro)',
        archmage: 'var(--tier-archmage)',
    };

    // ===== 로그인된 상태 =====
    if (user) {
        return (
            <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        {t('title')}
                    </h1>

                    {/* 사용자 정보 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            {t('email')}
                        </div>
                        <div style={{ fontWeight: 600 }}>{user.email}</div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            UID
                        </div>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            wordBreak: 'break-all',
                        }}>
                            {user.uid}
                        </div>
                    </div>

                    {/* 티어 + 엔타이틀먼트 */}
                    {entitlement && (
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            borderLeft: `3px solid ${tierColor[entitlement.tier] || '#888'}`,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                            }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                    {t('tier')}
                                </span>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: tierColor[entitlement.tier] || '#fff',
                                    textTransform: 'uppercase',
                                }}>
                                    {entitlement.tier}
                                </span>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                fontSize: '0.85rem',
                            }}>
                                <div>
                                    <div style={{ opacity: 0.6 }}>{t('dailyLimit')}</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {entitlement.dailyQuestionLimit === -1
                                            ? '∞'
                                            : entitlement.dailyQuestionLimit}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ opacity: 0.6 }}>{t('maxTokens')}</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {entitlement.maxTokens.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ opacity: 0.6 }}>{t('synthesis')}</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {entitlement.canSynthesis ? '✅' : '❌'}
                                    </div>
                                </div>
                                {usage && (
                                    <div>
                                        <div style={{ opacity: 0.6 }}>{t('usedToday')}</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {usage.usedQuestions}
                                            {entitlement.dailyQuestionLimit !== -1 &&
                                                ` / ${entitlement.dailyQuestionLimit}`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!entitlement && (
                        <div style={{
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                        }}>
                            {t('loadingEntitlement')}
                        </div>
                    )}

                    <button
                        onClick={handleSignOut}
                        className="cosmic-btn"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        {t('signOut')}
                    </button>
                </div>
            </div>
        );
    }

    // ===== 로그인 안 된 상태 =====
    return (
        <div style={{ maxWidth: 420, margin: '3rem auto', padding: '0 1rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                    {mode === 'signin' ? t('signIn') : t('signUp')}
                </h1>

                <p style={{
                    textAlign: 'center',
                    opacity: 0.6,
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem',
                }}>
                    {mode === 'signin' ? t('signInDesc') : t('signUpDesc')}
                </p>

                {/* Google 로그인 */}
                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'inherit',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.25rem',
                        transition: 'background 0.2s',
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t('googleSignIn')}
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{tCommon('or')}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
                </div>

                {/* 이메일/비밀번호 폼 */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'inherit',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'inherit',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#ff6b6b',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            background: 'rgba(255,107,107,0.1)',
                            borderRadius: '8px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="cosmic-btn"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                        }}
                    >
                        {loading
                            ? tCommon('loading')
                            : mode === 'signin'
                                ? t('signIn')
                                : t('signUp')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.6 }}>
                        {mode === 'signin' ? t('noAccount') : t('hasAccount')}
                    </span>{' '}
                    <button
                        onClick={() => {
                            setMode(mode === 'signin' ? 'signup' : 'signin');
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: 'inherit',
                            padding: 0,
                        }}
                    >
                        {mode === 'signin' ? t('signUp') : t('signIn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
