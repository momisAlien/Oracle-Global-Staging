'use client';

/* ===========================
   Checkout Success Page
   /{locale}/checkout/success
   =========================== */

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const LABELS: Record<string, Record<string, string>> = {
    title: {
        ko: '결제 완료! 🎉',
        ja: '決済完了！🎉',
        en: 'Payment Successful! 🎉',
        zh: '付款成功！🎉',
    },
    subtitle: {
        ko: '크레딧이 계정에 추가되었습니다. 지금 바로 운세를 확인해 보세요!',
        ja: 'クレジットがアカウントに追加されました。今すぐ占いをチェック！',
        en: 'Credits have been added to your account. Check your fortune now!',
        zh: '积分已添加到您的账户。现在就查看您的运势吧！',
    },
    goHome: {
        ko: '운세 보러 가기',
        ja: '占いを見に行く',
        en: 'Go to Fortune',
        zh: '去看运势',
    },
    viewMyPage: {
        ko: '마이페이지',
        ja: 'マイページ',
        en: 'My Page',
        zh: '我的页面',
    },
};

function SuccessContent() {
    const { locale } = useParams();
    const searchParams = useSearchParams();
    const loc = (locale as string) || 'ko';
    const sessionId = searchParams.get('session_id');
    const L = (obj: Record<string, string>) => obj[loc] || obj.en;

    return (
        <section className="section">
            <div className="container" style={{
                maxWidth: '600px',
                textAlign: 'center',
                padding: '4rem 1.5rem',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                <h1 style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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

                {sessionId && (
                    <p style={{
                        color: 'var(--color-text-tertiary)',
                        fontSize: 'var(--text-sm)',
                        marginBottom: '2rem',
                    }}>
                        Session: {sessionId.slice(0, 16)}...
                    </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href={`/${loc}`} style={{
                        padding: '0.75rem 2rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent-primary)',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                    }}>
                        {L(LABELS.goHome)}
                    </a>
                    <a href={`/${loc}/mypage`} style={{
                        padding: '0.75rem 2rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        {L(LABELS.viewMyPage)}
                    </a>
                </div>
            </div>
        </section>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
