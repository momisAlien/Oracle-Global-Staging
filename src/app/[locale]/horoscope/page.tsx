'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';
import {
    getZodiacSign,
    getChineseZodiac,
    formatDateRange,
    ZODIAC_SIGNS,
    CHINESE_ZODIAC_ANIMALS,
    ELEMENT_COLORS,
    ELEMENT_NAMES,
    ELEMENT_ICONS,
    CZ_ELEMENT_COLORS,
    CZ_ELEMENT_ICONS,
    type ZodiacSign,
    type ChineseZodiacAnimal,
} from '@/lib/zodiac';

const LABELS: Record<string, Record<string, string>> = {
    title: { ko: '별자리 및 띠 운세', ja: '星座・干支占い', en: 'Zodiac & Chinese Zodiac', zh: '星座与生肖运势' },
    subtitle: {
        ko: '생년월일을 입력하면 당신의 별자리·띠와 오늘의 운세를 확인할 수 있습니다',
        ja: '生年月日を入力して、あなたの星座・干支と今日の運勢を確認しましょう',
        en: 'Enter your birthdate to discover your zodiac sign, Chinese zodiac & fortune',
        zh: '输入出生日期，查看您的星座、生肖和今日运势',
    },
    birthDate: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
    yourSign: { ko: '당신의 별자리', ja: 'あなたの星座', en: 'Your Sign', zh: '您的星座' },
    yourAnimal: { ko: '당신의 띠', ja: 'あなたの干支', en: 'Your Chinese Zodiac', zh: '您的生肖' },
    element: { ko: '원소', ja: '元素', en: 'Element', zh: '元素' },
    traits: { ko: '성격 특성', ja: '性格特性', en: 'Traits', zh: '性格特征' },
    period: { ko: '기간', ja: '期間', en: 'Period', zh: '日期范围' },
    analyze: { ko: '✦ AI 운세 분석', ja: '✦ AI運勢分析', en: '✦ AI Fortune Analysis', zh: '✦ AI运势分析' },
    selectSign: { ko: '또는 별자리를 선택하세요', ja: 'または星座を選んでください', en: 'Or select your zodiac sign', zh: '或选择您的星座' },
    selectAnimal: { ko: '또는 띠를 선택하세요', ja: 'または干支を選んでください', en: 'Or select your Chinese zodiac', zh: '或选择您的生肖' },
    gender: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
    male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
    female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
    question: { ko: '궁금한 점 (선택)', ja: '質問（任意）', en: 'Your Question (optional)', zh: '您的问题（可选）' },
    questionPh: {
        ko: '연애운이 궁금합니다...',
        ja: '恋愛運が気になります...',
        en: 'Tell me about my love fortune...',
        zh: '想了解我的恋爱运...',
    },
    todayFortune: { ko: '오늘의 운세', ja: '今日の運勢', en: "Today's Fortune", zh: '今日运势' },
};

export default function HoroscopePage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [birthDate, setBirthDate] = useState('');
    const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
    const [selectedAnimal, setSelectedAnimal] = useState<ChineseZodiacAnimal | null>(null);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [question, setQuestion] = useState('');
    const { result, loading, error, errorCode, interpret } = useInterpret();

    // 생년월일로 별자리 자동 감지
    const detectedSign = useMemo(() => {
        if (!birthDate) return null;
        return getZodiacSign(birthDate);
    }, [birthDate]);

    // 생년월일로 띠 자동 감지
    const detectedAnimal = useMemo(() => {
        if (!birthDate) return null;
        const year = parseInt(birthDate.split('-')[0], 10);
        if (isNaN(year)) return null;
        return getChineseZodiac(year);
    }, [birthDate]);

    // 최종 선택된 별자리 (입력 감지 우선, 없으면 직접 선택)
    const activeSign = detectedSign || selectedSign;
    const activeAnimal = detectedAnimal || selectedAnimal;

    const handleSelectSign = (sign: ZodiacSign) => {
        setSelectedSign(sign);
        setBirthDate(''); // 직접 선택 시 날짜 초기화
    };

    const handleSelectAnimal = (animal: ChineseZodiacAnimal) => {
        setSelectedAnimal(animal);
        setBirthDate(''); // 직접 선택 시 날짜 초기화
    };

    const handleAnalyze = () => {
        if (!activeSign && !activeAnimal) return;

        const today = new Date().toISOString().split('T')[0];
        const signName = activeSign?.names[loc] || '';
        const animalName = activeAnimal?.names[loc] || '';
        const combo = [signName, animalName].filter(Boolean).join(' + ');

        interpret({
            system: 'astrology',
            locale: loc,
            question: question || (loc === 'ko'
                ? `${combo}의 오늘(${today}) 운세를 상세히 분석해주세요. 연애, 재물, 건강, 직장/학업 운을 각각 알려주세요.${activeAnimal ? ` 띠(${animalName})의 특성도 반영해주세요.` : ''}`
                : loc === 'ja'
                    ? `${combo}の今日(${today})の運勢を詳しく分析してください。恋愛、金運、健康、仕事/学業運をそれぞれ教えてください。${activeAnimal ? `干支(${animalName})の特性も反映してください。` : ''}`
                    : loc === 'zh'
                        ? `请详细分析${combo}今天(${today})的运势。请分别告诉我爱情、财运、健康、事业/学业运。${activeAnimal ? `请同时反映生肖(${animalName})的特征。` : ''}`
                        : `Please analyze today's (${today}) horoscope for ${combo} in detail. Cover love, wealth, health, and career/study fortune.${activeAnimal ? ` Also reflect ${animalName} Chinese zodiac characteristics.` : ''}`
            ),
            birthDate: birthDate || today,
            gender,
        });
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* 헤더 */}
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">⭐ {LABELS.title[loc]}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {LABELS.subtitle[loc]}
                    </p>
                </div>

                {/* 입력 폼 */}
                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label>{LABELS.birthDate[loc]}</label>
                            <input
                                type="date"
                                className="input"
                                value={birthDate}
                                onChange={(e) => {
                                    setBirthDate(e.target.value);
                                    setSelectedSign(null);
                                    setSelectedAnimal(null);
                                }}
                            />
                        </div>

                        {/* 성별 선택 */}
                        <div className="form-group">
                            <label>{LABELS.gender[loc]}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {(['male', 'female'] as const).map((g) => (
                                    <button
                                        key={g}
                                        className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setGender(g)}
                                        style={{ flex: 1 }}
                                    >
                                        {g === 'male' ? '🧙‍♂️' : '🧙‍♀️'} {LABELS[g][loc]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 질문 입력 */}
                        <div className="form-group">
                            <label>{LABELS.question[loc]}</label>
                            <textarea
                                className="input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={LABELS.questionPh[loc]}
                                rows={2}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                </div>

                {/* 별자리 감지 결과 카드 */}
                {/* 별자리 감지 결과 */}
                {activeSign && (
                    <div className="zodiac-result-card" style={{ marginTop: 'var(--space-6)' }}>
                        <div className="zodiac-detected">
                            <div className="zodiac-detected-symbol" style={{
                                background: `linear-gradient(135deg, ${ELEMENT_COLORS[activeSign.element]}, rgba(138,100,255,0.8))`,
                            }}>
                                {activeSign.symbol}
                            </div>
                            <div className="zodiac-detected-info">
                                <div className="zodiac-detected-label">{LABELS.yourSign[loc]}</div>
                                <h2 className="zodiac-detected-name">{activeSign.names[loc]}</h2>
                                <div className="zodiac-detected-meta">
                                    <span>{ELEMENT_ICONS[activeSign.element]} {ELEMENT_NAMES[activeSign.element][loc]}</span>
                                    <span>📅 {formatDateRange(activeSign, loc)}</span>
                                </div>
                                <div className="zodiac-detected-traits">
                                    {LABELS.traits[loc]}: {activeSign.traits[loc]}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 띠 감지 결과 */}
                {activeAnimal && (
                    <div className="zodiac-result-card" style={{ marginTop: 'var(--space-4)' }}>
                        <div className="zodiac-detected">
                            <div className="zodiac-detected-symbol" style={{
                                background: `linear-gradient(135deg, ${CZ_ELEMENT_COLORS[activeAnimal.element]}, rgba(234,179,8,0.8))`,
                            }}>
                                {activeAnimal.emoji}
                            </div>
                            <div className="zodiac-detected-info">
                                <div className="zodiac-detected-label">{LABELS.yourAnimal[loc]}</div>
                                <h2 className="zodiac-detected-name">{activeAnimal.names[loc]}</h2>
                                <div className="zodiac-detected-meta">
                                    <span>{CZ_ELEMENT_ICONS[activeAnimal.element]} {activeAnimal.branch}</span>
                                    <span>📅 {activeAnimal.years.join(', ')}</span>
                                </div>
                                <div className="zodiac-detected-traits">
                                    {LABELS.traits[loc]}: {activeAnimal.traits[loc]}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 분석 버튼 */}
                {(activeSign || activeAnimal) && (
                    <button
                        className="btn btn-primary btn-lg"
                        style={{ marginTop: 'var(--space-4)', width: '100%' }}
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? '⏳...' : LABELS.analyze[loc]}
                    </button>
                )}

                {/* AI 결과 패널 (기존 컴포넌트 재사용 → 광고 자동 포함) */}
                <FortuneResultPanel
                    system="astrology"
                    result={result}
                    loading={loading}
                    error={error}
                    errorCode={errorCode}
                    gender={gender}
                    locale={loc}
                    onRetry={handleAnalyze}
                />

                {/* 12별자리 선택 그리드 */}
                <div style={{ marginTop: 'var(--space-10)' }}>
                    <h2 className="text-center" style={{
                        fontSize: 'var(--text-2xl)', fontWeight: 700,
                        marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)',
                    }}>
                        {LABELS.selectSign[loc]}
                    </h2>
                    <div className="zodiac-grid">
                        {ZODIAC_SIGNS.map((sign) => (
                            <button
                                key={sign.id}
                                className={`zodiac-card ${activeSign?.id === sign.id ? 'zodiac-card--active' : ''}`}
                                onClick={() => handleSelectSign(sign)}
                            >
                                <div className="zodiac-card-symbol" style={{
                                    color: ELEMENT_COLORS[sign.element],
                                }}>
                                    {sign.symbol}
                                </div>
                                <div className="zodiac-card-name">{sign.names[loc]}</div>
                                <div className="zodiac-card-dates">{formatDateRange(sign, loc)}</div>
                                <div className="zodiac-card-element">
                                    {ELEMENT_ICONS[sign.element]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 12띠 선택 그리드 */}
                <div style={{ marginTop: 'var(--space-10)' }}>
                    <h2 className="text-center" style={{
                        fontSize: 'var(--text-2xl)', fontWeight: 700,
                        marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)',
                    }}>
                        {LABELS.selectAnimal[loc]}
                    </h2>
                    <div className="zodiac-grid">
                        {CHINESE_ZODIAC_ANIMALS.map((animal) => (
                            <button
                                key={animal.id}
                                className={`zodiac-card ${activeAnimal?.id === animal.id ? 'zodiac-card--active' : ''}`}
                                onClick={() => handleSelectAnimal(animal)}
                            >
                                <div className="zodiac-card-symbol" style={{
                                    color: CZ_ELEMENT_COLORS[animal.element],
                                }}>
                                    {animal.emoji}
                                </div>
                                <div className="zodiac-card-name">{animal.names[loc]}</div>
                                <div className="zodiac-card-dates">{animal.years.slice(-3).join(', ')}</div>
                                <div className="zodiac-card-element">
                                    {CZ_ELEMENT_ICONS[animal.element]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .zodiac-result-card {
                    background: var(--color-bg-glass);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--color-border-glow);
                    border-radius: var(--radius-xl);
                    padding: var(--space-8);
                    box-shadow: var(--shadow-glow);
                    animation: fadeIn 0.5s ease;
                }
                .zodiac-detected {
                    display: flex;
                    align-items: center;
                    gap: var(--space-6);
                }
                .zodiac-detected-symbol {
                    width: 100px;
                    height: 100px;
                    border-radius: var(--radius-2xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    flex-shrink: 0;
                    box-shadow: 0 0 30px rgba(138, 100, 255, 0.3);
                }
                .zodiac-detected-info {
                    flex: 1;
                }
                .zodiac-detected-label {
                    font-size: var(--text-xs);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--color-accent-primary);
                    font-weight: 600;
                }
                .zodiac-detected-name {
                    font-size: var(--text-3xl);
                    font-weight: 800;
                    margin: var(--space-1) 0 var(--space-2);
                    background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .zodiac-detected-meta {
                    display: flex;
                    gap: var(--space-4);
                    font-size: var(--text-sm);
                    color: var(--color-text-secondary);
                    margin-bottom: var(--space-2);
                }
                .zodiac-detected-traits {
                    font-size: var(--text-sm);
                    color: var(--color-text-muted);
                    font-style: italic;
                }
                .zodiac-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-3);
                }
                .zodiac-card {
                    background: var(--color-bg-glass);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    text-align: center;
                    cursor: pointer;
                    transition: all var(--transition-base);
                    position: relative;
                    overflow: hidden;
                }
                .zodiac-card:hover {
                    border-color: var(--color-border-glow);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow);
                }
                .zodiac-card--active {
                    border-color: var(--color-accent-primary);
                    background: rgba(138, 100, 255, 0.1);
                    box-shadow: var(--shadow-glow-strong);
                }
                .zodiac-card-symbol {
                    font-size: var(--text-3xl);
                    margin-bottom: var(--space-2);
                }
                .zodiac-card-name {
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin-bottom: var(--space-1);
                }
                .zodiac-card-dates {
                    font-size: 11px;
                    color: var(--color-text-muted);
                }
                .zodiac-card-element {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    font-size: 12px;
                    opacity: 0.6;
                }
                @media (max-width: 768px) {
                    .zodiac-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .zodiac-detected {
                        flex-direction: column;
                        text-align: center;
                    }
                    .zodiac-detected-meta {
                        justify-content: center;
                    }
                }
                @media (max-width: 480px) {
                    .zodiac-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </section>
    );
}
