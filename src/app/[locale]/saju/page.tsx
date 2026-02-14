'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function SajuPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [isLunar, setIsLunar] = useState(false);

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '사주팔자 분석', ja: '四柱推命分析', en: 'Four Pillars of Destiny', zh: '四柱八字分析' },
        subtitle: { ko: '사주명리학 기반 정밀 분석 — 절기 기준 월주 결정', ja: '四柱推命学に基づく精密分析', en: 'Traditional Saju analysis with solar-term boundaries', zh: '基于四柱命理学的精确分析' },
        date: { ko: '생년월일', ja: '生年月日', en: 'Date of Birth', zh: '出生日期' },
        time: { ko: '출생 시간', ja: '出生時刻', en: 'Time of Birth', zh: '出生时间' },
        lunar: { ko: '음력으로 입력', ja: '旧暦で入力', en: 'Enter in Lunar Calendar', zh: '农历输入' },
        analyze: { ko: '분석하기', ja: '分析する', en: 'Analyze', zh: '分析' },
    };

    const pillarLabels: Record<string, Record<string, string>> = {
        year: { ko: '년주', ja: '年柱', en: 'Year', zh: '年柱' },
        month: { ko: '월주', ja: '月柱', en: 'Month', zh: '月柱' },
        day: { ko: '일주', ja: '日柱', en: 'Day', zh: '日柱' },
        hour: { ko: '시주', ja: '時柱', en: 'Hour', zh: '時柱' },
        stem: { ko: '천간', ja: '天干', en: 'Stem', zh: '天干' },
        branch: { ko: '지지', ja: '地支', en: 'Branch', zh: '地支' },
    };

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={isLunar} onChange={(e) => setIsLunar(e.target.checked)} style={{ accentColor: 'var(--color-accent-primary)' }} />
                                <span style={{ fontSize: 'var(--text-sm)' }}>{labels.lunar[loc]}</span>
                            </label>
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-4)' }}>
                            {labels.analyze[loc]}
                        </button>
                    </div>
                </div>

                {/* 사주팔자 표시 */}
                <div className="glass-card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-8)' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontWeight: 700 }}>
                        {loc === 'ko' ? '사주팔자' : loc === 'ja' ? '四柱八字' : 'Four Pillars'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', textAlign: 'center' }}>
                        {(['hour', 'day', 'month', 'year'] as const).map((pillar) => (
                            <div key={pillar} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                    {pillarLabels[pillar][loc]}
                                </span>
                                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-accent-primary)' }}>—</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{pillarLabels.stem[loc]}</div>
                                </div>
                                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-accent-rose)' }}>—</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{pillarLabels.branch[loc]}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        {loc === 'ko' ? '출생 정보를 입력하면 사주팔자가 표시됩니다' : 'Enter birth data to reveal your Four Pillars'}
                    </p>
                </div>

                {/* 오행 분포 */}
                <div className="glass-card" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-4)', fontWeight: 700 }}>
                        {loc === 'ko' ? '오행 분포' : loc === 'ja' ? '五行分布' : 'Five Elements'}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {[
                            { name: { ko: '목(木)', ja: '木', en: 'Wood' }, color: 'var(--element-wood)', icon: '🌳' },
                            { name: { ko: '화(火)', ja: '火', en: 'Fire' }, color: 'var(--element-fire)', icon: '🔥' },
                            { name: { ko: '토(土)', ja: '土', en: 'Earth' }, color: 'var(--element-earth)', icon: '⛰️' },
                            { name: { ko: '금(金)', ja: '金', en: 'Metal' }, color: 'var(--element-metal)', icon: '⚔️' },
                            { name: { ko: '수(水)', ja: '水', en: 'Water' }, color: 'var(--element-water)', icon: '💧' },
                        ].map((el) => (
                            <div key={el.name.en} style={{ textAlign: 'center', minWidth: '60px' }}>
                                <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>{el.icon}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: el.color, fontWeight: 600 }}>
                                    {el.name[loc as 'ko' | 'ja' | 'en'] || el.name.en}
                                </div>
                                <div style={{ width: '40px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: 'var(--space-1) auto 0' }}>
                                    <div style={{ width: '0%', height: '100%', background: el.color, borderRadius: '2px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
