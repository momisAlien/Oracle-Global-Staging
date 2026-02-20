/* ===========================
   Toss Create Session API Route
   POST /api/payments/toss/create-session
   ===========================
   
   📖 https://docs.tosspayments.com/guides/v2/payment-widget/integration
*/

import { NextRequest, NextResponse } from 'next/server';
import { isTossConfigured, getTossConfigError } from '@/lib/payments/toss/config';
import { tossProvider } from '@/lib/payments/toss/provider';
import { TierName } from '@/lib/tiers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    // Feature Flag: 결제 비활성화 시 즉시 차단
    const { isPaymentsEnabled, PAYMENT_DISABLED_RESPONSE } = await import('@/lib/featureFlags');
    if (!isPaymentsEnabled()) {
        return NextResponse.json(PAYMENT_DISABLED_RESPONSE, { status: 403 });
    }

    // 키 미설정 → 503
    if (!isTossConfigured()) {
        return NextResponse.json(
            { error: getTossConfigError(), code: 'TOSS_NOT_CONFIGURED' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { uid, tier, locale, pricePlanId } = body as {
            uid: string;
            tier: Exclude<TierName, 'free'>;
            locale: string;
            pricePlanId: string;
        };

        // 입력 검증
        if (!uid || !tier || !locale) {
            return NextResponse.json(
                { error: '필수 파라미터 누락: uid, tier, locale' },
                { status: 400 }
            );
        }

        if (!['plus', 'pro', 'archmage'].includes(tier)) {
            return NextResponse.json(
                { error: '유효하지 않은 티어입니다' },
                { status: 400 }
            );
        }

        // TODO: Firebase Auth 토큰 검증
        // const authToken = request.headers.get('Authorization');
        // const decodedToken = await verifyIdToken(authToken);
        // if (decodedToken.uid !== uid) return 403;

        // TODO: Firestore에서 promoUsedFlags 조회
        const promoUsedFlags: Record<string, boolean> = {};
        const isFirstPurchase = true; // TODO: Firestore 조회

        const session = await tossProvider.createCheckoutSession({
            uid,
            tier,
            locale,
            pricePlanId: pricePlanId || tier,
            isFirstPurchase,
            promoUsedFlags,
        });

        // TODO: Firestore에 PENDING 구매 기록 생성
        // await db.collection('purchases').doc(session.purchaseId).set({
        //   provider: 'toss',
        //   tier,
        //   amount: session.amount,
        //   currency: session.currency,
        //   status: 'PENDING',
        //   uid,
        //   orderId: session.orderId,
        //   createdAt: FieldValue.serverTimestamp(),
        // });

        return NextResponse.json(session);
    } catch (error) {
        console.error('[Toss Create Session Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '세션 생성 실패' },
            { status: 500 }
        );
    }
}
