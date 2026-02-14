/* ===========================
   Payment Provider Factory
   =========================== */

import { IPaymentProvider, PaymentProvider } from './types';
import { tossProvider } from './toss/provider';

const providers: Record<string, IPaymentProvider> = {
    toss: tossProvider,
    // stripe: stripeProvider,  // TODO: Phase 2
    // paypal: paypalProvider,  // TODO: Phase 2
};

export function getPaymentProvider(name: PaymentProvider): IPaymentProvider {
    const provider = providers[name];
    if (!provider) {
        throw new Error(`결제 프로바이더 '${name}'을(를) 찾을 수 없습니다`);
    }
    return provider;
}

export { type IPaymentProvider, type PaymentProvider } from './types';
