/* ===========================
   Toss Payments — Provider
   IPaymentProvider 구현
   ===========================
   
   📖 토스페이먼츠 공식 문서:
   - https://docs.tosspayments.com/guides/v2/payment-widget/integration
   - https://docs.tosspayments.com/reference
*/

import {
    IPaymentProvider,
    CheckoutSessionInput,
    CheckoutSessionResult,
    ConfirmPaymentInput,
    ConfirmPaymentResult,
    WebhookResult,
    RefundInput,
    RefundResult,
} from '../types';
import { TierName, getEffectivePrice, PRICE_PLANS } from '@/lib/tiers';
import { TOSS_CONFIG, isTossConfigured, getTossConfigError } from './config';
import { confirmTossPayment, verifyTossWebhookSignature } from './verify';

export class TossPaymentProvider implements IPaymentProvider {
    readonly name = 'toss' as const;

    async createCheckoutSession(
        input: CheckoutSessionInput
    ): Promise<CheckoutSessionResult> {
        if (!isTossConfigured()) {
            throw new Error(getTossConfigError());
        }

        const plan = PRICE_PLANS[input.tier];
        const amount = getEffectivePrice(
            input.tier,
            input.isFirstPurchase,
            true, // isPromoActive — 런칭 기간
            input.promoUsedFlags
        );

        const orderId = `oracle-${input.tier}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const orderName = `Tarotaihub ${plan.promoLabel || input.tier} 구독`;
        const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Firestore에 PENDING 구매 기록 생성은 API 라우트에서 처리

        return {
            orderId,
            orderName,
            amount,
            currency: 'KRW',
            successUrl: `${TOSS_CONFIG.successUrl}?orderId=${orderId}&purchaseId=${purchaseId}`,
            failUrl: TOSS_CONFIG.failUrl,
            customerKey: input.uid,
            purchaseId,
        };
    }

    async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
        if (!isTossConfigured()) {
            throw new Error(getTossConfigError());
        }

        try {
            const result = await confirmTossPayment({
                paymentKey: input.paymentKey,
                orderId: input.orderId,
                amount: input.amount,
            });

            return {
                success: result.status === 'DONE',
                transactionId: result.paymentKey,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '결제 승인 실패',
            };
        }
    }

    async handleWebhook(request: Request): Promise<WebhookResult> {
        try {
            const body = await request.text();
            const signature = request.headers.get('x-toss-signature');

            const isValid = verifyTossWebhookSignature(body, signature);
            if (!isValid) {
                return { handled: false, error: '웹훅 서명 검증 실패' };
            }

            const payload = JSON.parse(body);
            const eventType = payload.eventType || 'UNKNOWN';

            console.log(`[Toss Webhook] 이벤트 수신: ${eventType}`, {
                orderId: payload.data?.orderId,
                status: payload.data?.status,
                timestamp: new Date().toISOString(),
            });

            // TODO: 이벤트 타입별 처리 (결제 완료, 취소, 환불 등)
            // payload.data에서 orderId로 Firestore 조회 → 상태 업데이트

            return { handled: true, event: eventType };
        } catch (error) {
            return {
                handled: false,
                error: error instanceof Error ? error.message : '웹훅 처리 실패',
            };
        }
    }

    async grantEntitlement(
        uid: string,
        tier: TierName,
        periodDays: number
    ): Promise<void> {
        // Firestore entitlements/{uid} 업데이트
        // API 라우트에서 Firebase Admin SDK로 처리
        console.log(`[Toss] 엔타이틀먼트 부여: uid=${uid}, tier=${tier}, days=${periodDays}`);
    }

    async refundPayment(input: RefundInput): Promise<RefundResult> {
        // TODO: 토스 환불 API 구현
        // https://docs.tosspayments.com/reference#결제-취소
        console.warn('[Toss] 환불 API 미구현 — 키 발급 후 구현 필요');
        return {
            success: false,
            error: '환불 기능은 아직 구현되지 않았습니다 (stub)',
        };
    }
}

export const tossProvider = new TossPaymentProvider();
