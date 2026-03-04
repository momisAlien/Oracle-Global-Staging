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
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
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
    errorCode?: string | null;
    gender: 'male' | 'female';
    locale: string;
    system?: 'saju' | 'astrology' | 'tarot' | 'synthesis' | 'today-report' | 'love' | 'compatibility';
    onRetry?: () => void;
}

export default function FortuneResultPanel({
    result,
    loading,
    error,
    errorCode,
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
    const [isAnonymous, setIsAnonymous] = useState(true);

    // Firebase Auth 상태 체크 (UpgradePanel 표시용)
    useEffect(() => {
        const auth = getClientAuth();
        return onAuthStateChanged(auth, (u) => setIsAnonymous(!u));
    }, []);

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
                // eslint-disable-next-line react-hooks/set-state-in-effect
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

    /* --- 에러 상태 (코드별 분기) --- */
    if (error) {
        // TRIAL_EXHAUSTED — 익명 트라이얼 소진
        if (errorCode === 'TRIAL_EXHAUSTED') {
            return (
                <div className="fortune-result">
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', background: 'linear-gradient(135deg, rgba(138,100,255,0.08), rgba(236,72,153,0.08))', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(138,100,255,0.25)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🔮</div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            {loc === 'ko' ? '무료 체험이 완료되었습니다' : loc === 'ja' ? '無料体験が完了しました' : loc === 'zh' ? '免费体验已完成' : 'Free trial completed'}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', whiteSpace: 'pre-line' }}>
                            {loc === 'ko' ? '회원가입하면 +2회 추가 질문을 받을 수 있습니다!\n더 깊은 분석도 이용할 수 있어요.' : loc === 'ja' ? '登録すると+2回追加質問が可能です！\nより深い分析もご利用いただけます。' : loc === 'zh' ? '注册即可获得+2次额外提问！\n还可以使用更深度的分析。' : 'Sign up to get +2 more questions!\nAccess deeper analysis too.'}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={`/${loc}/account`} className="btn btn-primary" style={{ minWidth: '160px' }}>✨ {loc === 'ko' ? '가입하고 +2회 받기' : loc === 'ja' ? '登録して+2回もらう' : loc === 'zh' ? '注册获取+2次' : 'Sign up & get +2'}</a>
                            <a href={`/${loc}/pricing`} className="btn btn-secondary" style={{ minWidth: '140px' }}>{loc === 'ko' ? '요금제 보기' : loc === 'ja' ? '料金を見る' : loc === 'zh' ? '查看价格' : 'View Pricing'}</a>
                        </div>
                    </div>
                </div>
            );
        }

        // LOGIN_REQUIRED_FOR_GRADE — 프리미엄 등급 로그인 필요
        if (errorCode === 'LOGIN_REQUIRED_FOR_GRADE') {
            return (
                <div className="fortune-result">
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(245,158,11,0.08))', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(168,85,247,0.25)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🔒</div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            {loc === 'ko' ? '프리미엄 등급은 로그인이 필요합니다' : loc === 'ja' ? 'プレミアムグレードにはログインが必要です' : loc === 'zh' ? '高级等级需要登录' : 'Premium grades require login'}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', whiteSpace: 'pre-line' }}>
                            {loc === 'ko' ? 'Pro/Archmage 등급을 사용하려면 로그인하거나\n다른 등급을 선택해주세요.' : loc === 'ja' ? 'Pro/Archmageグレードをご利用いただくにはログインするか、\n別のグレードを選択してください。' : loc === 'zh' ? '要使用Pro/Archmage等级，请登录或\n选择其他等级。' : 'To use Pro/Archmage grades, please log in or\nchoose a different grade.'}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={`/${loc}/account`} className="btn btn-primary" style={{ minWidth: '140px' }}>{loc === 'ko' ? '로그인' : loc === 'ja' ? 'ログイン' : loc === 'zh' ? '登录' : 'Login'}</a>
                            <a href={`/${loc}/grade`} className="btn btn-secondary" style={{ minWidth: '140px' }}>{loc === 'ko' ? '등급 변경' : loc === 'ja' ? 'グレード変更' : loc === 'zh' ? '更改等级' : 'Change Grade'}</a>
                        </div>
                    </div>
                </div>
            );
        }

        // CREDITS_EXHAUSTED — 크레딧 소진 (로그인 유저)
        if (errorCode === 'CREDITS_EXHAUSTED') {
            return (
                <div className="fortune-result">
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(138,100,255,0.08))', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>💎</div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            {loc === 'ko' ? '크레딧이 소진되었습니다' : loc === 'ja' ? 'クレジットが消費されました' : loc === 'zh' ? '积分已用完' : 'Credits exhausted'}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                            {loc === 'ko' ? '크레딧을 구매하면 계속 이용할 수 있습니다.' : loc === 'ja' ? 'クレジットを購入すると引き続きご利用いただけます。' : loc === 'zh' ? '购买积分即可继续使用。' : 'Purchase credits to continue using the service.'}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={`/${loc}/pricing`} className="btn btn-primary" style={{ minWidth: '160px' }}>{loc === 'ko' ? '크레딧 구매' : loc === 'ja' ? 'クレジット購入' : loc === 'zh' ? '购买积分' : 'Buy Credits'}</a>
                        </div>
                    </div>
                </div>
            );
        }

        // Generic error fallback
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

                    {/* ───── UpgradePanel — 익명 사용자 전환 유도 ───── */}
                    {isAnonymous && (
                        <div style={{
                            marginTop: 'var(--space-6)',
                            padding: 'var(--space-6)',
                            background: 'linear-gradient(135deg, rgba(138,100,255,0.1), rgba(236,72,153,0.1))',
                            border: '1px solid rgba(138,100,255,0.3)',
                            borderRadius: 'var(--radius-xl)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>✨</div>
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                                {loc === 'ko' ? '한 번 더 보고 싶나요?' : loc === 'ja' ? 'もう一度占いますか？' : loc === 'zh' ? '还想再占一次吗？' : 'Want another reading?'}
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                                {loc === 'ko' ? '무료 질문 1회가 완료되었습니다. 회원가입하면 +2회 더 받을 수 있어요.' : loc === 'ja' ? '無料の1回分は終了しました。登録すると+2回分が追加されます。' : loc === 'zh' ? '免费一次已用完。注册即可再获得+2次。' : 'Your free question is used. Sign up to get +2 more readings.'}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href={`/${loc}/account`} className="btn btn-primary" style={{ minWidth: '140px' }}>
                                    {loc === 'ko' ? '로그인 / 가입' : loc === 'ja' ? 'ログイン / 登録' : loc === 'zh' ? '登录 / 注册' : 'Login / Sign Up'}
                                </a>
                                <a href={`/${loc}/pricing`} className="btn btn-secondary" style={{ minWidth: '140px' }}>
                                    {loc === 'ko' ? '요금제 보기' : loc === 'ja' ? '料金を見る' : loc === 'zh' ? '查看价格' : 'View Pricing'}
                                </a>
                            </div>
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
