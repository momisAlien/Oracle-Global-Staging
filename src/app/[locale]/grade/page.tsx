'use client';

/* ===========================
   Grade Selection Page
   /{locale}/grade
   ===========================
   
   첫 방문 시 등급 선택 화면
   - FREE/PLUS: 익명 허용
   - PRO/ARCHMAGE: 로그인 필요
*/

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import { TIER_ORDER, TIER_NAMES, TIER_COLORS, TIER_AURA } from '@/lib/tiers';

const GRADE_COOKIE = 'tarotai_grade';

const TIER_ICONS: Record<string, string> = {
    free: '🌱',
    plus: '⚔️',
    pro: '🔮',
    archmage: '👑',
};

const TIER_DESCRIPTIONS: Record<string, Record<string, string>> = {
    free: {
        ko: '간단한 운세 체험\n짧고 핵심적인 5~7개 포인트',
        ja: '簡単な占い体験\n短く核心的な5〜7ポイント',
        en: 'Quick fortune experience\nConcise 5–7 key points',
        zh: '简单的占卜体验\n简短核心的5-7个要点',
    },
    plus: {
        ko: '상세 분석 + 조언\n구조화된 섹션별 심층 해석',
        ja: '詳細分析 + アドバイス\n構造化されたセクション別深層解釈',
        en: 'Detailed analysis + advice\nStructured in-depth sections',
        zh: '详细分析 + 建议\n结构化的深度解读',
    },
    pro: {
        ko: '심층 분석 + 시나리오 + 실용 팁\n다각도 운세 + 행동 가이드',
        ja: '深層分析 + シナリオ + 実用ヒント\n多角的占い + 行動ガイド',
        en: 'Deep analysis + scenarios + tips\nMulti-angle fortune + action guide',
        zh: '深度分析 + 场景 + 实用建议\n多角度运势 + 行动指南',
    },
    archmage: {
        ko: '최고급 다중 분석 + 주의 사항\n크로스 시스템 비전 + 투명성 노트',
        ja: '最高級マルチ分析 + 注意事項\nクロスシステムビジョン + 透明性ノート',
        en: 'Premium multi-analysis + cautions\nCross-system vision + transparency',
        zh: '顶级多重分析 + 注意事项\n跨系统视觉 + 透明度说明',
    },
};

const LABELS: Record<string, Record<string, string>> = {
    title: {
        ko: '원하는 점술사를 선택하세요',
        ja: '占い師を選んでください',
        en: 'Choose Your Seer',
        zh: '选择你的占卜师',
    },
    subtitle: {
        ko: '첫 질문 1회는 무료입니다. 등급에 따라 분석의 깊이가 달라집니다.',
        ja: '最初の質問は無料です。グレードにより分析の深さが変わります。',
        en: 'Your first question is free. Grade determines depth of analysis.',
        zh: '首次提问免费。等级决定分析的深度。',
    },
    freeLabel: {
        ko: '무료',
        ja: '無料',
        en: 'Free',
        zh: '免费',
    },
    loginRequired: {
        ko: '🔒 로그인 필요',
        ja: '🔒 ログイン必要',
        en: '🔒 Login Required',
        zh: '🔒 需要登录',
    },
    select: {
        ko: '선택하기',
        ja: '選択する',
        en: 'Select',
        zh: '选择',
    },
    freeTrial: {
        ko: '✨ 1회 무료 체험 포함',
        ja: '✨ 1回無料体験含む',
        en: '✨ Includes 1 free trial',
        zh: '✨ 含1次免费体验',
    },
};

function GradePageContent() {
    const { locale } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const loc = (locale as string) || 'ko';
    const nextPath = searchParams.get('next');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedForLogin, setSelectedForLogin] = useState('');

    useEffect(() => {
        const auth = getClientAuth();
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    const L = (obj: Record<string, string>) => obj[loc] || obj.en;

    const handleSelect = (tierId: string) => {
        const requiresLogin = ['pro', 'archmage'].includes(tierId) && !user;

        if (requiresLogin) {
            setSelectedForLogin(tierId);
            setShowLoginModal(true);
            return;
        }

        // Save to cookie + localStorage
        document.cookie = `${GRADE_COOKIE}=${tierId};path=/;max-age=${60 * 60 * 24 * 365}`;
        localStorage.setItem(GRADE_COOKIE, tierId);

        // If logged in, save to profile via API
        if (user) {
            user.getIdToken().then(token => {
                fetch('/api/me', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ preferredGrade: tierId }),
                }).catch(() => { });
            });
        }

        // Redirect to next path or home
        const destination = nextPath || `/${loc}`;
        router.push(destination);
    };

    if (loading) {
        return (
            <section className="section">
                <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="loading-spinner" />
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="section cosmic-bg">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{
                            fontSize: 'var(--text-3xl)',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {L(LABELS.title)}
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontSize: 'var(--text-lg)' }}>
                            {L(LABELS.subtitle)}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1.5rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                    }}>
                        {TIER_ORDER.map((tierId) => {
                            const requiresLogin = ['pro', 'archmage'].includes(tierId) && !user;
                            const color = TIER_COLORS[tierId];
                            const aura = TIER_AURA[tierId];
                            return (
                                <div key={tierId} style={{
                                    background: 'var(--color-surface)',
                                    border: `2px solid ${color}33`,
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem 1.5rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                }}
                                    onClick={() => handleSelect(tierId)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = color;
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = `0 8px 32px ${aura}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = `${color}33`;
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Aura glow */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-50%',
                                        left: '-50%',
                                        width: '200%',
                                        height: '200%',
                                        background: `radial-gradient(circle, ${aura} 0%, transparent 70%)`,
                                        opacity: 0.3,
                                        pointerEvents: 'none',
                                    }} />

                                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem', position: 'relative' }}>
                                        {TIER_ICONS[tierId]}
                                    </div>

                                    <h3 style={{ color, fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.25rem', position: 'relative' }}>
                                        {TIER_NAMES[tierId]?.[loc] || tierId}
                                    </h3>

                                    {tierId === 'free' && (
                                        <span style={{
                                            background: `${color}22`,
                                            color,
                                            padding: '2px 12px',
                                            borderRadius: '12px',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 600,
                                            marginBottom: '0.75rem',
                                        }}>
                                            {L(LABELS.freeLabel)}
                                        </span>
                                    )}

                                    {requiresLogin && (
                                        <span style={{
                                            background: 'rgba(239,68,68,0.15)',
                                            color: '#ef4444',
                                            padding: '2px 12px',
                                            borderRadius: '12px',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 600,
                                            marginBottom: '0.75rem',
                                        }}>
                                            {L(LABELS.loginRequired)}
                                        </span>
                                    )}

                                    <p style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: 'var(--text-sm)',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-line',
                                        marginTop: '0.5rem',
                                        flex: 1,
                                        position: 'relative',
                                    }}>
                                        {TIER_DESCRIPTIONS[tierId]?.[loc] || ''}
                                    </p>

                                    <button style={{
                                        marginTop: '1.5rem',
                                        padding: '0.75rem 2rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: 'none',
                                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                                        color: '#fff',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s',
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    >
                                        {L(LABELS.select)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '2rem',
                        color: 'var(--color-accent-primary)',
                        fontSize: 'var(--text-sm)',
                    }}>
                        {L(LABELS.freeTrial)}
                    </p>
                </div>
            </section>

            {/* Login Required Modal */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)',
                }} onClick={() => setShowLoginModal(false)}>
                    <div style={{
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2.5rem',
                        maxWidth: '420px',
                        width: '90%',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>
                            {TIER_NAMES[selectedForLogin]?.[loc] || ''}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            {loc === 'ko' ? 'Pro/Archmage 등급은 로그인이 필요합니다.\n가입하면 +2 무료 크레딧을 받을 수 있습니다!' :
                                loc === 'ja' ? 'Pro/Archmageグレードにはログインが必要です。\n登録すると+2無料クレジットがもらえます！' :
                                    loc === 'zh' ? 'Pro/Archmage等级需要登录。\n注册可获得+2免费积分！' :
                                        'Pro/Archmage grades require login.\nSign up to get +2 free credits!'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => router.push(`/${loc}/account`)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: 'none',
                                    background: 'var(--color-accent-primary)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                {loc === 'ko' ? '로그인 / 가입' : loc === 'ja' ? 'ログイン/登録' : loc === 'zh' ? '登录/注册' : 'Login / Sign Up'}
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
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
                                {loc === 'ko' ? '닫기' : loc === 'ja' ? '閉じる' : loc === 'zh' ? '关闭' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </>
    );
}

export default function GradePage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="fortune-loading-orb" /></div>}>
            <GradePageContent />
        </Suspense>
    );
}
