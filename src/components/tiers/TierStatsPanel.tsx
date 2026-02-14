'use client';

import { TIER_STATS, STAT_LABELS, STAT_ICONS, TIER_COLORS, TIER_AURA, TIER_NAMES, type TierStats } from '@/lib/tiers';

interface TierStatsPanelProps {
    tierId: string;
    locale: string;
}

export default function TierStatsPanel({ tierId, locale }: TierStatsPanelProps) {
    const stats = TIER_STATS[tierId];
    const color = TIER_COLORS[tierId];
    const aura = TIER_AURA[tierId];
    const loc = locale || 'ko';

    if (!stats) return null;

    const statKeys: (keyof Omit<TierStats, 'id'>)[] = ['depth', 'synthesis', 'foresight', 'aiPower'];

    const skillLabels: Record<string, Record<string, string>> = {
        skill1: { ko: '기본 리딩', ja: '基本リーディング', en: 'Basic Reading', zh: '基础解读' },
        skill2: { ko: '심층 분석', ja: '深層分析', en: 'Deep Analysis', zh: '深度分析' },
        skill3: { ko: '종합 해석', ja: '総合解釈', en: 'Synthesis', zh: '综合解读' },
        skill4: { ko: '이중 추론', ja: '二重推論', en: 'Dual Reasoning', zh: '双重推理' },
        skill5: { ko: '연간 예측', ja: '年間予測', en: 'Annual Forecast', zh: '年度预测' },
    };

    const skills = [
        { key: 'skill1', icon: '📖', unlockAt: 0 },
        { key: 'skill2', icon: '🔍', unlockAt: 1 },
        { key: 'skill3', icon: '🌀', unlockAt: 2 },
        { key: 'skill4', icon: '🧠', unlockAt: 3 },
        { key: 'skill5', icon: '📅', unlockAt: 3 },
    ];

    const tierLevel = ['free', 'plus', 'pro', 'archmage'].indexOf(tierId);

    return (
        <div style={{
            background: `linear-gradient(135deg, rgba(15,15,25,0.95), rgba(25,20,40,0.95))`,
            border: `1px solid ${color}40`,
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* 오라 배경 */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 0%, ${aura}, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* 티어 뱃지 + 레벨 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                        }}>
                            {tierId.toUpperCase()}
                        </span>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                            {TIER_NAMES[tierId]?.[loc] || tierId}
                        </h3>
                    </div>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color}40, ${color}15)`,
                        border: `2px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: color,
                    }}>
                        Lv.{tierLevel + 1}
                    </div>
                </div>

                {/* 스탯 바 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {statKeys.map((key) => {
                        const value = stats[key];
                        const maxValue = 5;
                        const pct = (value / maxValue) * 100;

                        return (
                            <div key={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {STAT_ICONS[key]} {STAT_LABELS[key]?.[loc] || key}
                                    </span>
                                    <span style={{ fontSize: '11px', color: color, fontWeight: 700 }}>
                                        Lv.{value}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    borderRadius: '3px',
                                    background: 'rgba(255,255,255,0.08)',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        borderRadius: '3px',
                                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 스킬 슬롯 */}
                <div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {loc === 'ko' ? '스킬' : loc === 'ja' ? 'スキル' : loc === 'zh' ? '技能' : 'Skills'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {skills.map((skill) => {
                            const unlocked = tierLevel >= skill.unlockAt;
                            return (
                                <div
                                    key={skill.key}
                                    title={skillLabels[skill.key]?.[loc]}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '10px',
                                        background: unlocked ? `${color}15` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${unlocked ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        opacity: unlocked ? 1 : 0.4,
                                        cursor: 'default',
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{skill.icon}</span>
                                    {!unlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '10px',
                                            background: 'rgba(0,0,0,0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '16px',
                                        }}>
                                            🔒
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes statBarFill {
                    from { width: 0%; }
                }
            `}</style>
        </div>
    );
}
