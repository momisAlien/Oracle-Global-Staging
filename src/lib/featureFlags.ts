/* ===========================
   Feature Flags — 서버 런타임 전용
   ===========================
   
   모든 플래그는 서버 전용 env (NEXT_PUBLIC_ 접두사 없음).
   Amplify Console에서 환경변수만 변경하면 리빌드 없이 즉시 반영.
   프론트엔드는 /api/config 엔드포인트를 통해 런타임에 조회.
*/

/** 결제 기능 활성화 여부 (기본값: false) */
export function isPaymentsEnabled(): boolean {
    return process.env.PAYMENTS_ENABLED === 'true';
}

/** 테스트 모드 활성화 여부 (기본값: false) */
export function isTestMode(): boolean {
    return process.env.TEST_MODE === 'true';
}

/** 관리자 이메일 체크 (ADMIN_EMAILS 쉼표 구분) */
export function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return adminEmails.includes(email.toLowerCase());
}

/** 결제 비활성화 시 API 응답용 */
export const PAYMENT_DISABLED_RESPONSE = {
    error: 'Payment feature is currently disabled',
    code: 'PAYMENT_DISABLED',
} as const;
