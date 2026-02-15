'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';
import { calculateSaju } from '@/lib/saju/calculator';

export default function SajuPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [isLunar, setIsLunar] = useState(false);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [question, setQuestion] = useState('');
    const [showChart, setShowChart] = useState(false);
    const { result, loading, error, interpret, reset } = useInterpret();

    // 출생 정보 입력 시 실시간 사주 계산
    const sajuResult = useMemo(() => {
        return calculateSaju(birthDate, birthTime || undefined);
    }, [birthDate, birthTime]);

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '사주팔자 분석', ja: '四柱推命分析', en: 'Four Pillars of Destiny', zh: '四柱八字分析' },
        subtitle: { ko: '사주명리학 기반 정밀 분석 — 절기 기준 월주 결정', ja: '四柱推命学に基づく精密分析', en: 'Traditional Saju analysis with solar-term boundaries', zh: '基于四柱命理学的精确分析' },
        date: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        time: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        lunar: { ko: '음력으로 입력', ja: '旧暦で入力', en: 'Enter in Lunar Calendar', zh: '农历输入' },
        analyze: { ko: '✦ AI 분석하기', ja: '✦ AI分析する', en: '✦ AI Analyze', zh: '✦ AI分析' },
        question: { ko: '궁금한 점 (선택)', ja: '質問（任意）', en: 'Your Question (optional)', zh: '您的问题（可选）' },
        questionPlaceholder: { ko: '올해의 운세가 궁금합니다...', ja: '今年の運勢が気になります...', en: "I'm curious about this year's fortune...", zh: '想知道今年的运势...' },
        genderLabel: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
        male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
        female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
        enterInfo: { ko: '출생 정보를 입력하면 사주팔자가 표시됩니다', ja: '出生情報を入力すると四柱八字が表示されます', en: 'Enter birth data to reveal your Four Pillars', zh: '输入出生信息以显示四柱八字' },
    };

    const pillarLabels: Record<string, Record<string, string>> = {
        year: { ko: '년주', ja: '年柱', en: 'Year', zh: '年柱' },
        month: { ko: '월주', ja: '月柱', en: 'Month', zh: '月柱' },
        day: { ko: '일주', ja: '日柱', en: 'Day', zh: '日柱' },
        hour: { ko: '시주', ja: '時柱', en: 'Hour', zh: '時柱' },
        stem: { ko: '천간', ja: '天干', en: 'Stem', zh: '天干' },
        branch: { ko: '지지', ja: '地支', en: 'Branch', zh: '地支' },
    };

    const handleAnalyze = () => {
        if (!birthDate) return;
        setShowChart(true);
        interpret({
            system: 'saju',
            locale: loc,
            question: question || (loc === 'ko' ? '전반적인 사주 분석을 해주세요' : 'Please provide a general Saju analysis'),
            birthDate,
            birthTime: birthTime || undefined,
            isLunar,
            gender,
        });
    };

    const pillarsOrder = ['hour', 'day', 'month', 'year'] as const;
    const elementsList = [
        { key: 'wood' as const, name: { ko: '목(木)', ja: '木', en: 'Wood', zh: '木' }, color: '#22c55e', icon: '🌳' },
        { key: 'fire' as const, name: { ko: '화(火)', ja: '火', en: 'Fire', zh: '火' }, color: '#ef4444', icon: '🔥' },
        { key: 'earth' as const, name: { ko: '토(土)', ja: '土', en: 'Earth', zh: '土' }, color: '#eab308', icon: '⛰️' },
        { key: 'metal' as const, name: { ko: '금(金)', ja: '金', en: 'Metal', zh: '金' }, color: '#94a3b8', icon: '⚔️' },
        { key: 'water' as const, name: { ko: '수(水)', ja: '水', en: 'Water', zh: '水' }, color: '#3b82f6', icon: '💧' },
    ];

    // 전체 8개 중 비율 계산
    const maxEl = sajuResult ? Math.max(...Object.values(sajuResult.elements), 1) : 1;

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">☯ {labels.title[loc]}</span>
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={isLunar} onChange={(e) => setIsLunar(e.target.checked)} style={{ accentColor: 'var(--color-accent-primary)' }} />
                                <span style={{ fontSize: 'var(--text-sm)' }}>{labels.lunar[loc]}</span>
                            </label>
                        </div>

                        {/* 질문 입력 */}
                        <div className="form-group">
                            <label>{labels.question[loc]}</label>
                            <textarea
                                className="input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={labels.questionPlaceholder[loc]}
                                rows={2}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 'var(--space-4)' }}
                            onClick={handleAnalyze}
                            disabled={!birthDate || loading}
                        >
                            {loading ? '⏳...' : labels.analyze[loc]}
                        </button>
                    </div>
                </div>

                {/* 사주팔자 표시 — AI 분석 클릭 후 표시 */}
                {showChart && sajuResult && (
                    <div className="glass-card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-8)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontWeight: 700, fontSize: 'var(--text-xl)' }}>
                            {loc === 'ko' ? '사주팔자' : loc === 'ja' ? '四柱八字' : loc === 'zh' ? '四柱八字' : 'Four Pillars'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', textAlign: 'center' }}>
                            {pillarsOrder.map((key) => {
                                const pillar = sajuResult ? sajuResult[key] : null;
                                return (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                            {pillarLabels[key][loc]}
                                        </span>
                                        {/* 천간 */}
                                        <div style={{
                                            background: 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-4)',
                                            border: pillar ? `2px solid ${pillar.stemColor}` : '1px solid var(--color-border)',
                                            transition: 'all 0.4s ease',
                                        }}>
                                            <div style={{
                                                fontSize: 'var(--text-3xl)',
                                                fontWeight: 800,
                                                color: pillar ? pillar.stemColor : 'var(--color-text-muted)',
                                                transition: 'color 0.4s ease',
                                            }}>
                                                {pillar ? `${pillar.stem}` : '—'}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--text-sm)',
                                                color: pillar ? pillar.stemColor : 'var(--color-text-muted)',
                                                fontWeight: 600, opacity: 0.8,
                                            }}>
                                                {pillar ? pillar.stemHanja : pillarLabels.stem[loc]}
                                            </div>
                                        </div>
                                        {/* 지지 */}
                                        <div style={{
                                            background: 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-4)',
                                            border: pillar ? `2px solid ${pillar.branchColor}` : '1px solid var(--color-border)',
                                            transition: 'all 0.4s ease',
                                        }}>
                                            <div style={{
                                                fontSize: 'var(--text-3xl)',
                                                fontWeight: 800,
                                                color: pillar ? pillar.branchColor : 'var(--color-text-muted)',
                                                transition: 'color 0.4s ease',
                                            }}>
                                                {pillar ? `${pillar.branch}` : '—'}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--text-sm)',
                                                color: pillar ? pillar.branchColor : 'var(--color-text-muted)',
                                                fontWeight: 600, opacity: 0.8,
                                            }}>
                                                {pillar ? pillar.branchHanja : pillarLabels.branch[loc]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 오행 분포 — AI 분석 클릭 후 표시 */}
                {showChart && sajuResult && (
                    <div className="glass-card" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontWeight: 700, fontSize: 'var(--text-xl)' }}>
                            {loc === 'ko' ? '오행 분포' : loc === 'ja' ? '五行分布' : loc === 'zh' ? '五行分布' : 'Five Elements'}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                            {elementsList.map((el) => {
                                const count = sajuResult ? sajuResult.elements[el.key] : 0;
                                const pct = sajuResult ? Math.round((count / maxEl) * 100) : 0;
                                return (
                                    <div key={el.key} style={{ textAlign: 'center', minWidth: '70px' }}>
                                        <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>{el.icon}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: el.color, fontWeight: 700 }}>
                                            {el.name[loc as keyof typeof el.name] || el.name.en}
                                        </div>
                                        {/* 분포 바 */}
                                        <div style={{
                                            width: '50px', height: '6px',
                                            background: 'var(--color-border)',
                                            borderRadius: '3px',
                                            margin: 'var(--space-1) auto 0',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: el.color,
                                                borderRadius: '3px',
                                                transition: 'width 0.6s ease',
                                            }} />
                                        </div>
                                        {sajuResult && (
                                            <div style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--color-text-muted)',
                                                marginTop: '2px',
                                                fontWeight: 600,
                                            }}>
                                                {count}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* AI 결과 패널 */}
                <FortuneResultPanel
                    system="saju"
                    result={result}
                    loading={loading}
                    error={error}
                    gender={gender}
                    locale={loc}
                    onRetry={() => handleAnalyze()}
                />
            </div>
        </section>
    );
}
