/* ===========================
   KST 쿼터 강제 적용 — 서버 전용
   ===========================
   
   Firestore 트랜잭션으로 일일 사용량 원자적 증가
*/

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../firebase/admin';
import { dailyQuotaPath } from './paths';
import { DailyQuotaDoc } from './schema';
import { getKstDateKey } from '../time/kst';

export interface QuotaCheckResult {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    kstDateKey: string;
}

/**
 * 쿼터 체크 + 원자적 증가 (Firestore 트랜잭션)
 * 
 * @returns QuotaCheckResult — allowed=false이면 한도 초과
 */
export async function checkAndIncrementQuota(
    uid: string,
    dailyLimit: number
): Promise<QuotaCheckResult> {
    const kstDateKey = getKstDateKey();
    const quotaRef = adminDb.doc(dailyQuotaPath(uid, kstDateKey));

    // 무제한 티어 (-1)
    if (dailyLimit === -1) {
        // 사용량 기록만 하고 항상 허용
        await quotaRef.set(
            {
                usedQuestions: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        const doc = await quotaRef.get();
        const used = (doc.data() as DailyQuotaDoc)?.usedQuestions ?? 1;

        return {
            allowed: true,
            used,
            limit: -1,
            remaining: -1,
            kstDateKey,
        };
    }

    // 제한 있는 티어 — 트랜잭션으로 원자적 체크+증가
    return adminDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(quotaRef);
        const currentUsed = doc.exists
            ? (doc.data() as DailyQuotaDoc).usedQuestions
            : 0;

        if (currentUsed >= dailyLimit) {
            return {
                allowed: false,
                used: currentUsed,
                limit: dailyLimit,
                remaining: 0,
                kstDateKey,
            };
        }

        // 사용량 증가
        if (doc.exists) {
            transaction.update(quotaRef, {
                usedQuestions: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp(),
            });
        } else {
            transaction.set(quotaRef, {
                usedQuestions: 1,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        return {
            allowed: true,
            used: currentUsed + 1,
            limit: dailyLimit,
            remaining: dailyLimit - currentUsed - 1,
            kstDateKey,
        };
    });
}
