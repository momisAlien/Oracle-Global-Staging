/* ===========================
   Admin: Set Tier API
   POST /api/admin/set-tier
   ===========================
   
   관리자가 특정 유저의 티어를 직접 변경할 수 있는 API.
   TEST_MODE + ADMIN_EMAILS 체크로 보호.
*/

import { NextRequest, NextResponse } from 'next/server';
import { isTestMode, isAdmin } from '@/lib/featureFlags';

export async function POST(request: NextRequest) {
    // 1) TEST_MODE 체크
    if (!isTestMode()) {
        return NextResponse.json(
            { error: 'Admin API is only available in test mode', code: 'TEST_MODE_REQUIRED' },
            { status: 403 }
        );
    }

    // 2) 이메일 인증 (Firebase Auth 토큰에서 추출)
    const authHeader = request.headers.get('Authorization');
    let callerEmail: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
        try {
            const { getAdminAuth } = await import('@/lib/firebase/admin');
            const token = authHeader.replace('Bearer ', '');
            const decoded = await getAdminAuth().verifyIdToken(token);
            callerEmail = decoded.email || null;
        } catch {
            return NextResponse.json(
                { error: 'Invalid authentication token', code: 'AUTH_FAILED' },
                { status: 401 }
            );
        }
    }

    if (!isAdmin(callerEmail)) {
        return NextResponse.json(
            { error: 'Admin access required', code: 'ADMIN_REQUIRED' },
            { status: 403 }
        );
    }

    // 3) Body 파싱
    const body = await request.json();
    const { uid, tier } = body;

    if (!uid || !tier) {
        return NextResponse.json(
            { error: 'uid and tier are required', code: 'MISSING_PARAMS' },
            { status: 400 }
        );
    }

    const validTiers = ['free', 'plus', 'pro', 'archmage'];
    if (!validTiers.includes(tier)) {
        return NextResponse.json(
            { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}`, code: 'INVALID_TIER' },
            { status: 400 }
        );
    }

    // 4) Firestore 업데이트
    try {
        const { upgradeTier } = await import('@/lib/db/provision');
        await upgradeTier(uid, tier, null);

        return NextResponse.json({
            success: true,
            uid,
            tier,
            updatedBy: callerEmail,
            message: `User ${uid} tier updated to ${tier}`,
        });
    } catch (err) {
        console.error('[Admin] set-tier error:', err);
        return NextResponse.json(
            { error: 'Failed to update tier', code: 'UPDATE_FAILED' },
            { status: 500 }
        );
    }
}
