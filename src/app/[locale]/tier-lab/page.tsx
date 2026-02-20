'use client';

/* ===========================
   Tier Lab — 티어별 비교 테스트
   ===========================
   
   실제 서비스와 동일한 입력 폼 + 4컬럼 결과 비교
   /api/interpret-tiers 호출 (core 1회 + expand 4개)
   TEST_MODE 전용
*/

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { searchCities, CityResult } from '@/lib/geo/citySearch';

type FortuneMode = 'saju' | 'astrology' | 'tarot';
type TierName = 'free' | 'plus' | 'pro' | 'archmage';

interface TierResult {
    summary: string;
    sections: { title: string; content: string; icon: string }[];
    keyPoints: string[];
    guidance: string;
    luckyElements?: { color?: string; number?: string; direction?: string };
    model: string;
    meta: {
        userTier: string;
        effectiveTier: string;
        seedKey: string;
        latencyMs: number;
        cacheHit: boolean;
        totalChars: number;
        sectionCount: number;
        keyPointCount: number;
    };
}

interface TiersResponse {
    tiers: Record<TierName, TierResult>;
    seedKey: string;
    totalLatencyMs: number;
}

const TIER_INFO: Record<TierName, { name: Record<string, string>; color: string; icon: string }> = {
    free: { name: { ko: '무료 견습생', ja: '無料見習い', en: 'Free Apprentice', zh: '免费学徒' }, color: '#94a3b8', icon: '🌱' },
    plus: { name: { ko: '10년 점술사', ja: '10年占術師', en: '10yr Seer', zh: '十年占卜师' }, color: '#3b82f6', icon: '⭐' },
    pro: { name: { ko: '100년 대도사', ja: '100年大導師', en: 'Grand Seer', zh: '百年大道师' }, color: '#a855f7', icon: '🔮' },
    archmage: { name: { ko: '아크메이지', ja: 'アークメイジ', en: 'Archmage', zh: '大法师' }, color: '#f59e0b', icon: '👑' },
};

export default function TierLabPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    // 타입 안전 라벨 조회 헬퍼
    const L = (obj: Record<string, string>) => obj[loc] || obj.en || '';

    // 접근 제어
    const [testMode, setTestMode] = useState<boolean | null>(null);
    useEffect(() => {
        fetch('/api/config').then(r => r.json()).then(d => setTestMode(d.testMode)).catch(() => setTestMode(false));
    }, []);

    // 모드 선택
    const [mode, setMode] = useState<FortuneMode>('saju');

    // 공통 입력
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [question, setQuestion] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('female');

    // 사주 전용
    const [isLunar, setIsLunar] = useState(false);

    // 점성술 전용
    const [birthPlace, setBirthPlace] = useState('');
    const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
    const [suggestions, setSuggestions] = useState<CityResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 결과
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<TiersResponse | null>(null);

    // 점성술 도시 검색
    function handlePlaceInput(value: string) {
        setBirthPlace(value);
        setSelectedCity(null);
        const r = searchCities(value);
        setSuggestions(r);
        setShowDropdown(r.length > 0);
    }
    function handleSelectCity(city: CityResult) {
        setBirthPlace(loc === 'en' ? city.nameEn : city.name);
        setSelectedCity(city);
        setShowDropdown(false);
    }
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 분석 실행
    async function handleTestAllTiers() {
        setLoading(true);
        setError(null);
        setResults(null);

        const body: Record<string, unknown> = {
            system: mode,
            locale: loc,
            question: question || undefined,
            gender,
        };

        if (mode === 'saju') {
            if (!birthDate) { setError('생년월일을 입력하세요'); setLoading(false); return; }
            body.birthDate = birthDate;
            body.birthTime = birthTime || undefined;
            body.isLunar = isLunar;
        } else if (mode === 'astrology') {
            if (!birthDate || !selectedCity) { setError('생년월일과 출생 장소를 입력하세요'); setLoading(false); return; }
            body.birthDate = birthDate;
            body.birthTime = birthTime || undefined;
            body.birthPlace = selectedCity.nameEn;
            body.latitude = selectedCity.lat;
            body.longitude = selectedCity.lng;
        }
        // tarot: question만 필요

        try {
            const res = await fetch('/api/interpret-tiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }
            const data: TiersResponse = await res.json();
            setResults(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    const modeTab: Record<FortuneMode, Record<string, string>> = {
        saju: { ko: '☯ 사주', ja: '☯ 四柱', en: '☯ Saju', zh: '☯ 四柱' },
        astrology: { ko: '✦ 점성술', ja: '✦ 占星術', en: '✦ Astrology', zh: '✦ 占星术' },
        tarot: { ko: '🃏 타로', ja: '🃏 タロット', en: '🃏 Tarot', zh: '🃏  塔罗' },
    };
    const lb: Record<string, Record<string, string>> = {
        title: { ko: '🧪 Tier Lab', ja: '🧪 ティアラボ', en: '🧪 Tier Lab', zh: '🧪 层级实验室' },
        subtitle: { ko: '동일 입력 → 4티어 비교', ja: '同じ入力 → 4ティア比較', en: 'Same input → Compare 4 tiers', zh: '同一输入 → 4层级比较' },
        date: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        time: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        place: { ko: '출생 장소', ja: '出生地', en: 'Place of Birth', zh: '出生地' },
        placePh: { ko: '도시 이름 입력', ja: '都市名を入力', en: 'Type a city name', zh: '输入城市名称' },
        question: { ko: '질문 (선택)', ja: '質問（任意）', en: 'Question (optional)', zh: '问题(可选)' },
        questionPh: { ko: '궁금한 점을 입력하세요...', ja: '質問を入力してください...', en: 'Enter your question...', zh: '请输入您的问题...' },
        lunar: { ko: '음력', ja: '旧暦', en: 'Lunar', zh: '农历' },
        male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
        female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
        testAll: { ko: '🚀 Test All Tiers', ja: '🚀 全ティアテスト', en: '🚀 Test All Tiers', zh: '🚀 测试所有层级' },
        denied: { ko: '⛔ TEST_MODE가 꺼져 있습니다', ja: '⛔ テストモードが無効です', en: '⛔ TEST_MODE is disabled', zh: '⛔ 测试模式已关闭' },
    };

    // 접근 제어 로딩
    if (testMode === null) {
        return <section className="section"><div className="container text-center"><p>⏳ Loading...</p></div></section>;
    }
    if (!testMode) {
        return (
            <section className="section">
                <div className="container text-center">
                    <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
                        {L(lb.denied)}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        .env.local에서 TEST_MODE=true로 설정하세요
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '1400px' }}>
                {/* 헤더 */}
                <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                        <span className="text-gradient">{L(lb.title)}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{L(lb.subtitle)}</p>
                </div>

                {/* 모드 탭 */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
                    {(['saju', 'astrology', 'tarot'] as FortuneMode[]).map((m) => (
                        <button
                            key={m}
                            className={`btn ${mode === m ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => { setMode(m); setResults(null); setError(null); }}
                            style={{ minWidth: '120px' }}
                        >
                            {L(modeTab[m])}
                        </button>
                    ))}
                </div>

                {/* 입력 폼 */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', maxWidth: '700px', margin: '0 auto var(--space-6)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        {/* 생년월일 (사주/점성술) */}
                        {(mode === 'saju' || mode === 'astrology') && (
                            <>
                                <div className="form-group">
                                    <label>{L(lb.date)}</label>
                                    <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>{L(lb.time)}</label>
                                    <input type="time" className="input" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
                                </div>
                            </>
                        )}

                        {/* 음력 (사주 전용) */}
                        {mode === 'saju' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={isLunar} onChange={(e) => setIsLunar(e.target.checked)} style={{ accentColor: 'var(--color-accent-primary)' }} />
                                <span style={{ fontSize: 'var(--text-sm)' }}>{L(lb.lunar)}</span>
                            </label>
                        )}

                        {/* 출생 장소 (점성술 전용) */}
                        {mode === 'astrology' && (
                            <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                                <label>{L(lb.place)}</label>
                                <input
                                    type="text" className="input"
                                    placeholder={L(lb.placePh)}
                                    value={birthPlace}
                                    onChange={(e) => handlePlaceInput(e.target.value)}
                                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                        background: 'var(--color-bg-secondary, #1a1a2e)',
                                        border: '1px solid var(--color-border, #333)',
                                        borderRadius: 'var(--radius-lg, 12px)',
                                        marginTop: '4px', maxHeight: '200px', overflowY: 'auto',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                    }}>
                                        {suggestions.map((city, i) => (
                                            <button key={i} onClick={() => handleSelectCity(city)} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                width: '100%', padding: '10px 14px', background: 'transparent',
                                                border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                                color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)', textAlign: 'left',
                                            }}>
                                                <span>{loc === 'en' ? city.nameEn : city.name}</span>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                                                    {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedCity && (
                                    <div style={{ marginTop: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-accent-primary)' }}>
                                        📍 {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 성별 */}
                        <div className="form-group">
                            <label>{loc === 'ko' ? '성별' : 'Gender'}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {(['male', 'female'] as const).map((g) => (
                                    <button key={g} className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setGender(g)} style={{ flex: 1 }}>
                                        {g === 'male' ? '🧙‍♂️' : '🧙‍♀️'} {L(lb[g])}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 질문 */}
                        <div className="form-group">
                            <label>{L(lb.question)}</label>
                            <textarea className="input" value={question} onChange={(e) => setQuestion(e.target.value)}
                                placeholder={L(lb.questionPh)} rows={2} style={{ resize: 'vertical' }} />
                        </div>

                        {/* Test 버튼 */}
                        <button className="btn btn-gold btn-lg" onClick={handleTestAllTiers}
                            disabled={loading || (mode !== 'tarot' && !birthDate) || (mode === 'astrology' && !selectedCity)}
                            style={{ marginTop: 'var(--space-2)' }}>
                            {loading ? '⏳ Generating...' : L(lb.testAll)}
                        </button>
                    </div>
                </div>

                {/* 에러 */}
                {error && (
                    <div style={{ textAlign: 'center', color: '#ef4444', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)' }}>
                        ❌ {error}
                    </div>
                )}

                {/* 로딩 */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', animation: 'pulse 2s infinite' }}>🔮</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>Core 생성 중... → 4티어 동시 확장 중...</p>
                    </div>
                )}

                {/* 결과: 4컬럼 그리드 */}
                {results && (
                    <>
                        {/* SeedKey + Total Latency */}
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            🔑 seedKey: <code style={{ color: 'var(--color-accent-primary)' }}>{results.seedKey}</code>
                            {' · '}
                            ⏱ Total: <strong>{results.totalLatencyMs}ms</strong>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
                            {(['free', 'plus', 'pro', 'archmage'] as TierName[]).map((tierKey) => {
                                const tier = results.tiers[tierKey];
                                const info = TIER_INFO[tierKey];
                                if (!tier) return null;

                                return (
                                    <div key={tierKey} className="glass-card" style={{
                                        padding: 'var(--space-4)',
                                        borderTop: `3px solid ${info.color}`,
                                        overflow: 'hidden',
                                    }}>
                                        {/* 티어 헤더 */}
                                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                                            <div style={{ fontSize: '1.5rem' }}>{info.icon}</div>
                                            <div style={{ fontWeight: 700, color: info.color, fontSize: 'var(--text-sm)' }}>
                                                {info.name[loc] || info.name.en}
                                            </div>
                                        </div>

                                        {/* 메타 정보 */}
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', display: 'grid', gap: '2px' }}>
                                            <div>effectiveTier: <strong style={{ color: info.color }}>{tier.meta.effectiveTier}</strong></div>
                                            <div>📏 <strong style={{ color: 'var(--color-accent-gold, #f59e0b)' }}>{tier.meta.totalChars}</strong> chars · {tier.meta.sectionCount} secs · {tier.meta.keyPointCount} pts</div>
                                            <div>⏱ {tier.meta.latencyMs}ms · {tier.model}</div>
                                        </div>

                                        {/* Summary */}
                                        <div style={{ marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Summary</div>
                                            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{tier.summary}</p>
                                        </div>

                                        {/* Sections */}
                                        {tier.sections.map((sec, i) => (
                                            <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '2px' }}>
                                                    {sec.icon} {sec.title}
                                                </div>
                                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                    {sec.content.length > 300 ? sec.content.slice(0, 300) + '...' : sec.content}
                                                </p>
                                            </div>
                                        ))}

                                        {/* Key Points */}
                                        <div style={{ marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Key Points</div>
                                            <ul style={{ fontSize: 'var(--text-xs)', margin: 0, paddingLeft: '16px', color: 'var(--color-text-secondary)' }}>
                                                {tier.keyPoints.map((kp, i) => <li key={i} style={{ marginBottom: '2px' }}>{kp}</li>)}
                                            </ul>
                                        </div>

                                        {/* Lucky Elements */}
                                        {tier.luckyElements && (
                                            <div style={{
                                                fontSize: 'var(--text-xs)', padding: 'var(--space-2)',
                                                background: 'rgba(138,100,255,0.08)', borderRadius: 'var(--radius-md)',
                                                display: 'grid', gap: '2px',
                                            }}>
                                                <div>🎨 {tier.luckyElements.color}</div>
                                                <div>🔢 {tier.luckyElements.number}</div>
                                                <div>🧭 {tier.luckyElements.direction}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
