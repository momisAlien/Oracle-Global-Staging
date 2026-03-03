'use client';

import { useParams } from 'next/navigation';

const CONTENT: Record<string, { title: string; body: string }> = {
    ko: {
        title: '소개',
        body: `
## 🌟 우리의 미션

TarotAIHub는 **기술과 영성의 만남**을 통해, 동양과 서양의 지혜를 누구나 쉽게 접할 수 있는 AI 운세 플랫폼을 만들어갑니다.

수천 년간 이어져 온 타로, 점성술, 사주팔자의 지혜를 현대 AI 기술로 재해석하여, 전 세계 사용자에게 의미 있는 통찰과 성찰의 기회를 제공합니다.

## ✨ 서비스 소개

### 🃏 타로
직관이 안내하는 타로 카드 리딩. AI가 카드의 의미, 위치, 조합을 분석하여 당신의 질문에 맞는 해석을 제공합니다.

### ⭐ 별자리 운세
생년월일 기반 12별자리 판별과 매일 업데이트되는 운세. 연애, 재물, 건강, 직장 운을 상세히 분석합니다.

### ✦ 점성술 (Natal Chart)
천체력 기반 정밀 출생차트 분석. 행성의 위치와 하우스 배치를 통해 당신의 성격, 재능, 잠재력을 탐구합니다.

### ☯ 사주팔자
절기 기준 사주팔자 · 십신 · 오행 · 대운 분석. 한국, 일본, 중국의 전통 명리학을 AI가 깊이 있게 해석합니다.

## 🌍 글로벌 서비스

TarotAIHub는 **한국어, 일본어, 영어, 중국어** 4개 언어를 지원하며, 각 언어와 문화에 맞는 자연스러운 해석을 제공합니다.

## 🔒 신뢰와 투명성

### AI 결과물에 대하여
- AI 분석 결과는 전통 운세 지식을 기반으로 생성되며, **오락 및 개인적 성찰 목적**으로만 제공됩니다.
- AI는 통계적 패턴과 언어 모델을 활용하여 해석을 생성합니다. 초자연적 예지능력이 아닙니다.
- 중요한 결정은 전문가와 상담하시기 바랍니다.

### 개인정보 보호
- 수집하는 데이터를 최소화하고, 투명하게 처리합니다.
- 사용자에게 자신의 데이터에 대한 통제권을 부여합니다.
- 자세한 내용은 [개인정보 처리방침](/ko/privacy)을 참조하세요.

---

**질문이 있으시면** [문의하기](/ko/contact)를 통해 연락해 주세요.
`,
    },
    ja: {
        title: '概要',
        body: `
## 🌟 私たちのミッション

TarotAIHub は**テクノロジーとスピリチュアリティの出会い**を通じて、東洋と西洋の叡智を誰もが気軽に体験できる AI 占いプラットフォームを創造しています。

数千年にわたり受け継がれてきたタロット、占星術、四柱推命の知恵を現代の AI 技術で再解釈し、世界中のユーザーに意味のある洞察と内省の機会を提供します。

## ✨ サービス紹介

### 🃏 タロット
直感が導くタロットカードリーディング。AI がカードの意味、位置、組み合わせを分析し、あなたの質問に合わせた解釈をお届けします。

### ⭐ 星座占い
生年月日に基づく12星座判定と毎日更新される運勢。恋愛、金運、健康、仕事運を詳しく分析します。

### ✦ 占星術（ネイタルチャート）
エフェメリスに基づく精密な出生チャート分析。惑星の位置とハウス配置から、あなたの性格、才能、可能性を探求します。

### ☯ 四柱推命
節気基準の四柱推命・十神・五行・大運分析。日本、韓国、中国の伝統命理学を AI が深く解釈します。

## 🌍 グローバルサービス

TarotAIHub は**日本語、韓国語、英語、中国語**の4言語に対応し、各言語と文化に合った自然な解釈を提供します。

## 🔒 信頼と透明性

### AI の出力について
- AI 分析結果は伝統的な占いの知識に基づいて生成され、**エンターテインメントおよび内省目的**でのみ提供されます。
- AI は統計的パターンと言語モデルを活用して解釈を生成します。超自然的な予知能力ではありません。
- 重要な判断は専門家にご相談ください。

### プライバシー保護
- 収集するデータを最小限に抑え、透明性をもって取り扱います。
- ユーザーが自身のデータをコントロールする権利を尊重します。
- 詳細は[プライバシーポリシー](/ja/privacy)をご覧ください。

---

**ご質問がございましたら** [お問い合わせ](/ja/contact)からご連絡ください。
`,
    },
    en: {
        title: 'About Us',
        body: `
## 🌟 Our Mission

TarotAIHub brings together **technology and spirituality**, creating an AI-powered fortune platform that makes the wisdom of both Eastern and Western traditions accessible to everyone.

We reinterpret the time-honored knowledge of Tarot, Astrology, and Saju (Four Pillars of Destiny) through modern AI, providing users worldwide with meaningful insights and moments of reflection.

## ✨ Our Services

### 🃏 Tarot
Intuition-guided tarot card readings. Our AI analyzes card meanings, positions, and combinations to deliver personalized interpretations for your questions.

### ⭐ Zodiac Horoscope
Birthdate-based zodiac sign identification with daily updated fortunes. Get detailed analysis of love, wealth, health, and career prospects.

### ✦ Astrology (Natal Chart)
Ephemeris-based precision natal chart analysis. Explore your personality, talents, and potential through planetary positions and house placements.

### ☯ Saju (Four Pillars)
Solar-term based Four Pillars analysis with Ten Gods, Five Elements, and Major Luck cycles. Deep AI interpretation of traditional East Asian destiny reading.

## 🌍 Global Service

TarotAIHub supports **English, Korean, Japanese, and Chinese**, delivering natural interpretations tailored to each language and cultural context.

## 🔒 Trust & Transparency

### About AI Outputs
- AI analysis is generated based on traditional fortune-telling knowledge and is provided **for entertainment and personal reflection purposes only**.
- Our AI uses statistical patterns and language models to generate interpretations. It is not a supernatural or psychic ability.
- For important life decisions, please consult qualified professionals.

### Privacy First
- We minimize data collection and handle your information transparently.
- We give users control over their own data.
- For details, see our [Privacy Policy](/en/privacy).

---

**Have questions?** Reach out through our [Contact page](/en/contact).
`,
    },
    zh: {
        title: '关于我们',
        body: `
## 🌟 我们的使命

TarotAIHub 通过**科技与灵性的融合**，打造一个让所有人都能轻松体验东西方智慧的 AI 运势平台。

我们用现代 AI 技术重新诠释传承数千年的塔罗、占星术和四柱八字智慧，为全球用户提供有意义的洞察与自我反思的契机。

## ✨ 服务介绍

### 🃏 塔罗牌
直觉引导的塔罗牌解读。AI 分析卡牌含义、位置和组合，为您的问题提供个性化解读。

### ⭐ 星座运势
基于出生日期的12星座判定与每日更新运势。详细分析爱情、财运、健康和事业运。

### ✦ 占星术（出生星盘）
基于星历的精确出生星盘分析。通过行星位置和宫位配置，探索您的性格、才能和潜力。

### ☯ 四柱八字
基于节气的四柱八字、十神、五行、大运分析。AI 深入解读东亚传统命理学。

## 🌍 全球化服务

TarotAIHub 支持**中文、韩语、日语和英语**四种语言，提供符合各语言和文化背景的自然解读。

## 🔒 信任与透明

### 关于 AI 输出
- AI 分析结果基于传统运势知识生成，**仅供娱乐和个人反思之用**。
- 我们的 AI 利用统计模式和语言模型生成解读，并非超自然预知能力。
- 重要决策请咨询专业人士。

### 隐私至上
- 我们最大限度减少数据收集，透明地处理您的信息。
- 我们赋予用户对自身数据的控制权。
- 详情请参阅我们的[隐私政策](/zh/privacy)。

---

**有疑问？** 请通过[联系我们](/zh/contact)页面与我们取得联系。
`,
    },
};

export default function AboutPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'en';
    const c = CONTENT[loc] || CONTENT.en;

    return (
        <section className="section">
            <div className="container legal-page">
                <h1 className="legal-title">{c.title}</h1>
                <div className="legal-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(c.body) }} />
            </div>
            <style>{LEGAL_STYLES}</style>
        </section>
    );
}

function markdownToHtml(md: string): string {
    return md
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<[htuola])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');
}

const LEGAL_STYLES = `
  .legal-page { max-width: 800px; }
  .legal-title { font-size: var(--text-3xl); font-weight: 800; margin-bottom: var(--space-6); background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .legal-body h2 { font-size: var(--text-xl); font-weight: 700; margin: var(--space-8) 0 var(--space-3); color: var(--color-text-primary); }
  .legal-body h3 { font-size: var(--text-lg); font-weight: 600; margin: var(--space-6) 0 var(--space-2); }
  .legal-body p { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-3); }
  .legal-body a { color: var(--color-accent-primary); }
  .legal-body a:hover { text-decoration: underline; }
  .legal-body ul { padding-left: var(--space-6); margin-bottom: var(--space-4); }
  .legal-body li { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-1); }
  .legal-body hr { border: none; border-top: 1px solid var(--color-border); margin: var(--space-6) 0; }
  .legal-body strong { color: var(--color-text-primary); }
`;
