import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n/request';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    ko: 'Oracle — 프리미엄 운세 플랫폼',
    ja: 'Oracle — プレミアム占いプラットフォーム',
    en: 'Oracle — Premium Fortune Platform',
    zh: 'Oracle — 高端命理平台',
  };
  const descriptions: Record<string, string> = {
    ko: 'AI 기반 사주, 점성술, 타로 분석. 동양과 서양의 지혜를 만나보세요.',
    ja: 'AI占い — タロット・占星術・四柱推命を統合分析',
    en: 'AI-powered astrology, saju, and tarot readings. Where Eastern and Western wisdom meet.',
    zh: 'AI驱动的占星术、四柱、塔罗牌解读。东西方智慧的交汇。',
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const langMap: Record<string, string> = {
    ko: 'ko',
    ja: 'ja',
    en: 'en',
    zh: 'zh-CN',
  };

  return (
    <html lang={langMap[locale] || 'en'}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="app-wrapper">
            <nav className="main-nav">
              <div className="container nav-inner">
                <a href={`/${locale}`} className="nav-logo">
                  <span className="logo-icon">✦</span>
                  <span className="logo-text">Oracle</span>
                </a>
                <div className="nav-links">
                  <a href={`/${locale}/astrology`}>
                    {locale === 'ko' ? '점성술' : locale === 'ja' ? '占星術' : locale === 'zh' ? '占星术' : 'Astrology'}
                  </a>
                  <a href={`/${locale}/saju`}>
                    {locale === 'ko' ? '사주' : locale === 'ja' ? '四柱' : locale === 'zh' ? '四柱' : 'Saju'}
                  </a>
                  <a href={`/${locale}/tarot`}>
                    {locale === 'ko' ? '타로' : locale === 'ja' ? 'タロット' : locale === 'zh' ? '塔罗' : 'Tarot'}
                  </a>
                  <a href={`/${locale}/pricing`} className="nav-pricing">
                    {locale === 'ko' ? '요금제' : locale === 'ja' ? '料金' : locale === 'zh' ? '价格' : 'Pricing'}
                  </a>
                  <a href={`/${locale}/mypage`}>
                    {locale === 'ko' ? '마이페이지' : locale === 'ja' ? 'マイページ' : locale === 'zh' ? '我的' : 'My Page'}
                  </a>
                </div>
                <div className="nav-actions">
                  <div className="locale-switcher">
                    {locales.map((l) => (
                      <a
                        key={l}
                        href={`/${l}`}
                        className={`locale-btn ${l === locale ? 'active' : ''}`}
                      >
                        {l.toUpperCase()}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
            <main className="main-content">
              {children}
            </main>
            <footer className="main-footer">
              <div className="container">
                <div className="disclaimer">
                  {locale === 'ko'
                    ? '본 서비스는 오락 및 개인적 성찰 목적으로만 제공됩니다.'
                    : locale === 'ja'
                      ? '本サービスはエンターテインメントおよび個人的な内省を目的として提供されています。'
                      : locale === 'zh'
                        ? '本服务仅供娱乐和个人反思之用。'
                        : 'This service is intended for entertainment and personal reflection purposes only.'}
                </div>
                <p className="footer-copy">© 2026 Oracle. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>

        <style>{`
          .main-nav {
            position: sticky;
            top: 0;
            z-index: var(--z-sticky);
            background: rgba(10, 10, 26, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--color-border);
            height: var(--nav-height);
          }
          .nav-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
          }
          .nav-logo {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            font-weight: 800;
            font-size: var(--text-xl);
            color: var(--color-text-primary);
          }
          .logo-icon {
            font-size: var(--text-2xl);
            background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .nav-links {
            display: flex;
            gap: var(--space-6);
          }
          .nav-links a {
            color: var(--color-text-secondary);
            font-size: var(--text-sm);
            font-weight: 500;
            transition: color var(--transition-fast);
          }
          .nav-links a:hover {
            color: var(--color-text-primary);
          }
          .nav-pricing {
            background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 600 !important;
          }
          .nav-actions {
            display: flex;
            align-items: center;
            gap: var(--space-3);
          }
          .locale-switcher {
            display: flex;
            gap: var(--space-1);
            background: var(--color-bg-glass);
            border-radius: var(--radius-full);
            padding: var(--space-1);
          }
          .locale-btn {
            padding: var(--space-1) var(--space-2);
            border-radius: var(--radius-full);
            font-size: var(--text-xs);
            font-weight: 600;
            color: var(--color-text-muted);
            transition: all var(--transition-fast);
          }
          .locale-btn.active {
            background: var(--color-accent-primary);
            color: white;
          }
          .locale-btn:hover:not(.active) {
            color: var(--color-text-primary);
          }
          .main-content {
            min-height: calc(100vh - var(--nav-height) - 120px);
          }
          .main-footer {
            padding: var(--space-8) 0;
            border-top: 1px solid var(--color-border);
            text-align: center;
          }
          .footer-copy {
            font-size: var(--text-xs);
            color: var(--color-text-muted);
            margin-top: var(--space-2);
          }
          @media (max-width: 768px) {
            .nav-links {
              display: none;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
