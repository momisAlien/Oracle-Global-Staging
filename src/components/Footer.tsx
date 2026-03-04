'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const FOOTER_LABELS: Record<string, Record<string, string>> = {
  services: { ko: '서비스', ja: 'サービス', en: 'Services', zh: '服务' },
  legal: { ko: '법적 고지', ja: '法的情報', en: 'Legal', zh: '法律信息' },
  saju: { ko: '사주', ja: '四柱推命', en: 'Saju', zh: '四柱' },
  tarot: { ko: '타로', ja: 'タロット', en: 'Tarot', zh: '塔罗' },
  astrology: { ko: '점성술', ja: '占星術', en: 'Astrology', zh: '占星术' },
  horoscope: { ko: '별자리 및 띠 운세', ja: '星座・干支占い', en: 'Zodiac & Chinese Zodiac', zh: '星座与生肖运势' },
  todayReport: { ko: '오늘의 운세', ja: '今日の運勢', en: "Today's Fortune", zh: '今日运势' },
  love: { ko: '연애 운세', ja: '恋愛占い', en: 'Love Fortune', zh: '恋爱运势' },
  privacy: { ko: '개인정보 처리방침', ja: 'プライバシーポリシー', en: 'Privacy Policy', zh: '隐私政策' },
  terms: { ko: '이용약관', ja: '利用規約', en: 'Terms of Service', zh: '服务条款' },
  contact: { ko: '문의하기', ja: 'お問い合わせ', en: 'Contact Us', zh: '联系我们' },
  about: { ko: '소개', ja: '概要', en: 'About', zh: '关于我们' },
  disclaimer: {
    ko: '본 서비스는 오락 및 개인적 성찰 목적으로만 제공됩니다. 의료·법률·금융 조언이 아닙니다.',
    ja: '本サービスはエンターテインメントおよび内省を目的としたものです。医療・法律・金融の助言ではありません。',
    en: 'This service is for entertainment and personal reflection only. It is not medical, legal, or financial advice.',
    zh: '本服务仅供娱乐和个人反思之用，不构成医疗、法律或财务建议。',
  },
  language: { ko: '언어', ja: '言語', en: 'Language', zh: '语言' },
};

const SERVICE_LINKS = [
  { key: 'saju', href: '/saju' },
  { key: 'tarot', href: '/tarot' },
  { key: 'astrology', href: '/astrology' },
  { key: 'horoscope', href: '/horoscope' },
  { key: 'todayReport', href: '/today-report' },
  { key: 'love', href: '/love' },
];

const LEGAL_LINKS = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'contact', href: '/contact' },
  { key: 'about', href: '/about' },
];

const LOCALES = ['ko', 'ja', 'en', 'zh'];

export default function Footer() {
  const { locale } = useParams();
  const loc = (locale as string) || 'en';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* 서비스 링크 */}
          <div className="footer-col">
            <h3 className="footer-heading">{FOOTER_LABELS.services[loc]}</h3>
            <ul className="footer-list">
              {SERVICE_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={`/${loc}${link.href}`} aria-label={FOOTER_LABELS[link.key][loc]}>
                    {FOOTER_LABELS[link.key][loc]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 고지 */}
          <div className="footer-col">
            <h3 className="footer-heading">{FOOTER_LABELS.legal[loc]}</h3>
            <ul className="footer-list">
              {LEGAL_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={`/${loc}${link.href}`} aria-label={FOOTER_LABELS[link.key][loc]}>
                    {FOOTER_LABELS[link.key][loc]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 문의 & 언어 */}
          <div className="footer-col">
            <h3 className="footer-heading">{FOOTER_LABELS.contact[loc]}</h3>
            <p className="footer-email">
              <a href="mailto:support@tarotaihub.com" aria-label="Email support">
                support@tarotaihub.com
              </a>
            </p>
            <h3 className="footer-heading" style={{ marginTop: 'var(--space-4)' }}>
              {FOOTER_LABELS.language[loc]}
            </h3>
            <div className="footer-locales">
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`footer-locale-btn ${l === loc ? 'active' : ''}`}
                  aria-label={`Switch to ${l.toUpperCase()}`}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">{FOOTER_LABELS.disclaimer[loc]}</p>
          <p className="footer-copy">© {year} TarotAIHub. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .site-footer {
          border-top: 1px solid var(--color-border);
          padding: var(--space-10) 0 var(--space-6);
          margin-top: var(--space-10);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-8);
          margin-bottom: var(--space-8);
        }
        .footer-heading {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent-primary);
          font-weight: 700;
          margin-bottom: var(--space-3);
        }
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .footer-list a {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          transition: color var(--transition-fast);
        }
        .footer-list a:hover {
          color: var(--color-text-primary);
        }
        .footer-email a {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          transition: color var(--transition-fast);
        }
        .footer-email a:hover {
          color: var(--color-accent-primary);
        }
        .footer-locales {
          display: flex;
          gap: var(--space-1);
        }
        .footer-locale-btn {
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          transition: all var(--transition-fast);
          background: var(--color-bg-glass);
        }
        .footer-locale-btn.active {
          background: var(--color-accent-primary);
          color: white;
        }
        .footer-locale-btn:hover:not(.active) {
          color: var(--color-text-primary);
        }
        .footer-bottom {
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-6);
          text-align: center;
        }
        .footer-disclaimer {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          max-width: 600px;
          margin: 0 auto var(--space-2);
          line-height: 1.6;
        }
        .footer-copy {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          opacity: 0.6;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }
        }
      `}</style>
    </footer>
  );
}
