/* ===========================
   Signup Bonus API
   POST /api/auth/signup-bonus
   ===========================
   
   가입 보너스 +2 크레딧 (1회, 이메일 인증 필수)
   - user.signupBonusGrantedAt: 계정 레벨 중복 방지
   - abuseDevices/{deviceId}.signupBonusUsedAt: 디바이스 레벨 남용 방지 (30일)
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SIGNUP_BONUS_CREDITS = 2;

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        // Verify token
        const decoded = await adminAuth.verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;

        // Check email verification
        if (!decoded.email_verified) {
            return NextResponse.json(
                { error: '이메일 인증이 필요합니다', code: 'EMAIL_NOT_VERIFIED' },
                { status: 403 }
            );
        }

        // Check if already granted (user level)
        const { isSignupBonusGranted, markSignupBonusGranted, grantCredits } = await import('@/lib/db/credits');
        const alreadyGranted = await isSignupBonusGranted(adminDb, uid);
        if (alreadyGranted) {
            return NextResponse.json(
                { error: '이미 가입 보너스를 받으셨습니다', code: 'BONUS_ALREADY_GRANTED', granted: false },
                { status: 409 }
            );
        }

        // Check device-level abuse
        const deviceCookie = request.cookies.get('ta_device')?.value;
        if (deviceCookie) {
            const deviceId = deviceCookie.split('.')[0];
            const { checkSignupBonusEligibility, markSignupBonusUsed } = await import('@/lib/device/abuse');
            const eligible = await checkSignupBonusEligibility(adminDb, deviceId);
            if (!eligible) {
                return NextResponse.json(
                    { error: '이 기기에서는 보너스를 받을 수 없습니다', code: 'DEVICE_BONUS_LIMIT', granted: false },
                    { status: 429 }
                );
            }

            // Determine grade for bonus
            const body = await request.json().catch(() => ({}));
            const grade = body.grade || 'plus';

            // Grant credits
            const result = await grantCredits(adminDb, uid, grade, SIGNUP_BONUS_CREDITS, 'signup_bonus');

            // Mark as granted
            await markSignupBonusGranted(adminDb, uid);
            await markSignupBonusUsed(adminDb, deviceId);

            return NextResponse.json({
                granted: true,
                grade,
                creditsAdded: SIGNUP_BONUS_CREDITS,
                remaining: result.remaining,
            });
        }

        // No device cookie — still grant but log warning
        const body = await request.json().catch(() => ({}));
        const grade = body.grade || 'plus';

        const result = await grantCredits(adminDb, uid, grade, SIGNUP_BONUS_CREDITS, 'signup_bonus');
        await markSignupBonusGranted(adminDb, uid);

        return NextResponse.json({
            granted: true,
            grade,
            creditsAdded: SIGNUP_BONUS_CREDITS,
            remaining: result.remaining,
        });
    } catch (error) {
        console.error('[Signup Bonus Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '보너스 처리 실패', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
