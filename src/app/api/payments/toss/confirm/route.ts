/* ===========================
   Toss Confirm Payment API Route
   POST /api/payments/toss/confirm
   ===========================
   
   📖 https://docs.tosspayments.com/reference#결제-승인
*/

import { NextRequest, NextResponse } from 'next/server';
import { isTossConfigured, getTossConfigError } from '@/lib/payments/toss/config';
import { tossProvider } from '@/lib/payments/toss/provider';

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
        const { paymentKey, orderId, amount } = body as {
            paymentKey: string;
            orderId: string;
            amount: number;
        };

        // 입력 검증
        if (!paymentKey || !orderId || !amount) {
            return NextResponse.json(
                { error: '필수 파라미터 누락: paymentKey, orderId, amount' },
                { status: 400 }
            );
        }

        // TODO: Firestore에서 PENDING 구매 기록 조회
        // const purchaseRef = db.collection('purchases').where('orderId', '==', orderId);
        // const purchaseSnap = await purchaseRef.get();
        // if (purchaseSnap.empty) return 404;
        // const purchaseDoc = purchaseSnap.docs[0];
        // if (purchaseDoc.data().amount !== amount) return 400 (금액 불일치);

        // 토스 결제 승인
        const result = await tossProvider.confirmPayment({
            paymentKey,
            orderId,
            amount,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || '결제 승인 실패' },
                { status: 400 }
            );
        }

        // TODO: Firestore 업데이트
        // 1. purchases/{purchaseId}.status = 'PAID', paymentKey, updatedAt
        // 2. subscriptions/{subId} 생성/갱신
        // 3. entitlements/{uid} 티어 업데이트
        // 4. users/{uid}.promoUsed 플래그 업데이트

        return NextResponse.json({
            success: true,
            transactionId: result.transactionId,
            message: '결제가 완료되었습니다',
        });
    } catch (error) {
        console.error('[Toss Confirm Payment Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '결제 승인 처리 실패' },
            { status: 500 }
        );
    }
}
