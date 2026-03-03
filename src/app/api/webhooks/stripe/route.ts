/* ===========================
   Stripe Webhook Handler
   POST /api/webhooks/stripe
   ===========================
   
   Stripe 이벤트 수신 + 크레딧/구독 처리
   - checkout.session.completed: 크레딧 팩 또는 구독 시작
   - invoice.paid: 구독 갱신 시 월간 크레딧 부여
   - customer.subscription.deleted: 구독 취소
   
   ★ 이벤트 중복 방지: processedEvents/{eventId} 체크
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Monthly credits per subscription tier
const SUBSCRIPTION_MONTHLY_CREDITS: Record<string, number> = {
    plus: 30,
    pro: 100,
    archmage: 999,
};

export async function POST(request: NextRequest) {
    try {
        const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
        const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

        if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
        }

        const Stripe = (await import('stripe')).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2025-02-24.acacia' as any });

        // Verify Stripe signature
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');
        if (!sig) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
        } catch (err) {
            console.error('[Stripe Webhook] Signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const { getAdminDb } = await import('@/lib/firebase/admin');
        const adminDb = getAdminDb();

        // Idempotency check
        const eventRef = adminDb.doc(`processedEvents/${event.id}`);
        const eventDoc = await eventRef.get();
        if (eventDoc.exists) {
            console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`);
            return NextResponse.json({ received: true, duplicate: true });
        }

        // Mark event as processed
        const { FieldValue } = await import('firebase-admin/firestore');
        await eventRef.set({
            type: event.type,
            processedAt: FieldValue.serverTimestamp(),
        });

        // Handle events
        switch (event.type) {
            case 'checkout.session.completed': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const session = event.data.object as any;
                const metadata = session.metadata || {};
                const userId = metadata.userId;
                const grade = metadata.grade || 'plus';
                const type = metadata.type;

                if (!userId) {
                    console.error('[Stripe Webhook] Missing userId in metadata');
                    break;
                }

                if (type === 'credits') {
                    const creditsAmount = parseInt(metadata.creditsAmount || '0', 10);
                    if (creditsAmount > 0) {
                        const { grantCredits } = await import('@/lib/db/credits');
                        await grantCredits(adminDb, userId, grade, creditsAmount, 'purchase_stripe');
                        console.log(`[Stripe Webhook] Granted ${creditsAmount} credits to ${userId} (${grade})`);
                    }
                }

                if (type === 'subscription') {
                    // Grant first month credits
                    const monthlyCredits = SUBSCRIPTION_MONTHLY_CREDITS[grade] || 30;
                    const { grantCredits } = await import('@/lib/db/credits');
                    await grantCredits(adminDb, userId, grade, monthlyCredits, 'subscription_monthly');

                    // Store subscription record
                    await adminDb.collection('subscriptions').add({
                        uid: userId,
                        provider: 'stripe',
                        providerSubId: session.subscription || '',
                        tier: grade,
                        status: 'active',
                        currentPeriodEnd: null, // Updated on invoice.paid
                        createdAt: FieldValue.serverTimestamp(),
                    });
                    console.log(`[Stripe Webhook] Subscription created for ${userId} (${grade})`);
                }

                // Store payment record
                await adminDb.collection('purchases').add({
                    uid: userId,
                    provider: 'stripe',
                    providerPaymentId: session.payment_intent || session.subscription || '',
                    tier: grade,
                    amount: (session.amount_total || 0) / 100,
                    currency: session.currency || 'usd',
                    status: 'completed',
                    metadata: metadata,
                    createdAt: FieldValue.serverTimestamp(),
                });
                break;
            }

            case 'invoice.paid': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invoice = event.data.object as any;
                const subId = invoice.subscription;
                if (!subId) break;

                // Find userId from subscription record
                const subQuery = await adminDb.collection('subscriptions')
                    .where('providerSubId', '==', subId)
                    .where('provider', '==', 'stripe')
                    .limit(1)
                    .get();

                if (!subQuery.empty) {
                    const subDoc = subQuery.docs[0];
                    const subData = subDoc.data();
                    const monthlyCredits = SUBSCRIPTION_MONTHLY_CREDITS[subData.tier] || 30;

                    const { grantCredits } = await import('@/lib/db/credits');
                    await grantCredits(adminDb, subData.uid, subData.tier, monthlyCredits, 'subscription_monthly');

                    // Update subscription period
                    const periodEnd = invoice.lines?.data?.[0]?.period?.end;
                    if (periodEnd) {
                        await subDoc.ref.update({
                            currentPeriodEnd: new Date(periodEnd * 1000),
                            status: 'active',
                        });
                    }
                    console.log(`[Stripe Webhook] Monthly credits granted for subscription ${subId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sub = event.data.object as any;
                const subQuery = await adminDb.collection('subscriptions')
                    .where('providerSubId', '==', sub.id)
                    .where('provider', '==', 'stripe')
                    .limit(1)
                    .get();

                if (!subQuery.empty) {
                    await subQuery.docs[0].ref.update({ status: 'canceled' });
                    console.log(`[Stripe Webhook] Subscription ${sub.id} canceled`);
                }
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Stripe Webhook Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
