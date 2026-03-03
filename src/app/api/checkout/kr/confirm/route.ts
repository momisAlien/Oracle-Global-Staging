/* ===========================
   PortOne KR Payment Confirm
   POST /api/checkout/kr/confirm
   ===========================
   
   PortOne 결제 결과 서버사이드 검증 후 크레딧 부여
   ★ 클라이언트 콜백만으로는 절대 크레딧을 부여하지 않음
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const PORTONE_API_KEY = process.env.PORTONE_API_KEY;
        const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

        if (!PORTONE_API_KEY || !PORTONE_API_SECRET) {
            return NextResponse.json({ error: 'PortOne 서버 인증 미설정' }, { status: 503 });
        }

        // Auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const decoded = await getAdminAuth().verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;

        const body = await request.json();
        const { orderId, paymentId, transactionId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'orderId가 필요합니다' }, { status: 400 });
        }

        const adminDb = getAdminDb();

        // 1. Load order from Firestore
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
        }

        const order = orderDoc.data()!;

        // Verify order belongs to user
        if (order.uid !== uid) {
            return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
        }

        // Check if already processed
        if (order.status === 'paid') {
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                message: '이미 처리된 주문입니다',
            });
        }

        // 2. Verify payment with PortOne server API
        // Using PortOne REST API v2 to check payment status
        let paymentVerified = false;
        let verifiedAmount = 0;

        try {
            const verifyRes = await fetch(
                `https://api.portone.io/payments/${encodeURIComponent(paymentId || transactionId)}`,
                {
                    headers: {
                        'Authorization': `PortOne ${PORTONE_API_SECRET}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (verifyRes.ok) {
                const paymentData = await verifyRes.json();

                // Verify amount matches (critical security check)
                if (paymentData.status === 'PAID' && paymentData.amount?.total === order.amount) {
                    paymentVerified = true;
                    verifiedAmount = paymentData.amount.total;
                } else {
                    console.error('[PortOne Confirm] Amount mismatch or not paid:', {
                        expected: order.amount,
                        actual: paymentData.amount?.total,
                        status: paymentData.status,
                    });
                }
            } else {
                const errText = await verifyRes.text();
                console.error('[PortOne Confirm] Verification API failed:', errText);
            }
        } catch (verifyError) {
            console.error('[PortOne Confirm] Verification request failed:', verifyError);
        }

        if (!paymentVerified) {
            await orderRef.update({ status: 'failed', failedAt: new Date() });
            return NextResponse.json(
                { error: '결제 검증에 실패했습니다', code: 'PAYMENT_VERIFICATION_FAILED' },
                { status: 400 }
            );
        }

        // 3. Grant credits
        const { grantCredits } = await import('@/lib/db/credits');
        const { FieldValue } = await import('firebase-admin/firestore');

        const result = await grantCredits(
            adminDb,
            uid,
            order.grade,
            order.creditsAmount,
            'purchase_portone'
        );

        // 4. Update order status
        await orderRef.update({
            status: 'paid',
            paymentId: paymentId || transactionId,
            verifiedAmount,
            paidAt: FieldValue.serverTimestamp(),
        });

        // 5. Store purchase record
        await adminDb.collection('purchases').add({
            uid,
            provider: 'portone',
            providerPaymentId: paymentId || transactionId || '',
            tier: order.grade,
            amount: verifiedAmount,
            currency: 'KRW',
            status: 'completed',
            orderId,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            creditsGranted: order.creditsAmount,
            remaining: result.remaining,
            grade: order.grade,
        });
    } catch (error) {
        console.error('[PortOne Confirm Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '결제 확인 실패' },
            { status: 500 }
        );
    }
}
