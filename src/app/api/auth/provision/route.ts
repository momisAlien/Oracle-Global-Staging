/* ===========================
   신규 사용자 프로비저닝 API
   POST /api/auth/provision
   ===========================
   
   Firebase Auth 회원가입 후 클라이언트에서 호출.
   users/{uid} + entitlements/{uid} 자동 생성.
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // 1) Authorization 헤더에서 ID 토큰 추출
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '인증 토큰이 필요합니다', code: 'AUTH_REQUIRED' },
                { status: 401 }
            );
        }

        const idToken = authHeader.replace('Bearer ', '');

        // 2) ID 토큰 검증 (동적 import)
        const { getAdminAuth } = await import('@/lib/firebase/admin');
        const adminAuth = getAdminAuth();

        let decoded;
        try {
            decoded = await adminAuth.verifyIdToken(idToken);
        } catch {
            return NextResponse.json(
                { error: '유효하지 않은 토큰입니다', code: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }

        const uid = decoded.uid;
        const email = decoded.email || '';
        const displayName = decoded.name || decoded.email?.split('@')[0] || '';

        // 3) 이미 프로비저닝된 사용자인지 확인
        const { provisionNewUser, userExists } = await import('@/lib/db/provision');
        const exists = await userExists(uid);
        if (exists) {
            return NextResponse.json({
                message: '이미 프로비저닝된 사용자입니다',
                uid,
                provisioned: false,
            });
        }

        // 4) 로케일 추출 (요청 body에서)
        let locale: 'ko' | 'ja' | 'en' | 'zh' = 'ko';
        try {
            const body = await request.json();
            if (['ko', 'ja', 'en', 'zh'].includes(body.locale)) {
                locale = body.locale;
            }
        } catch {
            // body가 없어도 OK — 기본 locale 사용
        }

        // 5) 신규 사용자 프로비저닝
        await provisionNewUser(uid, {
            email,
            displayName,
            locale,
        });

        return NextResponse.json({
            message: '사용자 프로비저닝 완료',
            uid,
            tier: 'free',
            provisioned: true,
        });
    } catch (error) {
        console.error('[Provision API Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '프로비저닝 실패' },
            { status: 500 }
        );
    }
}
