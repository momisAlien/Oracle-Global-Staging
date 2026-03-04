'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';

/* ---------- Zodiac signs for optional selector ---------- */
const ZODIAC_OPTIONS = [
    { id: 'aries', emoji: '♈', names: { ko: '양자리', ja: '牡羊座', en: 'Aries', zh: '白羊座' } },
    { id: 'taurus', emoji: '♉', names: { ko: '황소자리', ja: '牡牛座', en: 'Taurus', zh: '金牛座' } },
    { id: 'gemini', emoji: '♊', names: { ko: '쌍둥이자리', ja: '双子座', en: 'Gemini', zh: '双子座' } },
    { id: 'cancer', emoji: '♋', names: { ko: '게자리', ja: '蟹座', en: 'Cancer', zh: '巨蟹座' } },
    { id: 'leo', emoji: '♌', names: { ko: '사자자리', ja: '獅子座', en: 'Leo', zh: '狮子座' } },
    { id: 'virgo', emoji: '♍', names: { ko: '처녀자리', ja: '乙女座', en: 'Virgo', zh: '处女座' } },
    { id: 'libra', emoji: '♎', names: { ko: '천칭자리', ja: '天秤座', en: 'Libra', zh: '天秤座' } },
    { id: 'scorpio', emoji: '♏', names: { ko: '전갈자리', ja: '蠍座', en: 'Scorpio', zh: '天蝎座' } },
    { id: 'sagittarius', emoji: '♐', names: { ko: '궁수자리', ja: '射手座', en: 'Sagittarius', zh: '射手座' } },
    { id: 'capricorn', emoji: '♑', names: { ko: '염소자리', ja: '山羊座', en: 'Capricorn', zh: '摩羯座' } },
    { id: 'aquarius', emoji: '♒', names: { ko: '물병자리', ja: '水瓶座', en: 'Aquarius', zh: '水瓶座' } },
    { id: 'pisces', emoji: '♓', names: { ko: '물고기자리', ja: '魚座', en: 'Pisces', zh: '双鱼座' } },
];

/* ---------- Inline localized labels ---------- */
const L: Record<string, Record<string, string>> = {
    title: { ko: '오늘의 운세 리포트', ja: '今日の運勢レポート', en: "Today's Fortune Report", zh: '今日运势报告' },
    subtitle: {
        ko: '오늘 하루의 종합운, 재물운, 연애운, 건강운을 AI가 분석합니다',
        ja: '今日一日の総合運・金運・恋愛運・健康運をAIが分析します',
        en: 'AI analyzes your overall, money, love & health fortune for today',
        zh: 'AI为您分析今天的综合运、财运、恋爱运、健康运',
    },
    focusLabel: { ko: '오늘 집중하고 싶은 점 (선택)', ja: '今日集中したいこと（任意）', en: 'Focus for today (optional)', zh: '今天想关注的事情（可选）' },
    focusPh: {
        ko: '예: 중요한 면접이 있어요, 재물운이 궁금합니다...',
        ja: '例：大事な面接があります、金運が気になります...',
        en: 'e.g. I have an important interview, curious about money fortune...',
        zh: '例：我有一个重要的面试，想了解财运...',
    },
    zodiacLabel: { ko: '별자리 (선택)', ja: '星座（任意）', en: 'Zodiac Sign (optional)', zh: '星座（可选）' },
    zodiacNone: { ko: '선택 안 함', ja: '選択しない', en: 'No selection', zh: '不选择' },
    gender: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
    male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
    female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
    analyze: { ko: '✦ 오늘의 운세 분석', ja: '✦ 今日の運勢分析', en: "✦ Analyze Today's Fortune", zh: '✦ 分析今日运势' },
    disclaimer: {
        ko: '⚠️ 본 서비스는 오락 목적이며 의료·법률·금융 조언이 아닙니다.',
        ja: '⚠️ 本サービスは娯楽目的であり、医療・法律・金融の助言ではありません。',
        en: '⚠️ This is for entertainment only, not medical, legal, or financial advice.',
        zh: '⚠️ 本服务仅供娱乐，不构成医疗、法律或财务建议。',
    },
};

export default function TodayReportPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [focus, setFocus] = useState('');
    const [zodiac, setZodiac] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const { result, loading, error, errorCode, interpret } = useInterpret();

    const handleAnalyze = () => {
        const today = new Date().toLocaleDateString(
            loc === 'ko' ? 'ko-KR' : loc === 'ja' ? 'ja-JP' : loc === 'zh' ? 'zh-CN' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        );
        const todayISO = new Date().toISOString().split('T')[0];

        const parts: string[] = [];
        parts.push(
            loc === 'ko' ? `오늘 날짜: ${today}` :
                loc === 'ja' ? `今日の日付: ${today}` :
                    loc === 'zh' ? `今天日期: ${today}` :
                        `Today's date: ${today}`
        );

        if (zodiac) {
            const sign = ZODIAC_OPTIONS.find((z) => z.id === zodiac);
            if (sign) {
                parts.push(
                    loc === 'ko' ? `별자리: ${sign.names.ko}` :
                        loc === 'ja' ? `星座: ${sign.names.ja}` :
                            loc === 'zh' ? `星座: ${sign.names.zh}` :
                                `Zodiac sign: ${sign.names.en}`
                );
            }
        }

        if (focus.trim()) {
            parts.push(
                loc === 'ko' ? `오늘 집중 사항: ${focus}` :
                    loc === 'ja' ? `今日の関心事: ${focus}` :
                        loc === 'zh' ? `今天关注: ${focus}` :
                            `Today's focus: ${focus}`
            );
        }

        parts.push(
            loc === 'ko' ? '종합운, 재물운, 연애운, 건강운을 각각 분석해주세요. 각 섹션에 실천 가능한 팁을 포함하세요.' :
                loc === 'ja' ? '総合運・金運・恋愛運・健康運をそれぞれ分析してください。各セクションに実践的なヒントを含めてください。' :
                    loc === 'zh' ? '请分别分析综合运、财运、恋爱运、健康运。每个部分都要包含实际可行的建议。' :
                        'Please analyze overall, money, love, and health fortune separately. Include a practical action tip in each section.'
        );

        interpret({
            system: 'today-report',
            locale: loc,
            question: parts.join('\n'),
            birthDate: todayISO,
            gender,
        });
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">📋 {L.title[loc]}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {L.subtitle[loc]}
                    </p>
                </div>

                {/* Input Form */}
                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        {/* Focus */}
                        <div className="form-group">
                            <label>{L.focusLabel[loc]}</label>
                            <textarea
                                className="input"
                                value={focus}
                                onChange={(e) => setFocus(e.target.value)}
                                placeholder={L.focusPh[loc]}
                                rows={2}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Zodiac selector */}
                        <div className="form-group">
                            <label>{L.zodiacLabel[loc]}</label>
                            <select
                                className="input"
                                value={zodiac}
                                onChange={(e) => setZodiac(e.target.value)}
                            >
                                <option value="">{L.zodiacNone[loc]}</option>
                                {ZODIAC_OPTIONS.map((z) => (
                                    <option key={z.id} value={z.id}>
                                        {z.emoji} {z.names[loc as keyof typeof z.names] || z.names.en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Gender */}
                        <div className="form-group">
                            <label>{L.gender[loc]}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {(['male', 'female'] as const).map((g) => (
                                    <button
                                        key={g}
                                        className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setGender(g)}
                                        style={{ flex: 1 }}
                                    >
                                        {g === 'male' ? '🧙‍♂️' : '🧙‍♀️'} {L[g][loc]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analyze button */}
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 'var(--space-2)' }}
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? '⏳...' : L.analyze[loc]}
                        </button>
                    </div>
                </div>

                {/* Disclaimer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-4)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)',
                }}>
                    {L.disclaimer[loc]}
                </div>

                {/* Result */}
                <FortuneResultPanel
                    system="today-report"
                    result={result}
                    loading={loading}
                    error={error}
                    errorCode={errorCode}
                    gender={gender}
                    locale={loc}
                    onRetry={handleAnalyze}
                />
            </div>
        </section>
    );
}
