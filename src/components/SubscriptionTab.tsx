'use client';

/* ===========================
   구독 상태 탭 — 실시간 데이터
   =========================== */

import { useState, useEffect } from 'react';
import { User, getIdToken } from 'firebase/auth';

interface UsageData {
    tier: string;
    effectiveTier: string;
    dailyLimit: number;
    usedToday: number;
    remaining: number;
    renewalAt: string | null;
    credits: Record<string, number>;
}

interface Props {
    user: User;
    locale: string;
}

const TIER_LABELS: Record<string, Record<string, string>> = {
    free: { ko: '무료 (견습 점술사)', ja: '無料（見習い占い師）', en: 'Free (Apprentice)', zh: '免费（学徒）' },
    plus: { ko: 'PLUS (술사)', ja: 'PLUS（術師）', en: 'PLUS (Seer)', zh: 'PLUS（术师）' },
    pro: { ko: 'PRO (대술사)', ja: 'PRO（大術師）', en: 'PRO (Grand Seer)', zh: 'PRO（大术师）' },
    archmage: { ko: 'ARCHMAGE (아크메이지)', ja: 'ARCHMAGE（大魔術師）', en: 'ARCHMAGE', zh: 'ARCHMAGE（大法师）' },
};

const TIER_COLORS: Record<string, string> = {
    free: 'var(--color-text-secondary)',
    plus: '#60a5fa',
    pro: '#a78bfa',
    archmage: 'var(--color-accent-gold)',
};

export default function SubscriptionTab({ user, locale }: Props) {
    type Locale4 = 'ko' | 'ja' | 'en' | 'zh';
    const loc: Locale4 = (['ko', 'ja', 'en', 'zh'].includes(locale) ? locale : 'en') as Locale4;
    const [data, setData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getIdToken(user);
                if (!token) return;
                const res = await fetch('/api/me/usage', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setData(await res.json());
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const row = (label: string, value: string, accent?: string) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: accent || 'var(--color-text-primary)' }}>{value}</span>
        </div>
    );

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>⏳</div>;
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
            {loc === 'ko' ? '불러오기 실패' : loc === 'ja' ? '読み込み失敗' : 'Failed to load'}
        </div>;
    }

    const tierLabel = (t: string) => TIER_LABELS[t]?.[loc] ?? t.toUpperCase();
    const tierColor = (t: string) => TIER_COLORS[t] ?? 'var(--color-text-primary)';

    const usedDisplay = data.dailyLimit === -1
        ? `${data.usedToday} / ∞`
        : `${data.usedToday} / ${data.dailyLimit}`;

    // 보너스 크레딧 표시 (plus/pro/archmage)
    const bonusEntries = (['archmage', 'pro', 'plus'] as const).filter(t => data.credits[t] > 0);

    const labels = {
        currentTier: { ko: '현재 등급', ja: '現在のランク', en: 'Current Tier', zh: '当前等级' },
        nextTier: { ko: '다음 질문 등급', ja: '次の質問ランク', en: 'Next Question Tier', zh: '下次提问等级' },
        todayUsage: { ko: '오늘 사용량', ja: '今日の使用量', en: "Today's Usage", zh: '今日用量' },
        dailyLimit: { ko: '일일 한도', ja: '日次リミット', en: 'Daily Limit', zh: '每日限额' },
        renewal: { ko: '갱신 예정일', ja: '更新予定日', en: 'Renewal Date', zh: '续费日期' },
        bonus: { ko: '보너스 크레딧', ja: 'ボーナスクレジット', en: 'Bonus Credits', zh: '奖励积分' },
        upgrade: { ko: '등급 업그레이드', ja: 'ランクアップ', en: 'Upgrade', zh: '升级' },
        unlimited: { ko: '무제한', ja: '無制限', en: 'Unlimited', zh: '无限制' },
    };
    const l = (k: keyof typeof labels) => labels[k][loc] || labels[k]['en'];

    return (
        <div style={{ display: 'grid', gap: '4px' }}>
            {row(l('currentTier'), tierLabel(data.tier), tierColor(data.tier))}

            {/* 다음 질문에 적용될 실제 티어 */}
            {data.effectiveTier !== data.tier && row(
                l('nextTier'),
                `✨ ${tierLabel(data.effectiveTier)}`,
                tierColor(data.effectiveTier)
            )}

            {row(l('todayUsage'), usedDisplay)}
            {row(l('dailyLimit'), data.dailyLimit === -1 ? l('unlimited') : `${data.dailyLimit} ${loc === 'ko' ? '질문' : 'Q'}`)}
            {row(l('renewal'), data.renewalAt ?? '-')}

            {/* 보너스 크레딧 잔여량 */}
            {bonusEntries.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(138,100,255,0.08)', borderRadius: '10px', border: '1px solid rgba(138,100,255,0.2)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎁 {l('bonus')}
                    </div>
                    {bonusEntries.map(t => (
                        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: 'var(--text-sm)', color: tierColor(t), fontWeight: 600 }}>{tierLabel(t)}</span>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>×{data.credits[t]}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a href={`/${locale}/pricing`} className="btn btn-gold">
                    ⬆ {l('upgrade')}
                </a>
            </div>
        </div>
    );
}
