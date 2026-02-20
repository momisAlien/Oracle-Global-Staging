'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

// 토스페이먼츠 위젯 JS SDK 스크립트 로드
// 📖 https://docs.tosspayments.com/sdk/v2/js
// 📖 https://docs.tosspayments.com/guides/v2/payment-widget/integration

const TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard';

export default function TossCheckoutPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>}>
            <TossCheckoutInner />
        </Suspense>
    );
}

function TossCheckoutInner() {
    const { locale } = useParams();
    const searchParams = useSearchParams();
    const tier = searchParams.get('tier') || 'plus';
    const loc = (locale as string) || 'ko';

    const [clientKey, setClientKey] = useState<string>('');
    const [isKeyMissing, setIsKeyMissing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState<string>('');
    const [paymentsDisabled, setPaymentsDisabled] = useState(false);

    useEffect(() => {
        // Feature Flag 체크
        fetch('/api/config')
            .then(r => r.json())
            .then(d => {
                if (!d.paymentsEnabled) {
                    setPaymentsDisabled(true);
                    setIsLoading(false);
                    return;
                }
                const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';
                setClientKey(key);
                setIsKeyMissing(!key);
                setIsLoading(false);
            })
            .catch(() => {
                const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';
                setClientKey(key);
                setIsKeyMissing(!key);
                setIsLoading(false);
            });
    }, []);

    // 체크아웃 세션 생성
    async function handleCreateSession() {
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/payments/toss/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: 'demo-user', // TODO: Firebase Auth에서 가져오기
                    tier,
                    locale: loc,
                    pricePlanId: tier,
                }),
            });

            if (res.status === 503) {
                const data = await res.json();
                setIsKeyMissing(true);
                setError(data.error);
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || '세션 생성 실패');
                return;
            }

            const session = await res.json();
            setSessionData(session);

            // 토스 위젯 실행
            // TODO: SDK가 로드되면 실제 결제 위젯 트리거
            // const tossPayments = TossPayments(clientKey);
            // tossPayments.requestPayment('카드', {
            //   amount: session.amount,
            //   orderId: session.orderId,
            //   orderName: session.orderName,
            //   successUrl: session.successUrl,
            //   failUrl: session.failUrl,
            //   customerKey: session.customerKey,
            // });

        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다');
        } finally {
            setIsLoading(false);
        }
    }

    const tierNames: Record<string, Record<string, string>> = {
        plus: { ko: '10년 점술사 (Plus)', ja: '十年占い師 (Plus)', en: '10-Year Seer (Plus)' },
        pro: { ko: '100년 대도사 (Pro)', ja: '百年大師 (Pro)', en: '100-Year Grand Seer (Pro)' },
        archmage: { ko: '아크메이지', ja: 'アークメイジ', en: 'Archmage' },
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '600px' }}>
                {/* 결제 비활성화 안내 */}
                {paymentsDisabled ? (
                    <div className="text-center" style={{ padding: 'var(--space-16) 0' }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--space-6)' }}>✨</div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
                            <span className="text-gradient">
                                {loc === 'ko' ? '결제 기능 준비 중' : loc === 'ja' ? '決済機能準備中' : loc === 'zh' ? '支付功能准备中' : 'Payments Coming Soon'}
                            </span>
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
                            {loc === 'ko' ? '결제 기능은 곧 오픈됩니다. 지금은 무료로 체험해보세요!' : loc === 'ja' ? '決済機能は近日オープン予定です。今は無料で体験してください！' : 'Payment features will be available soon. Try it for free!'}
                        </p>
                        <a href={`/${loc}/pricing`} className="btn btn-primary btn-lg">
                            {loc === 'ko' ? '티어 비교 보기' : loc === 'ja' ? 'ティア比較を見る' : 'Compare Tiers'}
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
                            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
                                <span className="text-gradient">
                                    {loc === 'ko' ? '구독 결제' : loc === 'ja' ? '購読支払い' : 'Subscribe'}
                                </span>
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                {tierNames[tier]?.[loc === 'zh' ? 'en' : loc] || tier}
                            </p>
                        </div>

                        {/* 키 미설정 배너 */}
                        {isKeyMissing && (
                            <div className="banner-warning" style={{ marginBottom: 'var(--space-6)' }}>
                                ⚠️ {loc === 'ko'
                                    ? '토스페이먼츠 키가 설정되지 않았습니다. 결제 기능이 비활성화됩니다.'
                                    : loc === 'ja'
                                        ? '決済キーが設定されていません。決済機能は無効です。'
                                        : 'Toss payment keys are not configured. Payment is disabled.'}
                                <br />
                                <small style={{ opacity: 0.7 }}>
                                    .env.local → NEXT_PUBLIC_TOSS_CLIENT_KEY, TOSS_SECRET_KEY
                                </small>
                            </div>
                        )}

                        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                            {/* 결제 수단 미리보기 */}
                            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                                {loc === 'ko' ? '결제 수단' : loc === 'ja' ? '支払い方法' : 'Payment Methods'}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                                {[
                                    { label: loc === 'ko' ? '신용카드' : 'Card', icon: '💳' },
                                    { label: 'KakaoPay', icon: '🟡' },
                                    { label: 'NaverPay', icon: '🟢' },
                                    { label: 'TossPay', icon: '🔵' },
                                    { label: loc === 'ko' ? '계좌이체' : 'Bank', icon: '🏦' },
                                    { label: loc === 'ko' ? '가상계좌' : 'Virtual', icon: '📋' },
                                ].map((method) => (
                                    <div
                                        key={method.label}
                                        style={{
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-3)',
                                            textAlign: 'center',
                                            fontSize: 'var(--text-sm)',
                                        }}
                                    >
                                        <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>{method.icon}</div>
                                        {method.label}
                                    </div>
                                ))}
                            </div>

                            {/* 토스 위젯 마운트 포인트 */}
                            <div id="toss-payment-widget" style={{ minHeight: '200px', marginBottom: 'var(--space-6)' }}>
                                {!isKeyMissing && !sessionData && (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                                        {loc === 'ko' ? '결제 버튼을 누르면 토스 결제 위젯이 표시됩니다.' : 'Click Pay to load the Toss payment widget.'}
                                    </div>
                                )}
                                {sessionData && (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'rgba(78,205,196,0.1)', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ color: 'var(--tier-plus)', fontWeight: 600 }}>
                                            ✓ {loc === 'ko' ? '세션 생성 완료' : 'Session created'}
                                        </p>
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                                            Order: {sessionData.orderId as string} / Amount: ₩{(sessionData.amount as number)?.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div style={{ color: 'var(--color-accent-rose)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleCreateSession}
                                disabled={isKeyMissing || isLoading}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                            >
                                {isLoading
                                    ? (loc === 'ko' ? '처리 중...' : 'Loading...')
                                    : isKeyMissing
                                        ? (loc === 'ko' ? '결제 준비 중 (키 미설정)' : 'Payment setup pending')
                                        : (loc === 'ko' ? '결제하기' : 'Pay Now')}
                            </button>
                        </div>

                        {/* 갱신 가격 안내 */}
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {loc === 'ko'
                                ? '* 출시 특가는 첫 해에만 적용됩니다. 갱신 시 정상 갱신가가 적용됩니다.'
                                : loc === 'ja'
                                    ? '* ローンチ特価は初年度のみ適用されます。更新時は通常の更新価格が適用されます。'
                                    : '* Launch special applies to the first year only. Renewal pricing applies thereafter.'}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
