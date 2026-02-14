/* ===========================
   Payment Provider Interface
   확장 가능한 결제 인터페이스
   =========================== */

import { TierName } from '@/lib/tiers';

export type PaymentMethod =
    | 'CARD'
    | 'KAKAOPAY'
    | 'NAVERPAY'
    | 'TOSSPAY'
    | 'BANK_TRANSFER'
    | 'VIRTUAL_ACCOUNT'
    | 'APPLE_PAY'
    | 'GOOGLE_PAY'
    | 'PAYPAL';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentProvider = 'toss' | 'stripe' | 'paypal';

export interface CheckoutSessionInput {
    uid: string;
    tier: Exclude<TierName, 'free'>;
    locale: string;
    pricePlanId: string;
    isFirstPurchase: boolean;
    promoUsedFlags: Record<string, boolean>;
}

export interface CheckoutSessionResult {
    orderId: string;
    orderName: string;
    amount: number;
    currency: string;
    successUrl: string;
    failUrl: string;
    customerKey?: string;
    purchaseId: string;
}

export interface ConfirmPaymentInput {
    paymentKey: string;
    orderId: string;
    amount: number;
}

export interface ConfirmPaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface WebhookResult {
    handled: boolean;
    event?: string;
    error?: string;
}

export interface RefundInput {
    transactionId: string;
    amount?: number;
    reason?: string;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    error?: string;
}

export interface PurchaseRecord {
    id: string;
    uid: string;
    provider: PaymentProvider;
    tier: TierName;
    amount: number;
    currency: string;
    status: PaymentStatus;
    orderId: string;
    paymentKey?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 모든 결제 프로바이더가 구현해야 하는 인터페이스
 */
export interface IPaymentProvider {
    readonly name: PaymentProvider;

    createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
    confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
    handleWebhook(request: Request): Promise<WebhookResult>;
    grantEntitlement(uid: string, tier: TierName, periodDays: number): Promise<void>;
    refundPayment(input: RefundInput): Promise<RefundResult>;
}
