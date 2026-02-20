/* ===========================
   Fortune Guardrail Test Cases
   ===========================
   
   Usage: npx tsx src/lib/ai/guardrail.test.ts
   
   20개 수동 검증 케이스 (허용 10 + 차단 10)
*/

import { isFortuneQuery } from './guardrail';

interface TestCase {
    input: string;
    locale: string;
    expectedAllowed: boolean;
    description: string;
}

const testCases: TestCase[] = [
    // ===== 허용 케이스 (10개) =====
    { input: '오늘의 운세를 알려주세요', locale: 'ko', expectedAllowed: true, description: '한국어 운세 직접 요청' },
    { input: '내 사주 좀 봐줘', locale: 'ko', expectedAllowed: true, description: '한국어 사주 요청' },
    { input: '타로 카드 3장 뽑아줘', locale: 'ko', expectedAllowed: true, description: '한국어 타로 요청' },
    { input: '사자자리 이번주 운세', locale: 'ko', expectedAllowed: true, description: '한국어 별자리 운세' },
    { input: '올해 재물운이 어떤가요?', locale: 'ko', expectedAllowed: true, description: '한국어 재물운 질문' },
    { input: 'What is my horoscope today?', locale: 'en', expectedAllowed: true, description: '영어 호로스코프 요청' },
    { input: 'Do a tarot reading for me', locale: 'en', expectedAllowed: true, description: '영어 타로 리딩 요청' },
    { input: '今日の運勢を教えてください', locale: 'ja', expectedAllowed: true, description: '일본어 운세 요청' },
    { input: 'Is Leo compatible with Scorpio?', locale: 'en', expectedAllowed: true, description: '영어 궁합 질문' },
    { input: '내 오행 분석해줘', locale: 'ko', expectedAllowed: true, description: '한국어 오행 분석' },

    // ===== 차단 케이스 (10개) =====
    { input: '자바스크립트로 투두리스트 만들어줘', locale: 'ko', expectedAllowed: false, description: '한국어 코딩 요청' },
    { input: 'Write me a Python function', locale: 'en', expectedAllowed: false, description: '영어 프로그래밍 요청' },
    { input: '미분 방정식 풀어줘', locale: 'ko', expectedAllowed: false, description: '한국어 수학 질문' },
    { input: 'What caused World War II?', locale: 'en', expectedAllowed: false, description: '영어 역사 질문' },
    { input: '김치찌개 레시피 알려줘', locale: 'ko', expectedAllowed: false, description: '한국어 요리 레시피' },
    { input: 'Translate this to Spanish', locale: 'en', expectedAllowed: false, description: '영어 번역 요청' },
    { input: 'React와 Vue 비교해줘', locale: 'ko', expectedAllowed: false, description: '한국어 프레임워크 비교' },
    { input: '処方箋の書き方を教えて', locale: 'ja', expectedAllowed: false, description: '일본어 의료 질문' },
    { input: 'How to file a lawsuit', locale: 'en', expectedAllowed: false, description: '영어 법률 질문' },
    { input: 'Firebase 데이터베이스 설정 방법', locale: 'ko', expectedAllowed: false, description: '한국어 IT 설정' },
];

// ==========================
// 테스트 실행
// ==========================
let passed = 0;
let failed = 0;

console.log('\n🔮 Fortune Guardrail Test\n');
console.log('='.repeat(60));

for (const tc of testCases) {
    const result = isFortuneQuery(tc.input, tc.locale);
    const ok = result.allowed === tc.expectedAllowed;

    if (ok) {
        passed++;
        console.log(`  ✅ ${tc.description}`);
    } else {
        failed++;
        console.log(`  ❌ ${tc.description}`);
        console.log(`     Input: "${tc.input}"`);
        console.log(`     Expected: ${tc.expectedAllowed ? 'ALLOWED' : 'BLOCKED'}`);
        console.log(`     Got: ${result.allowed ? 'ALLOWED' : 'BLOCKED'} ${result.reason ? `(${result.reason.substring(0, 40)}...)` : ''}`);
    }
}

console.log('\n' + '='.repeat(60));
console.log(`  Results: ${passed} passed, ${failed} failed, ${testCases.length} total`);
console.log('='.repeat(60) + '\n');

if (failed > 0) {
    process.exit(1);
}
