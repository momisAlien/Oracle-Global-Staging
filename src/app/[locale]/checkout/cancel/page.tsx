'use client';

/* ===========================
   Checkout Cancel Page
   /{locale}/checkout/cancel
   =========================== */

import { useParams } from 'next/navigation';

const LABELS: Record<string, Record<string, string>> = {
    title: {
        ko: '결제가 취소되었습니다',
        ja: '決済がキャンセルされました',
        en: 'Payment Cancelled',
        zh: '付款已取消',
    },
    subtitle: {
        ko: '결제 과정에서 문제가 있으셨나요? 언제든 다시 시도하실 수 있습니다.',
        ja: 'お支払いに問題がありましたか？いつでもやり直せます。',
        en: 'Had an issue during checkout? You can try again anytime.',
        zh: '付款过程中遇到问题了吗？您可以随时重试。',
    },
    retry: {
        ko: '요금제 보기',
        ja: '料金プランを見る',
        en: 'View Pricing',
        zh: '查看定价',
    },
    goHome: {
        ko: '홈으로',
        ja: 'ホームへ',
        en: 'Go Home',
        zh: '回首页',
    },
};

export default function CheckoutCancelPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';
    const L = (obj: Record<string, string>) => obj[loc] || obj.en;

    return (
        <section className="section">
            <div className="container" style={{
                maxWidth: '600px',
                textAlign: 'center',
                padding: '4rem 1.5rem',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>😔</div>
                <h1 style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    color: 'var(--color-text-primary)',
                }}>
                    {L(LABELS.title)}
                </h1>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-lg)',
                    lineHeight: 1.8,
                    marginBottom: '2rem',
                }}>
                    {L(LABELS.subtitle)}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href={`/${loc}/pricing`} style={{
                        padding: '0.75rem 2rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent-primary)',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                    }}>
                        {L(LABELS.retry)}
                    </a>
                    <a href={`/${loc}`} style={{
                        padding: '0.75rem 2rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        {L(LABELS.goHome)}
                    </a>
                </div>
            </div>
        </section>
    );
}
