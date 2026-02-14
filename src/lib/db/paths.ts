/* ===========================
   Firestore 컬렉션/문서 경로 헬퍼
   =========================== */

/** 사용자 문서 경로 */
export function userPath(uid: string): string {
    return `users/${uid}`;
}

/** 엔타이틀먼트 문서 경로 */
export function entitlementPath(uid: string): string {
    return `entitlements/${uid}`;
}

/** 일일 사용량 문서 경로 */
export function dailyQuotaPath(uid: string, kstDateKey: string): string {
    return `usage/${uid}/dailyQuota/${kstDateKey}`;
}

/** 사용량 컬렉션 경로 */
export function usageCollectionPath(uid: string): string {
    return `usage/${uid}/dailyQuota`;
}

/** 프로필 문서 경로 */
export function profilePath(profileId: string): string {
    return `profiles/${profileId}`;
}

/** 운세 해석 문서 경로 */
export function readingPath(readingId: string): string {
    return `readings/${readingId}`;
}

/** 구독 문서 경로 */
export function subscriptionPath(subscriptionId: string): string {
    return `subscriptions/${subscriptionId}`;
}

/** 구매 이력 문서 경로 */
export function purchasePath(purchaseId: string): string {
    return `purchases/${purchaseId}`;
}
