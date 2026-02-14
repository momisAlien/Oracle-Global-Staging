'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { searchCities, CityResult } from '@/lib/geo/citySearch';

export default function AstrologyPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
    const [suggestions, setSuggestions] = useState<CityResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '점성술 출생차트', ja: '出生チャート', en: 'Natal Birth Chart', zh: '出生星盘' },
        subtitle: { ko: '고정밀 천체력 기반 네이탈 차트', ja: '高精度エフェメリスに基づくネイタルチャート', en: 'High-precision ephemeris-based natal chart', zh: '基于高精度星历的本命盘' },
        date: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        time: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        place: { ko: '출생 장소', ja: '出生地', en: 'Place of Birth', zh: '出生地' },
        placePh: { ko: '도시 이름을 입력하세요', ja: '都市名を入力', en: 'Type a city name', zh: '输入城市名称' },
        analyze: { ko: '차트 생성', ja: 'チャート生成', en: 'Generate Chart', zh: '生成星盘' },
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
        selectedCoords: {
            ko: '좌표',
            ja: '座標',
            en: 'Coordinates',
            zh: '坐标',
        },
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

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 12하우스 네이탈 차트를 위한 데모 SVG
    function renderDemoChart() {
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

        // Demo planet positions (degrees)
        const demoPlanets = selectedCity ? [
            { symbol: '☉', deg: 42, label: 'Sun' },
            { symbol: '☽', deg: 128, label: 'Moon' },
            { symbol: '☿', deg: 55, label: 'Mercury' },
            { symbol: '♀', deg: 15, label: 'Venus' },
            { symbol: '♂', deg: 210, label: 'Mars' },
            { symbol: '♃', deg: 285, label: 'Jupiter' },
            { symbol: '♄', deg: 330, label: 'Saturn' },
        ] : [];

        return (
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: '500px' }}>
                <defs>
                    <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(138,100,255,0.08)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>

                {/* 배경 */}
                <circle cx={cx} cy={cy} r={outerR + 15} fill="url(#chartBg)" />

                {/* 외곽 원 */}
                <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(138,100,255,0.4)" strokeWidth="1" />
                <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(138,100,255,0.3)" strokeWidth="1" />
                <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(138,100,255,0.2)" strokeWidth="1" />

                {/* 12 하우스 구분선 + 사인 기호 */}
                {signs.map((sign, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x1 = Math.round((cx + innerR * Math.cos(angle)) * 100) / 100;
                    const y1 = Math.round((cy + innerR * Math.sin(angle)) * 100) / 100;
                    const x2 = Math.round((cx + outerR * Math.cos(angle)) * 100) / 100;
                    const y2 = Math.round((cy + outerR * Math.sin(angle)) * 100) / 100;

                    // 사인 기호 위치 (두 선 사이 중간)
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

                {/* 데모 행성 배치 */}
                {demoPlanets.map((planet, i) => {
                    const angle = (planet.deg - 90) * (Math.PI / 180);
                    const r = innerR - 30;
                    const px = Math.round((cx + r * Math.cos(angle)) * 100) / 100;
                    const py = Math.round((cy + r * Math.sin(angle)) * 100) / 100;

                    return (
                        <g key={i}>
                            <circle cx={px} cy={py} r={14} fill="rgba(138,100,255,0.15)" stroke="rgba(138,100,255,0.5)" strokeWidth="1" />
                            <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
                                fill="var(--color-accent-primary, #a78bfa)" fontSize="13" fontWeight="bold">
                                {planet.symbol}
                            </text>
                        </g>
                    );
                })}

                {/* 중앙 텍스트 */}
                {!selectedCity && (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                        fill="rgba(255,255,255,0.3)" fontSize="11">
                        {labels.chartPlaceholder[loc]}
                    </text>
                )}
                {selectedCity && (
                    <>
                        <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600">
                            NATAL CHART
                        </text>
                        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                            (Demo Data)
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
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 50,
                                    background: 'var(--color-bg-secondary, #1a1a2e)',
                                    border: '1px solid var(--color-border, #333)',
                                    borderRadius: 'var(--radius-lg, 12px)',
                                    marginTop: '4px',
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                }}>
                                    {suggestions.map((city, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectCity(city)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                                color: 'var(--color-text-primary, #fff)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--text-sm, 14px)',
                                                textAlign: 'left',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(138,100,255,0.1)'; }}
                                            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
                                        >
                                            <span>{loc === 'en' ? city.nameEn : city.name}</span>
                                            <span style={{
                                                fontSize: 'var(--text-xs, 12px)',
                                                color: 'var(--color-text-muted, #666)',
                                                marginLeft: '8px',
                                            }}>
                                                {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 선택된 도시 좌표 표시 */}
                            {selectedCity && (
                                <div style={{
                                    marginTop: '6px',
                                    fontSize: 'var(--text-xs, 12px)',
                                    color: 'var(--color-accent-primary, #a78bfa)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    📍 {labels.selectedCoords[loc]}: {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 'var(--space-4)' }}
                            onClick={() => {
                                if (!selectedCity) {
                                    // 도시를 선택하지 않은 경우
                                    const results = searchCities(birthPlace);
                                    if (results.length > 0) {
                                        setSuggestions(results);
                                        setShowDropdown(true);
                                    }
                                    return;
                                }
                                // TODO: Phase 3에서 실제 차트 계산 연동
                            }}
                        >
                            {labels.analyze[loc]}
                        </button>
                    </div>
                </div>

                {/* SVG 네이탈 차트 */}
                <div className="glass-card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-8)', textAlign: 'center' }}>
                    {renderDemoChart()}
                </div>

                <div className="trust-statement-box" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(138,100,255,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(138,100,255,0.15)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        🔬 {labels.trust[loc]}
                    </p>
                </div>
            </div>
        </section>
    );
}
