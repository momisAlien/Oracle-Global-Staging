# Oracle Global — 다국어 프리미엄 운세 플랫폼

> 동양과 서양의 지혜가 만나는 AI 강화 운세 플랫폼

## 🌍 지원 언어

- 🇰🇷 한국어 (ko) — 사주 우선
- 🇯🇵 日本語 (ja) — 타로 우선
- 🇺🇸 English (en) — 점성술 우선
- 🇨🇳 中文 (zh) — 점성술 우선

## 🚀 시작하기

```bash
# 환경변수 설정
cp .env.local.example .env.local
# 값 채우기 (Toss 키, Firebase, OpenAI 등)

# 개발 서버
npm run dev
```

## 💰 결제 연동

### 토스페이먼츠 (1순위)

| 문서 | URL |
|------|-----|
| LLM 가이드 | https://docs.tosspayments.com/guides/v2/get-started/llms-guide |
| 위젯 연동 | https://docs.tosspayments.com/guides/v2/payment-widget/integration |
| JS SDK | https://docs.tosspayments.com/sdk/v2/js |
| 관리자 | https://docs.tosspayments.com/guides/v2/payment-widget/admin |
| API 레퍼런스 | https://docs.tosspayments.com/reference |

**키 미설정 시 동작:**
- UI: "결제 준비 중" 배너 표시, 버튼 비활성화
- API: 503 + 명확한 에러 메시지

### Stripe / PayPal (Phase 2)
Stripe, PayPal 연동은 PaymentProvider 인터페이스 기반으로 확장 예정

## 🏗 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/           # 로케일 라우팅
│   │   ├── astrology/
│   │   ├── saju/
│   │   ├── tarot/
│   │   ├── synthesis/
│   │   ├── pricing/
│   │   ├── checkout/toss/
│   │   └── account/
│   └── api/
│       ├── interpret/      # AI 해석 (쿼터+라우팅)
│       └── payments/toss/  # 결제 API
├── i18n/messages/          # ko, ja, en, zh
├── lib/
│   ├── tiers/              # 티어 정의 + 가격
│   ├── time/               # KST 유틸
│   └── payments/           # 결제 프로바이더
└── styles/globals.css      # 디자인 시스템
```

## ⏰ 일일 리셋

Free 티어 일일 5회 제한은 **KST(Asia/Seoul) 자정** 기준으로 서버에서만 처리됩니다.

## ⚖️ 면책

> 본 서비스는 오락 및 개인적 성찰 목적으로만 제공됩니다.
