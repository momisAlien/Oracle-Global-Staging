/* ===========================
   Bootstrap Account API
   POST /api/account/bootstrap
   ===========================
   
   Ensures default Firestore docs exist for a user:
   - users/{uid}
   - entitlements/{uid} (free tier defaults)
   Idempotent — safe to call multiple times.
*/

import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        const decoded = await adminAuth.verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;

        const body = await request.json().catch(() => ({}));
        const locale = body.locale || 'en';

        // ── 1) Ensure users/{uid} doc ──
        const userRef = adminDb.doc(`users/${uid}`);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            await userRef.set({
                displayName: decoded.name || decoded.email?.split('@')[0] || '',
                email: decoded.email || '',
                locale,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        // ── 2) Ensure entitlements/{uid} doc ──
        const entRef = adminDb.doc(`entitlements/${uid}`);
        const entSnap = await entRef.get();
        if (!entSnap.exists) {
            await entRef.set({
                tier: 'free',
                dailyQuestionLimit: 5,
                canSynthesis: false,
                maxTokens: 500,
                renewalAt: null,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        return NextResponse.json({
            ok: true,
            uid,
            created: {
                user: !userSnap.exists,
                entitlement: !entSnap.exists,
            },
        });
    } catch (error) {
        console.error('[Bootstrap Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Bootstrap failed', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
