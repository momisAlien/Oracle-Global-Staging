/* ===========================
   Toss Webhook API Route
   POST /api/payments/toss/webhook
   ===========================
   
   📖 https://docs.tosspayments.com/guides/v2/webhook
*/

import { NextRequest, NextResponse } from 'next/server';
import { tossProvider } from '@/lib/payments/toss/provider';

export async function POST(request: NextRequest) {
    try {
        // 웹훅 이벤트 처리
        const result = await tossProvider.handleWebhook(request);

        if (!result.handled) {
            console.error('[Toss Webhook] 처리 실패:', result.error);
            return NextResponse.json(
                { error: result.error || '웹훅 처리 실패' },
                { status: 400 }
            );
        }

        // 감사 로그
        console.log('[Toss Webhook] 이벤트 처리 완료:', {
            event: result.event,
            timestamp: new Date().toISOString(),
        });

        // TODO: Firestore에 웹훅 이벤트 로그 저장
        // await db.collection('webhook_logs').add({
        //   provider: 'toss',
        //   event: result.event,
        //   processed: true,
        //   timestamp: FieldValue.serverTimestamp(),
        // });

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Toss Webhook Error]', error);
        return NextResponse.json(
            { error: '웹훅 처리 중 오류 발생' },
            { status: 500 }
        );
    }
}
