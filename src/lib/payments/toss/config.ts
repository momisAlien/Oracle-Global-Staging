/* ===========================
   Toss Payments — Config
   토스페이먼츠 설정
   =========================== 
   
   📖 공식 문서:
   - LLM 가이드: https://docs.tosspayments.com/guides/v2/get-started/llms-guide
   - 위젯 연동: https://docs.tosspayments.com/guides/v2/payment-widget/integration
   - JS SDK:    https://docs.tosspayments.com/sdk/v2/js
   - 관리자:    https://docs.tosspayments.com/guides/v2/payment-widget/admin
   - API 레퍼런스: https://docs.tosspayments.com/reference
*/

export const TOSS_CONFIG = {
    clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',
    secretKey: process.env.TOSS_SECRET_KEY || '',
    successUrl: process.env.TOSS_SUCCESS_URL || 'http://localhost:3000/ko/checkout/toss/success',
    failUrl: process.env.TOSS_FAIL_URL || 'http://localhost:3000/ko/checkout/toss/fail',
    webhookSecret: process.env.TOSS_WEBHOOK_SECRET || '',
    environment: (process.env.TOSS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    apiBaseUrl: 'https://api.tosspayments.com/v1',
} as const;

/**
 * 토스 키 설정 여부 확인
 */
export function isTossConfigured(): boolean {
    return !!(TOSS_CONFIG.clientKey && TOSS_CONFIG.secretKey);
}

/**
 * 키 미설정 시 안전한 에러 메시지
 */
export function getTossConfigError(): string {
    const missing: string[] = [];
    if (!TOSS_CONFIG.clientKey) missing.push('NEXT_PUBLIC_TOSS_CLIENT_KEY');
    if (!TOSS_CONFIG.secretKey) missing.push('TOSS_SECRET_KEY');
    return `토스페이먼츠 키가 설정되지 않았습니다. 누락된 환경변수: ${missing.join(', ')}`;
}
