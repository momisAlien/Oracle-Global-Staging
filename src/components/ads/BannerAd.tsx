'use client';

/* ===========================
   BannerAd — 배너 광고 컴포넌트
   ===========================
   
   provider에 따라:
   - "mock": 개발용 placeholder 박스
   - "adsense": Google AdSense ins 태그 + 스크립트 로드
   - "gam": Google Ad Manager GPT 태그
   
   CLS 방지를 위해 고정 높이 wrapper 사용.
   이 컴포넌트가 실제로 렌더될 때만 스크립트 로드 (= free만)
*/

import { useEffect, useRef } from 'react';

interface BannerAdProps {
    provider: string;
    adsenseClient?: string;
    adsenseBannerSlot?: string;
    gamNetworkCode?: string;
    gamBannerAdUnit?: string;
    locale?: string;
}

export default function BannerAd({
    provider,
    adsenseClient,
    adsenseBannerSlot,
    gamNetworkCode,
    gamBannerAdUnit,
    locale,
}: BannerAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        if (scriptLoadedRef.current) return;

        if (provider === 'adsense' && adsenseClient) {
            // AdSense 스크립트 로드
            const existing = document.querySelector('script[src*="adsbygoogle"]');
            if (!existing) {
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
                script.crossOrigin = 'anonymous';
                document.head.appendChild(script);
            }
            // push ad
            try {
                ((window as unknown as Record<string, unknown[]>).adsbygoogle =
                    (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
            } catch {
                // ignore
            }
            scriptLoadedRef.current = true;
        } else if (provider === 'gam' && gamNetworkCode) {
            // GPT 스크립트 로드
            const existing = document.querySelector('script[src*="securepubads"]');
            if (!existing) {
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
                document.head.appendChild(script);
            }
            scriptLoadedRef.current = true;
        }
    }, [provider, adsenseClient, gamNetworkCode]);

    const labels: Record<string, string> = {
        ko: '광고',
        ja: '広告',
        en: 'Advertisement',
        zh: '广告',
    };

    // Mock 모드: 개발용 placeholder
    if (provider === 'mock') {
        return (
            <div className="ad-banner ad-banner--mock">
                <div className="ad-banner__label">{labels[locale || 'en'] || labels.en}</div>
                <div className="ad-banner__content">
                    <span style={{ fontSize: '1.5rem' }}>📢</span>
                    <span>Banner Ad Placeholder (mock)</span>
                </div>
            </div>
        );
    }

    // AdSense 모드
    if (provider === 'adsense' && adsenseClient && adsenseBannerSlot) {
        return (
            <div className="ad-banner" ref={containerRef}>
                <div className="ad-banner__label">{labels[locale || 'en'] || labels.en}</div>
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', minHeight: '90px' }}
                    data-ad-client={adsenseClient}
                    data-ad-slot={adsenseBannerSlot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        );
    }

    // GAM 모드
    if (provider === 'gam' && gamBannerAdUnit) {
        return (
            <div className="ad-banner" ref={containerRef}>
                <div className="ad-banner__label">{labels[locale || 'en'] || labels.en}</div>
                <div id="gam-banner-slot" style={{ minHeight: '90px', width: '100%' }} />
            </div>
        );
    }

    return null;
}
