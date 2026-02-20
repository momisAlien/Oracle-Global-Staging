/* ===========================
   Config API — 서버 Feature Flags 조회
   GET /api/config
   ===========================
   
   프론트엔드에서 런타임에 서버 설정을 조회하기 위한 엔드포인트.
   NEXT_PUBLIC_* 대신 서버 env를 런타임에 읽어 응답.
   Amplify Console에서 env 변경 시 리빌드 없이 즉시 반영.
*/

import { NextResponse } from 'next/server';
import { isPaymentsEnabled, isTestMode } from '@/lib/featureFlags';

export const runtime = 'nodejs';

export async function GET() {
    return NextResponse.json(
        {
            paymentsEnabled: isPaymentsEnabled(),
            testMode: isTestMode(),
        },
        {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        }
    );
}
