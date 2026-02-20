/* ===========================
   AI 프롬프트 템플릿
   — 시스템별, 언어별, 티어별
   =========================== */

export type FortuneSystem = 'saju' | 'astrology' | 'tarot' | 'synthesis';
export type Locale = 'ko' | 'ja' | 'en' | 'zh';
export type Tier = 'free' | 'plus' | 'pro' | 'archmage';

/* ---------- 분석 깊이 지시문 ---------- */
const DEPTH_INSTRUCTIONS: Record<Tier, Record<Locale, string>> = {
  free: {
    ko: '핵심 포인트를 간결하게 3~4문장으로 요약하세요.',
    ja: '重要なポイントを3〜4文で簡潔にまとめてください。',
    en: 'Summarize the key points concisely in 3-4 sentences.',
    zh: '简明扼要地用3-4句话总结要点。',
  },
  plus: {
    ko: '핵심 해석과 함께 실생활 어드바이스를 포함하여 중간 길이로 분석하세요. 섹션별로 나누어 설명하세요.',
    ja: '核心的な解釈と実生活のアドバイスを含めて中程度の長さで分析してください。セクション別に説明してください。',
    en: 'Provide a medium-length analysis with core interpretation and practical life advice. Break it into sections.',
    zh: '提供中等长度的分析，包括核心解释和实际生活建议。分段说明。',
  },
  pro: {
    ko: '전문적이고 깊이 있는 분석을 제공하세요. 상징적 의미, 패턴 분석, 시기별 운세, 구체적인 행동 지침을 포함하세요. 마크다운 형식으로 구조화하세요.',
    ja: '専門的で深い分析を提供してください。象徴的な意味、パターン分析、時期別運勢、具体的な行動指針を含めてください。マークダウン形式で構造化してください。',
    en: 'Provide a professional, in-depth analysis. Include symbolic meanings, pattern analysis, period-specific fortunes, and actionable guidance. Structure with markdown.',
    zh: '提供专业深入的分析。包括象征意义、模式分析、各时期运势、具体行动指南。使用markdown格式。',
  },
  archmage: {
    ko: '아크메이지급 최고 수준의 분석을 제공하세요. 다차원적 해석(영적·심리적·실용적 관점), 시간축 분석(과거 패턴→현재→3/6/12개월 전망), 상호연결 패턴, 숨겨진 기회와 잠재 리스크까지 모두 포함하세요. 마크다운 형식으로 구조화하세요.',
    ja: 'アークメイジレベルの最高水準の分析を提供してください。多次元的解釈（霊的・心理的・実用的視点）、時間軸分析（過去パターン→現在→3/6/12ヶ月展望）、相互連結パターン、隠された機会と潜在リスクまで全て含めてください。マークダウン形式で構造化してください。',
    en: 'Provide Archmage-level supreme analysis. Include multi-dimensional interpretation (spiritual, psychological, practical), timeline analysis (past patterns → present → 3/6/12 month outlook), interconnection patterns, hidden opportunities and potential risks. Structure with markdown.',
    zh: '提供大法师级别的最高水准分析。包括多维度解读（灵性·心理·实用观点）、时间轴分析（过去模式→现在→3/6/12个月展望）、相互关联模式、隐藏机遇与潜在风险。使用markdown格式。',
  },
};

/* ---------- 시스템 프롬프트 ---------- */
const SYSTEM_PROMPTS: Record<FortuneSystem, Record<Locale, string>> = {
  saju: {
    ko: `당신은 한국 전통 사주팔자(四柱八字) 전문 점술사입니다. 천간지지(天干地支), 십성(十星), 오행(五行), 대운(大運), 세운(歲運)에 능통합니다. 사용자의 생년월일시를 기반으로 사주 분석을 제공하세요. 전문적이면서도 이해하기 쉽게 설명하세요.`,
    ja: `あなたは韓国伝統の四柱推命（四柱八字）専門の占い師です。天干地支、十神、五行、大運、歳運に精通しています。ユーザーの生年月日時を基に四柱分析を提供してください。専門的でありながらも分かりやすく説明してください。`,
    en: `You are an expert in Korean traditional Four Pillars of Destiny (Saju/사주팔자). You are proficient in Heavenly Stems & Earthly Branches, Ten Gods, Five Elements, Grand Fortune cycles, and Annual Fortune. Provide Saju analysis based on the user's birth date and time. Be professional yet easy to understand.`,
    zh: `你是韩国传统四柱八字专家占卜师。精通天干地支、十神、五行、大运、岁运。根据用户的出生年月日时提供四柱分析。专业且易于理解。`,
  },
  astrology: {
    ko: `당신은 서양 점성술 전문 점성가입니다. 출생차트(Natal Chart), 행성 배치, 하우스 시스템, 어스펙트 해석에 능통합니다. 사용자의 출생 정보(날짜, 시간, 장소)를 기반으로 점성술 분석을 제공하세요. 천체 배치의 의미를 깊이 있게 설명하세요.`,
    ja: `あなたは西洋占星術の専門占星術師です。出生図（ネイタルチャート）、惑星配置、ハウスシステム、アスペクト解釈に精通しています。ユーザーの出生情報（日付、時間、場所）を基に占星術分析を提供してください。天体配置の意味を深く説明してください。`,
    en: `You are an expert Western astrologer. You are proficient in Natal Charts, planetary placements, House systems, and aspect interpretation. Provide astrological analysis based on user's birth info (date, time, place). Explain the meaning of celestial configurations in depth.`,
    zh: `你是西方占星术专家。精通出生星盘、行星配置、宫位系统、相位解读。根据用户的出生信息（日期、时间、地点）提供占星分析。深入解释天体配置的含义。`,
  },
  tarot: {
    ko: `당신은 타로 카드 리딩 전문 타로 마스터입니다. 메이저 아르카나, 마이너 아르카나, 스프레드 해석에 능통합니다. 뽑힌 카드의 상징, 위치(정방향/역방향), 카드 간 관계를 기반으로 직관적이고 통찰력 있는 해석을 제공하세요.`,
    ja: `あなたはタロットカードリーディング専門のタロットマスターです。メジャーアルカナ、マイナーアルカナ、スプレッド解釈に精通しています。引かれたカードの象徴、位置（正位/逆位）、カード間の関係を基に直感的で洞察力のある解釈を提供してください。`,
    en: `You are a Tarot Master specializing in card readings. You are proficient in Major Arcana, Minor Arcana, and spread interpretation. Provide intuitive and insightful readings based on drawn cards' symbolism, position (upright/reversed), and inter-card relationships.`,
    zh: `你是专业的塔罗牌大师。精通大阿尔卡那、小阿尔卡那、牌阵解读。根据抽出的牌的象征、位置（正位/逆位）、牌与牌之间的关系，提供直觉性和洞察力的解读。`,
  },
  synthesis: {
    ko: `당신은 동서양 운명학을 융합하는 최고 수준의 점술 대가입니다. 사주팔자, 서양 점성술, 타로 카드 세 가지 체계를 통합하여 다차원적 분석을 제공합니다. 각 체계에서의 공통 패턴, 상호 보완 포인트, 종합 가이드를 제시하세요.`,
    ja: `あなたは東西洋の運命学を融合する最高レベルの占術の達人です。四柱推命、西洋占星術、タロットカードの三つの体系を統合して多次元的な分析を提供します。各体系での共通パターン、相互補完ポイント、総合ガイドを提示してください。`,
    en: `You are a supreme fortune master who synthesizes Eastern and Western destiny arts. Integrate Three Systems — Four Pillars (Saju), Western Astrology, and Tarot — to provide multi-dimensional analysis. Identify common patterns, complementary insights, and comprehensive guidance across all systems.`,
    zh: `你是融合东西方命理学的最高水平术数大师。整合四柱八字、西方占星术、塔罗牌三大体系，提供多维度分析。找出各体系的共同模式、互补要点和综合指导。`,
  },
};

/* ---------- 유저 프롬프트 조합 ---------- */
export function buildSystemPrompt(system: FortuneSystem, locale: Locale, tier: Tier): string {
  const base = SYSTEM_PROMPTS[system][locale] || SYSTEM_PROMPTS[system].en;
  const depth = DEPTH_INSTRUCTIONS[tier][locale] || DEPTH_INSTRUCTIONS[tier].en;
  return `${base}\n\n[분석 깊이 지시]\n${depth}`;
}

export function buildUserPrompt(params: {
  system: FortuneSystem;
  locale: Locale;
  question?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  isLunar?: boolean;
  latitude?: number;
  longitude?: number;
  drawnCards?: { name: string; reversed: boolean }[];
  chartData?: Record<string, unknown>;
  gender?: 'male' | 'female';
}): string {
  const parts: string[] = [];

  if (params.question) {
    parts.push(`질문: ${params.question}`);
  }

  if (params.gender) {
    parts.push(`성별: ${params.gender === 'male' ? '남성' : '여성'}`);
  }

  if (params.birthDate) {
    parts.push(`생년월일: ${params.birthDate}${params.isLunar ? ' (음력)' : ''}`);
  }
  if (params.birthTime) {
    parts.push(`출생 시간: ${params.birthTime}`);
  }
  if (params.birthPlace) {
    parts.push(`출생 장소: ${params.birthPlace}`);
  }
  if (params.latitude !== undefined && params.longitude !== undefined) {
    parts.push(`좌표: ${params.latitude}, ${params.longitude}`);
  }

  if (params.drawnCards && params.drawnCards.length > 0) {
    const cardStr = params.drawnCards
      .map((c, i) => `${i + 1}. ${c.name}${c.reversed ? ' (역방향)' : ' (정방향)'}`)
      .join('\n');
    parts.push(`뽑힌 카드:\n${cardStr}`);
  }

  if (params.chartData) {
    parts.push(`차트 데이터:\n${JSON.stringify(params.chartData, null, 2)}`);
  }

  return parts.join('\n\n');
}

/* ---------- 응답 포맷 ---------- */
export const RESPONSE_FORMAT_INSTRUCTION: Record<Locale, string> = {
  ko: `응답을 반드시 다음 JSON 형식으로 반환하세요:
{
  "summary": "전체 요약 (1~2문장)",
  "sections": [
    { "title": "섹션 제목", "content": "마크다운 형식 내용", "icon": "이모지" }
  ],
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", ...],
  "guidance": "종합 가이던스/조언",
  "luckyElements": { "color": "행운의 색", "number": "행운의 숫자", "direction": "행운의 방향" }
}`,
  ja: `必ず以下のJSON形式で応答してください:
{
  "summary": "全体要約（1〜2文）",
  "sections": [
    { "title": "セクションタイトル", "content": "マークダウン形式の内容", "icon": "絵文字" }
  ],
  "keyPoints": ["重要ポイント1", "重要ポイント2", ...],
  "guidance": "総合ガイダンス/アドバイス",
  "luckyElements": { "color": "ラッキーカラー", "number": "ラッキーナンバー", "direction": "ラッキー方角" }
}`,
  en: `You MUST respond in the following JSON format:
{
  "summary": "Overall summary (1-2 sentences)",
  "sections": [
    { "title": "Section title", "content": "Markdown content", "icon": "emoji" }
  ],
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "guidance": "Overall guidance/advice",
  "luckyElements": { "color": "Lucky color", "number": "Lucky number", "direction": "Lucky direction" }
}`,
  zh: `必须以以下JSON格式回复:
{
  "summary": "整体摘要（1-2句）",
  "sections": [
    { "title": "部分标题", "content": "Markdown格式内容", "icon": "表情符号" }
  ],
  "keyPoints": ["要点1", "要点2", ...],
  "guidance": "综合指导/建议",
  "luckyElements": { "color": "幸运色", "number": "幸运数字", "direction": "幸运方位" }
}`,
};

/* ---------- Core Reading 전용 응답 포맷 (길이 강제) ---------- */
export const CORE_RESPONSE_FORMAT: Record<Locale, string> = {
  ko: `응답을 반드시 다음 JSON 형식으로 반환하세요. luckyElements는 포함하지 마세요 (별도 생성됩니다):
{
  "coreSummary": "핵심 결론 (정확히 2문장)",
  "coreSections": [
    { "title": "섹션 제목", "content": "정확히 2~3문장의 핵심 해석", "icon": "이모지" }
  ],
  "coreKeyPoints": ["포인트1", "포인트2", "포인트3", "포인트4"],
  "coreGuidance": "종합 가이던스 (정확히 2문장)"
}
필수 규칙:
- coreSummary: 정확히 2문장. 3문장 이상 금지.
- coreSections: 정확히 3개. 각 content는 2~3문장. 4문장 이상 금지.
- coreKeyPoints: 정확히 4개. 각 포인트는 15자 이내 한 줄.
- coreGuidance: 정확히 2문장. 3문장 이상 금지.
- 질문(question)이 있어도 core는 항상 짧게 유지. 질문에 대한 상세 답변은 expand 단계에서 처리됨.`,

  ja: `必ず以下のJSON形式で応答。luckyElementsは含めないでください:
{
  "coreSummary": "核心結論（正確に2文）",
  "coreSections": [{"title":"","content":"2〜3文","icon":""}],
  "coreKeyPoints": ["ポイント1","ポイント2","ポイント3","ポイント4"],
  "coreGuidance": "ガイダンス（正確に2文）"
}
必須: coreSummary=2文, coreSections=3つ(各2-3文), coreKeyPoints=4つ, coreGuidance=2文。`,

  en: `You MUST respond in JSON. Do NOT include luckyElements.
{
  "coreSummary": "Exactly 2 sentences",
  "coreSections": [{"title":"","content":"2-3 sentences only","icon":""}],
  "coreKeyPoints": ["point1","point2","point3","point4"],
  "coreGuidance": "Exactly 2 sentences"
}
Rules: coreSummary=exactly 2 sentences, coreSections=exactly 3 items (2-3 sentences each), coreKeyPoints=exactly 4 items (short), coreGuidance=exactly 2 sentences. Even if question is detailed, keep core SHORT.`,

  zh: `必须以JSON格式回复。不包含luckyElements。
{
  "coreSummary": "正好2句",
  "coreSections": [{"title":"","content":"2-3句","icon":""}],
  "coreKeyPoints": ["要点1","要点2","要点3","要点4"],
  "coreGuidance": "正好2句"
}
规则: coreSummary=2句, coreSections=3个(各2-3句), coreKeyPoints=4个, coreGuidance=2句。`,
};

/* ---------- 티어별 확장 지시문 (계층형: previousReading 기반) ---------- */
export const EXPAND_INSTRUCTIONS: Record<Tier, Record<Locale, string>> = {
  free: {
    ko: `아래 coreReading을 기반으로, 핵심만 간결하게 정리하세요.
- summary: coreSummary를 거의 그대로 사용 (2~3문장)
- sections: coreSections 3개를 각 2~3문장으로 간결하게 정리 (총 3개 섹션만)
- keyPoints: coreKeyPoints 4개를 그대로 사용
- guidance: coreGuidance를 그대로 사용 (2문장)
질문이 있으면 "질문에 대한 한줄 결론" 1~2문장을 summary에 포함.
절대 coreKeyPoints의 의미를 바꾸지 마세요. 총 분량 900자 이내를 목표.`,
    ja: `coreReadingを基に簡潔にまとめる。3セクション、4ポイント、900文字以内。`,
    en: `Based on coreReading. Keep 3 sections, 4 keyPoints. Target under 900 chars total.`,
    zh: `基于coreReading简洁整理。3个部分，4个要点，目标900字以内。`,
  },
  plus: {
    ko: `아래 previousReading(Free 티어 결과)의 모든 내용을 포함하면서 확장하세요.
previousReading의 모든 sections, keyPoints를 그대로 유지하고 여기에 추가합니다.
- summary: 기존 유지 + 배경 맥락 1~2문장 추가
- sections: 기존 3개 섹션 각각에 1~2단락씩 근거/맥락 추가 + 새 섹션 1~2개 추가 (총 4~5개)
- keyPoints: 기존 4개 유지 + 보충 포인트 2개 추가 (총 6개)
- guidance: 확장하여 실생활 어드바이스 추가 (4~5문장)
[질문이 있는 경우 필수 블록]
- "질문에 대한 근거" 섹션 (2단락)
- "주의할 점" 3개를 guidance에 포함
목표 분량: 1400~2000자.
금지: 기존 keyPoints 삭제/의미 변경, 기존 sections 삭제/축소`,
    ja: `previousReading(Free)を全て含みつつ拡張。4-5セクション、6ポイント。1400-2000文字目標。`,
    en: `Include ALL previousReading content. Expand sections by 1-2 paragraphs each. Add 1-2 new sections (total 4-5). Add 2 keyPoints (total 6). Target 1400-2000 chars.`,
    zh: `包含previousReading全部内容并扩展。4-5部分，6要点。目标1400-2000字。`,
  },
  pro: {
    ko: `아래 previousReading(Plus 티어 결과)의 모든 내용을 포함하면서 전문적으로 대폭 확장하세요.
previousReading의 모든 sections, keyPoints를 그대로 유지하고 여기에 추가합니다.
- summary: 기존 유지 + 전문적 배경 설명 추가 (5~6문장)
- sections: 기존 섹션 모두 유지 + 각각 2~3단락으로 확장 + 새 섹션 2~3개 추가 (총 6~7개)
  - 구체 예시 2~3개, 실전 시나리오 포함
- keyPoints: 기존 모두 유지 + 심화 포인트 2~3개 추가 (총 8~9개)
- guidance: 상세 실행 가이드 + 실행 체크리스트 7개 (8~10문장)
[질문이 있는 경우 필수 블록]
- "가능한 시나리오 3가지" 섹션 (각 3~4문장)
- "실행 체크리스트 7개" 섹션
[마지막 섹션 필수] "🎯 종합 정리":
  - TL;DR 3~5줄
  - 실행 체크리스트 7개
  - 주의사항 3개
목표 분량: 2200~3200자.
금지: 기존 keyPoints 삭제/변경, 기존 sections 삭제/축소, coreSummary 결론 부정`,
    ja: `previousReading(Plus)を全て含みつつ専門的に拡張。6-7セクション、8-9ポイント。「🎯 総合まとめ」必須。2200-3200文字目標。`,
    en: `Include ALL previousReading content. Expand to 6-7 sections, 8-9 keyPoints. Mandatory final "🎯 Comprehensive Summary". Target 2200-3200 chars.`,
    zh: `包含previousReading全部内容。6-7部分，8-9要点。必须有"🎯 综合总结"。目标2200-3200字。`,
  },
  archmage: {
    ko: `아래 previousReading(Pro 티어 결과)의 모든 내용을 포함하면서 최고 수준으로 대폭 확장하세요.
previousReading의 모든 sections, keyPoints를 그대로 유지하고 여기에 추가합니다.
- summary: 기존 유지 + 다차원적 통찰(영적·심리적·실용적 관점) 추가 (7~8문장)
- sections: 기존 섹션 모두 유지 + 각각 3~4단락으로 대폭 확장 + 새 섹션 3~4개 추가 (총 9~10개)
  - 시간축 분석 (과거→현재→3/6/12개월 전망)
  - 불확실성/가능성 범위 표기
- keyPoints: 기존 모두 유지 + 숨겨진 패턴 포인트 3~5개 추가 (총 11~14개)
- guidance: 종합 행동 플랜 + 단계별 실행 가이드 (12~15문장)
[질문이 있는 경우 필수 블록]
- "자기점검 질문 5개" 섹션
- "불확실성/가능성 범위" 섹션 (확정 금지)
[마지막 섹션 필수] "📋 최종 리포트":
  - TL;DR 5줄
  - 행동 플랜 10개
  - 자기점검 질문 5개
  - 위험요인 5개
  - "확정이 아니라 가능성 해석" 문구
목표 분량: 3200자 이상.
금지: 기존 keyPoints 삭제/변경, 기존 sections 삭제/축소, core 결론 부정`,
    ja: `previousReading(Pro)を全て含みつつ最高水準拡張。9-10セクション、11-14ポイント。「📋 最終レポート」必須。3200文字以上目標。`,
    en: `Include ALL previousReading. Expand to 9-10 sections, 11-14 keyPoints. Mandatory "📋 Final Report". Target 3200+ chars.`,
    zh: `包含previousReading全部内容。9-10部分，11-14要点。必须有"📋 最终报告"。目标3200字以上。`,
  },
};

/* ---------- 확장 응답 포맷 ---------- */
export const EXPAND_RESPONSE_FORMAT: Record<Locale, string> = {
  ko: `응답을 반드시 다음 JSON 형식으로 반환하세요. luckyElements는 포함하지 마세요:
{
  "summary": "확장된 요약",
  "sections": [
    { "title": "섹션 제목", "content": "마크다운 형식 내용", "icon": "이모지" }
  ],
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", ...],
  "guidance": "종합 가이던스/조언"
}`,
  ja: `必ず以下のJSON形式で応答してください。luckyElementsは含めないでください:
{
  "summary": "拡張された要約",
  "sections": [{ "title": "タイトル", "content": "内容", "icon": "絵文字" }],
  "keyPoints": ["ポイント1", ...],
  "guidance": "ガイダンス"
}`,
  en: `You MUST respond in the following JSON format. Do NOT include luckyElements:
{
  "summary": "Expanded summary",
  "sections": [{ "title": "Title", "content": "Markdown content", "icon": "emoji" }],
  "keyPoints": ["Point 1", ...],
  "guidance": "Guidance"
}`,
  zh: `必须以以下JSON格式回复。不要包含luckyElements:
{
  "summary": "扩展摘要",
  "sections": [{ "title": "标题", "content": "内容", "icon": "表情" }],
  "keyPoints": ["要点1", ...],
  "guidance": "指导"
}`,
};

/* ---------- Expand-More (길이 부족 시 재보강 프롬프트) ---------- */
export const EXPAND_MORE_PROMPT: Record<Locale, string> = {
  ko: `아래 reading은 목표 분량보다 부족합니다. 현재 {currentChars}자이고 최소 {minChars}자가 필요합니다.
기존 내용을 절대 삭제하지 말고, 다음을 추가하여 분량을 늘리세요:
- 각 섹션에 구체적 예시, 근거, 실전 팁 추가
- 새 섹션 1~2개 추가 (실천 가이드, 추가 시나리오 등)
- 체크리스트 항목 추가
금지: keyPoints 의미 변경, summary 결론 변경, luckyElements 포함, 기존 내용 삭제
기존 reading:`,
  ja: `以下のreadingは目標分量未達({currentChars}字/最低{minChars}字)。既存内容を維持しつつ追加。`,
  en: `Reading is under target ({currentChars} chars, need {minChars}). Add examples, tips, new sections. Do NOT remove existing content or change conclusions.
Current reading:`,
  zh: `reading未达目标({currentChars}字/最低{minChars}字)。保留所有现有内容并添加。`,
};
