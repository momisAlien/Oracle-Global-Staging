/* ===========================
   Device Token — 서버 발급 HMAC 기반
   ===========================
   
   쿠키 기반 디바이스 식별: 익명 남용 방지용
   httpOnly, secure, sameSite=lax
*/

import { createHmac, randomUUID } from 'crypto';

const HMAC_SECRET = process.env.DEVICE_TOKEN_HMAC_SECRET || 'dev-hmac-secret-change-me';
const IP_SALT = process.env.IP_HASH_SALT || 'dev-ip-salt-change-me';

export const DEVICE_COOKIE_NAME = 'ta_device';
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Generate a new device ID + HMAC signature */
export function mintDeviceToken(): { deviceId: string; token: string } {
    const deviceId = randomUUID();
    const sig = createHmac('sha256', HMAC_SECRET).update(deviceId).digest('hex').slice(0, 16);
    return { deviceId, token: `${deviceId}.${sig}` };
}

/** Verify and extract deviceId from a signed token */
export function verifyDeviceToken(token: string): string | null {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [deviceId, sig] = parts;
    const expected = createHmac('sha256', HMAC_SECRET).update(deviceId).digest('hex').slice(0, 16);
    if (sig !== expected) return null;
    return deviceId;
}

/** Hash an IP address (never store raw IPs) */
export function hashIp(ip: string): string {
    return createHmac('sha256', IP_SALT).update(ip).digest('hex').slice(0, 32);
}

/** Hash user agent string */
export function hashUserAgent(ua: string): string {
    return createHmac('sha256', IP_SALT).update(ua).digest('hex').slice(0, 16);
}
