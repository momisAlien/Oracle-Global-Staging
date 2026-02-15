'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useInterpret } from '@/lib/hooks/useInterpret';
import FortuneResultPanel from '@/components/fortune/FortuneResultPanel';

const MAJOR_ARCANA = [
    { name: 'The Fool', number: 0 },
    { name: 'The Magician', number: 1 },
    { name: 'The High Priestess', number: 2 },
    { name: 'The Empress', number: 3 },
    { name: 'The Emperor', number: 4 },
    { name: 'The Hierophant', number: 5 },
    { name: 'The Lovers', number: 6 },
    { name: 'The Chariot', number: 7 },
    { name: 'Strength', number: 8 },
    { name: 'The Hermit', number: 9 },
    { name: 'Wheel of Fortune', number: 10 },
    { name: 'Justice', number: 11 },
    { name: 'The Hanged Man', number: 12 },
    { name: 'Death', number: 13 },
    { name: 'Temperance', number: 14 },
    { name: 'The Devil', number: 15 },
    { name: 'The Tower', number: 16 },
    { name: 'The Star', number: 17 },
    { name: 'The Moon', number: 18 },
    { name: 'The Sun', number: 19 },
    { name: 'Judgement', number: 20 },
    { name: 'The World', number: 21 },
];

const CARD_SETS = ['a', 'b', 'c'] as const;

export default function TarotPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [spreadType, setSpreadType] = useState<'one' | 'three'>('one');
    const [drawnCards, setDrawnCards] = useState<{ name: string; number: number; reversed: boolean }[]>([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [question, setQuestion] = useState('');
    const [allFlipped, setAllFlipped] = useState(false);
    const [cardSet, setCardSet] = useState<'a' | 'b' | 'c'>('a');
    const { result, loading, error, interpret } = useInterpret();

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '타로 카드', ja: 'タロットカード', en: 'Tarot Cards', zh: '塔罗牌' },
        subtitle: { ko: '직관의 안내를 받아보세요', ja: '直感の導きを受けましょう', en: 'Receive guidance from your intuition', zh: '接受直觉的指引' },
        oneCard: { ko: '1장 뽑기', ja: '1枚引き', en: 'One Card', zh: '单牌' },
        threeCard: { ko: '3장 스프레드', ja: '3枚スプレッド', en: 'Three Card', zh: '三牌' },
        shuffle: { ko: '셔플 & 뽑기', ja: 'シャッフル＆引く', en: 'Shuffle & Draw', zh: '洗牌和抽牌' },
        past: { ko: '과거', ja: '過去', en: 'Past', zh: '过去' },
        present: { ko: '현재', ja: '現在', en: 'Present', zh: '现在' },
        future: { ko: '미래', ja: '未来', en: 'Future', zh: '未来' },
        insight: { ko: '통찰', ja: '洞察', en: 'Insight', zh: '洞察' },
        clickToReveal: { ko: '카드를 클릭하여 뒤집기', ja: 'カードをクリックして表示', en: 'Click to reveal', zh: '点击翻牌' },
        question: { ko: '궁금한 점 (선택)', ja: '質問（任意）', en: 'Your Question (optional)', zh: '您的问题（可选）' },
        questionPh: { ko: '연애운이 궁금합니다...', ja: '恋愛運が気になります...', en: "I'm curious about my love life...", zh: '想知道恋爱运...' },
        genderLabel: { ko: '성별', ja: '性別', en: 'Gender', zh: '性别' },
        male: { ko: '남성', ja: '男性', en: 'Male', zh: '男性' },
        female: { ko: '여성', ja: '女性', en: 'Female', zh: '女性' },
        reversed: { ko: '역방향', ja: '逆位', en: 'Reversed', zh: '逆位' },
        upright: { ko: '정방향', ja: '正位', en: 'Upright', zh: '正位' },
    };

    function handleDraw() {
        setIsShuffling(true);
        setFlippedCards(new Set());
        setAllFlipped(false);
        // 매 셔플마다 a/b/c 세트 중 랜덤 선택
        const randomSet = CARD_SETS[Math.floor(Math.random() * CARD_SETS.length)];
        setCardSet(randomSet);
        setTimeout(() => {
            const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
            const count = spreadType === 'one' ? 1 : 3;
            const drawn = shuffled.slice(0, count).map((card) => ({
                ...card,
                reversed: Math.random() > 0.5,
            }));
            setDrawnCards(drawn);
            setIsShuffling(false);
        }, 1200);
    }

    function handleFlip(index: number) {
        setFlippedCards((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    }

    // 모든 카드가 뒤집혔을 때 자동으로 AI 해석 요청
    useEffect(() => {
        if (drawnCards.length > 0 && flippedCards.size === drawnCards.length && !allFlipped) {
            setAllFlipped(true);
            interpret({
                system: 'tarot',
                locale: loc,
                question: question || (loc === 'ko' ? '타로 카드 해석을 해주세요' : 'Please interpret these tarot cards'),
                drawnCards: drawnCards.map((c) => ({
                    name: c.name,
                    reversed: c.reversed,
                })),
                gender,
            });
        }
    }, [flippedCards, drawnCards, allFlipped, loc, question, interpret]);

    const positionLabels = spreadType === 'three'
        ? [labels.past[loc], labels.present[loc], labels.future[loc]]
        : [labels.insight[loc]];

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                        <span className="text-gradient">🃏 {labels.title[loc]}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{labels.subtitle[loc]}</p>
                </div>

                {/* 성별 + 질문 */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
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
                    </div>
                </div>

                {/* 스프레드 선택 */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
                    <button
                        onClick={() => setSpreadType('one')}
                        className={`btn ${spreadType === 'one' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {labels.oneCard[loc]}
                    </button>
                    <button
                        onClick={() => setSpreadType('three')}
                        className={`btn ${spreadType === 'three' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {labels.threeCard[loc]}
                    </button>
                </div>

                {/* 셔플 버튼 */}
                <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
                    <button
                        onClick={handleDraw}
                        disabled={isShuffling}
                        className="btn btn-gold btn-lg"
                    >
                        {isShuffling ? '✨ ...' : `✦ ${labels.shuffle[loc]}`}
                    </button>
                </div>

                {/* 카드 디스플레이 — 풀 와이드 */}
                {drawnCards.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-6)',
                        justifyContent: 'center',
                        flexWrap: 'nowrap',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 var(--space-4)',
                    }}>
                        {drawnCards.map((card, i) => (
                            <div key={i} style={{ textAlign: 'center', flex: '1 1 280px', maxWidth: '336px' }}>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent-primary)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                    {positionLabels[i]}
                                </p>
                                <div
                                    className="card-flip-container"
                                    onClick={() => handleFlip(i)}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '2 / 3',
                                        maxHeight: '52vh',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className={`card-flip-inner ${flippedCards.has(i) ? 'flipped' : ''}`}>
                                        {/* 카드 뒷면 */}
                                        <div
                                            className="card-flip-front"
                                            style={{
                                                background: 'linear-gradient(135deg, #1a0a3e, #2a1a5e)',
                                                border: '2px solid var(--color-accent-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexDirection: 'column', gap: 'var(--space-2)',
                                            }}
                                        >
                                            <span style={{ fontSize: '4rem' }}>✦</span>
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                                {labels.clickToReveal[loc]}
                                            </span>
                                        </div>
                                        {/* 카드 앞면 — 이미지가 카드 전체를 채움 */}
                                        <div
                                            className="card-flip-back"
                                            style={{
                                                border: `2px solid ${card.reversed ? '#ff6b6b' : 'var(--color-accent-gold)'}`,
                                                transform: 'rotateY(180deg)',
                                                overflow: 'hidden',
                                                padding: 0,
                                            }}
                                        >
                                            <img
                                                src={`/images/tarot/${card.number.toString().padStart(2, '0')}_${card.name.toLowerCase().replace(/ /g, '_')}_${cardSet}.png`}
                                                alt={card.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* 카드 아래 정보 표시 */}
                                {flippedCards.has(i) && (
                                    <div style={{ marginTop: 'var(--space-3)' }}>
                                        <span style={{ fontSize: 'var(--text-sm)', color: card.reversed ? '#ff6b6b' : 'var(--color-accent-gold)', fontWeight: 600 }}>
                                            {card.number}
                                        </span>
                                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 'var(--space-1) 0' }}>
                                            {card.name}
                                        </p>
                                        <span style={{
                                            fontSize: 'var(--text-sm)',
                                            color: card.reversed ? '#ff6b6b' : 'var(--color-accent-primary)',
                                            fontWeight: 600,
                                            padding: '4px 14px',
                                            borderRadius: 'var(--radius-full)',
                                            background: card.reversed ? 'rgba(255,107,107,0.15)' : 'rgba(138,100,255,0.15)',
                                        }}>
                                            {card.reversed ? `↓ ${labels.reversed[loc]}` : `↑ ${labels.upright[loc]}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {drawnCards.length === 0 && (
                    <div className="glass-card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', opacity: 0.3 }}>🃏</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {loc === 'ko' ? '셔플 버튼을 눌러 카드를 뽑아보세요' : 'Click shuffle to draw your cards'}
                        </p>
                    </div>
                )}

                {/* AI 결과 패널 */}
                <FortuneResultPanel
                    system="tarot"
                    result={result}
                    loading={loading}
                    error={error}
                    gender={gender}
                    locale={loc}
                    onRetry={() => {
                        if (drawnCards.length > 0) {
                            interpret({
                                system: 'tarot',
                                locale: loc,
                                question: question || 'Please interpret these tarot cards',
                                drawnCards: drawnCards.map((c) => ({ name: c.name, reversed: c.reversed })),
                            });
                        }
                    }}
                />
            </div>
        </section>
    );
}
