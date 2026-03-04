'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

type Tab = 'profile' | 'history' | 'subscription' | 'payments';

interface Profile {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    lat?: number;
    lng?: number;
}

interface ReadingRecord {
    id: string;
    module: string;
    question?: string;
    summary?: string;
    createdAt: string;
}

export default function MypagePage() {
    const { locale } = useParams();
    const router = useRouter();
    const loc = (locale as string) || 'ko';
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [loading, setLoading] = useState(true);

    // 데모 프로필 데이터
    const [profile] = useState<Profile>({});
    const [readings] = useState<ReadingRecord[]>([]);

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '마이페이지', ja: 'マイページ', en: 'My Page', zh: '我的页面' },
        tabProfile: { ko: '내 프로필', ja: 'プロフィール', en: 'My Profile', zh: '我的资料' },
        tabHistory: { ko: '질문 기록', ja: '質問履歴', en: 'History', zh: '提问记录' },
        tabSubscription: { ko: '구독 상태', ja: 'サブスクリプション', en: 'Subscription', zh: '订阅状态' },
        tabPayments: { ko: '결제 내역', ja: '決済履歴', en: 'Payments', zh: '支付记录' },
        needLogin: { ko: '로그인이 필요합니다', ja: 'ログインが必要です', en: 'Login required', zh: '需要登录' },
        goLogin: { ko: '로그인 하러 가기', ja: 'ログインする', en: 'Go to Login', zh: '去登录' },
        noBirthData: { ko: '출생 정보가 아직 입력되지 않았습니다', ja: '出生情報がまだ入力されていません', en: 'Birth data not yet entered', zh: '尚未输入出生信息' },
        enterBirthData: { ko: '사주 분석에서 입력', ja: '四柱分析で入力', en: 'Enter via Saju analysis', zh: '通过四柱分析输入' },
        birthDate: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        birthTime: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        birthPlace: { ko: '출생 장소', ja: '出生地', en: 'Place of Birth', zh: '出生地' },
        noHistory: { ko: '아직 질문 기록이 없습니다', ja: 'まだ質問履歴がありません', en: 'No history yet', zh: '暂无提问记录' },
        startReading: { ko: '지금 운세 보러 가기', ja: '今すぐ占いを見る', en: 'Start a reading', zh: '现在去看运势' },
        currentTier: { ko: '현재 등급', ja: '現在のランク', en: 'Current Tier', zh: '当前等级' },
        dailyUsage: { ko: '오늘 사용량', ja: '今日の使用量', en: 'Daily Usage', zh: '今日用量' },
        dailyLimit: { ko: '일일 한도', ja: '日次リミット', en: 'Daily Limit', zh: '每日限额' },
        renewalDate: { ko: '갱신 예정일', ja: '更新予定日', en: 'Renewal Date', zh: '续费日期' },
        free: { ko: '무료 (견습 점술사)', ja: '無料（見習い占い師）', en: 'Free (Apprentice Seer)', zh: '免费（学徒占卜师）' },
        upgradeCta: { ko: '등급 업그레이드', ja: 'ランクアップ', en: 'Upgrade', zh: '升级' },
        noPayments: { ko: '결제 내역이 없습니다', ja: '決済履歴はありません', en: 'No payments', zh: '暂无支付记录' },
    };

    const checkAuth = useCallback(() => {
        const auth = getClientAuth();
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        const unsub = checkAuth();
        return () => { if (unsub) unsub(); };
    }, [checkAuth]);

    if (loading) {
        return (
            <section className="section">
                <div className="container" style={{ maxWidth: '800px', textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="section">
                <div className="container" style={{ maxWidth: '500px', textAlign: 'center' }}>
                    <div className="glass-card" style={{ padding: '48px 32px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '12px' }}>
                            {labels.needLogin[loc]}
                        </h2>
                        <a href={`/${loc}/account`} className="btn btn-primary" style={{ marginTop: '16px' }}>
                            {labels.goLogin[loc]}
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'profile', label: labels.tabProfile[loc], icon: '👤' },
        { key: 'history', label: labels.tabHistory[loc], icon: '📜' },
        { key: 'subscription', label: labels.tabSubscription[loc], icon: '⭐' },
        { key: 'payments', label: labels.tabPayments[loc], icon: '💳' },
    ];

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-gold))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 800,
                        color: '#fff',
                    }}>
                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                            {labels.title[loc]}
                        </h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* 탭 바 */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '14px',
                    padding: '4px',
                    marginBottom: 'var(--space-6)',
                    overflowX: 'auto',
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === tab.key ? 'var(--color-accent-primary)' : 'transparent',
                                color: activeTab === tab.key ? '#fff' : 'var(--color-text-secondary)',
                                fontWeight: 600,
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div className="glass-card" style={{ padding: 'var(--space-8)', minHeight: '300px' }}>
                    {activeTab === 'profile' && (
                        <div>
                            {profile.birthDate ? (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <InfoRow label={labels.birthDate[loc]} value={profile.birthDate} />
                                    <InfoRow label={labels.birthTime[loc]} value={profile.birthTime || '-'} />
                                    <InfoRow label={labels.birthPlace[loc]} value={profile.birthPlace || '-'} />
                                </div>
                            ) : (
                                <EmptyState
                                    emoji="📝"
                                    message={labels.noBirthData[loc]}
                                    actionLabel={labels.enterBirthData[loc]}
                                    actionHref={`/${loc}/saju`}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            {readings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {readings.map((r) => (
                                        <div key={r.id} className="glass-card" style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent-primary)' }}>
                                                    {r.module}
                                                </span>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                                    {r.createdAt}
                                                </span>
                                            </div>
                                            {r.question && <p style={{ fontSize: 'var(--text-sm)' }}>{r.question}</p>}
                                            {r.summary && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{r.summary}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    emoji="🔮"
                                    message={labels.noHistory[loc]}
                                    actionLabel={labels.startReading[loc]}
                                    actionHref={`/${loc}/saju`}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <InfoRow label={labels.currentTier[loc]} value={labels.free[loc]} accent />
                            <InfoRow label={labels.dailyUsage[loc]} value="0 / 5" />
                            <InfoRow label={labels.dailyLimit[loc]} value={`5 ${loc === 'ko' ? '질문' : 'questions'}`} />
                            <InfoRow label={labels.renewalDate[loc]} value="-" />
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <a href={`/${loc}/pricing`} className="btn btn-gold">
                                    ⬆ {labels.upgradeCta[loc]}
                                </a>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <EmptyState
                            emoji="💳"
                            message={labels.noPayments[loc]}
                            actionLabel={labels.upgradeCta[loc]}
                            actionHref={`/${loc}/pricing`}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

/** 정보 행 */
function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
            <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: accent ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
            }}>
                {value}
            </span>
        </div>
    );
}

/** 빈 상태 */
function EmptyState({ emoji, message, actionLabel, actionHref }: { emoji: string; message: string; actionLabel: string; actionHref: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>{emoji}</div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>{message}</p>
            <a href={actionHref} className="btn btn-primary btn-sm">
                {actionLabel}
            </a>
        </div>
    );
}
