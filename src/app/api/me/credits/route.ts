/* ===========================
   Credits Balance API
   GET /api/me/credits
   ===========================
   
   현재 사용자의 등급별 크레딧 잔액 조회
*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
        }

        const { getAdminAuth, getAdminDb } = await import('@/lib/firebase/admin');
        const decoded = await getAdminAuth().verifyIdToken(authHeader.replace('Bearer ', ''));
        const uid = decoded.uid;

        const { getAllCredits } = await import('@/lib/db/credits');
        const credits = await getAllCredits(getAdminDb(), uid);

        return NextResponse.json({ credits });
    } catch (error) {
        console.error('[Credits API Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '크레딧 조회 실패' },
            { status: 500 }
        );
    }
}
