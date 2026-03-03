/* ===========================
   Credits System — Firestore 기반
   ===========================
   
   users/{uid}/credits/{grade} 구조로 크레딧 관리
   - getRemainingCredits: 잔여 크레딧 조회
   - consumeCredit: 크레딧 1 소비 (트랜잭션)
   - grantCredits: 크레딧 부여 (구매, 가입 보너스 등)
*/

import { FieldValue } from 'firebase-admin/firestore';

export interface CreditDoc {
    remaining: number;
    totalGranted: number;
    totalConsumed: number;
    updatedAt: FirebaseFirestore.Timestamp | FieldValue;
}

export interface CreditGrantLog {
    amount: number;
    reason: string; // 'signup_bonus' | 'purchase_stripe' | 'purchase_portone' | 'subscription_monthly' | 'admin_grant'
    createdAt: FirebaseFirestore.Timestamp | FieldValue;
}

function creditPath(uid: string, grade: string): string {
    return `users/${uid}/credits/${grade}`;
}

function creditLogPath(uid: string, grade: string): string {
    return `users/${uid}/credits/${grade}/logs`;
}

/** Get remaining credits for a specific grade */
export async function getRemainingCredits(
    db: FirebaseFirestore.Firestore,
    uid: string,
    grade: string,
): Promise<number> {
    const doc = await db.doc(creditPath(uid, grade)).get();
    if (!doc.exists) return 0;
    return (doc.data() as CreditDoc).remaining || 0;
}

/** Get remaining credits for all grades */
export async function getAllCredits(
    db: FirebaseFirestore.Firestore,
    uid: string,
): Promise<Record<string, number>> {
    const grades = ['free', 'plus', 'pro', 'archmage'];
    const result: Record<string, number> = {};

    for (const grade of grades) {
        result[grade] = await getRemainingCredits(db, uid, grade);
    }
    return result;
}

/** Consume 1 credit for a grade (atomic transaction). Returns remaining or -1 if insufficient. */
export async function consumeCredit(
    db: FirebaseFirestore.Firestore,
    uid: string,
    grade: string,
): Promise<{ success: boolean; remaining: number }> {
    const docRef = db.doc(creditPath(uid, grade));

    return db.runTransaction(async (tx) => {
        const doc = await tx.get(docRef);

        if (!doc.exists) {
            return { success: false, remaining: 0 };
        }

        const data = doc.data() as CreditDoc;
        if (data.remaining <= 0) {
            return { success: false, remaining: 0 };
        }

        tx.update(docRef, {
            remaining: FieldValue.increment(-1),
            totalConsumed: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, remaining: data.remaining - 1 };
    });
}

/** Grant credits for a grade with reason logging */
export async function grantCredits(
    db: FirebaseFirestore.Firestore,
    uid: string,
    grade: string,
    amount: number,
    reason: string,
): Promise<{ remaining: number }> {
    const docRef = db.doc(creditPath(uid, grade));
    const doc = await docRef.get();

    if (doc.exists) {
        await docRef.update({
            remaining: FieldValue.increment(amount),
            totalGranted: FieldValue.increment(amount),
            updatedAt: FieldValue.serverTimestamp(),
        });
    } else {
        await docRef.set({
            remaining: amount,
            totalGranted: amount,
            totalConsumed: 0,
            updatedAt: FieldValue.serverTimestamp(),
        });
    }

    // Log the grant
    await db.collection(creditLogPath(uid, grade)).add({
        amount,
        reason,
        createdAt: FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    return { remaining: (updated.data() as CreditDoc).remaining };
}

/** Check if signup bonus was already granted for this user */
export async function isSignupBonusGranted(
    db: FirebaseFirestore.Firestore,
    uid: string,
): Promise<boolean> {
    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) return false;
    const data = userDoc.data();
    return !!data?.signupBonusGrantedAt;
}

/** Mark signup bonus as granted for user */
export async function markSignupBonusGranted(
    db: FirebaseFirestore.Firestore,
    uid: string,
): Promise<void> {
    await db.doc(`users/${uid}`).set(
        { signupBonusGrantedAt: FieldValue.serverTimestamp() },
        { merge: true },
    );
}
