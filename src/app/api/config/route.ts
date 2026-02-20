/* ===========================
   Config API — 서버 Feature Flags 조회
   GET /api/config
   ===========================
   
   프론트엔드에서 런타임에 서버 설정을 조회하기 위한 엔드포인트.
   NEXT_PUBLIC_* 대신 서버 env를 런타임에 읽어 응답.
   Amplify Console에서 env 변경 시 리빌드 없이 즉시 반영.
   
   ⚠ 이 응답은 s-maxage 캐시됨 → 개인화 데이터(userTier 등) 절대 포함 금지!
   유저 티어는 /api/me에서 가져온다.
*/

import { NextResponse } from 'next/server';
import { isPaymentsEnabled, isTestMode, getAdsConfig } from '@/lib/featureFlags';

export const runtime = 'nodejs';

export async function GET() {
    const adsConfig = getAdsConfig();

    return NextResponse.json(
        {
            paymentsEnabled: isPaymentsEnabled(),
            testMode: isTestMode(),
            ads: {
                enabled: adsConfig.adsEnabled,
                bannerEnabled: adsConfig.adsBannerEnabled,
                videoEnabled: adsConfig.adsVideoEnabled,
                provider: adsConfig.adsProvider,
                adsenseClient: adsConfig.adsenseClient,
                adsenseBannerSlot: adsConfig.adsenseBannerSlot,
                gamNetworkCode: adsConfig.gamNetworkCode,
                gamBannerAdUnit: adsConfig.gamBannerAdUnit,
                gamVideoAdTagUrl: adsConfig.gamVideoAdTagUrl,
            },
        },
        {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        }
    );
}
