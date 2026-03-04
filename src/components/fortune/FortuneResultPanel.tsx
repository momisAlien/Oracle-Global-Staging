'use client';

/* ===========================
   FortuneResultPanel — 비주얼 노벨 스타일 결과 패널
   캐릭터 반신 + 홀로그램 카드 + 글래스모피즘
   =========================== */

import '@/styles/fortune-result.css';
import '@/styles/ads.css';
import { useState, useEffect } from 'react';
import type { InterpretResponse } from '@/lib/hooks/useInterpret';
import { useMe } from '@/lib/hooks/useMe';
import AdsGate from '@/components/ads/AdsGate';
import BannerAd from '@/components/ads/BannerAd';
import VideoAdInterstitial, { shouldShowVideoAd } from '@/components/ads/VideoAdInterstitial';

interface AdsFlags {
    enabled: boolean;
    bannerEnabled: boolean;
    videoEnabled: boolean;
    provider: string;
    adsenseClient?: string;
    adsenseBannerSlot?: string;
    gamNetworkCode?: string;
    gamBannerAdUnit?: string;
    gamVideoAdTagUrl?: string;
}

// 티어별 캐릭터 이미지 매핑
const TIER_IMAGES: Record<string, Record<'male' | 'female', string>> = {
    free: {
        male: '/images/tiers/Apprentice_male.png',
        female: '/images/tiers/Apprentice_female.png',
    },
    plus: {
        male: '/images/tiers/seer_male.png',
        female: '/images/tiers/seer_female.png',
    },
    pro: {
        male: '/images/tiers/Grand_Seer_male.png',
        female: '/images/tiers/Grand_Seer_female.png',
    },
    archmage: {
        male: '/images/tiers/archmage_male.png',
        female: '/images/tiers/archmage_female.png',
    },
};

const TIER_NAMES_MAP: Record<string, Record<string, string>> = {
    free: { ko: '견습 점술사', ja: '見習い占い師', en: 'Apprentice Seer', zh: '学徒占卜师' },
    plus: { ko: '10년 점술사', ja: '10年占い師', en: '10-Year Seer', zh: '十年占卜师' },
    pro: { ko: '100년 대도사', ja: '100年大導師', en: 'Grand Seer', zh: '百年大道师' },
    archmage: { ko: '아크메이지', ja: 'アークメイジ', en: 'Archmage', zh: '大法师' },
};

const LOADING_TEXT: Record<string, string> = {
    ko: '운명의 별을 읽는 중...',
    ja: '運命の星を読んでいます...',
    en: 'Reading the stars of destiny...',
    zh: '正在解读命运之星...',
};

const DISCLAIMER_TEXT: Record<string, string> = {
    ko: '본 서비스는 오락 및 개인적 성찰 목적입니다.',
    ja: 'このサービスは娯楽および個人的な内省目的です。',
    en: 'This service is for entertainment and personal reflection.',
    zh: '本服务仅供娱乐和个人反思。',
};

interface FortuneResultPanelProps {
    result: InterpretResponse | null;
    loading: boolean;
    error: string | null;
    gender: 'male' | 'female';
    locale: string;
    system?: 'saju' | 'astrology' | 'tarot' | 'synthesis' | 'today-report' | 'love' | 'compatibility';
    onRetry?: () => void;
}

export default function FortuneResultPanel({
    result,
    loading,
    error,
    gender,
    locale,
    system,
    onRetry,
}: FortuneResultPanelProps) {
    const loc = (['ko', 'ja', 'en', 'zh'].includes(locale) ? locale : 'ko') as 'ko' | 'ja' | 'en' | 'zh';

    // 광고 관련
    const { userTier } = useMe();
    const [adsFlags, setAdsFlags] = useState<AdsFlags | null>(null);
    const [showVideoAd, setShowVideoAd] = useState(false);

    // /api/config에서 광고 플래그 로드 (캐시됨)
    useEffect(() => {
        fetch('/api/config')
            .then(r => r.json())
            .then(d => { if (d.ads) setAdsFlags(d.ads); })
            .catch(() => { });
    }, []);

    // 결과 도착 시 영상 광고 표시 여부 판단
    useEffect(() => {
        if (result && userTier === 'free' && adsFlags?.videoEnabled) {
            if (shouldShowVideoAd()) {
                setShowVideoAd(true);
            }
        }
    }, [result, userTier, adsFlags?.videoEnabled]);

    /* --- 로딩 상태 --- */
    if (loading) {
        return (
            <div className="fortune-result">
                <div className="fortune-loading">
                    <div className="fortune-loading-orb" />
                    <p className="fortune-loading-text">{LOADING_TEXT[loc]}</p>
                </div>
            </div>
        );
    }

    /* --- 에러 상태 --- */
    if (error) {
        return (
            <div className="fortune-result">
                <div className="fortune-error">
                    <div className="fortune-error-icon">⚠️</div>
                    <p className="fortune-error-msg">{error}</p>
                    {onRetry && (
                        <div className="fortune-error-retry">
                            <button className="btn btn-secondary" onClick={onRetry}>
                                {loc === 'ko' ? '다시 시도' : loc === 'ja' ? '再試行' : loc === 'zh' ? '重试' : 'Retry'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* --- 결과 없음 --- */
    if (!result) return null;

    const tier = result.tier || 'free';
    const charImg = TIER_IMAGES[tier]?.[gender] || TIER_IMAGES.free[gender];
    const charName = TIER_NAMES_MAP[tier]?.[loc] || TIER_NAMES_MAP.free.en;

    return (
        <div className="fortune-result">
            <div className="fortune-result-layout">
                {/* 캐릭터 영역 */}
                <div className="fortune-character">
                    <img
                        src={charImg}
                        alt={charName}
                        className="fortune-character-img"
                        loading="lazy"
                    />
                    <span className="fortune-character-name">{charName}</span>
                </div>

                {/* 결과 콘텐츠 */}
                <div className="fortune-content">
                    {/* 서머리 */}
                    {result.summary && (
                        <div className="fortune-summary">{result.summary}</div>
                    )}

                    {/* 홀로그램 카드 스택 */}
                    {result.sections && result.sections.length > 0 && (
                        <div className="fortune-cards">
                            {result.sections.map((section, i) => (
                                <div key={i} className="fortune-card">
                                    <div className="fortune-card-header">
                                        <span className="fortune-card-icon">{section.icon || '✦'}</span>
                                        <span className="fortune-card-title">{section.title}</span>
                                    </div>
                                    <div className="fortune-card-content">{section.content}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 키 포인트 */}
                    {result.keyPoints && result.keyPoints.length > 0 && (
                        <div className="fortune-keypoints">
                            <h4>{loc === 'ko' ? '핵심 포인트' : loc === 'ja' ? '重要ポイント' : loc === 'zh' ? '要点' : 'Key Points'}</h4>
                            <ul className="fortune-keypoint-list">
                                {result.keyPoints.map((point, i) => (
                                    <li key={i} className="fortune-keypoint-item">{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 가이던스 */}
                    {result.guidance && (
                        <div className="fortune-guidance">
                            💡 {result.guidance}
                        </div>
                    )}

                    {/* 행운 요소 (타로에서는 표시 안 함) */}
                    {system !== 'tarot' && result.luckyElements && (
                        <div className="fortune-lucky">
                            {result.luckyElements.color && (
                                <span className="fortune-lucky-item">
                                    <span className="fortune-lucky-label">🎨</span> {result.luckyElements.color}
                                </span>
                            )}
                            {result.luckyElements.number && (
                                <span className="fortune-lucky-item">
                                    <span className="fortune-lucky-label">🔢</span> {result.luckyElements.number}
                                </span>
                            )}
                            {result.luckyElements.direction && (
                                <span className="fortune-lucky-item">
                                    <span className="fortune-lucky-label">🧭</span> {result.luckyElements.direction}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Gemini 2차 검증 (Archmage) */}
                    {result.geminiVerification && (
                        <div className="fortune-gemini">
                            <div className="fortune-gemini-header">
                                ⚡ {loc === 'ko' ? '아크메이지 2차 검증 (Gemini)' : loc === 'ja' ? 'アークメイジ二次検証' : loc === 'zh' ? '大法师二次验证' : 'Archmage 2nd-Pass Verification'}
                            </div>
                            {result.geminiVerification.additionalInsights && (
                                <div className="fortune-gemini-content">
                                    {result.geminiVerification.additionalInsights}
                                </div>
                            )}
                            {result.geminiVerification.crossValidation && (
                                <div className="fortune-gemini-content" style={{ marginTop: 'var(--space-2)' }}>
                                    {result.geminiVerification.crossValidation}
                                </div>
                            )}
                            {result.geminiVerification.hiddenPatterns && result.geminiVerification.hiddenPatterns.length > 0 && (
                                <div className="fortune-gemini-patterns">
                                    {result.geminiVerification.hiddenPatterns.map((p, i) => (
                                        <span key={i} className="fortune-gemini-pattern">{p}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 배너 광고 (free 전용) */}
                    {adsFlags && (
                        <AdsGate userTier={userTier} adsEnabled={adsFlags.enabled && adsFlags.bannerEnabled}>
                            <BannerAd
                                provider={adsFlags.provider}
                                adsenseClient={adsFlags.adsenseClient}
                                adsenseBannerSlot={adsFlags.adsenseBannerSlot}
                                gamNetworkCode={adsFlags.gamNetworkCode}
                                gamBannerAdUnit={adsFlags.gamBannerAdUnit}
                                locale={loc}
                            />
                        </AdsGate>
                    )}

                    {/* 메타 정보 */}
                    <div className="fortune-meta">
                        <span className="fortune-disclaimer">{DISCLAIMER_TEXT[loc]}</span>
                    </div>
                </div>
            </div>

            {/* 영상 광고 인터스티셜 (free 전용, frequency cap) */}
            {showVideoAd && adsFlags && (
                <VideoAdInterstitial
                    onComplete={() => setShowVideoAd(false)}
                    provider={adsFlags.provider}
                    videoAdTagUrl={adsFlags.gamVideoAdTagUrl}
                    locale={loc}
                />
            )}
        </div>
    );
}
