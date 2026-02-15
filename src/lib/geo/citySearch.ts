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
    { name: '세종, 대한민국', nameEn: 'Sejong, South Korea', lat: 36.4800, lng: 127.2890, country: 'KR' },

    // 경기도
    { name: '수원, 대한민국', nameEn: 'Suwon, South Korea', lat: 37.2636, lng: 127.0286, country: 'KR' },
    { name: '성남, 대한민국', nameEn: 'Seongnam, South Korea', lat: 37.4201, lng: 127.1265, country: 'KR' },
    { name: '고양, 대한민국', nameEn: 'Goyang, South Korea', lat: 37.6584, lng: 126.8320, country: 'KR' },
    { name: '용인, 대한민국', nameEn: 'Yongin, South Korea', lat: 37.2411, lng: 127.1776, country: 'KR' },
    { name: '부천, 대한민국', nameEn: 'Bucheon, South Korea', lat: 37.5034, lng: 126.7660, country: 'KR' },
    { name: '안산, 대한민국', nameEn: 'Ansan, South Korea', lat: 37.3219, lng: 126.8309, country: 'KR' },
    { name: '안양, 대한민국', nameEn: 'Anyang, South Korea', lat: 37.3943, lng: 126.9568, country: 'KR' },
    { name: '남양주, 대한민국', nameEn: 'Namyangju, South Korea', lat: 37.6360, lng: 127.2165, country: 'KR' },
    { name: '화성, 대한민국', nameEn: 'Hwaseong, South Korea', lat: 37.1995, lng: 126.8310, country: 'KR' },
    { name: '평택, 대한민국', nameEn: 'Pyeongtaek, South Korea', lat: 36.9921, lng: 127.1127, country: 'KR' },
    { name: '의정부, 대한민국', nameEn: 'Uijeongbu, South Korea', lat: 37.7381, lng: 127.0338, country: 'KR' },
    { name: '파주, 대한민국', nameEn: 'Paju, South Korea', lat: 37.7599, lng: 126.7800, country: 'KR' },
    { name: '김포, 대한민국', nameEn: 'Gimpo, South Korea', lat: 37.6150, lng: 126.7150, country: 'KR' },
    { name: '광명, 대한민국', nameEn: 'Gwangmyeong, South Korea', lat: 37.4786, lng: 126.8645, country: 'KR' },
    { name: '광주(경기), 대한민국', nameEn: 'Gwangju (Gyeonggi), South Korea', lat: 37.4292, lng: 127.2550, country: 'KR' },
    { name: '군포, 대한민국', nameEn: 'Gunpo, South Korea', lat: 37.3617, lng: 126.9352, country: 'KR' },
    { name: '오산, 대한민국', nameEn: 'Osan, South Korea', lat: 37.1498, lng: 127.0772, country: 'KR' },
    { name: '이천, 대한민국', nameEn: 'Icheon, South Korea', lat: 37.2720, lng: 127.4350, country: 'KR' },
    { name: '안성, 대한민국', nameEn: 'Anseong, South Korea', lat: 37.0079, lng: 127.2790, country: 'KR' },
    { name: '구리, 대한민국', nameEn: 'Guri, South Korea', lat: 37.5943, lng: 127.1296, country: 'KR' },
    { name: '포천, 대한민국', nameEn: 'Pocheon, South Korea', lat: 37.8949, lng: 127.2000, country: 'KR' },
    { name: '양주, 대한민국', nameEn: 'Yangju, South Korea', lat: 37.7853, lng: 127.0458, country: 'KR' },
    { name: '동두천, 대한민국', nameEn: 'Dongducheon, South Korea', lat: 37.9036, lng: 127.0607, country: 'KR' },

    // 강원특별자치도
    { name: '춘천, 대한민국', nameEn: 'Chuncheon, South Korea', lat: 37.8813, lng: 127.7298, country: 'KR' },
    { name: '원주, 대한민국', nameEn: 'Wonju, South Korea', lat: 37.3422, lng: 127.9202, country: 'KR' },
    { name: '강릉, 대한민국', nameEn: 'Gangneung, South Korea', lat: 37.7519, lng: 128.8761, country: 'KR' },
    { name: '동해, 대한민국', nameEn: 'Donghae, South Korea', lat: 37.5247, lng: 129.1143, country: 'KR' },
    { name: '태백, 대한민국', nameEn: 'Taebaek, South Korea', lat: 37.1641, lng: 128.9856, country: 'KR' },
    { name: '속초, 대한민국', nameEn: 'Sokcho, South Korea', lat: 38.2070, lng: 128.5918, country: 'KR' },
    { name: '삼척, 대한민국', nameEn: 'Samcheok, South Korea', lat: 37.4499, lng: 129.1650, country: 'KR' },

    // 충청북도
    { name: '청주, 대한민국', nameEn: 'Cheongju, South Korea', lat: 36.6424, lng: 127.4890, country: 'KR' },
    { name: '충주, 대한민국', nameEn: 'Chungju, South Korea', lat: 36.9910, lng: 127.9259, country: 'KR' },
    { name: '제천, 대한민국', nameEn: 'Jecheon, South Korea', lat: 37.1326, lng: 128.1900, country: 'KR' },

    // 충청남도
    { name: '천안, 대한민국', nameEn: 'Cheonan, South Korea', lat: 36.8151, lng: 127.1139, country: 'KR' },
    { name: '공주, 대한민국', nameEn: 'Gongju, South Korea', lat: 36.4556, lng: 127.1190, country: 'KR' },
    { name: '보령, 대한민국', nameEn: 'Boryeong, South Korea', lat: 36.3334, lng: 126.6127, country: 'KR' },
    { name: '아산, 대한민국', nameEn: 'Asan, South Korea', lat: 36.7890, lng: 127.0017, country: 'KR' },
    { name: '서산, 대한민국', nameEn: 'Seosan, South Korea', lat: 36.7849, lng: 126.4503, country: 'KR' },
    { name: '논산, 대한민국', nameEn: 'Nonsan, South Korea', lat: 36.1872, lng: 127.0988, country: 'KR' },
    { name: '계룡, 대한민국', nameEn: 'Gyeryong, South Korea', lat: 36.2756, lng: 127.2487, country: 'KR' },
    { name: '당진, 대한민국', nameEn: 'Dangjin, South Korea', lat: 36.8938, lng: 126.6298, country: 'KR' },

    // 전라북도
    { name: '전주, 대한민국', nameEn: 'Jeonju, South Korea', lat: 35.8242, lng: 127.1480, country: 'KR' },
    { name: '군산, 대한민국', nameEn: 'Gunsan, South Korea', lat: 35.9677, lng: 126.7367, country: 'KR' },
    { name: '익산, 대한민국', nameEn: 'Iksan, South Korea', lat: 35.9483, lng: 126.9576, country: 'KR' },
    { name: '정읍, 대한민국', nameEn: 'Jeongeup, South Korea', lat: 35.5698, lng: 126.8559, country: 'KR' },
    { name: '남원, 대한민국', nameEn: 'Namwon, South Korea', lat: 35.4164, lng: 127.3900, country: 'KR' },
    { name: '김제, 대한민국', nameEn: 'Gimje, South Korea', lat: 35.8036, lng: 126.8808, country: 'KR' },

    // 전라남도
    { name: '목포, 대한민국', nameEn: 'Mokpo, South Korea', lat: 34.8118, lng: 126.3922, country: 'KR' },
    { name: '여수, 대한민국', nameEn: 'Yeosu, South Korea', lat: 34.7604, lng: 127.6622, country: 'KR' },
    { name: '순천, 대한민국', nameEn: 'Suncheon, South Korea', lat: 34.9506, lng: 127.4872, country: 'KR' },
    { name: '나주, 대한민국', nameEn: 'Naju, South Korea', lat: 35.0158, lng: 126.7108, country: 'KR' },
    { name: '광양, 대한민국', nameEn: 'Gwangyang, South Korea', lat: 34.9407, lng: 127.6959, country: 'KR' },

    // 경상북도
    { name: '포항, 대한민국', nameEn: 'Pohang, South Korea', lat: 36.0190, lng: 129.3435, country: 'KR' },
    { name: '경주, 대한민국', nameEn: 'Gyeongju, South Korea', lat: 35.8562, lng: 129.2247, country: 'KR' },
    { name: '김천, 대한민국', nameEn: 'Gimcheon, South Korea', lat: 36.1398, lng: 128.1136, country: 'KR' },
    { name: '안동, 대한민국', nameEn: 'Andong, South Korea', lat: 36.5684, lng: 128.7294, country: 'KR' },
    { name: '구미, 대한민국', nameEn: 'Gumi, South Korea', lat: 36.1195, lng: 128.3446, country: 'KR' },
    { name: '영주, 대한민국', nameEn: 'Yeongju, South Korea', lat: 36.8057, lng: 128.6241, country: 'KR' },
    { name: '영천, 대한민국', nameEn: 'Yeongcheon, South Korea', lat: 35.9733, lng: 128.9389, country: 'KR' },
    { name: '상주, 대한민국', nameEn: 'Sangju, South Korea', lat: 36.4109, lng: 128.1590, country: 'KR' },
    { name: '문경, 대한민국', nameEn: 'Mungyeong, South Korea', lat: 36.5864, lng: 128.1860, country: 'KR' },
    { name: '경산, 대한민국', nameEn: 'Gyeongsan, South Korea', lat: 35.8251, lng: 128.7417, country: 'KR' },

    // 경상남도
    { name: '창원, 대한민국', nameEn: 'Changwon, South Korea', lat: 35.2281, lng: 128.6811, country: 'KR' },
    { name: '진주, 대한민국', nameEn: 'Jinju, South Korea', lat: 35.1799, lng: 128.1076, country: 'KR' },
    { name: '통영, 대한민국', nameEn: 'Tongyeong, South Korea', lat: 34.8544, lng: 128.4332, country: 'KR' },
    { name: '사천, 대한민국', nameEn: 'Sacheon, South Korea', lat: 35.0039, lng: 128.0646, country: 'KR' },
    { name: '김해, 대한민국', nameEn: 'Gimhae, South Korea', lat: 35.2285, lng: 128.8894, country: 'KR' },
    { name: '밀양, 대한민국', nameEn: 'Miryang, South Korea', lat: 35.4932, lng: 128.7489, country: 'KR' },
    { name: '거제, 대한민국', nameEn: 'Geoje, South Korea', lat: 34.8806, lng: 128.6210, country: 'KR' },
    { name: '양산, 대한민국', nameEn: 'Yangsan, South Korea', lat: 35.3350, lng: 129.0370, country: 'KR' },

    // 제주특별자치도
    { name: '제주, 대한민국', nameEn: 'Jeju, South Korea', lat: 33.4996, lng: 126.5312, country: 'KR' },
    { name: '서귀포, 대한민국', nameEn: 'Seogwipo, South Korea', lat: 33.2533, lng: 126.5618, country: 'KR' },


    // 🇯🇵 일본
    { name: '札幌, 日本', nameEn: 'Sapporo, Japan', lat: 43.0618, lng: 141.3545, country: 'JP' },
    { name: '函館, 日本', nameEn: 'Hakodate, Japan', lat: 41.7688, lng: 140.7288, country: 'JP' },
    { name: '旭川, 日本', nameEn: 'Asahikawa, Japan', lat: 43.7706, lng: 142.3650, country: 'JP' },
    { name: '室蘭, 日本', nameEn: 'Muroran, Japan', lat: 42.3152, lng: 140.9730, country: 'JP' },
    { name: '釧路, 日本', nameEn: 'Kushiro, Japan', lat: 42.9849, lng: 144.3814, country: 'JP' },
    { name: '帯広, 日本', nameEn: 'Obihiro, Japan', lat: 42.9233, lng: 143.1967, country: 'JP' },
    { name: '北見, 日本', nameEn: 'Kitami, Japan', lat: 43.8031, lng: 143.8958, country: 'JP' },
    { name: '夕張, 日本', nameEn: 'Yubari, Japan', lat: 43.0563, lng: 141.9756, country: 'JP' },
    { name: '岩見沢, 日本', nameEn: 'Iwamizawa, Japan', lat: 43.1961, lng: 141.7584, country: 'JP' },
    { name: '網走, 日本', nameEn: 'Abashiri, Japan', lat: 44.0206, lng: 144.2736, country: 'JP' },
    { name: '留萌, 日本', nameEn: 'Rumoi, Japan', lat: 43.9344, lng: 141.6424, country: 'JP' },
    { name: '苫小牧, 日本', nameEn: 'Tomakomai, Japan', lat: 42.6345, lng: 141.6030, country: 'JP' },
    { name: '稚内, 日本', nameEn: 'Wakkanai, Japan', lat: 45.4094, lng: 141.6739, country: 'JP' },
    { name: '美唄, 日本', nameEn: 'Bibai, Japan', lat: 43.3333, lng: 141.8586, country: 'JP' },
    { name: '芦別, 日本', nameEn: 'Ashibetsu, Japan', lat: 43.5189, lng: 142.1858, country: 'JP' },
    { name: '江別, 日本', nameEn: 'Ebetsu, Japan', lat: 43.1106, lng: 141.5364, country: 'JP' },
    { name: '赤平, 日本', nameEn: 'Akabira, Japan', lat: 43.5583, lng: 142.0464, country: 'JP' },
    { name: '紋別, 日本', nameEn: 'Monbetsu, Japan', lat: 44.3560, lng: 143.3544, country: 'JP' },
    { name: '士別, 日本', nameEn: 'Shibetsu, Japan', lat: 44.1786, lng: 142.4000, country: 'JP' },
    { name: '名寄, 日本', nameEn: 'Nayoro, Japan', lat: 44.3506, lng: 142.4578, country: 'JP' },
    { name: '三笠, 日本', nameEn: 'Mikasa, Japan', lat: 43.2444, lng: 141.8711, country: 'JP' },
    { name: '根室, 日本', nameEn: 'Nemuro, Japan', lat: 43.3236, lng: 145.5742, country: 'JP' },
    { name: '千歳, 日本', nameEn: 'Chitose, Japan', lat: 42.8208, lng: 141.6525, country: 'JP' },
    { name: '滝川, 日本', nameEn: 'Takikawa, Japan', lat: 43.5578, lng: 141.9069, country: 'JP' },
    { name: '砂川, 日本', nameEn: 'Sunagawa, Japan', lat: 43.4911, lng: 141.9064, country: 'JP' },
    { name: '歌志内, 日本', nameEn: 'Utashinai, Japan', lat: 43.5164, lng: 142.0361, country: 'JP' },
    { name: '深川, 日本', nameEn: 'Fukagawa, Japan', lat: 43.7197, lng: 142.0408, country: 'JP' },
    { name: '富良野, 日本', nameEn: 'Furano, Japan', lat: 43.3422, lng: 142.3833, country: 'JP' },
    { name: '登別, 日本', nameEn: 'Noboribetsu, Japan', lat: 42.4126, lng: 141.1065, country: 'JP' },
    { name: '恵庭, 日本', nameEn: 'Eniwa, Japan', lat: 42.8803, lng: 141.5750, country: 'JP' },
    { name: '伊達(北海道), 日本', nameEn: 'Date (Hokkaido), Japan', lat: 42.4681, lng: 140.8689, country: 'JP' },
    { name: '北広島, 日本', nameEn: 'Kitahiroshima, Japan', lat: 42.9858, lng: 141.5616, country: 'JP' },
    { name: '石狩, 日本', nameEn: 'Ishikari, Japan', lat: 43.1644, lng: 141.3150, country: 'JP' },
    { name: '北斗, 日本', nameEn: 'Hokuto (Hokkaido), Japan', lat: 41.8167, lng: 140.6533, country: 'JP' },


    // 🇨🇳 중국
    { name: '北京, 中国', nameEn: 'Beijing, China', lat: 39.9042, lng: 116.4074, country: 'CN' },
    { name: '上海, 中国', nameEn: 'Shanghai, China', lat: 31.2304, lng: 121.4737, country: 'CN' },
    { name: '天津, 中国', nameEn: 'Tianjin, China', lat: 39.3434, lng: 117.3616, country: 'CN' },
    { name: '重庆, 中国', nameEn: 'Chongqing, China', lat: 29.4316, lng: 106.9123, country: 'CN' },
    { name: '石家庄, 中国', nameEn: 'Shijiazhuang, China', lat: 38.0428, lng: 114.5149, country: 'CN' },
    { name: '唐山, 中国', nameEn: 'Tangshan, China', lat: 39.6309, lng: 118.1802, country: 'CN' },
    { name: '秦皇岛, 中国', nameEn: 'Qinhuangdao, China', lat: 39.9354, lng: 119.6005, country: 'CN' },
    { name: '邯郸, 中国', nameEn: 'Handan, China', lat: 36.6256, lng: 114.5391, country: 'CN' },
    { name: '邢台, 中国', nameEn: 'Xingtai, China', lat: 37.0706, lng: 114.5048, country: 'CN' },
    { name: '保定, 中国', nameEn: 'Baoding, China', lat: 38.8745, lng: 115.4646, country: 'CN' },
    { name: '张家口, 中国', nameEn: 'Zhangjiakou, China', lat: 40.8244, lng: 114.8875, country: 'CN' },
    { name: '承德, 中国', nameEn: 'Chengde, China', lat: 40.9515, lng: 117.9634, country: 'CN' },
    { name: '沧州, 中国', nameEn: 'Cangzhou, China', lat: 38.3044, lng: 116.8388, country: 'CN' },
    { name: '廊坊, 中国', nameEn: 'Langfang, China', lat: 39.5370, lng: 116.6835, country: 'CN' },
    { name: '衡水, 中国', nameEn: 'Hengshui, China', lat: 37.7389, lng: 115.6702, country: 'CN' },
    { name: '太原, 中国', nameEn: 'Taiyuan, China', lat: 37.8706, lng: 112.5489, country: 'CN' },
    { name: '大同, 中国', nameEn: 'Datong, China', lat: 40.0768, lng: 113.3001, country: 'CN' },
    { name: '阳泉, 中国', nameEn: 'Yangquan, China', lat: 37.8570, lng: 113.5767, country: 'CN' },
    { name: '长治, 中国', nameEn: 'Changzhi, China', lat: 36.1954, lng: 113.1163, country: 'CN' },
    { name: '晋城, 中国', nameEn: 'Jincheng, China', lat: 35.4907, lng: 112.8513, country: 'CN' },
    { name: '朔州, 中国', nameEn: 'Shuozhou, China', lat: 39.3312, lng: 112.4333, country: 'CN' },
    { name: '晋中, 中国', nameEn: 'Jinzhong, China', lat: 37.6870, lng: 112.7529, country: 'CN' },
    { name: '运城, 中国', nameEn: 'Yuncheng, China', lat: 35.0263, lng: 111.0069, country: 'CN' },
    { name: '忻州, 中国', nameEn: 'Xinzhou, China', lat: 38.4167, lng: 112.7342, country: 'CN' },
    { name: '临汾, 中国', nameEn: 'Linfen, China', lat: 36.0880, lng: 111.5189, country: 'CN' },
    { name: '吕梁, 中国', nameEn: 'Luliang, China', lat: 37.5193, lng: 111.1445, country: 'CN' },
    { name: '呼和浩特, 中国', nameEn: 'Hohhot, China', lat: 40.8426, lng: 111.7492, country: 'CN' },
    { name: '包头, 中国', nameEn: 'Baotou, China', lat: 40.6574, lng: 109.8403, country: 'CN' },
    { name: '乌海, 中国', nameEn: 'Wuhai, China', lat: 39.6538, lng: 106.8228, country: 'CN' },
    { name: '赤峰, 中国', nameEn: 'Chifeng, China', lat: 42.2578, lng: 118.8889, country: 'CN' },
    { name: '通辽, 中国', nameEn: 'Tongliao, China', lat: 43.6525, lng: 122.2433, country: 'CN' },
    { name: '鄂尔多斯, 中国', nameEn: 'Ordos, China', lat: 39.6086, lng: 109.7813, country: 'CN' },
    { name: '呼伦贝尔, 中国', nameEn: 'Hulunbuir, China', lat: 49.2116, lng: 119.7657, country: 'CN' },
    { name: '巴彦淖尔, 中国', nameEn: 'Bayannur, China', lat: 40.7433, lng: 107.3877, country: 'CN' },
    { name: '乌兰察布, 中国', nameEn: 'Ulanqab, China', lat: 41.0341, lng: 113.1128, country: 'CN' },






    // 🇺🇸 미국
    { name: 'Montgomery, USA', nameEn: 'Montgomery, USA', lat: 32.3792, lng: -86.3077, country: 'US' },
    { name: 'Juneau, USA', nameEn: 'Juneau, USA', lat: 58.3019, lng: -134.4197, country: 'US' },
    { name: 'Phoenix, USA', nameEn: 'Phoenix, USA', lat: 33.4484, lng: -112.0740, country: 'US' },
    { name: 'Little Rock, USA', nameEn: 'Little Rock, USA', lat: 34.7465, lng: -92.2896, country: 'US' },
    { name: 'Sacramento, USA', nameEn: 'Sacramento, USA', lat: 38.5816, lng: -121.4944, country: 'US' },
    { name: 'Denver, USA', nameEn: 'Denver, USA', lat: 39.7392, lng: -104.9903, country: 'US' },
    { name: 'Hartford, USA', nameEn: 'Hartford, USA', lat: 41.7658, lng: -72.6734, country: 'US' },
    { name: 'Dover, USA', nameEn: 'Dover, USA', lat: 39.1582, lng: -75.5244, country: 'US' },
    { name: 'Tallahassee, USA', nameEn: 'Tallahassee, USA', lat: 30.4383, lng: -84.2807, country: 'US' },
    { name: 'Atlanta, USA', nameEn: 'Atlanta, USA', lat: 33.7490, lng: -84.3880, country: 'US' },
    { name: 'Honolulu, USA', nameEn: 'Honolulu, USA', lat: 21.3069, lng: -157.8583, country: 'US' },
    { name: 'Boise, USA', nameEn: 'Boise, USA', lat: 43.6150, lng: -116.2023, country: 'US' },
    { name: 'Springfield, USA', nameEn: 'Springfield (Illinois), USA', lat: 39.7817, lng: -89.6501, country: 'US' },
    { name: 'Indianapolis, USA', nameEn: 'Indianapolis, USA', lat: 39.7684, lng: -86.1581, country: 'US' },
    { name: 'Des Moines, USA', nameEn: 'Des Moines, USA', lat: 41.5868, lng: -93.6250, country: 'US' },
    { name: 'Topeka, USA', nameEn: 'Topeka, USA', lat: 39.0473, lng: -95.6752, country: 'US' },
    { name: 'Frankfort, USA', nameEn: 'Frankfort, USA', lat: 38.2009, lng: -84.8733, country: 'US' },
    { name: 'Baton Rouge, USA', nameEn: 'Baton Rouge, USA', lat: 30.4515, lng: -91.1871, country: 'US' },
    { name: 'Augusta, USA', nameEn: 'Augusta (Maine), USA', lat: 44.3106, lng: -69.7795, country: 'US' },
    { name: 'Annapolis, USA', nameEn: 'Annapolis, USA', lat: 38.9784, lng: -76.4922, country: 'US' },
    { name: 'Boston, USA', nameEn: 'Boston, USA', lat: 42.3601, lng: -71.0589, country: 'US' },
    { name: 'Lansing, USA', nameEn: 'Lansing, USA', lat: 42.7325, lng: -84.5555, country: 'US' },
    { name: 'Saint Paul, USA', nameEn: 'Saint Paul, USA', lat: 44.9537, lng: -93.0900, country: 'US' },
    { name: 'Jackson, USA', nameEn: 'Jackson (Mississippi), USA', lat: 32.2988, lng: -90.1848, country: 'US' },
    { name: 'Jefferson City, USA', nameEn: 'Jefferson City, USA', lat: 38.5767, lng: -92.1735, country: 'US' },
    { name: 'Helena, USA', nameEn: 'Helena, USA', lat: 46.5884, lng: -112.0245, country: 'US' },
    { name: 'Lincoln, USA', nameEn: 'Lincoln (Nebraska), USA', lat: 40.8136, lng: -96.7026, country: 'US' },
    { name: 'Carson City, USA', nameEn: 'Carson City, USA', lat: 39.1638, lng: -119.7674, country: 'US' },
    { name: 'Concord, USA', nameEn: 'Concord (New Hampshire), USA', lat: 43.2081, lng: -71.5376, country: 'US' },
    { name: 'Trenton, USA', nameEn: 'Trenton, USA', lat: 40.2206, lng: -74.7597, country: 'US' },
    { name: 'Santa Fe, USA', nameEn: 'Santa Fe, USA', lat: 35.6870, lng: -105.9378, country: 'US' },
    { name: 'Albany, USA', nameEn: 'Albany (New York), USA', lat: 42.6526, lng: -73.7562, country: 'US' },
    { name: 'Raleigh, USA', nameEn: 'Raleigh, USA', lat: 35.7796, lng: -78.6382, country: 'US' },
    { name: 'Bismarck, USA', nameEn: 'Bismarck, USA', lat: 46.8083, lng: -100.7837, country: 'US' },
    { name: 'Columbus, USA', nameEn: 'Columbus (Ohio), USA', lat: 39.9612, lng: -82.9988, country: 'US' },
    { name: 'Oklahoma City, USA', nameEn: 'Oklahoma City, USA', lat: 35.4676, lng: -97.5164, country: 'US' },
    { name: 'Salem, USA', nameEn: 'Salem (Oregon), USA', lat: 44.9429, lng: -123.0351, country: 'US' },
    { name: 'Harrisburg, USA', nameEn: 'Harrisburg, USA', lat: 40.2732, lng: -76.8867, country: 'US' },
    { name: 'Providence, USA', nameEn: 'Providence, USA', lat: 41.8240, lng: -71.4128, country: 'US' },
    { name: 'Columbia, USA', nameEn: 'Columbia (South Carolina), USA', lat: 34.0007, lng: -81.0348, country: 'US' },
    { name: 'Pierre, USA', nameEn: 'Pierre, USA', lat: 44.3683, lng: -100.3510, country: 'US' },
    { name: 'Nashville, USA', nameEn: 'Nashville, USA', lat: 36.1627, lng: -86.7816, country: 'US' },
    { name: 'Austin, USA', nameEn: 'Austin, USA', lat: 30.2672, lng: -97.7431, country: 'US' },
    { name: 'Salt Lake City, USA', nameEn: 'Salt Lake City, USA', lat: 40.7608, lng: -111.8910, country: 'US' },
    { name: 'Montpelier, USA', nameEn: 'Montpelier, USA', lat: 44.2601, lng: -72.5754, country: 'US' },
    { name: 'Richmond, USA', nameEn: 'Richmond (Virginia), USA', lat: 37.5407, lng: -77.4360, country: 'US' },
    { name: 'Olympia, USA', nameEn: 'Olympia, USA', lat: 47.0379, lng: -122.9007, country: 'US' },
    { name: 'Charleston, USA', nameEn: 'Charleston (West Virginia), USA', lat: 38.3498, lng: -81.6326, country: 'US' },
    { name: 'Madison, USA', nameEn: 'Madison, USA', lat: 43.0731, lng: -89.4012, country: 'US' },
    { name: 'Cheyenne, USA', nameEn: 'Cheyenne, USA', lat: 41.1400, lng: -104.8202, country: 'US' },


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
