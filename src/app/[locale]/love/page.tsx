'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';

/* ---------- Inline localized labels ---------- */
const L: Record<string, Record<string, string>> = {
    title: { ko: '연애 운세', ja: '恋愛占い', en: 'Love Fortune', zh: '恋爱运势' },
    subtitle: {
        ko: '나의 연애운을 확인하거나, 두 사람의 궁합을 분석해보세요',
        ja: '自分の恋愛運を確認したり、二人の相性を分析しましょう',
        en: 'Check your love fortune or analyze compatibility between two people',
        zh: '查看您的恋爱运势，或分析两人之间的缘分',
    },
    modeA: { ko: '💖 나의 연애운', ja: '💖 私の恋愛運', en: '💖 My Love Fortune', zh: '💖 我的恋爱运' },
    modeB: { ko: '💕 궁합 분석', ja: '💕 相性分析', en: '💕 Compatibility', zh: '💕 缘分分析' },
    name: { ko: '이름 (선택)', ja: '名前（任意）', en: 'Name (optional)', zh: '姓名（可选）' },
    namePh: { ko: '이름을 입력하세요', ja: '名前を入力', en: 'Enter your name', zh: '请输入姓名' },
    personA: { ko: '첫 번째 사람', ja: '一人目', en: 'Person A', zh: '第一个人' },
    personB: { ko: '두 번째 사람', ja: '二人目', en: 'Person B', zh: '第二个人' },
    nameAPh: { ko: '이름을 입력하세요', ja: '名前を入力', en: 'Enter name', zh: '输入姓名' },
    nameBPh: { ko: '이름을 입력하세요', ja: '名前を入力', en: 'Enter name', zh: '输入姓名' },
    relationship: { ko: '관계 상태', ja: '関係の状態', en: 'Relationship Status', zh: '关系状态' },
    relOptions: {
        ko: '썸|연인|부부|짝사랑|재회 희망|기타',
        ja: 'いい感じ|恋人|夫婦|片思い|復縁希望|その他',
        en: 'Flirting|Dating|Married|Crush|Hoping to Reconnect|Other',
        zh: '暧昧|恋人|夫妻|暗恋|想复合|其他',
    },
    context: { ko: '상황 설명 (선택)', ja: '状況説明（任意）', en: 'Context (optional)', zh: '背景说明（可选）' },
    contextPhA: {
        ko: '현재 연애 상황이나 고민을 적어주세요...',
        ja: '現在の恋愛状況や悩みを書いてください...',
        en: 'Describe your current love situation or concerns...',
        zh: '请描述您当前的恋爱状况或困惑...',
    },
    contextPhB: {
        ko: '두 사람의 관계나 상황을 적어주세요...',
        ja: '二人の関係や状況を書いてください...',
        en: 'Describe the relationship or situation between the two...',
        zh: '请描述两人的关系或情况...',
    },
    gender: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
    male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
    female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
    analyzeA: { ko: '✦ 연애운 분석', ja: '✦ 恋愛運分析', en: '✦ Analyze Love Fortune', zh: '✦ 分析恋爱运' },
    analyzeB: { ko: '✦ 궁합 분석', ja: '✦ 相性分析', en: '✦ Analyze Compatibility', zh: '✦ 分析缘分' },
    disclaimer: {
        ko: '⚠️ 본 서비스는 오락 목적이며 전문 상담을 대체하지 않습니다.',
        ja: '⚠️ 本サービスは娯楽目的であり、専門的なカウンセリングに代わるものではありません。',
        en: '⚠️ This is for entertainment only, not a substitute for professional counseling.',
        zh: '⚠️ 本服务仅供娱乐，不能替代专业咨询。',
    },
};

const REL_KEYS = ['flirting', 'dating', 'married', 'crush', 'reconnect', 'other'];

export default function LovePage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [mode, setMode] = useState<'love' | 'compatibility'>('love');
    const [gender, setGender] = useState<'male' | 'female'>('female');

    // Mode A fields
    const [name, setName] = useState('');
    const [contextA, setContextA] = useState('');

    // Mode B fields
    const [nameA, setNameA] = useState('');
    const [nameB, setNameB] = useState('');
    const [relationship, setRelationship] = useState('flirting');
    const [contextB, setContextB] = useState('');

    const { result, loading, error, errorCode, interpret, reset } = useInterpret();

    const relLabels = L.relOptions[loc]?.split('|') || L.relOptions.en.split('|');

    const handleAnalyze = () => {
        if (mode === 'love') {
            // Mode A: My Love Fortune
            const parts: string[] = [];
            if (name.trim()) parts.push(
                loc === 'ko' ? `이름: ${name}` :
                    loc === 'ja' ? `名前: ${name}` :
                        loc === 'zh' ? `姓名: ${name}` :
                            `Name: ${name}`
            );
            if (contextA.trim()) parts.push(contextA);
            parts.push(
                loc === 'ko' ? '현재 매력 포인트, 연애 운세, 관계 조언을 분석해주세요.' :
                    loc === 'ja' ? '現在の魅力ポイント、恋愛運、関係アドバイスを分析してください。' :
                        loc === 'zh' ? '请分析当前魅力要点、恋爱运势和关系建议。' :
                            'Analyze current charm points, love fortune, and relationship advice.'
            );

            interpret({
                system: 'love',
                locale: loc,
                question: parts.join('\n'),
                gender,
            });
        } else {
            // Mode B: Compatibility
            const parts: string[] = [];
            const relIdx = REL_KEYS.indexOf(relationship);
            const relLabel = relLabels[relIdx] || relationship;

            if (nameA.trim()) parts.push(
                loc === 'ko' ? `첫 번째 사람: ${nameA}` :
                    loc === 'ja' ? `一人目: ${nameA}` :
                        loc === 'zh' ? `第一个人: ${nameA}` :
                            `Person A: ${nameA}`
            );
            if (nameB.trim()) parts.push(
                loc === 'ko' ? `두 번째 사람: ${nameB}` :
                    loc === 'ja' ? `二人目: ${nameB}` :
                        loc === 'zh' ? `第二个人: ${nameB}` :
                            `Person B: ${nameB}`
            );
            parts.push(
                loc === 'ko' ? `관계 상태: ${relLabel}` :
                    loc === 'ja' ? `関係: ${relLabel}` :
                        loc === 'zh' ? `关系状态: ${relLabel}` :
                            `Relationship: ${relLabel}`
            );
            if (contextB.trim()) parts.push(contextB);
            parts.push(
                loc === 'ko' ? '두 사람의 매력 분석, 관계 조언, 궁합 점수와 분석을 해주세요.' :
                    loc === 'ja' ? '二人の魅力分析、関係アドバイス、相性スコアと分析をお願いします。' :
                        loc === 'zh' ? '请分析两人的魅力、关系建议、缘分指数和详细分析。' :
                            'Analyze charm points for both, relationship advice, and compatibility score with detailed analysis.'
            );

            interpret({
                system: 'compatibility',
                locale: loc,
                question: parts.join('\n'),
                gender,
            });
        }
    };

    const handleModeSwitch = (newMode: 'love' | 'compatibility') => {
        if (newMode !== mode) {
            setMode(newMode);
            reset();
        }
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">💝 {L.title[loc]}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {L.subtitle[loc]}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)',
                    background: 'var(--color-bg-glass)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-1)',
                }}>
                    <button
                        className={`btn ${mode === 'love' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleModeSwitch('love')}
                        style={{ flex: 1 }}
                    >
                        {L.modeA[loc]}
                    </button>
                    <button
                        className={`btn ${mode === 'compatibility' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleModeSwitch('compatibility')}
                        style={{ flex: 1 }}
                    >
                        {L.modeB[loc]}
                    </button>
                </div>

                {/* Input Form */}
                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>

                        {mode === 'love' ? (
                            <>
                                {/* Mode A: My Love Fortune */}
                                <div className="form-group">
                                    <label>{L.name[loc]}</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={L.namePh[loc]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{L.context[loc]}</label>
                                    <textarea
                                        className="input"
                                        value={contextA}
                                        onChange={(e) => setContextA(e.target.value)}
                                        placeholder={L.contextPhA[loc]}
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Mode B: Compatibility */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label>{L.personA[loc]}</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={nameA}
                                            onChange={(e) => setNameA(e.target.value)}
                                            placeholder={L.nameAPh[loc]}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{L.personB[loc]}</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={nameB}
                                            onChange={(e) => setNameB(e.target.value)}
                                            placeholder={L.nameBPh[loc]}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{L.relationship[loc]}</label>
                                    <select
                                        className="input"
                                        value={relationship}
                                        onChange={(e) => setRelationship(e.target.value)}
                                    >
                                        {REL_KEYS.map((key, i) => (
                                            <option key={key} value={key}>
                                                {relLabels[i]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{L.context[loc]}</label>
                                    <textarea
                                        className="input"
                                        value={contextB}
                                        onChange={(e) => setContextB(e.target.value)}
                                        placeholder={L.contextPhB[loc]}
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </>
                        )}

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
                            {loading ? '⏳...' : (mode === 'love' ? L.analyzeA[loc] : L.analyzeB[loc])}
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
                    system={mode === 'love' ? 'love' : 'compatibility'}
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
