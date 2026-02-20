/* ===========================
   SeedKey — 입력 정규화 + 결정론적 행운 요소
   ===========================
   
   동일 입력 → 동일 seedKey → 동일 luckyElements
   티어와 무관하게 일관된 결과 보장
*/

import { createHash } from 'crypto';

export interface NormalizedInput {
    mode: string;
    locale: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    question?: string;
}

/**
 * 입력을 정규화하여 stable seedKey 생성
 */
export function generateSeedKey(input: NormalizedInput): string {
    const parts: string[] = [
        input.mode.toLowerCase().trim(),
        input.locale.toLowerCase().trim(),
    ];

    // 날짜는 ISO 형식으로 통일 (YYYY-MM-DD)
    if (input.birthDate) {
        parts.push(`bd:${input.birthDate.trim()}`);
    }
    // 시간은 HH:mm
    if (input.birthTime) {
        parts.push(`bt:${input.birthTime.trim()}`);
    }
    // 출생지는 원문 소문자
    if (input.birthPlace) {
        parts.push(`bp:${input.birthPlace.trim().toLowerCase()}`);
    }
    // 질문은 공백 정리 + 소문자
    if (input.question) {
        const normalizedQ = input.question
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[.,!?;:'"()]/g, '');
        parts.push(`q:${normalizedQ}`);
    }

    const raw = parts.join('|');
    return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/* ---------- 결정론적 행운 요소 ---------- */

const LUCKY_COLORS: Record<string, string[]> = {
    ko: ['빨간색', '파란색', '초록색', '보라색', '금색', '은색', '분홍색', '하늘색', '주황색', '청록색', '자주색', '연두색'],
    ja: ['赤', '青', '緑', '紫', 'ゴールド', 'シルバー', 'ピンク', '水色', 'オレンジ', 'ターコイズ', '藤色', '若草色'],
    en: ['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Pink', 'Sky Blue', 'Orange', 'Turquoise', 'Magenta', 'Lime'],
    zh: ['红色', '蓝色', '绿色', '紫色', '金色', '银色', '粉色', '天蓝色', '橙色', '青绿色', '品红色', '浅绿色'],
};

const LUCKY_DIRECTIONS: Record<string, string[]> = {
    ko: ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'],
    ja: ['東', '西', '南', '北', '東南', '東北', '西南', '西北'],
    en: ['East', 'West', 'South', 'North', 'Southeast', 'Northeast', 'Southwest', 'Northwest'],
    zh: ['东方', '西方', '南方', '北方', '东南方', '东北方', '西南方', '西北方'],
};

/**
 * seedKey 기반 결정론적 행운 요소 생성
 * 동일 seedKey → 동일 결과 (티어 무관)
 */
export function generateLuckyElements(
    seedKey: string,
    locale: string
): { color: string; number: string; direction: string } {
    // seedKey의 hex 값으로 인덱스 결정
    const hashNum = parseInt(seedKey.slice(0, 8), 16);

    const colors = LUCKY_COLORS[locale] || LUCKY_COLORS.en;
    const directions = LUCKY_DIRECTIONS[locale] || LUCKY_DIRECTIONS.en;

    const colorIdx = hashNum % colors.length;
    const numberVal = ((hashNum >> 4) % 9) + 1; // 1~9
    const dirIdx = ((hashNum >> 8) % directions.length);

    return {
        color: colors[colorIdx],
        number: String(numberVal),
        direction: directions[dirIdx],
    };
}
