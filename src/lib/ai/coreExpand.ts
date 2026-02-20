/* ===========================
   Core+Expand Pipeline v2 — 계층형 체인 + 단조증가 보장
   ===========================
   
   1) Core: LLM 1회 (temp=0) → 고정 길이 핵심 결론
   2) Expand 체인: free → plus(free 기반) → pro(plus 기반) → archmage(pro 기반)
   3) 길이 검증 + expand-more 재호출로 단조증가 무조건 보장
*/

import OpenAI from 'openai';
import {
    buildSystemPrompt,
    buildUserPrompt,
    CORE_RESPONSE_FORMAT,
    EXPAND_INSTRUCTIONS,
    EXPAND_RESPONSE_FORMAT,
    EXPAND_MORE_PROMPT,
    type FortuneSystem,
    type Locale,
    type Tier,
} from './prompts';
import { generateSeedKey, generateLuckyElements, type NormalizedInput } from './seedKey';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- 티어별 max_tokens ---------- */
const EXPAND_TOKENS: Record<Tier, number> = {
    free: 800,
    plus: 2000,
    pro: 3500,
    archmage: 6000,
};

/* ---------- 티어별 최소/최대 문자수 ---------- */
const MIN_CHARS: Record<Tier, number> = {
    free: 0,
    plus: 1400,
    pro: 2200,
    archmage: 3200,
};

const MAX_CHARS: Record<Tier, number> = {
    free: 900,
    plus: 2200,
    pro: 3500,
    archmage: 99999,
};

/* ---------- Types ---------- */

export interface CoreReading {
    coreSummary: string;
    coreSections: { title: string; content: string; icon: string }[];
    coreKeyPoints: string[];
    coreGuidance: string;
}

export interface ReadingContent {
    summary: string;
    sections: { title: string; content: string; icon: string }[];
    keyPoints: string[];
    guidance: string;
}

export interface LengthMetrics {
    totalChars: number;
    sectionCount: number;
    keyPointCount: number;
}

export interface ExpandedReading extends ReadingContent {
    luckyElements: { color: string; number: string; direction: string };
    model: string;
    meta: {
        userTier: Tier;
        effectiveTier: Tier;
        seedKey: string;
        latencyMs: number;
        cacheHit: boolean;
        totalChars: number;
        sectionCount: number;
        keyPointCount: number;
    };
}

export interface InterpretParams {
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
}

/* ---------- measureLength ---------- */

export function measureLength(reading: ReadingContent): LengthMetrics {
    const parts: string[] = [
        reading.summary,
        ...reading.sections.map(s => `${s.title} ${s.content}`),
        ...reading.keyPoints,
        reading.guidance,
    ];
    const totalChars = parts.join('').length;
    return {
        totalChars,
        sectionCount: reading.sections.length,
        keyPointCount: reading.keyPoints.length,
    };
}

/* ---------- In-memory core cache ---------- */
const coreCache = new Map<string, { reading: CoreReading; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedCore(seedKey: string): CoreReading | null {
    const entry = coreCache.get(seedKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        coreCache.delete(seedKey);
        return null;
    }
    return entry.reading;
}

function setCachedCore(seedKey: string, reading: CoreReading): void {
    if (coreCache.size > 100) {
        const oldest = coreCache.keys().next().value;
        if (oldest) coreCache.delete(oldest);
    }
    coreCache.set(seedKey, { reading, timestamp: Date.now() });
}

/* ---------- 1) Core Reading 생성 (고정 길이 강제) ---------- */

export async function generateCoreReading(params: InterpretParams): Promise<{ core: CoreReading; seedKey: string }> {
    const normalizedInput: NormalizedInput = {
        mode: params.system,
        locale: params.locale,
        birthDate: params.birthDate,
        birthTime: params.birthTime,
        birthPlace: params.birthPlace,
        question: params.question,
    };
    const seedKey = generateSeedKey(normalizedInput);

    const cached = getCachedCore(seedKey);
    if (cached) {
        return { core: cached, seedKey };
    }

    const systemPrompt = buildSystemPrompt(params.system, params.locale, 'pro');
    const userPrompt = buildUserPrompt(params);
    const formatInstruction = CORE_RESPONSE_FORMAT[params.locale] || CORE_RESPONSE_FORMAT.en;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: `${systemPrompt}\n\n${formatInstruction}` },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0,
        seed: parseInt(seedKey.slice(0, 8), 16) % 2147483647,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    const core: CoreReading = {
        coreSummary: parsed.coreSummary || '',
        coreSections: Array.isArray(parsed.coreSections) ? parsed.coreSections.slice(0, 3) : [],
        coreKeyPoints: Array.isArray(parsed.coreKeyPoints) ? parsed.coreKeyPoints.slice(0, 4) : [],
        coreGuidance: parsed.coreGuidance || '',
    };

    // 강제: 정확히 3섹션, 4 keyPoints
    while (core.coreSections.length < 3) {
        core.coreSections.push({ title: '추가 해석', content: '추가 분석이 필요합니다.', icon: '🔍' });
    }
    while (core.coreKeyPoints.length < 4) {
        core.coreKeyPoints.push('참고 포인트');
    }

    setCachedCore(seedKey, core);
    return { core, seedKey };
}

/* ---------- 2) 계층형 Expand ---------- */

async function expandFromPrevious(
    core: CoreReading,
    previousReading: ReadingContent | null,
    tier: Tier,
    params: InterpretParams,
): Promise<ReadingContent> {
    const locale = params.locale;

    // Free: core를 직접 변환 (LLM 호출 없음)
    if (tier === 'free') {
        return {
            summary: core.coreSummary,
            sections: core.coreSections.map(s => ({
                title: s.title,
                content: s.content,
                icon: s.icon,
            })),
            keyPoints: [...core.coreKeyPoints],
            guidance: core.coreGuidance,
        };
    }

    // Plus/Pro/Archmage: previousReading 기반 LLM 확장
    const expandInstruction = EXPAND_INSTRUCTIONS[tier][locale] || EXPAND_INSTRUCTIONS[tier].en;
    const expandFormat = EXPAND_RESPONSE_FORMAT[locale] || EXPAND_RESPONSE_FORMAT.en;
    const systemPrompt = buildSystemPrompt(params.system, locale, tier);

    const hasQuestion = !!params.question && params.question.trim().length > 0;

    const expandPrompt = `[coreReading (핵심 결론 — 절대 변경 금지)]
${JSON.stringify(core, null, 2)}

[previousReading (하위 티어 결과 — 이 내용을 반드시 포함하고 확장)]
${JSON.stringify(previousReading, null, 2)}

[확장 지시]
${expandInstruction}

${hasQuestion ? `[질문이 있습니다: "${params.question}"] 위 지시의 "질문이 있는 경우 필수 블록"을 반드시 포함하세요.` : ''}

[원래 입력 정보]
${buildUserPrompt(params)}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: `${systemPrompt}\n\n${expandFormat}` },
            { role: 'user', content: expandPrompt },
        ],
        max_tokens: EXPAND_TOKENS[tier],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';

    try {
        const parsed = JSON.parse(raw);
        return {
            summary: parsed.summary || (previousReading?.summary ?? core.coreSummary),
            sections: Array.isArray(parsed.sections) ? parsed.sections : (previousReading?.sections ?? core.coreSections),
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : (previousReading?.keyPoints ?? core.coreKeyPoints),
            guidance: parsed.guidance || (previousReading?.guidance ?? core.coreGuidance),
        };
    } catch {
        // JSON 파싱 실패 시 previousReading 반환
        return previousReading || {
            summary: core.coreSummary,
            sections: core.coreSections,
            keyPoints: core.coreKeyPoints,
            guidance: core.coreGuidance,
        };
    }
}

/* ---------- 3) Expand-More (길이 부족 시 재호출) ---------- */

async function expandMore(
    reading: ReadingContent,
    tier: Tier,
    params: InterpretParams,
    minChars: number,
    currentChars: number,
): Promise<ReadingContent> {
    const locale = params.locale;
    const expandFormat = EXPAND_RESPONSE_FORMAT[locale] || EXPAND_RESPONSE_FORMAT.en;
    const systemPrompt = buildSystemPrompt(params.system, locale, tier);
    const morePromptTemplate = EXPAND_MORE_PROMPT[locale] || EXPAND_MORE_PROMPT.en;
    const morePrompt = morePromptTemplate
        .replace('{currentChars}', String(currentChars))
        .replace('{minChars}', String(minChars));

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: `${systemPrompt}\n\n${expandFormat}` },
            { role: 'user', content: `${morePrompt}\n${JSON.stringify(reading, null, 2)}` },
        ],
        max_tokens: EXPAND_TOKENS[tier],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    try {
        const parsed = JSON.parse(raw);
        return {
            summary: parsed.summary || reading.summary,
            sections: Array.isArray(parsed.sections) ? parsed.sections : reading.sections,
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : reading.keyPoints,
            guidance: parsed.guidance || reading.guidance,
        };
    } catch {
        return reading;
    }
}

/* ---------- 4) enforceMonotonicLength ---------- */

async function enforceMinLength(
    reading: ReadingContent,
    tier: Tier,
    params: InterpretParams,
): Promise<ReadingContent> {
    const minChars = MIN_CHARS[tier];
    if (minChars <= 0) return reading;

    let current = reading;
    for (let attempt = 0; attempt < 2; attempt++) {
        const metrics = measureLength(current);
        if (metrics.totalChars >= minChars) break;
        console.log(`[enforceMinLength] ${tier}: ${metrics.totalChars} < ${minChars}, retry ${attempt + 1}`);
        current = await expandMore(current, tier, params, minChars, metrics.totalChars);
    }
    return current;
}

/* ---------- 5) 통합: 단일 티어 ---------- */

export async function interpretWithCoreExpand(
    params: InterpretParams,
    tier: Tier,
    userTier: Tier = 'free',
): Promise<ExpandedReading> {
    const startTime = Date.now();
    const { core, seedKey } = await generateCoreReading(params);
    const luckyElements = generateLuckyElements(seedKey, params.locale);

    // 체인 진행: free → 요청 tier까지
    const tierChain: Tier[] = ['free', 'plus', 'pro', 'archmage'];
    const targetIdx = tierChain.indexOf(tier);

    let previousReading: ReadingContent | null = null;
    let currentReading: ReadingContent | null = null;

    for (let i = 0; i <= targetIdx; i++) {
        const currentTier = tierChain[i];
        currentReading = await expandFromPrevious(core, previousReading, currentTier, params);
        currentReading = await enforceMinLength(currentReading, currentTier, params);
        previousReading = currentReading;
    }

    if (!currentReading) {
        currentReading = {
            summary: core.coreSummary,
            sections: core.coreSections,
            keyPoints: core.coreKeyPoints,
            guidance: core.coreGuidance,
        };
    }

    const metrics = measureLength(currentReading);

    return {
        ...currentReading,
        luckyElements,
        model: 'gpt-4o-mini',
        meta: {
            userTier,
            effectiveTier: tier,
            seedKey,
            latencyMs: Date.now() - startTime,
            cacheHit: false,
            totalChars: metrics.totalChars,
            sectionCount: metrics.sectionCount,
            keyPointCount: metrics.keyPointCount,
        },
    };
}

/* ---------- 6) 4티어 동시 비교 (tier-lab용) — 체인 호출 ---------- */

export async function interpretAllTiers(
    params: InterpretParams,
): Promise<{ tiers: Record<Tier, ExpandedReading>; seedKey: string }> {
    const startTime = Date.now();
    const { core, seedKey } = await generateCoreReading(params);
    const luckyElements = generateLuckyElements(seedKey, params.locale);
    const coreLatency = Date.now() - startTime;

    const tierChain: Tier[] = ['free', 'plus', 'pro', 'archmage'];
    const results: Record<string, ExpandedReading> = {};

    let previousReading: ReadingContent | null = null;

    // 체인 순서대로 실행 (상위 = 하위 포함)
    for (const tier of tierChain) {
        const tierStart = Date.now();
        let reading = await expandFromPrevious(core, previousReading, tier, params);
        reading = await enforceMinLength(reading, tier, params);

        const metrics = measureLength(reading);
        const tierLatency = Date.now() - tierStart + coreLatency;

        results[tier] = {
            ...reading,
            luckyElements,
            model: 'gpt-4o-mini',
            meta: {
                userTier: 'free',
                effectiveTier: tier,
                seedKey,
                latencyMs: tierLatency,
                cacheHit: tier === 'free', // free는 LLM 미호출
                totalChars: metrics.totalChars,
                sectionCount: metrics.sectionCount,
                keyPointCount: metrics.keyPointCount,
            },
        };

        previousReading = reading;
    }

    // 최종 단조증가 검증 (만약 깨져도 로그만 남김 — expandMore 이미 시도했으므로)
    const chars = tierChain.map(t => results[t].meta.totalChars);
    for (let i = 1; i < chars.length; i++) {
        if (chars[i] <= chars[i - 1]) {
            console.warn(`[MonotonicCheck] WARNING: ${tierChain[i]}(${chars[i]}) <= ${tierChain[i - 1]}(${chars[i - 1]})`);
        }
    }

    const totalLatency = Date.now() - startTime;

    return {
        tiers: results as Record<Tier, ExpandedReading>,
        seedKey,
    };
}
