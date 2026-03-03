/* ===========================
   PortOne KR Checkout — 주문 생성
   POST /api/checkout/kr
   ===========================
   
   원타임 크레딧 팩 전용 (KR 로컬 결제)
   - 서버에서 주문 레코드 생성 (status: pending)
   - PortOne JS SDK가 필요로 하는 파라미터 반환
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const CREDIT_PACKS_KRW: Record<string, { credits: number; priceKrw: number; label: string }> = {
    pack_5: { credits: 5, priceKrw: 4900, label: '5 크레딧' },
    pack_20: { credits: 20, priceKrw: 14900, label: '20 크레딧' },
    pack_50: { credits: 50, priceKrw: 29900, label: '50 크레딧' },
};

export async function POST(request: NextRequest) {
    try {
        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        if (!storeId) {
            return NextResponse.json(
                { error: 'PortOne이 구성되지 않았습니다', code: 'PORTONE_NOT_CONFIGURED' },
                { status: 503 }
            );
        }

        // Auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const decoded = await getAdminAuth().verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;
        const email = decoded.email || '';

        const body = await request.json();
        const { packId, grade } = body;

        const pack = CREDIT_PACKS_KRW[packId];
        if (!pack) {
            return NextResponse.json({ error: '유효하지 않은 크레딧 팩입니다' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const { FieldValue } = await import('firebase-admin/firestore');

        // Create order record (pending)
        const orderId = `KR_${uid.slice(0, 8)}_${Date.now()}`;
        await adminDb.collection('orders').doc(orderId).set({
            uid,
            provider: 'portone',
            type: 'credits',
            grade: grade || 'plus',
            creditsAmount: pack.credits,
            amount: pack.priceKrw,
            currency: 'KRW',
            status: 'pending',
            packId,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Return params for PortOne JS SDK
        return NextResponse.json({
            orderId,
            orderName: `TarotAIHub ${pack.label}`,
            amount: pack.priceKrw,
            currency: 'KRW',
            storeId,
            customerEmail: email,
            customerName: decoded.name || '',
            grade: grade || 'plus',
            creditsAmount: pack.credits,
        });
    } catch (error) {
        console.error('[PortOne Checkout Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '주문 생성 실패' },
            { status: 500 }
        );
    }
}
