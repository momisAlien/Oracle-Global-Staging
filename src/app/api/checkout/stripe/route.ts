/* ===========================
   Stripe Checkout API
   POST /api/checkout/stripe
   ===========================
   
   Stripe Checkout Session 생성
   - mode: subscription (월정액) 또는 payment (크레딧 팩)
   - metadata에 userId, grade, creditsAmount 전달 → webhook에서 fulfillment
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Credit pack definitions
const CREDIT_PACKS: Record<string, { credits: number; priceUsd: number; label: string }> = {
    pack_5: { credits: 5, priceUsd: 399, label: '5 Credits' },
    pack_20: { credits: 20, priceUsd: 1299, label: '20 Credits' },
    pack_50: { credits: 50, priceUsd: 2499, label: '50 Credits' },
};

export async function POST(request: NextRequest) {
    try {
        const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
        if (!STRIPE_SECRET) {
            return NextResponse.json(
                { error: 'Stripe가 구성되지 않았습니다', code: 'STRIPE_NOT_CONFIGURED' },
                { status: 503 }
            );
        }

        // Auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { getAdminAuth } = await import('@/lib/firebase/admin');
        const decoded = await getAdminAuth().verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;
        const email = decoded.email || '';

        const body = await request.json();
        const { mode, planId, grade, locale } = body;

        // Dynamic import Stripe
        const Stripe = (await import('stripe')).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2025-02-24.acacia' as any });

        const origin = request.headers.get('origin') || 'https://tarotaihub.com';
        const successUrl = `${origin}/${locale || 'ko'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/${locale || 'ko'}/checkout/cancel`;

        if (mode === 'subscription') {
            // Monthly subscription via Stripe Price ID
            const priceId = planId || process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
            if (!priceId) {
                return NextResponse.json({ error: 'Price ID가 설정되지 않았습니다' }, { status: 400 });
            }

            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                customer_email: email,
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: uid,
                    grade: grade || 'pro',
                    type: 'subscription',
                    locale: locale || 'ko',
                },
            });

            return NextResponse.json({ url: session.url });
        }

        if (mode === 'credits') {
            // One-time credit pack purchase
            const pack = CREDIT_PACKS[planId];
            if (!pack) {
                return NextResponse.json(
                    { error: '유효하지 않은 크레딧 팩입니다', code: 'INVALID_PACK' },
                    { status: 400 }
                );
            }

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                customer_email: email,
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: pack.label },
                        unit_amount: pack.priceUsd,
                    },
                    quantity: 1,
                }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: uid,
                    grade: grade || 'plus',
                    type: 'credits',
                    creditsAmount: String(pack.credits),
                    packId: planId,
                    locale: locale || 'ko',
                },
            });

            return NextResponse.json({ url: session.url });
        }

        return NextResponse.json({ error: '유효하지 않은 mode입니다' }, { status: 400 });
    } catch (error) {
        console.error('[Stripe Checkout Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Checkout 실패' },
            { status: 500 }
        );
    }
}
