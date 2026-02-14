'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

const SAMPLE_CARDS = [
    { name: 'The Fool', number: 0, upright: 'New beginnings, innocence, adventure', reversed: 'Recklessness, carelessness' },
    { name: 'The Magician', number: 1, upright: 'Willpower, manifestation, skill', reversed: 'Manipulation, poor planning' },
    { name: 'The High Priestess', number: 2, upright: 'Intuition, mystery, inner knowledge', reversed: 'Hidden agendas, disconnection' },
    { name: 'The Empress', number: 3, upright: 'Abundance, nurturing, fertility', reversed: 'Dependence, smothering' },
    { name: 'The Emperor', number: 4, upright: 'Authority, structure, stability', reversed: 'Tyranny, rigidity' },
    { name: 'The Hierophant', number: 5, upright: 'Tradition, conformity, guidance', reversed: 'Rebellion, non-conformity' },
    { name: 'The Lovers', number: 6, upright: 'Love, harmony, choices', reversed: 'Disharmony, misalignment' },
    { name: 'The Chariot', number: 7, upright: 'Determination, willpower, triumph', reversed: 'Lack of direction, aggression' },
    { name: 'Strength', number: 8, upright: 'Courage, patience, inner strength', reversed: 'Self-doubt, weakness' },
    { name: 'The Hermit', number: 9, upright: 'Soul-searching, introspection, wisdom', reversed: 'Isolation, loneliness' },
];

export default function TarotPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const [spreadType, setSpreadType] = useState<'one' | 'three'>('one');
    const [drawnCards, setDrawnCards] = useState<typeof SAMPLE_CARDS>([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

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
    };

    function handleDraw() {
        setIsShuffling(true);
        setFlippedCards(new Set());
        setTimeout(() => {
            const shuffled = [...SAMPLE_CARDS].sort(() => Math.random() - 0.5);
            const count = spreadType === 'one' ? 1 : 3;
            setDrawnCards(shuffled.slice(0, count));
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

                {/* 카드 디스플레이 */}
                {drawnCards.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {drawnCards.map((card, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent-primary)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                    {positionLabels[i]}
                                </p>
                                <div
                                    className="card-flip-container"
                                    onClick={() => handleFlip(i)}
                                    style={{ width: '180px', height: '280px', cursor: 'pointer' }}
                                >
                                    <div className={`card-flip-inner ${flippedCards.has(i) ? 'flipped' : ''}`}>
                                        {/* 카드 뒷면 */}
                                        <div
                                            className="card-flip-front"
                                            style={{
                                                background: 'linear-gradient(135deg, #1a0a3e, #2a1a5e)',
                                                border: '2px solid var(--color-accent-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                gap: 'var(--space-2)',
                                            }}
                                        >
                                            <span style={{ fontSize: '3rem' }}>✦</span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                                {labels.clickToReveal[loc]}
                                            </span>
                                        </div>
                                        {/* 카드 앞면 */}
                                        <div
                                            className="card-flip-back"
                                            style={{
                                                background: 'linear-gradient(180deg, var(--color-bg-secondary), var(--color-surface))',
                                                border: '2px solid var(--color-accent-gold)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 'var(--space-4)',
                                            }}
                                        >
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-gold)', fontWeight: 600 }}>
                                                {card.number}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 'var(--space-2) 0', textAlign: 'center' }}>
                                                {card.name}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
                                                {card.upright}
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
            </div>
        </section>
    );
}
