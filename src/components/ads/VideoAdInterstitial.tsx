'use client';

/* ===========================
   VideoAdInterstitial — 영상 광고 인터스티셜
   ===========================
   
   free 유저에게만 표시되는 인터스티셜 영상 광고.
   빈도 제한: 3회 중 1회 또는 10분에 1회 (localStorage 기반)
   5초 후 스킵 가능 → 원래 동작 진행
*/

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'oracle_video_ad';
const FREQ_CAP_INTERVAL_MS = 10 * 60 * 1000; // 10분
const FREQ_CAP_COUNT = 3; // 3회 중 1회

interface FreqCapData {
    lastShownAt: number;
    counter: number;
}

function getFreqCapData(): FreqCapData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return { lastShownAt: 0, counter: 0 };
}

function setFreqCapData(data: FreqCapData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore
    }
}

/** 영상 광고를 보여줄 타이밍인지 체크 */
export function shouldShowVideoAd(): boolean {
    const data = getFreqCapData();
    const now = Date.now();

    // 10분 이내에 이미 보여줬으면 스킵
    if (now - data.lastShownAt < FREQ_CAP_INTERVAL_MS) {
        return false;
    }

    // 3회 중 1회
    const nextCounter = data.counter + 1;
    setFreqCapData({ ...data, counter: nextCounter });

    if (nextCounter % FREQ_CAP_COUNT !== 0) {
        return false;
    }

    return true;
}

/** 영상 광고를 보여줬다고 기록 */
function markVideoAdShown() {
    setFreqCapData({ lastShownAt: Date.now(), counter: getFreqCapData().counter });
}

interface VideoAdInterstitialProps {
    /** 광고 닫힘 시 콜백 (원래 동작 진행) */
    onComplete: () => void;
    /** 광고 tag URL (GAM인 경우) */
    videoAdTagUrl?: string;
    provider: string;
    locale?: string;
}

export default function VideoAdInterstitial({
    onComplete,
    videoAdTagUrl,
    provider,
    locale,
}: VideoAdInterstitialProps) {
    const [countdown, setCountdown] = useState(5);
    const [canSkip, setCanSkip] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const labels: Record<string, Record<string, string>> = {
        skip: { ko: '건너뛰기', ja: 'スキップ', en: 'Skip', zh: '跳过' },
        ad: { ko: '광고', ja: '広告', en: 'Ad', zh: '广告' },
        wait: { ko: '{n}초 후 건너뛰기 가능', ja: '{n}秒後にスキップ可能', en: 'Skip in {n}s', zh: '{n}秒后可跳过' },
    };
    const L = (key: string) => labels[key]?.[locale || 'en'] || labels[key]?.en || '';

    useEffect(() => {
        markVideoAdShown();

        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setCanSkip(true);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleSkip = useCallback(() => {
        if (canSkip) onComplete();
    }, [canSkip, onComplete]);

    return (
        <div className="video-ad-overlay">
            <div className="video-ad-modal">
                {/* 헤더 */}
                <div className="video-ad-header">
                    <span className="video-ad-badge">{L('ad')}</span>
                    {canSkip ? (
                        <button className="video-ad-skip" onClick={handleSkip}>
                            {L('skip')} ▸
                        </button>
                    ) : (
                        <span className="video-ad-countdown">
                            {L('wait').replace('{n}', String(countdown))}
                        </span>
                    )}
                </div>

                {/* 영상 영역 */}
                <div className="video-ad-player">
                    {provider === 'mock' ? (
                        <div className="video-ad-mock">
                            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎬</div>
                            <p>Video Ad Placeholder (mock)</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                실제 운영 시 GAM/AdSense 영상 광고가 표시됩니다
                            </p>
                        </div>
                    ) : videoAdTagUrl ? (
                        <div className="video-ad-real" id="video-ad-container">
                            {/* GAM IMA SDK 등으로 videoAdTagUrl 재생 */}
                            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                Loading video ad...
                            </p>
                        </div>
                    ) : (
                        <div className="video-ad-mock">
                            <p>No video ad tag configured</p>
                        </div>
                    )}
                </div>

                {/* 진행 바 */}
                <div className="video-ad-progress">
                    <div
                        className="video-ad-progress-bar"
                        style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
