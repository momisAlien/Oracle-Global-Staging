/* ===========================
   KST (Asia/Seoul) 시간 유틸리티
   서버 전용 — 클라이언트 타임스탬프 신뢰 금지
   =========================== */

const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 KST 시각 반환
 */
export function getKstNow(): Date {
    return new Date();
}

/**
 * KST 기준 날짜 키 반환 (YYYY-MM-DD)
 * 서버 시간만 사용 — 클라이언트 시간 절대 사용 금지
 */
export function getKstDateKey(now?: Date): string {
    const date = now ?? new Date();
    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: KST_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(date); // returns YYYY-MM-DD
}

/**
 * 두 Date가 KST 기준 같은 날인지 확인
 */
export function isSameKstDay(a: Date, b: Date): boolean {
    return getKstDateKey(a) === getKstDateKey(b);
}

/**
 * KST 자정까지 남은 밀리초
 */
export function msUntilKstMidnight(now?: Date): number {
    const date = now ?? new Date();
    const kstStr = date.toLocaleString('en-US', { timeZone: KST_TIMEZONE });
    const kstDate = new Date(kstStr);

    const midnight = new Date(kstDate);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    // Convert back to UTC-relative ms
    const diff = midnight.getTime() - kstDate.getTime();
    return Math.max(0, diff);
}
