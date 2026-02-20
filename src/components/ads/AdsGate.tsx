'use client';

/* ===========================
   AdsGate — 광고 게이팅 컴포넌트
   ===========================
   
   userTier === 'free' && adsEnabled === true 일 때만 자식(광고)을 렌더.
   Plus/Pro/Archmage에서는 null 반환 → 광고 스크립트도 로드 안 됨.
*/

import { ReactNode } from 'react';

interface AdsGateProps {
    /** 실제 유저 티어 (effectiveTier 아님!) */
    userTier: string;
    /** /api/config의 ads.enabled (전체 광고 ON/OFF) */
    adsEnabled: boolean;
    children: ReactNode;
}

export default function AdsGate({ userTier, adsEnabled, children }: AdsGateProps) {
    // 광고 시스템 비활성화
    if (!adsEnabled) return null;
    // free가 아닌 티어는 광고 미노출
    if (userTier !== 'free') return null;
    // free + 광고 활성화 → 광고 렌더
    return <>{children}</>;
}
