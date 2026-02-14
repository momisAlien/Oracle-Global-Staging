# 토스페이먼츠 연동 가이드

## 공식 문서 URL

| 문서 | URL |
|------|-----|
| LLM 가이드 | https://docs.tosspayments.com/guides/v2/get-started/llms-guide |
| 위젯 연동 | https://docs.tosspayments.com/guides/v2/payment-widget/integration |
| JS SDK | https://docs.tosspayments.com/sdk/v2/js |
| 관리자 가이드 | https://docs.tosspayments.com/guides/v2/payment-widget/admin |
| API 레퍼런스 | https://docs.tosspayments.com/reference |

## 환경변수

`.env.local`에 다음 키를 설정하세요:

```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxx
TOSS_SECRET_KEY=test_sk_xxxx
```

## 파일 구조

```
src/lib/payments/
├── types.ts           # 결제 공통 인터페이스
├── index.ts           # 프로바이더 팩토리
└── toss/
    ├── config.ts      # 환경변수 + 키 검증
    ├── verify.ts      # 결제 승인 + 웹훅 검증
    ├── provider.ts    # IPaymentProvider 구현
    └── README.md      # 이 파일
```

## 키 미설정 시 동작

- UI: "결제 준비 중 (키 미설정)" 배너 표시, 결제 버튼 비활성화
- API: 503 응답 + "토스페이먼츠 키가 설정되지 않았습니다" 메시지
