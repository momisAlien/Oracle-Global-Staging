/* ===========================
   사주팔자 계산기 (클라이언트 사이드)
   천간 · 지지 · 오행 분포 산출
   =========================== */

// 십천간 (十天干)
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const STEMS_EN = ['Gap', 'Eul', 'Byeong', 'Jeong', 'Mu', 'Gi', 'Gyeong', 'Sin', 'Im', 'Gye'];

// 십이지지 (十二地支)
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCHES_EN = ['Ja', 'Chuk', 'In', 'Myo', 'Jin', 'Sa', 'O', 'Mi', 'Sin', 'Yu', 'Sul', 'Hae'];

// 천간 → 오행
const STEM_ELEMENT: Record<string, string> = {
    갑: 'wood', 을: 'wood',
    병: 'fire', 정: 'fire',
    무: 'earth', 기: 'earth',
    경: 'metal', 신: 'metal',
    임: 'water', 계: 'water',
};

// 지지 → 오행
const BRANCH_ELEMENT: Record<string, string> = {
    자: 'water', 축: 'earth', 인: 'wood', 묘: 'wood',
    진: 'earth', 사: 'fire', 오: 'fire', 미: 'earth',
    신: 'metal', 유: 'metal', 술: 'earth', 해: 'water',
};

// 천간 색상
const STEM_COLORS: Record<string, string> = {
    갑: '#22c55e', 을: '#22c55e', // 목 - 녹
    병: '#ef4444', 정: '#ef4444', // 화 - 적
    무: '#eab308', 기: '#eab308', // 토 - 황
    경: '#94a3b8', 신: '#94a3b8', // 금 - 백
    임: '#3b82f6', 계: '#3b82f6', // 수 - 청
};

// 지지 색상
const BRANCH_COLORS: Record<string, string> = {
    자: '#3b82f6', 축: '#eab308', 인: '#22c55e', 묘: '#22c55e',
    진: '#eab308', 사: '#ef4444', 오: '#ef4444', 미: '#eab308',
    신: '#94a3b8', 유: '#94a3b8', 술: '#eab308', 해: '#3b82f6',
};

export interface Pillar {
    stem: string;
    stemHanja: string;
    stemEn: string;
    stemColor: string;
    branch: string;
    branchHanja: string;
    branchEn: string;
    branchColor: string;
}

export interface SajuResult {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
    elements: { wood: number; fire: number; earth: number; metal: number; water: number };
}

function makePillar(stemIdx: number, branchIdx: number): Pillar {
    const s = stemIdx % 10;
    const b = branchIdx % 12;
    return {
        stem: HEAVENLY_STEMS[s],
        stemHanja: STEMS_HANJA[s],
        stemEn: STEMS_EN[s],
        stemColor: STEM_COLORS[HEAVENLY_STEMS[s]] || '#8b5cf6',
        branch: EARTHLY_BRANCHES[b],
        branchHanja: BRANCHES_HANJA[b],
        branchEn: BRANCHES_EN[b],
        branchColor: BRANCH_COLORS[EARTHLY_BRANCHES[b]] || '#8b5cf6',
    };
}

/**
 * 사주팔자 계산 (양력 기준 간이 계산)
 */
export function calculateSaju(birthDate: string, birthTime?: string): SajuResult | null {
    if (!birthDate) return null;

    const [yearStr, monthStr, dayStr] = birthDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // 년주: (year - 4) % 60
    const yearStemIdx = (year - 4) % 10;
    const yearBranchIdx = (year - 4) % 12;
    const yearPillar = makePillar(yearStemIdx, yearBranchIdx);

    // 월주: 월건표 기반 — 년간에 따라 월간이 결정됨
    // 년간의 인덱스(0-4 사이클) × 2 + 2 + (month - 1)
    const monthStemBase = (yearStemIdx % 5) * 2 + 2;
    const monthStemIdx = (monthStemBase + (month - 1)) % 10;
    // 지지는 인(2)월부터 시작
    const monthBranchIdx = (month + 1) % 12;
    const monthPillar = makePillar(monthStemIdx, monthBranchIdx);

    // 일주: 기준일(1900-01-01 = 갑자일)로부터의 일수 차이
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
    const dayStemIdx = ((diffDays % 10) + 10) % 10;
    const dayBranchIdx = ((diffDays % 12) + 12) % 12;
    const dayPillar = makePillar(dayStemIdx, dayBranchIdx);

    // 시주: 시간에 따라 결정
    let hour = 0;
    if (birthTime) {
        const [hStr] = birthTime.split(':');
        hour = parseInt(hStr, 10) || 0;
    }
    // 시지: 23~01=자, 01~03=축 ... (2시간 간격)
    const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);
    // 시간: 일간 × 2 + 시지idx
    const hourStemBase = (dayStemIdx % 5) * 2;
    const hourStemIdx = (hourStemBase + hourBranchIdx) % 10;
    const hourPillar = makePillar(hourStemIdx, hourBranchIdx);

    // 오행 분포 계산
    const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    for (const p of pillars) {
        const stemEl = STEM_ELEMENT[p.stem];
        const branchEl = BRANCH_ELEMENT[p.branch];
        if (stemEl) elements[stemEl as keyof typeof elements]++;
        if (branchEl) elements[branchEl as keyof typeof elements]++;
    }

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
        elements,
    };
}
