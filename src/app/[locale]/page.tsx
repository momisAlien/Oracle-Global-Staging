'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// 로케일별 모듈 순서
const MODULE_ORDER: Record<string, string[]> = {
  ko: ['saju', 'horoscope', 'astrology', 'tarot', 'today-report', 'love'],
  ja: ['tarot', 'horoscope', 'astrology', 'saju', 'today-report', 'love'],
  en: ['horoscope', 'astrology', 'tarot', 'saju', 'today-report', 'love'],
  zh: ['horoscope', 'astrology', 'saju', 'tarot', 'today-report', 'love'],
};

const MODULE_CONFIG: Record<string, { icon: string; gradient: string; href: string }> = {
  astrology: { icon: '✦', gradient: 'linear-gradient(135deg, #8a64ff, #6c4fe0)', href: '/astrology' },
  horoscope: { icon: '⭐', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', href: '/horoscope' },
  saju: { icon: '☯', gradient: 'linear-gradient(135deg, #ff6b9d, #ee5a24)', href: '/saju' },
  tarot: { icon: '🃏', gradient: 'linear-gradient(135deg, #4ecdc4, #2ecc71)', href: '/tarot' },
  'today-report': { icon: '📋', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', href: '/today-report' },
  love: { icon: '💝', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', href: '/love' },
};

export default function LandingPage() {
  const t = useTranslations();
  const { locale } = useParams();
  const currentLocale = (locale as string) || 'ko';
  const moduleOrder = MODULE_ORDER[currentLocale] || MODULE_ORDER.en;
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => setPaymentsEnabled(d.paymentsEnabled)).catch(() => { });
  }, []);

  const tierCta = paymentsEnabled
    ? t('tiers.subscribe')
    : (currentLocale === 'ko' ? '티어 비교' : currentLocale === 'ja' ? 'ティア比較' : currentLocale === 'zh' ? '套餐对比' : 'Compare Tiers');

  return (
    <>
      {/* Hero Section */}
      <section className="hero cosmic-bg">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <span className="badge badge-pro">Premium AI Fortune</span>
            </div>
            <h1 className="hero-title">
              <span className="text-gradient">{t('landing.heroTitle')}</span>
            </h1>
            <p className="hero-subtitle">{t('landing.heroSubtitle')}</p>
            <div className="hero-cta">
              <a href={`/${currentLocale}${MODULE_CONFIG[moduleOrder[0]].href}`} className="btn btn-primary btn-lg">
                {moduleOrder[0] === 'saju' ? t('landing.ctaSaju') : moduleOrder[0] === 'astrology' ? t('landing.ctaAstrology') : moduleOrder[0] === 'horoscope' ? (currentLocale === 'ko' ? '별자리 운세 보기' : currentLocale === 'ja' ? '星座占いを見る' : currentLocale === 'zh' ? '查看星座运势' : 'View Horoscope') : t('landing.ctaTarot')}
              </a>
              <a href={`/${currentLocale}/pricing`} className="btn btn-secondary btn-lg">
                {tierCta}
              </a>
            </div>
          </div>
          <div className="hero-orb animate-float" />
        </div>
      </section>

      {/* Module Cards */}
      <section className="section">
        <div className="container">
          <div className="module-grid">
            {moduleOrder.map((mod, i) => {
              const config = MODULE_CONFIG[mod];
              const names: Record<string, Record<string, string>> = {
                astrology: { ko: '점성술', ja: '占星術', en: 'Astrology', zh: '占星术' },
                horoscope: { ko: '별자리 및 띠 운세', ja: '星座・干支占い', en: 'Zodiac & Chinese Zodiac', zh: '星座与生肖运势' },
                saju: { ko: '사주팔자', ja: '四柱推命', en: 'Four Pillars', zh: '四柱八字' },
                tarot: { ko: '타로', ja: 'タロット', en: 'Tarot', zh: '塔罗牌' },
                'today-report': { ko: '오늘의 운세', ja: '今日の運勢', en: "Today's Fortune", zh: '今日运势' },
                love: { ko: '연애 운세', ja: '恋愛占い', en: 'Love Fortune', zh: '恋爱运势' },
              };
              const descs: Record<string, Record<string, string>> = {
                astrology: {
                  ko: '천체력 기반 정밀 출생차트 분석',
                  ja: 'エフェメリスに基づく精密なネイタルチャート分析',
                  en: 'Ephemeris-based precision natal chart analysis',
                  zh: '基于星历的精确出生星盘分析',
                },
                horoscope: {
                  ko: '별자리 및 띠 기반 운세 · 매일 업데이트',
                  ja: '星座・干支に基づく運勢・毎日更新',
                  en: 'Zodiac & Chinese zodiac fortune · Updated daily',
                  zh: '星座前生肖运势 · 每日更新',
                },
                saju: {
                  ko: '절기 기준 사주팔자·십신·오행·대운 분석',
                  ja: '節気基準の四柱推命・十神・五行・大運分析',
                  en: 'Solar-term based Four Pillars, Ten Gods & Five Elements',
                  zh: '基于节气的四柱八字、十神、五行、大运分析',
                },
                tarot: {
                  ko: '직관이 안내하는 타로 카드 리딩',
                  ja: '直感が導くタロットカードリーディング',
                  en: 'Intuition-guided tarot card readings',
                  zh: '直觉引导的塔罗牌解读',
                },
                'today-report': {
                  ko: '종합운·재물운·연애운·건강운 AI 일일 리포트',
                  ja: '総合運・金運・恋愛運・健康運 AI日刊レポート',
                  en: 'AI daily report: overall, money, love & health fortune',
                  zh: 'AI每日报告：综合运·财运·恋爱运·健康运',
                },
                love: {
                  ko: '나의 연애운 분석 · 두 사람의 궁합 분석',
                  ja: '恋愛運分析・二人の相性分析',
                  en: 'Love fortune analysis · Compatibility check',
                  zh: '恋爱运分析 · 两人缘分分析',
                },
              };

              return (
                <a
                  key={mod}
                  href={`/${currentLocale}${config.href}`}
                  className="glass-card module-card"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="module-icon" style={{ background: config.gradient }}>
                    {config.icon}
                  </div>
                  <h3 className="module-name">{names[mod][currentLocale]}</h3>
                  <p className="module-desc">{descs[mod][currentLocale]}</p>
                  <span className="module-arrow">→</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section trust-section">
        <div className="container text-center">
          <div className="trust-badges">
            <div className="glass-card trust-badge">
              <span className="trust-icon">🔬</span>
              <span>{currentLocale === 'ko' ? '천체력 기반 정밀 계산' : currentLocale === 'ja' ? 'エフェメリス基盤精密計算' : 'Ephemeris-based Precision'}</span>
            </div>
            <div className="glass-card trust-badge">
              <span className="trust-icon">🛡️</span>
              <span>{currentLocale === 'ko' ? '전통 프레임워크 기반' : currentLocale === 'ja' ? '伝統的フレームワーク' : 'Traditional Frameworks'}</span>
            </div>
            <div className="glass-card trust-badge">
              <span className="trust-icon">🤖</span>
              <span>{currentLocale === 'ko' ? 'AI 강화 해석' : currentLocale === 'ja' ? 'AI強化解釈' : 'AI-Enhanced Interpretation'}</span>
            </div>
          </div>
          <p className="trust-statement">
            {t('common.trustStatement')}
          </p>
        </div>
      </section>

      {/* Tier Preview */}
      <section className="section">
        <div className="container text-center">
          <h2 className="section-title">
            <span className="text-gradient">
              {currentLocale === 'ko' ? '당신의 점술사를 선택하세요' : currentLocale === 'ja' ? 'あなたの占い師を選んでください' : 'Choose Your Seer'}
            </span>
          </h2>
          <div className="tier-preview-grid">
            {(['free', 'plus', 'pro', 'archmage'] as const).map((tier) => {
              const names = { free: t('tiers.apprentice'), plus: t('tiers.tenYear'), pro: t('tiers.hundredYear'), archmage: t('tiers.archmage') };
              const colors = { free: 'var(--tier-free)', plus: 'var(--tier-plus)', pro: 'var(--tier-pro)', archmage: 'var(--tier-archmage)' };
              const badges = { free: 'badge-free', plus: 'badge-plus', pro: 'badge-pro', archmage: 'badge-archmage' };
              return (
                <div key={tier} className="glass-card tier-preview-card">
                  <span className={`badge ${badges[tier]}`}>{tier === 'free' ? t('tiers.free') : tier.toUpperCase()}</span>
                  <h3 style={{ color: colors[tier] }}>{names[tier]}</h3>
                  <a href={`/${currentLocale}/pricing`} className="btn btn-secondary" style={{ borderColor: colors[tier], marginTop: 'var(--space-4)' }}>
                    {tierCta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          padding: var(--space-24) 0 var(--space-20);
          position: relative;
          overflow: hidden;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-badge {
          margin-bottom: var(--space-6);
        }
        .hero-title {
          font-size: var(--text-6xl);
          font-weight: 800;
          line-height: var(--leading-tight);
          margin-bottom: var(--space-6);
        }
        .hero-subtitle {
          font-size: var(--text-xl);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-8);
        }
        .hero-cta {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-orb {
          position: absolute;
          top: 50%;
          right: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(138, 100, 255, 0.15), transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-6);
        }
        .module-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-8);
          animation: fadeIn 0.6s ease forwards;
          opacity: 0;
          text-decoration: none;
          color: inherit;
        }
        .module-card:hover {
          transform: translateY(-4px);
        }
        .module-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);
          margin-bottom: var(--space-4);
        }
        .module-name {
          font-size: var(--text-xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        .module-desc {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
        }
        .module-arrow {
          margin-top: var(--space-4);
          font-size: var(--text-xl);
          color: var(--color-accent-primary);
          transition: transform var(--transition-fast);
        }
        .module-card:hover .module-arrow {
          transform: translateX(4px);
        }
        .trust-section {
          background: var(--color-bg-secondary);
        }
        .trust-badges {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: var(--space-8);
        }
        .trust-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          font-size: var(--text-sm);
        }
        .trust-icon {
          font-size: var(--text-xl);
        }
        .trust-statement {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          max-width: 600px;
          margin: 0 auto;
          font-style: italic;
        }
        .section-title {
          font-size: var(--text-4xl);
          font-weight: 800;
          margin-bottom: var(--space-10);
        }
        .tier-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }
        .tier-preview-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-6);
        }
        .tier-preview-card h3 {
          margin-top: var(--space-3);
          font-size: var(--text-lg);
          font-weight: 700;
        }
      `}</style>
    </>
  );
}
