/* ===========================
   Toss Payments — Verification Helper
   토스페이먼츠 결제 승인 검증
   ===========================
   
   📖 결제 승인: https://docs.tosspayments.com/reference#결제-승인
   📖 웹훅: https://docs.tosspayments.com/guides/v2/webhook
*/

import { TOSS_CONFIG, isTossConfigured } from './config';

interface TossConfirmRequest {
    paymentKey: string;
    orderId: string;
    amount: number;
}

interface TossPaymentResponse {
    paymentKey: string;
    orderId: string;
    status: string;
    totalAmount: number;
    method: string;
    approvedAt: string;
    receipt?: { url: string };
    [key: string]: unknown;
}

/**
 * 토스페이먼츠 결제 승인 API 호출
 * Secret Key를 Base64로 인코딩하여 Authorization 헤더에 전달
 */
export async function confirmTossPayment(
    input: TossConfirmRequest
): Promise<TossPaymentResponse> {
    if (!isTossConfigured()) {
        throw new Error('토스페이먼츠 키가 설정되지 않았습니다 (TOSS_SECRET_KEY)');
    }

    const authHeader = Buffer.from(`${TOSS_CONFIG.secretKey}:`).toString('base64');

    const response = await fetch(`${TOSS_CONFIG.apiBaseUrl}/payments/confirm`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentKey: input.paymentKey,
            orderId: input.orderId,
            amount: input.amount,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
            `토스 결제 승인 실패: ${response.status} — ${JSON.stringify(errorBody)}`
        );
    }

    return response.json();
}

/**
 * 토스 웹훅 서명 검증
 * TODO: 실제 웹훅 시크릿이 발급되면 HMAC 검증 로직 추가
 * 현재는 웹훅 시크릿 미설정 시 경고 로그 출력
 */
export function verifyTossWebhookSignature(
    body: string,
    signature: string | null
): boolean {
    if (!TOSS_CONFIG.webhookSecret) {
        console.warn(
            '[Toss Webhook] 웹훅 시크릿 미설정 — 서명 검증 건너뜀. ' +
            'TOSS_WEBHOOK_SECRET 환경변수를 설정하세요.'
        );
        // 개발 환경에서는 통과, 프로덕션에서는 반드시 설정 필요
        if (TOSS_CONFIG.environment === 'production') {
            throw new Error('프로덕션 환경에서 웹훅 시크릿이 필요합니다');
        }
        return true;
    }

    if (!signature) {
        return false;
    }

    // TODO: HMAC-SHA256 검증 구현
    // const crypto = require('crypto');
    // const expected = crypto
    //   .createHmac('sha256', TOSS_CONFIG.webhookSecret)
    //   .update(body)
    //   .digest('hex');
    // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

    console.warn('[Toss Webhook] 서명 검증 로직 미구현 — 키 발급 후 구현 필요');
    return true;
}
