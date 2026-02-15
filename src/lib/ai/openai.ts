/* ===========================
   OpenAI Provider — gpt-4o-mini 기본 해석 엔진
   =========================== */

import OpenAI from 'openai';
import {
    buildSystemPrompt,
    buildUserPrompt,
    RESPONSE_FORMAT_INSTRUCTION,
    type FortuneSystem,
    type Locale,
    type Tier,
} from './prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/** 티어별 max_tokens */
const TIER_TOKENS: Record<Tier, number> = {
    free: 600,
    plus: 1500,
    pro: 3000,
    archmage: 5000,
};

export interface InterpretResult {
    summary: string;
    sections: { title: string; content: string; icon: string }[];
    keyPoints: string[];
    guidance: string;
    luckyElements?: { color?: string; number?: string; direction?: string };
    model: string;
}

export async function interpretFortune(params: {
    system: FortuneSystem;
    locale: Locale;
    tier: Tier;
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
}): Promise<InterpretResult> {
    const systemPrompt = buildSystemPrompt(params.system, params.locale, params.tier);
    const userPrompt = buildUserPrompt(params);
    const formatInstruction = RESPONSE_FORMAT_INSTRUCTION[params.locale] || RESPONSE_FORMAT_INSTRUCTION.en;
    const maxTokens = TIER_TOKENS[params.tier];

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: `${systemPrompt}\n\n${formatInstruction}` },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';

    try {
        const parsed = JSON.parse(raw);
        return {
            summary: parsed.summary || '',
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
            guidance: parsed.guidance || '',
            luckyElements: parsed.luckyElements || undefined,
            model: 'gpt-4o-mini',
        };
    } catch {
        // JSON 파싱 실패 시 raw 텍스트를 summary에 넣어 반환
        return {
            summary: raw,
            sections: [],
            keyPoints: [],
            guidance: '',
            model: 'gpt-4o-mini',
        };
    }
}
