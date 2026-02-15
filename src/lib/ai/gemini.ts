/* ===========================
   Gemini Provider — Archmage 2차 검증 패스
   =========================== */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    buildSystemPrompt,
    buildUserPrompt,
    RESPONSE_FORMAT_INSTRUCTION,
    type FortuneSystem,
    type Locale,
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiVerifyResult {
    additionalInsights: string;
    crossValidation: string;
    hiddenPatterns: string[];
    model: string;
}

/**
 * Archmage 전용 2차 검증: OpenAI 결과를 Gemini로 교차 검증
 */
export async function verifyWithGemini(params: {
    system: FortuneSystem;
    locale: Locale;
    originalResult: string;
    question?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    isLunar?: boolean;
    latitude?: number;
    longitude?: number;
    drawnCards?: { name: string; reversed: boolean }[];
    chartData?: Record<string, unknown>;
}): Promise<GeminiVerifyResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const verifyPromptByLocale: Record<string, string> = {
        ko: `당신은 최고 수준의 점술 검증관입니다. 아래 원본 해석을 교차 검증하고, 놓친 패턴이나 추가 통찰을 제공하세요.`,
        ja: `あなたは最高レベルの占術検証官です。以下の元の解釈を交差検証し、見落としたパターンや追加の洞察を提供してください。`,
        en: `You are a supreme fortune verification officer. Cross-validate the original interpretation below and provide missed patterns or additional insights.`,
        zh: `你是最高级别的占术验证官。交叉验证以下原始解读，提供遗漏的模式或额外洞察。`,
    };

    const formatPrompt: Record<string, string> = {
        ko: `반드시 다음 JSON 형식으로 응답하세요:
{ "additionalInsights": "추가 통찰", "crossValidation": "교차 검증 의견", "hiddenPatterns": ["숨겨진 패턴 1", ...] }`,
        ja: `必ず以下のJSON形式で応答してください:
{ "additionalInsights": "追加の洞察", "crossValidation": "交差検証の意見", "hiddenPatterns": ["隠されたパターン1", ...] }`,
        en: `You MUST respond in this JSON format:
{ "additionalInsights": "Additional insights", "crossValidation": "Cross-validation opinion", "hiddenPatterns": ["Hidden pattern 1", ...] }`,
        zh: `必须以以下JSON格式回复:
{ "additionalInsights": "额外洞察", "crossValidation": "交叉验证意见", "hiddenPatterns": ["隐藏模式1", ...] }`,
    };

    const locale = params.locale;
    const systemPrompt = buildSystemPrompt(params.system, locale, 'archmage');
    const userPrompt = buildUserPrompt(params);

    const prompt = `${verifyPromptByLocale[locale] || verifyPromptByLocale.en}

${systemPrompt}

[사용자 입력]
${userPrompt}

[원본 AI 해석 결과]
${params.originalResult}

${formatPrompt[locale] || formatPrompt.en}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON 블록 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                additionalInsights: parsed.additionalInsights || '',
                crossValidation: parsed.crossValidation || '',
                hiddenPatterns: Array.isArray(parsed.hiddenPatterns) ? parsed.hiddenPatterns : [],
                model: 'gemini-2.0-flash',
            };
        } catch {
            // fallthrough
        }
    }

    return {
        additionalInsights: text,
        crossValidation: '',
        hiddenPatterns: [],
        model: 'gemini-2.0-flash',
    };
}
