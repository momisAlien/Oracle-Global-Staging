'use client';

import { useParams } from 'next/navigation';

export default function SynthesisPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'ko';

    const labels: Record<string, Record<string, string>> = {
        title: { ko: '종합 분석', ja: '総合分析', en: 'Synthesis Reading', zh: '综合分析' },
        subtitle: { ko: '사주·점성술·타로를 통합하는 크로스모듈 심층 분석', ja: '四柱・占星術・タロットを統合するクロスモジュール分析', en: 'Cross-module deep analysis combining Saju, Astrology & Tarot', zh: '四柱·占星术·塔罗跨模块深度分析' },
        proRequired: { ko: 'Pro 이상 티어에서 사용 가능합니다', ja: 'Pro以上のティアで利用可能です', en: 'Available for Pro tier and above', zh: 'Pro及以上层级可用' },
        upgrade: { ko: '업그레이드하기', ja: 'アップグレード', en: 'Upgrade Now', zh: '立即升级' },
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                    <span className="text-gradient">🔮 {labels.title[loc]}</span>
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-10)' }}>{labels.subtitle[loc]}</p>

                <div className="glass-card" style={{ padding: 'var(--space-12)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔒</div>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                        {labels.proRequired[loc]}
                    </p>
                    <a href={`/${loc}/pricing`} className="btn btn-primary btn-lg">
                        {labels.upgrade[loc]}
                    </a>
                </div>
            </div>
        </section>
    );
}
