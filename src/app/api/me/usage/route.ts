/* ===========================
   GET /api/me/usage
   ===========================
   로그인 사용자의 오늘 사용량 + 엔타이틀먼트 + 크레딧 잔여량 반환
*/
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        const decoded = await adminAuth.verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;

        const { entitlementPath, dailyQuotaPath } = await import('@/lib/db/paths');
        const { getKstDateKey } = await import('@/lib/time/kst');
        const { TIER_DEFAULTS } = await import('@/lib/db/schema');
        const { getAllCredits } = await import('@/lib/db/credits');

        // 엔타이틀먼트 조회
        const entDoc = await adminDb.doc(entitlementPath(uid)).get();
        const entitlement = entDoc.exists
            ? entDoc.data() as import('@/lib/db/schema').EntitlementDoc
            : TIER_DEFAULTS.free;

        // 오늘 사용량 조회
        const kstDateKey = getKstDateKey();
        const quotaDoc = await adminDb.doc(dailyQuotaPath(uid, kstDateKey)).get();
        const usedToday = quotaDoc.exists ? (quotaDoc.data()?.usedQuestions ?? 0) : 0;

        // 크레딧 잔여량 조회
        const credits = await getAllCredits(adminDb, uid);

        // 실제 사용 가능 최고 티어 계산
        const tierOrder = ['archmage', 'pro', 'plus', 'free'] as const;
        let effectiveTier = entitlement.tier;
        for (const t of tierOrder) {
            if (credits[t] > 0) {
                effectiveTier = t;
                break;
            }
        }

        return NextResponse.json({
            tier: entitlement.tier,
            effectiveTier,
            dailyLimit: entitlement.dailyQuestionLimit,
            usedToday,
            remaining: entitlement.dailyQuestionLimit === -1
                ? -1
                : Math.max(0, entitlement.dailyQuestionLimit - usedToday),
            renewalAt: entitlement.renewalAt ?? null,
            credits,
            kstDateKey,
        });
    } catch (error) {
        console.error('[api/me/usage]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
