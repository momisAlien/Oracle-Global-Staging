/* ===========================
   도시 검색 — 출생장소 자동완성
   ===========================
   
   외부 API 없이 내장 데이터로 fuzzy 검색
   주요 도시 + 한중일 도시 포함
*/

export interface CityResult {
    name: string;           // 표시 이름 (예: "서울, 대한민국")
    nameEn: string;         // 영문 이름
    lat: number;
    lng: number;
    country: string;        // 2자리 국가코드
}

/** 주요 도시 데이터베이스 */
const CITIES: CityResult[] = [
    // 🇰🇷 한국
    { name: '서울, 대한민국', nameEn: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780, country: 'KR' },
    { name: '부산, 대한민국', nameEn: 'Busan, South Korea', lat: 35.1796, lng: 129.0756, country: 'KR' },
    { name: '인천, 대한민국', nameEn: 'Incheon, South Korea', lat: 37.4563, lng: 126.7052, country: 'KR' },
    { name: '대구, 대한민국', nameEn: 'Daegu, South Korea', lat: 35.8714, lng: 128.6014, country: 'KR' },
    { name: '대전, 대한민국', nameEn: 'Daejeon, South Korea', lat: 36.3504, lng: 127.3845, country: 'KR' },
    { name: '광주, 대한민국', nameEn: 'Gwangju, South Korea', lat: 35.1595, lng: 126.8526, country: 'KR' },
    { name: '울산, 대한민국', nameEn: 'Ulsan, South Korea', lat: 35.5384, lng: 129.3114, country: 'KR' },
    { name: '수원, 대한민국', nameEn: 'Suwon, South Korea', lat: 37.2636, lng: 127.0286, country: 'KR' },
    { name: '성남, 대한민국', nameEn: 'Seongnam, South Korea', lat: 37.4201, lng: 127.1265, country: 'KR' },
    { name: '고양, 대한민국', nameEn: 'Goyang, South Korea', lat: 37.6584, lng: 126.8320, country: 'KR' },
    { name: '용인, 대한민국', nameEn: 'Yongin, South Korea', lat: 37.2411, lng: 127.1776, country: 'KR' },
    { name: '창원, 대한민국', nameEn: 'Changwon, South Korea', lat: 35.2281, lng: 128.6811, country: 'KR' },
    { name: '제주, 대한민국', nameEn: 'Jeju, South Korea', lat: 33.4996, lng: 126.5312, country: 'KR' },
    { name: '전주, 대한민국', nameEn: 'Jeonju, South Korea', lat: 35.8242, lng: 127.1480, country: 'KR' },
    { name: '청주, 대한민국', nameEn: 'Cheongju, South Korea', lat: 36.6424, lng: 127.4890, country: 'KR' },
    { name: '천안, 대한민국', nameEn: 'Cheonan, South Korea', lat: 36.8151, lng: 127.1139, country: 'KR' },
    { name: '포항, 대한민국', nameEn: 'Pohang, South Korea', lat: 36.0190, lng: 129.3435, country: 'KR' },
    { name: '김해, 대한민국', nameEn: 'Gimhae, South Korea', lat: 35.2285, lng: 128.8894, country: 'KR' },

    // 🇯🇵 일본
    { name: '東京, 日本', nameEn: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, country: 'JP' },
    { name: '大阪, 日本', nameEn: 'Osaka, Japan', lat: 34.6937, lng: 135.5023, country: 'JP' },
    { name: '横浜, 日本', nameEn: 'Yokohama, Japan', lat: 35.4437, lng: 139.6380, country: 'JP' },
    { name: '名古屋, 日本', nameEn: 'Nagoya, Japan', lat: 35.1815, lng: 136.9066, country: 'JP' },
    { name: '札幌, 日本', nameEn: 'Sapporo, Japan', lat: 43.0618, lng: 141.3545, country: 'JP' },
    { name: '福岡, 日本', nameEn: 'Fukuoka, Japan', lat: 33.5904, lng: 130.4017, country: 'JP' },
    { name: '京都, 日本', nameEn: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, country: 'JP' },
    { name: '神戸, 日本', nameEn: 'Kobe, Japan', lat: 34.6901, lng: 135.1956, country: 'JP' },

    // 🇨🇳 중국
    { name: '北京, 中国', nameEn: 'Beijing, China', lat: 39.9042, lng: 116.4074, country: 'CN' },
    { name: '上海, 中国', nameEn: 'Shanghai, China', lat: 31.2304, lng: 121.4737, country: 'CN' },
    { name: '广州, 中国', nameEn: 'Guangzhou, China', lat: 23.1291, lng: 113.2644, country: 'CN' },
    { name: '深圳, 中国', nameEn: 'Shenzhen, China', lat: 22.5431, lng: 114.0579, country: 'CN' },
    { name: '成都, 中国', nameEn: 'Chengdu, China', lat: 30.5728, lng: 104.0668, country: 'CN' },
    { name: '杭州, 中国', nameEn: 'Hangzhou, China', lat: 30.2741, lng: 120.1551, country: 'CN' },
    { name: '重庆, 中国', nameEn: 'Chongqing, China', lat: 29.4316, lng: 106.9123, country: 'CN' },
    { name: '南京, 中国', nameEn: 'Nanjing, China', lat: 32.0603, lng: 118.7969, country: 'CN' },
    { name: '武汉, 中国', nameEn: 'Wuhan, China', lat: 30.5928, lng: 114.3055, country: 'CN' },
    { name: '西安, 中国', nameEn: "Xi'an, China", lat: 34.3416, lng: 108.9398, country: 'CN' },
    { name: '天津, 中国', nameEn: 'Tianjin, China', lat: 39.3434, lng: 117.3616, country: 'CN' },
    { name: '香港', nameEn: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'HK' },
    { name: '台北, 台灣', nameEn: 'Taipei, Taiwan', lat: 25.0330, lng: 121.5654, country: 'TW' },

    // 🇺🇸 미국
    { name: 'New York, USA', nameEn: 'New York, USA', lat: 40.7128, lng: -74.0060, country: 'US' },
    { name: 'Los Angeles, USA', nameEn: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437, country: 'US' },
    { name: 'Chicago, USA', nameEn: 'Chicago, USA', lat: 41.8781, lng: -87.6298, country: 'US' },
    { name: 'Houston, USA', nameEn: 'Houston, USA', lat: 29.7604, lng: -95.3698, country: 'US' },
    { name: 'San Francisco, USA', nameEn: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, country: 'US' },
    { name: 'Seattle, USA', nameEn: 'Seattle, USA', lat: 47.6062, lng: -122.3321, country: 'US' },

    // 🇬🇧 영국
    { name: 'London, UK', nameEn: 'London, UK', lat: 51.5074, lng: -0.1278, country: 'GB' },
    { name: 'Manchester, UK', nameEn: 'Manchester, UK', lat: 53.4808, lng: -2.2426, country: 'GB' },

    // 🇪🇺 유럽
    { name: 'Paris, France', nameEn: 'Paris, France', lat: 48.8566, lng: 2.3522, country: 'FR' },
    { name: 'Berlin, Germany', nameEn: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, country: 'DE' },
    { name: 'Rome, Italy', nameEn: 'Rome, Italy', lat: 41.9028, lng: 12.4964, country: 'IT' },
    { name: 'Madrid, Spain', nameEn: 'Madrid, Spain', lat: 40.4168, lng: -3.7038, country: 'ES' },
    { name: 'Amsterdam, Netherlands', nameEn: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041, country: 'NL' },

    // 🌏 기타 아시아
    { name: 'Bangkok, Thailand', nameEn: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018, country: 'TH' },
    { name: 'Singapore', nameEn: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'SG' },
    { name: 'Sydney, Australia', nameEn: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, country: 'AU' },
    { name: 'Mumbai, India', nameEn: 'Mumbai, India', lat: 19.0760, lng: 72.8777, country: 'IN' },
    { name: 'Dubai, UAE', nameEn: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, country: 'AE' },

    // 🌎 남미
    { name: 'São Paulo, Brazil', nameEn: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, country: 'BR' },
    { name: 'Buenos Aires, Argentina', nameEn: 'Buenos Aires, Argentina', lat: -34.6037, lng: -58.3816, country: 'AR' },

    // 🌍 아프리카
    { name: 'Cairo, Egypt', nameEn: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, country: 'EG' },

    // 🇰🇵 북한
    { name: '평양, 조선민주주의인민공화국', nameEn: 'Pyongyang, North Korea', lat: 39.0392, lng: 125.7625, country: 'KP' },
];

/**
 * 도시 검색 (fuzzy match)
 * @param query 검색어
 * @param limit 최대 결과 수
 */
export function searchCities(query: string, limit = 8): CityResult[] {
    if (!query || query.trim().length < 1) return [];

    const q = query.toLowerCase().trim();

    // 정확한 prefix 매칭을 우선
    const prefixMatches: CityResult[] = [];
    const containsMatches: CityResult[] = [];

    for (const city of CITIES) {
        const nameL = city.name.toLowerCase();
        const nameEnL = city.nameEn.toLowerCase();

        if (nameL.startsWith(q) || nameEnL.startsWith(q)) {
            prefixMatches.push(city);
        } else if (nameL.includes(q) || nameEnL.includes(q)) {
            containsMatches.push(city);
        }
    }

    return [...prefixMatches, ...containsMatches].slice(0, limit);
}
