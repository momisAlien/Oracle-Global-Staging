'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import TierStatsPanel from '@/components/tiers/TierStatsPanel';
import { TIER_ORDER, TIER_NAMES, TIER_COLORS, TIER_AURA } from '@/lib/tiers';

interface TierDef {
    id: string;
    questions: string;
    features: string[];
    priceKRW?: { regular: number; launch: number; renewal: number };
    priceUSD?: { regular: number; launch: number; renewal: number };
    priceJPY?: { regular: number; launch: number; renewal: number };
}

const TIERS: TierDef[] = [
    { id: 'free', questions: '5/day', features: ['basic'] },
    { id: 'plus', questions: '30/day', priceKRW: { regular: 30000, launch: 4900, renewal: 19000 }, priceUSD: { regular: 23, launch: 3.5, renewal: 14 }, priceJPY: { regular: 3000, launch: 500, renewal: 1900 }, features: ['medium', 'noAds'] },
    { id: 'pro', questions: '100/day', priceKRW: { regular: 300000, launch: 10000, renewal: 59000 }, priceUSD: { regular: 230, launch: 7.5, renewal: 45 }, priceJPY: { regular: 30000, launch: 1000, renewal: 5900 }, features: ['deep', 'noAds', 'crossModule'] },
    { id: 'archmage', questions: 'Unlimited', priceKRW: { regular: 990000, launch: 49000, renewal: 199000 }, priceUSD: { regular: 750, launch: 37, renewal: 150 }, priceJPY: { regular: 99000, launch: 4900, renewal: 19900 }, features: ['dualPass', 'noAds', 'crossModule', 'annualForecast'] },
];

// 각 티어의 캐릭터 이미지 매핑
const TIER_IMAGES: Record<string, Record<'male' | 'female', string>> = {
    free: { male: '/images/tiers/Apprentice_male.png', female: '/images/tiers/Apprentice_female.png' },
    plus: { male: '/images/tiers/seer_male.png', female: '/images/tiers/seer_female.png' },
    pro: { male: '/images/tiers/Grand_Seer_male.png', female: '/images/tiers/Grand_Seer_female.png' },
    archmage: { male: '/images/tiers/archmage_male.png', female: '/images/tiers/archmage_female.png' },
};

const TIER_AURA_SIZES: Record<string, string> = {
    free: '160px',
    plus: '200px',
    pro: '240px',
    archmage: '280px',
};

function formatPrice(amount: number, locale: string): string {
    const currency = locale === 'ko' ? 'KRW' : locale === 'ja' ? 'JPY' : 'USD';
    return new Intl.NumberFormat(
        locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US',
        { style: 'currency', currency, maximumFractionDigits: 0 }
    ).format(amount);
}

export default function PricingPage() {
    const t = useTranslations();
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const selectedTier = TIERS[selectedTierIndex];
    const tierId = selectedTier.id;
    const color = TIER_COLORS[tierId];
    const aura = TIER_AURA[tierId];

    function getPrice(tier: TierDef, type: 'launch' | 'renewal' | 'regular'): string {
        if (tier.id === 'free') return t('tiers.free');
        const priceSet = loc === 'ko' ? tier.priceKRW : loc === 'ja' ? tier.priceJPY : tier.priceUSD;
        if (!priceSet) return '';
        return formatPrice(priceSet[type], loc);
    }

    const featLabels: Record<string, Record<string, string>> = {
        basic: { ko: '기본 운세 분석', ja: '基本占い', en: 'Basic readings', zh: '基础分析' },
        medium: { ko: '중간 깊이 분석', ja: '中程度分析', en: 'Medium-depth analysis', zh: '中等深度分析' },
        deep: { ko: '심층 분석', ja: '深層分析', en: 'Deep analysis', zh: '深度分析' },
        noAds: { ko: '광고 없음', ja: '広告なし', en: 'No ads', zh: '无广告' },
        crossModule: { ko: '크로스모듈 분석', ja: 'クロスモジュール', en: 'Cross-module', zh: '交叉分析' },
        dualPass: { ko: '이중 추론 분석', ja: '二重推論', en: 'Dual reasoning', zh: '双重推理' },
        annualForecast: { ko: '연간 예측', ja: '年間予測', en: 'Annual forecast', zh: '年度预测' },
    };

    const genderLabels: Record<string, Record<string, string>> = {
        male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
        female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '1100px' }}>
                {/* 헤더 */}
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">{t('pricing.title')}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
                        {t('pricing.subtitle')}
                    </p>
                </div>

                {/* 성별 토글 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {(['male', 'female'] as const).map((g) => (
                        <button
                            key={g}
                            onClick={() => setGender(g)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '20px',
                                background: gender === g
                                    ? `linear-gradient(135deg, ${color}40, ${color}20)`
                                    : 'rgba(255,255,255,0.03)',
                                border: gender === g ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
                                color: gender === g ? '#fff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {g === 'male' ? '🧙‍♂️' : '🧙‍♀️'} {genderLabels[g][loc] || genderLabels[g].en}
                        </button>
                    ))}
                </div>

                {/* RPG 캐릭터 선택 레이아웃 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)', alignItems: 'start' }}>
                    {/* LEFT — 캐릭터 스테이지 */}
                    <div>
                        {/* 캐릭터 디스플레이 */}
                        <div style={{
                            position: 'relative',
                            height: '420px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'linear-gradient(180deg, rgba(15,10,30,0.9) 0%, rgba(20,15,40,0.95) 100%)',
                            border: `1px solid ${color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {/* 오라 배경 */}
                            <div style={{
                                position: 'absolute',
                                width: TIER_AURA_SIZES[tierId],
                                height: TIER_AURA_SIZES[tierId],
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${aura}, transparent)`,
                                animation: 'auraPulse 3s ease-in-out infinite',
                            }} />

                            {/* 마법진 */}
                            <div style={{
                                position: 'absolute',
                                bottom: '30px',
                                width: '240px',
                                height: '60px',
                                borderRadius: '50%',
                                background: `radial-gradient(ellipse, ${color}25, transparent 70%)`,
                                border: `1px solid ${color}20`,
                            }} />

                            {/* 캐릭터 이미지 */}
                            <div style={{
                                position: 'relative',
                                zIndex: 2,
                                textAlign: 'center',
                                animation: 'characterFloat 4s ease-in-out infinite',
                            }}>
                                <img
                                    src={TIER_IMAGES[tierId][gender]}
                                    alt={TIER_NAMES[tierId]?.[loc] || tierId}
                                    style={{
                                        height: '300px',
                                        objectFit: 'contain',
                                        filter: `drop-shadow(0 0 30px ${color}60)`,
                                        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                />
                            </div>

                            {/* 티어 이름 오버레이 */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                left: '20px',
                            }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                }}>
                                    {tierId}
                                </span>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                                    {TIER_NAMES[tierId]?.[loc] || tierId}
                                </h2>
                            </div>

                            {/* 성별 표시 배지 */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                fontSize: '20px',
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                {gender === 'male' ? '♂' : '♀'}
                            </div>
                        </div>

                        {/* 캐릭터 선택 바 */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            marginTop: '16px',
                        }}>
                            {TIER_ORDER.map((tid, i) => (
                                <button
                                    key={tid}
                                    onClick={() => setSelectedTierIndex(i)}
                                    style={{
                                        width: selectedTierIndex === i ? '80px' : '64px',
                                        height: selectedTierIndex === i ? '80px' : '64px',
                                        borderRadius: '14px',
                                        background: selectedTierIndex === i
                                            ? `linear-gradient(135deg, ${TIER_COLORS[tid]}30, ${TIER_COLORS[tid]}10)`
                                            : 'rgba(255,255,255,0.03)',
                                        border: selectedTierIndex === i
                                            ? `2px solid ${TIER_COLORS[tid]}`
                                            : '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        transform: selectedTierIndex === i ? 'translateY(-4px)' : 'none',
                                        padding: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <img
                                        src={TIER_IMAGES[tid][gender]}
                                        alt={tid}
                                        style={{
                                            height: selectedTierIndex === i ? '50px' : '38px',
                                            objectFit: 'contain',
                                            transition: 'height 0.3s',
                                            filter: selectedTierIndex === i
                                                ? `drop-shadow(0 0 6px ${TIER_COLORS[tid]}80)`
                                                : 'brightness(0.6)',
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '9px',
                                        color: selectedTierIndex === i ? TIER_COLORS[tid] : 'rgba(255,255,255,0.4)',
                                        fontWeight: 700,
                                        marginTop: '2px',
                                    }}>
                                        {TIER_NAMES[tid]?.[loc]?.split(' ')[0] || tid}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* 가격 + CTA */}
                        <div className="glass-card" style={{ marginTop: '16px', padding: '24px', textAlign: 'center' }}>
                            {tierId === 'free' ? (
                                <>
                                    <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>{t('tiers.free')}</span>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {selectedTier.questions} {loc === 'ko' ? '질문' : 'questions'}
                                    </p>
                                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
                                        {t('tiers.currentPlan')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', color, fontWeight: 600, textTransform: 'uppercase' }}>
                                            {t('tiers.launchSpecial')}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800 }}>
                                        {getPrice(selectedTier, 'launch')}
                                    </span>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                        {t('tiers.perYear')}
                                    </span>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                                        <s>{t('tiers.regularPrice')}: {getPrice(selectedTier, 'regular')}</s>
                                        {' · '}
                                        {t('tiers.renewalPrice')}: {getPrice(selectedTier, 'renewal')}{t('tiers.perYear')}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                            ✦ {selectedTier.questions} {loc === 'ko' ? '질문' : 'questions'}
                                        </span>
                                        {selectedTier.features.map((f) => (
                                            <span key={f} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                                ✦ {featLabels[f]?.[loc] || f}
                                            </span>
                                        ))}
                                    </div>
                                    <a
                                        href={`/${loc}/checkout/toss?tier=${tierId}`}
                                        className={`btn ${tierId === 'archmage' ? 'btn-gold' : 'btn-primary'}`}
                                        style={{ width: '100%', marginTop: '16px' }}
                                    >
                                        {t('tiers.subscribe')}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — 스탯 패널 */}
                    <div>
                        <TierStatsPanel tierId={tierId} locale={loc} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes auraPulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes characterFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @media (max-width: 768px) {
                    .container > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
