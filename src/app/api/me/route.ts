/* ===========================
   User Info API — 인증된 유저의 티어 조회
   GET /api/me
   ===========================
   
   인증 기반 개인화 데이터 → Cache-Control: no-store
   /api/config처럼 캐시하면 다른 유저에게 티어가 누출되므로 절대 캐시 금지.
   
   주 용도: 광고 노출 여부 판단 (free만 광고 노출)
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            // 비인증 = free로 간주
            return NextResponse.json(
                { userTier: 'free', authenticated: false },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();

        const decoded = await adminAuth.verifyIdToken(
            authHeader.replace('Bearer ', '')
        );
        const uid = decoded.uid;

        // 엔타이틀먼트 조회
        let userTier = 'free';
        try {
            const { entitlementPath } = await import('@/lib/db/paths');
            const adminDb = getAdminDb();
            const entDoc = await adminDb.doc(entitlementPath(uid)).get();
            if (entDoc.exists) {
                const entitlement = entDoc.data() as { tier: string };
                userTier = entitlement.tier || 'free';
            }
        } catch (err) {
            console.warn('[/api/me] Entitlement lookup failed:', err);
        }

        return NextResponse.json(
            { userTier, authenticated: true, uid },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('[/api/me] Error:', error);
        // 인증 실패 = free로 간주
        return NextResponse.json(
            { userTier: 'free', authenticated: false },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
