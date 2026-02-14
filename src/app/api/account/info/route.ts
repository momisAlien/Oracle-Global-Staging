/* ===========================
   Account Info API
   GET /api/account/info
   ===========================
   
   인증된 사용자의 엔타이틀먼트 + 오늘 사용량 반환
*/

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { entitlementPath, dailyQuotaPath } from '@/lib/db/paths';
import { EntitlementDoc, DailyQuotaDoc } from '@/lib/db/schema';
import { getKstDateKey } from '@/lib/time/kst';

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
        const entDoc = await adminDb.doc(entitlementPath(uid)).get();
        let entitlement: EntitlementDoc | null = null;
        if (entDoc.exists) {
            entitlement = entDoc.data() as EntitlementDoc;
        }

        // 3) 오늘 사용량 조회
        const kstDateKey = getKstDateKey();
        const usageDoc = await adminDb.doc(dailyQuotaPath(uid, kstDateKey)).get();
        let usage = { usedQuestions: 0, kstDateKey };
        if (usageDoc.exists) {
            const data = usageDoc.data() as DailyQuotaDoc;
            usage = { usedQuestions: data.usedQuestions, kstDateKey };
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
