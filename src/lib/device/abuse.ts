/* ===========================
   Anti-Abuse — Firestore 기반 디바이스 추적
   ===========================
   
   abuseDevices/{deviceId} 컬렉션으로 남용 방지
   - 익명 트라이얼: 30일 1회
   - 가입 보너스: 디바이스당 30일 1회
   - IP 레이트 리밋: ipRateLimit/{ipHash} 시간당 N회
*/

import { FieldValue } from 'firebase-admin/firestore';

const TRIAL_COOLDOWN_DAYS = 30;
const SIGNUP_BONUS_COOLDOWN_DAYS = 30;
const IP_RATE_LIMIT_PER_HOUR = 5;

export interface AbuseDeviceDoc {
    createdAt: FirebaseFirestore.Timestamp | FieldValue;
    lastSeenAt: FirebaseFirestore.Timestamp | FieldValue;
    trialUsedAt: FirebaseFirestore.Timestamp | null;
    trialCount: number;
    lastIpHash: string;
    lastUaHash: string;
    signupBonusUsedAt: FirebaseFirestore.Timestamp | null;
}

export interface IpRateLimitDoc {
    count: number;
    windowStart: FirebaseFirestore.Timestamp | FieldValue;
}

/** Check if anonymous trial is available for this device */
export async function checkAnonymousTrial(
    db: FirebaseFirestore.Firestore,
    deviceId: string,
    ipHash: string,
    uaHash: string,
): Promise<{ allowed: boolean; reason?: string }> {
    const docRef = db.doc(`abuseDevices/${deviceId}`);
    const doc = await docRef.get();

    if (doc.exists) {
        const data = doc.data() as AbuseDeviceDoc;
        const trialUsedAt = data.trialUsedAt;

        if (trialUsedAt && trialUsedAt instanceof Object && 'toDate' in trialUsedAt) {
            const usedDate = (trialUsedAt as FirebaseFirestore.Timestamp).toDate();
            const daysSince = (Date.now() - usedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < TRIAL_COOLDOWN_DAYS) {
                return { allowed: false, reason: 'TRIAL_EXHAUSTED' };
            }
        }

        // Update last seen
        await docRef.update({
            lastSeenAt: FieldValue.serverTimestamp(),
            lastIpHash: ipHash,
            lastUaHash: uaHash,
        });
    } else {
        // First visit — create doc
        await docRef.set({
            createdAt: FieldValue.serverTimestamp(),
            lastSeenAt: FieldValue.serverTimestamp(),
            trialUsedAt: null,
            trialCount: 0,
            lastIpHash: ipHash,
            lastUaHash: uaHash,
            signupBonusUsedAt: null,
        });
    }

    return { allowed: true };
}

/** Mark anonymous trial as used */
export async function markTrialUsed(
    db: FirebaseFirestore.Firestore,
    deviceId: string,
): Promise<void> {
    await db.doc(`abuseDevices/${deviceId}`).update({
        trialUsedAt: FieldValue.serverTimestamp(),
        trialCount: FieldValue.increment(1),
    });
}

/** Check IP rate limit (hourly window) */
export async function checkIpRateLimit(
    db: FirebaseFirestore.Firestore,
    ipHash: string,
): Promise<{ allowed: boolean; remaining: number }> {
    const docRef = db.doc(`ipRateLimit/${ipHash}`);
    const now = Date.now();

    return db.runTransaction(async (tx) => {
        const doc = await tx.get(docRef);

        if (doc.exists) {
            const data = doc.data() as IpRateLimitDoc;
            const windowStart = data.windowStart;
            let windowStartMs = 0;
            if (windowStart && typeof windowStart === 'object' && 'toDate' in windowStart) {
                windowStartMs = (windowStart as FirebaseFirestore.Timestamp).toDate().getTime();
            }

            // Check if window has expired (1 hour)
            if (now - windowStartMs > 3600 * 1000) {
                // Reset window
                tx.set(docRef, {
                    count: 1,
                    windowStart: FieldValue.serverTimestamp(),
                });
                return { allowed: true, remaining: IP_RATE_LIMIT_PER_HOUR - 1 };
            }

            if (data.count >= IP_RATE_LIMIT_PER_HOUR) {
                return { allowed: false, remaining: 0 };
            }

            tx.update(docRef, { count: FieldValue.increment(1) });
            return { allowed: true, remaining: IP_RATE_LIMIT_PER_HOUR - data.count - 1 };
        }

        // First request
        tx.set(docRef, {
            count: 1,
            windowStart: FieldValue.serverTimestamp(),
        });
        return { allowed: true, remaining: IP_RATE_LIMIT_PER_HOUR - 1 };
    });
}

/** Check signup bonus eligibility per device */
export async function checkSignupBonusEligibility(
    db: FirebaseFirestore.Firestore,
    deviceId: string,
): Promise<boolean> {
    const doc = await db.doc(`abuseDevices/${deviceId}`).get();
    if (!doc.exists) return true;

    const data = doc.data() as AbuseDeviceDoc;
    if (!data.signupBonusUsedAt) return true;

    if (data.signupBonusUsedAt instanceof Object && 'toDate' in data.signupBonusUsedAt) {
        const usedDate = (data.signupBonusUsedAt as FirebaseFirestore.Timestamp).toDate();
        const daysSince = (Date.now() - usedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= SIGNUP_BONUS_COOLDOWN_DAYS;
    }

    return true;
}

/** Mark signup bonus as used for device */
export async function markSignupBonusUsed(
    db: FirebaseFirestore.Firestore,
    deviceId: string,
): Promise<void> {
    await db.doc(`abuseDevices/${deviceId}`).set(
        { signupBonusUsedAt: FieldValue.serverTimestamp() },
        { merge: true },
    );
}
