/* ===========================
   엔타이틀먼트 프로비저닝 — 서버 전용
   ===========================
   
   신규 사용자 생성 시 자동으로:
   1. users/{uid} 문서 생성
   2. entitlements/{uid} FREE 기본값 생성
*/

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../firebase/admin';
import { userPath, entitlementPath } from './paths';
import { TIER_DEFAULTS, UserDoc, EntitlementDoc } from './schema';

/**
 * 신규 사용자 프로비저닝
 * 사용자 문서 + FREE 티어 엔타이틀먼트를 원자적으로 생성
 */
export async function provisionNewUser(
    uid: string,
    params: {
        email: string;
        displayName: string;
        locale?: 'ko' | 'ja' | 'en' | 'zh';
    }
): Promise<void> {
    const batch = adminDb.batch();

    // 1) users/{uid} 생성
    const userRef = adminDb.doc(userPath(uid));
    const userDoc: UserDoc = {
        displayName: params.displayName || '',
        email: params.email,
        locale: params.locale || 'ko',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(userRef, userDoc);

    // 2) entitlements/{uid} FREE 기본값 생성
    const entRef = adminDb.doc(entitlementPath(uid));
    const entDoc: EntitlementDoc = {
        ...TIER_DEFAULTS.free,
        updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(entRef, entDoc);

    await batch.commit();
    console.log(`[Provision] User ${uid} created with FREE tier`);
}

/**
 * 티어 업그레이드 (결제 성공 시 호출)
 */
export async function upgradeTier(
    uid: string,
    tier: 'plus' | 'pro' | 'archmage',
    renewalAt: Date | null
): Promise<void> {
    const defaults = TIER_DEFAULTS[tier];
    const entRef = adminDb.doc(entitlementPath(uid));

    await entRef.set(
        {
            ...defaults,
            renewalAt: renewalAt ? renewalAt : null,
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    console.log(`[Upgrade] User ${uid} upgraded to ${tier}`);
}

/**
 * 사용자 존재 여부 확인
 */
export async function userExists(uid: string): Promise<boolean> {
    const doc = await adminDb.doc(userPath(uid)).get();
    return doc.exists;
}
