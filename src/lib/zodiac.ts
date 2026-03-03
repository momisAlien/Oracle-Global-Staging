/* ===========================
   Zodiac — 별자리 판별 유틸
   ===========================
   
   생년월일(MM-DD) 기반 12별자리 판별
   별자리별 아이콘, 다국어 이름, 날짜 범위, 원소 데이터
*/

export interface ZodiacSign {
    id: string;
    symbol: string;
    emoji: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
    names: Record<string, string>;
    traits: Record<string, string>;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
    {
        id: 'aries', symbol: '♈', emoji: '🐏',
        element: 'fire', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
        names: { ko: '양자리', ja: 'おひつじ座', en: 'Aries', zh: '白羊座' },
        traits: { ko: '열정적, 리더십, 용감한', ja: '情熱的、リーダーシップ、勇敢', en: 'Passionate, Leadership, Brave', zh: '热情、领导力、勇敢' },
    },
    {
        id: 'taurus', symbol: '♉', emoji: '🐂',
        element: 'earth', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
        names: { ko: '황소자리', ja: 'おうし座', en: 'Taurus', zh: '金牛座' },
        traits: { ko: '안정적, 인내심, 감각적', ja: '安定的、忍耐強い、感覚的', en: 'Stable, Patient, Sensual', zh: '稳定、有耐心、感性' },
    },
    {
        id: 'gemini', symbol: '♊', emoji: '👯',
        element: 'air', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20,
        names: { ko: '쌍둥이자리', ja: 'ふたご座', en: 'Gemini', zh: '双子座' },
        traits: { ko: '다재다능, 호기심, 소통력', ja: '多才多芸、好奇心、コミュ力', en: 'Versatile, Curious, Communicative', zh: '多才多艺、好奇、善于沟通' },
    },
    {
        id: 'cancer', symbol: '♋', emoji: '🦀',
        element: 'water', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22,
        names: { ko: '게자리', ja: 'かに座', en: 'Cancer', zh: '巨蟹座' },
        traits: { ko: '감성적, 보호본능, 직관적', ja: '感性的、保護本能、直感的', en: 'Emotional, Protective, Intuitive', zh: '感性、保护欲强、直觉敏锐' },
    },
    {
        id: 'leo', symbol: '♌', emoji: '🦁',
        element: 'fire', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
        names: { ko: '사자자리', ja: 'しし座', en: 'Leo', zh: '狮子座' },
        traits: { ko: '자신감, 카리스마, 관대함', ja: '自信、カリスマ、寛大', en: 'Confident, Charismatic, Generous', zh: '自信、有魅力、慷慨' },
    },
    {
        id: 'virgo', symbol: '♍', emoji: '👸',
        element: 'earth', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
        names: { ko: '처녀자리', ja: 'おとめ座', en: 'Virgo', zh: '处女座' },
        traits: { ko: '분석적, 완벽주의, 실용적', ja: '分析的、完璧主義、実用的', en: 'Analytical, Perfectionist, Practical', zh: '善于分析、完美主义、务实' },
    },
    {
        id: 'libra', symbol: '♎', emoji: '⚖️',
        element: 'air', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22,
        names: { ko: '천칭자리', ja: 'てんびん座', en: 'Libra', zh: '天秤座' },
        traits: { ko: '조화, 공정함, 사교적', ja: '調和、公正、社交的', en: 'Harmonious, Fair, Social', zh: '和谐、公正、善于社交' },
    },
    {
        id: 'scorpio', symbol: '♏', emoji: '🦂',
        element: 'water', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21,
        names: { ko: '전갈자리', ja: 'さそり座', en: 'Scorpio', zh: '天蝎座' },
        traits: { ko: '강렬함, 통찰력, 결단력', ja: '強烈、洞察力、決断力', en: 'Intense, Insightful, Determined', zh: '强烈、有洞察力、果断' },
    },
    {
        id: 'sagittarius', symbol: '♐', emoji: '🏹',
        element: 'fire', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
        names: { ko: '궁수자리', ja: 'いて座', en: 'Sagittarius', zh: '射手座' },
        traits: { ko: '모험적, 낙관적, 자유로운', ja: '冒険的、楽観的、自由', en: 'Adventurous, Optimistic, Free', zh: '爱冒险、乐观、自由' },
    },
    {
        id: 'capricorn', symbol: '♑', emoji: '🐐',
        element: 'earth', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19,
        names: { ko: '염소자리', ja: 'やぎ座', en: 'Capricorn', zh: '摩羯座' },
        traits: { ko: '야심적, 책임감, 인내심', ja: '野心的、責任感、忍耐', en: 'Ambitious, Responsible, Patient', zh: '有野心、负责任、有耐心' },
    },
    {
        id: 'aquarius', symbol: '♒', emoji: '🏺',
        element: 'air', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
        names: { ko: '물병자리', ja: 'みずがめ座', en: 'Aquarius', zh: '水瓶座' },
        traits: { ko: '독창적, 혁신적, 인도주의', ja: '独創的、革新的、人道主義', en: 'Original, Innovative, Humanitarian', zh: '独创、创新、人道主义' },
    },
    {
        id: 'pisces', symbol: '♓', emoji: '🐟',
        element: 'water', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
        names: { ko: '물고기자리', ja: 'うお座', en: 'Pisces', zh: '双鱼座' },
        traits: { ko: '상상력, 공감능력, 예술적', ja: '想像力、共感力、芸術的', en: 'Imaginative, Empathetic, Artistic', zh: '想象力丰富、有同理心、艺术感' },
    },
];

/** 원소별 색상 */
export const ELEMENT_COLORS: Record<string, string> = {
    fire: '#ef4444',
    earth: '#a3e635',
    air: '#38bdf8',
    water: '#6366f1',
};

/** 원소 이름 다국어 */
export const ELEMENT_NAMES: Record<string, Record<string, string>> = {
    fire: { ko: '불', ja: '火', en: 'Fire', zh: '火' },
    earth: { ko: '땅', ja: '地', en: 'Earth', zh: '土' },
    air: { ko: '바람', ja: '風', en: 'Air', zh: '风' },
    water: { ko: '물', ja: '水', en: 'Water', zh: '水' },
};

/** 원소 아이콘 */
export const ELEMENT_ICONS: Record<string, string> = {
    fire: '🔥',
    earth: '🌿',
    air: '💨',
    water: '💧',
};

/**
 * 생년월일 → 별자리 판별
 * @param birthDate - YYYY-MM-DD 형식
 * @returns ZodiacSign | null
 */
export function getZodiacSign(birthDate: string): ZodiacSign | null {
    const parts = birthDate.split('-');
    if (parts.length < 3) return null;

    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day)) return null;

    for (const sign of ZODIAC_SIGNS) {
        // 별자리가 12월~1월에 걸치는 경우 (염소자리)
        if (sign.startMonth > sign.endMonth) {
            if (
                (month === sign.startMonth && day >= sign.startDay) ||
                (month === sign.endMonth && day <= sign.endDay)
            ) {
                return sign;
            }
        } else {
            if (
                (month === sign.startMonth && day >= sign.startDay) ||
                (month === sign.endMonth && day <= sign.endDay) ||
                (month > sign.startMonth && month < sign.endMonth)
            ) {
                return sign;
            }
        }
    }
    return null;
}

/**
 * 날짜 범위 포맷
 */
export function formatDateRange(sign: ZodiacSign, locale: string): string {
    const months: Record<string, string[]> = {
        ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    };
    const m = months[locale] || months.en;
    return `${m[sign.startMonth - 1]} ${sign.startDay} – ${m[sign.endMonth - 1]} ${sign.endDay}`;
}
