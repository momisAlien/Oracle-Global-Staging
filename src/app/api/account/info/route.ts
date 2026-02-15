/* ===========================
   Account Info API
   GET /api/account/info
   ===========================
   
   인증된 사용자의 엔타이틀먼트 + 오늘 사용량 반환
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        // 1) 인증 확인
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '인증이 필요합니다' },
                { status: 401 }
            );
        }

        // 동적 import로 Firebase Admin 로드
        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        let uid: string;
        try {
            const decoded = await adminAuth.verifyIdToken(
                authHeader.replace('Bearer ', '')
            );
            uid = decoded.uid;
        } catch {
            return NextResponse.json(
                { error: '유효하지 않은 토큰입니다' },
                { status: 401 }
            );
        }

        // 2) 엔타이틀먼트 조회
        const { entitlementPath, dailyQuotaPath } = await import('@/lib/db/paths');
        const { getKstDateKey } = await import('@/lib/time/kst');

        const entDoc = await adminDb.doc(entitlementPath(uid)).get();
        let entitlement = null;
        if (entDoc.exists) {
            entitlement = entDoc.data();
        }

        // 3) 오늘 사용량 조회
        const kstDateKey = getKstDateKey();
        const usageDoc = await adminDb.doc(dailyQuotaPath(uid, kstDateKey)).get();
        let usage = { usedQuestions: 0, kstDateKey };
        if (usageDoc.exists) {
            const data = usageDoc.data();
            usage = { usedQuestions: data?.usedQuestions || 0, kstDateKey };
        }

        return NextResponse.json({
            uid,
            entitlement,
            usage,
        });
    } catch (error) {
        console.error('[Account Info Error]', error);
        return NextResponse.json(
            { error: '계정 정보 조회 실패' },
            { status: 500 }
        );
    }
}
