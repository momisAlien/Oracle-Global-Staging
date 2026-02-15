'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect, useMemo } from 'react';
import { searchCities, CityResult } from '@/lib/geo/citySearch';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';

export default function AstrologyPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
    const [suggestions, setSuggestions] = useState<CityResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [question, setQuestion] = useState('');
    const [showChart, setShowChart] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { result, loading, error, interpret } = useInterpret();

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '점성술 출생차트', ja: '出生チャート', en: 'Natal Birth Chart', zh: '出生星盘' },
        subtitle: { ko: '고정밀 천체력 기반 네이탈 차트', ja: '高精度エフェメリスに基づくネイタルチャート', en: 'High-precision ephemeris-based natal chart', zh: '基于高精度星历的本命盘' },
        date: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        time: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        place: { ko: '출생 장소', ja: '出生地', en: 'Place of Birth', zh: '出生地' },
        placePh: { ko: '도시 이름을 입력하세요', ja: '都市名を入力', en: 'Type a city name', zh: '输入城市名称' },
        analyze: { ko: '✦ AI 차트 분석', ja: '✦ AIチャート分析', en: '✦ AI Chart Analysis', zh: '✦ AI星盘分析' },
        trust: {
            ko: '천체 위치는 고정밀 천체력 데이터를 기반으로 계산됩니다. 해석은 전통 점성학 프레임워크를 따릅니다.',
            ja: '天体の位置は高精度のエフェメリスデータを使用して計算されています。',
            en: 'Astronomical positions are calculated using high-precision ephemeris data. Interpretations follow traditional astrological frameworks.',
            zh: '天体位置使用高精度星历数据计算。解读遵循传统占星学框架。',
        },
        chartPlaceholder: {
            ko: '출생 정보를 입력하면 네이탈 차트가 여기에 표시됩니다',
            ja: '出生情報を入力するとネイタルチャートが表示されます',
            en: 'Enter birth data to generate your natal chart',
            zh: '输入出生信息以生成星盘',
        },
        selectedCoords: { ko: '좌표', ja: '座標', en: 'Coordinates', zh: '坐标' },
        question: { ko: '궁금한 점 (선택)', ja: '質問（任意）', en: 'Your Question (optional)', zh: '您的问题（可选）' },
        questionPh: { ko: '올해 커리어 운세가 궁금합니다...', ja: '今年のキャリア運が気になります...', en: "I'm curious about my career this year...", zh: '想知道今年的事业运...' },
        genderLabel: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
        male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
        female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
    };

    function handlePlaceInput(value: string) {
        setBirthPlace(value);
        setSelectedCity(null);
        const results = searchCities(value);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
    }

    function handleSelectCity(city: CityResult) {
        const displayName = loc === 'en' ? city.nameEn : city.name;
        setBirthPlace(displayName);
        setSelectedCity(city);
        setShowDropdown(false);
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAnalyze = () => {
        if (!birthDate || !selectedCity) return;
        setShowChart(true);
        interpret({
            system: 'astrology',
            locale: loc,
            question: question || (loc === 'ko' ? '전반적인 점성술 분석을 해주세요' : 'Please provide a general astrological analysis'),
            birthDate,
            birthTime: birthTime || undefined,
            birthPlace: selectedCity.nameEn,
            latitude: selectedCity.lat,
            longitude: selectedCity.lng,
            gender,
        });
    };

    // 생년월일 + 시간 기반 행성 위치 근사 계산
    const planetPositions = useMemo(() => {
        if (!birthDate) return null;
        const [yStr, mStr, dStr] = birthDate.split('-');
        const y = parseInt(yStr, 10);
        const m = parseInt(mStr, 10);
        const d = parseInt(dStr, 10);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

        let h = 12;
        if (birthTime) {
            const [hStr, minStr] = birthTime.split(':');
            h = parseInt(hStr, 10) + (parseInt(minStr, 10) || 0) / 60;
        }

        // Julian Day Number 근사
        const jd = 367 * y - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4) + Math.floor(275 * m / 9) + d + 1721013.5 + h / 24;
        const T = (jd - 2451545.0) / 36525; // J2000.0 기준 율리우스 세기

        // 간이 행성 경도 (도)
        const mod360 = (x: number) => ((x % 360) + 360) % 360;
        const sunLng = mod360(280.46646 + 36000.76983 * T);
        const moonLng = mod360(218.32 + 481267.883 * T);
        const mercuryLng = mod360(252.25 + 149472.675 * T);
        const venusLng = mod360(181.98 + 58517.816 * T);
        const marsLng = mod360(355.43 + 19140.30 * T);
        const jupiterLng = mod360(34.35 + 3034.906 * T);
        const saturnLng = mod360(50.08 + 1222.114 * T);

        return [
            { symbol: '☉', deg: sunLng, label: 'Sun', color: '#fbbf24' },
            { symbol: '☽', deg: moonLng, label: 'Moon', color: '#e2e8f0' },
            { symbol: '☿', deg: mercuryLng, label: 'Mercury', color: '#a3e635' },
            { symbol: '♀', deg: venusLng, label: 'Venus', color: '#ec4899' },
            { symbol: '♂', deg: marsLng, label: 'Mars', color: '#ef4444' },
            { symbol: '♃', deg: jupiterLng, label: 'Jupiter', color: '#8b5cf6' },
            { symbol: '♄', deg: saturnLng, label: 'Saturn', color: '#64748b' },
        ];
    }, [birthDate, birthTime]);

    // 12하우스 네이탈 차트 SVG
    function renderNatalChart() {
        const size = 500;
        const cx = size / 2;
        const cy = size / 2;
        const outerR = 220;
        const innerR = 150;
        const coreR = 60;

        const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        const signColors = [
            '#ef4444', '#a3e635', '#facc15', '#38bdf8',
            '#f97316', '#22c55e', '#ec4899', '#06b6d4',
            '#8b5cf6', '#64748b', '#3b82f6', '#6ee7b7'
        ];

        return (
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: '500px' }}>
                <defs>
                    <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(138,100,255,0.08)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={outerR + 15} fill="url(#chartBg)" />
                <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(138,100,255,0.4)" strokeWidth="1" />
                <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(138,100,255,0.3)" strokeWidth="1" />
                <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(138,100,255,0.2)" strokeWidth="1" />

                {signs.map((sign, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x1 = Math.round((cx + innerR * Math.cos(angle)) * 100) / 100;
                    const y1 = Math.round((cy + innerR * Math.sin(angle)) * 100) / 100;
                    const x2 = Math.round((cx + outerR * Math.cos(angle)) * 100) / 100;
                    const y2 = Math.round((cy + outerR * Math.sin(angle)) * 100) / 100;
                    const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180);
                    const signR = (innerR + outerR) / 2;
                    const sx = Math.round((cx + signR * Math.cos(midAngle)) * 100) / 100;
                    const sy = Math.round((cy + signR * Math.sin(midAngle)) * 100) / 100;

                    return (
                        <g key={i}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(138,100,255,0.2)" strokeWidth="0.5" />
                            <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                                fill={signColors[i]} fontSize="16" fontWeight="bold" opacity="0.8">
                                {sign}
                            </text>
                        </g>
                    );
                })}

                {/* 행성 표시 — 생년월일 입력 시 활성화 */}
                {planetPositions && planetPositions.map((planet, i) => {
                    const angle = (planet.deg - 90) * (Math.PI / 180);
                    const r = innerR - 30;
                    const px = Math.round((cx + r * Math.cos(angle)) * 100) / 100;
                    const py = Math.round((cy + r * Math.sin(angle)) * 100) / 100;

                    return (
                        <g key={i}>
                            <circle cx={px} cy={py} r={14} fill="rgba(138,100,255,0.15)" stroke={planet.color} strokeWidth="1.5" />
                            <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
                                fill={planet.color} fontSize="13" fontWeight="bold">
                                {planet.symbol}
                            </text>
                        </g>
                    );
                })}

                {!planetPositions && (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                        fill="rgba(255,255,255,0.3)" fontSize="11">
                        {labels.chartPlaceholder[loc]}
                    </text>
                )}
                {planetPositions && (
                    <>
                        <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600">
                            NATAL CHART
                        </text>
                        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                            {birthDate}{birthTime ? ` ${birthTime}` : ''}
                        </text>
                    </>
                )}
            </svg>
        );
    }

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">✦ {labels.title[loc]}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{labels.subtitle[loc]}</p>
                </div>

                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label>{labels.date[loc]}</label>
                            <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{labels.time[loc]}</label>
                            <input type="time" className="input" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
                        </div>

                        {/* 출생 장소 — 자동완성 */}
                        <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                            <label>{labels.place[loc]}</label>
                            <input
                                type="text"
                                className="input"
                                placeholder={labels.placePh[loc]}
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
                                    marginTop: '4px', maxHeight: '240px', overflowY: 'auto',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                }}>
                                    {suggestions.map((city, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectCity(city)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                width: '100%', padding: '12px 16px', background: 'transparent',
                                                border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                                color: 'var(--color-text-primary, #fff)', cursor: 'pointer',
                                                fontSize: 'var(--text-sm, 14px)', textAlign: 'left', transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(138,100,255,0.1)'; }}
                                            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
                                        >
                                            <span>{loc === 'en' ? city.nameEn : city.name}</span>
                                            <span style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--color-text-muted, #666)', marginLeft: '8px' }}>
                                                {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedCity && (
                                <div style={{ marginTop: '6px', fontSize: 'var(--text-xs, 12px)', color: 'var(--color-accent-primary, #a78bfa)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    📍 {labels.selectedCoords[loc]}: {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E
                                </div>
                            )}
                        </div>

                        {/* 성별 선택 */}
                        <div className="form-group">
                            <label>{labels.genderLabel[loc]}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {(['male', 'female'] as const).map((g) => (
                                    <button
                                        key={g}
                                        className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setGender(g)}
                                        style={{ flex: 1 }}
                                    >
                                        {g === 'male' ? '🧙‍♂️' : '🧙‍♀️'} {labels[g][loc]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 질문 입력 */}
                        <div className="form-group">
                            <label>{labels.question[loc]}</label>
                            <textarea
                                className="input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={labels.questionPh[loc]}
                                rows={2}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 'var(--space-4)' }}
                            onClick={handleAnalyze}
                            disabled={!birthDate || !selectedCity || loading}
                        >
                            {loading ? '⏳...' : labels.analyze[loc]}
                        </button>
                    </div>
                </div>

                {/* SVG 네이털 차트 — AI 분석 클릭 후 표시 */}
                {showChart && planetPositions && (
                    <div className="glass-card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-8)', textAlign: 'center' }}>
                        {renderNatalChart()}
                    </div>
                )}

                {/* AI 결과 패널 */}
                <FortuneResultPanel
                    system="astrology"
                    result={result}
                    loading={loading}
                    error={error}
                    gender={gender}
                    locale={loc}
                    onRetry={handleAnalyze}
                />

                <div className="trust-statement-box" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(138,100,255,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(138,100,255,0.15)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        🔬 {labels.trust[loc]}
                    </p>
                </div>
            </div>
        </section>
    );
}
