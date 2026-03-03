'use client';

import { useParams } from 'next/navigation';

const CONTENT: Record<string, { title: string; body: string }> = {
    ko: {
        title: '문의하기',
        body: `
## 고객 지원

질문, 제안, 문제가 있으시면 아래 이메일로 연락해 주세요.

**📧 이메일:** [support@tarotaihub.com](mailto:support@tarotaihub.com)

**⏱ 응답 시간:** 영업일 기준 24~72시간 이내

---

## 자주 묻는 질문

### 💳 결제 관련
- 구독 취소는 마이페이지에서 가능합니다.
- 결제 문제가 발생하면 결제 수단 정보와 함께 이메일로 문의해 주세요.

### 🐛 버그/오류 신고
- 오류가 발생한 페이지, 사용 기기, 브라우저 정보를 포함해 주세요.
- 스크린샷을 첨부하시면 더 빠른 해결이 가능합니다.

### 💡 기능 제안
- 새로운 기능이나 개선 사항에 대한 제안은 언제든 환영합니다!

### 🔒 개인정보/데이터 삭제 요청
- 개인정보 관련 요청 시 이메일 제목에 **"Privacy Request"**를 포함해 주세요.
- 예: 데이터 접근, 수정, 삭제 요청

---

저희는 여러분의 소중한 의견을 기다립니다. 더 나은 서비스를 위해 항상 노력하겠습니다.
`,
    },
    ja: {
        title: 'お問い合わせ',
        body: `
## カスタマーサポート

ご質問、ご提案、お困りの点がございましたら、下記メールアドレスまでお気軽にお問い合わせください。

**📧 メール:** [support@tarotaihub.com](mailto:support@tarotaihub.com)

**⏱ 回答時間:** 営業日の24〜72時間以内

---

## よくあるご質問

### 💳 お支払いについて
- サブスクリプションの解約はマイページから行えます。
- お支払いの問題が発生した場合は、お支払い方法の詳細とともにメールでお問い合わせください。

### 🐛 バグ/エラーの報告
- エラーが発生したページ、ご使用のデバイス、ブラウザ情報をお知らせください。
- スクリーンショットを添付していただくと、より迅速な対応が可能です。

### 💡 機能のご提案
- 新しい機能や改善に関するご提案はいつでも歓迎しております！

### 🔒 プライバシー/データ削除のリクエスト
- プライバシーに関するリクエストの場合、メールの件名に **「Privacy Request」** とご記入ください。
- 例：データへのアクセス、修正、削除のリクエスト

---

皆様の貴重なご意見をお待ちしております。より良いサービスの提供に努めてまいります。
`,
    },
    en: {
        title: 'Contact Us',
        body: `
## Customer Support

If you have questions, suggestions, or encounter any issues, please reach out to us.

**📧 Email:** [support@tarotaihub.com](mailto:support@tarotaihub.com)

**⏱ Response Time:** Within 24–72 business hours

---

## Frequently Asked Questions

### 💳 Billing
- You can cancel your subscription from your profile page.
- For payment issues, please email us with details of your payment method and the issue you encountered.

### 🐛 Bug Reports
- Please include the page where the error occurred, your device, and browser information.
- Screenshots help us resolve issues faster.

### 💡 Feature Suggestions
- We always welcome ideas for new features and improvements!

### 🔒 Privacy / Data Deletion Requests
- For privacy-related requests, please include **"Privacy Request"** in the email subject line.
- Examples: data access, correction, or deletion requests.

---

We value your feedback and are committed to improving our service. Don't hesitate to reach out!
`,
    },
    zh: {
        title: '联系我们',
        body: `
## 客户支持

如有任何问题、建议或遇到使用问题，请通过以下方式联系我们。

**📧 邮箱：** [support@tarotaihub.com](mailto:support@tarotaihub.com)

**⏱ 回复时间：** 24-72个工作小时内

---

## 常见问题

### 💳 付款相关
- 您可以在个人主页取消订阅。
- 如遇支付问题，请将支付方式详情通过邮件发送给我们。

### 🐛 错误反馈
- 请提供出现错误的页面、使用设备和浏览器信息。
- 附上截图可以帮助我们更快地解决问题。

### 💡 功能建议
- 我们随时欢迎您对新功能和改进的建议！

### 🔒 隐私/数据删除请求
- 如有隐私相关请求，请在邮件主题中注明 **"Privacy Request"**。
- 例如：数据访问、更正或删除请求。

---

感谢您的宝贵意见，我们将持续致力于提供更好的服务。
`,
    },
};

export default function ContactPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'en';
    const c = CONTENT[loc] || CONTENT.en;

    return (
        <section className="section">
            <div className="container legal-page">
                <h1 className="legal-title">{c.title}</h1>
                <div className="legal-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(c.body) }} />
            </div>
            <style>{LEGAL_STYLES}</style>
        </section>
    );
}

function markdownToHtml(md: string): string {
    return md
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<[htuola])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');
}

const LEGAL_STYLES = `
  .legal-page { max-width: 800px; }
  .legal-title { font-size: var(--text-3xl); font-weight: 800; margin-bottom: var(--space-6); background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .legal-body h2 { font-size: var(--text-xl); font-weight: 700; margin: var(--space-8) 0 var(--space-3); color: var(--color-text-primary); }
  .legal-body h3 { font-size: var(--text-lg); font-weight: 600; margin: var(--space-6) 0 var(--space-2); }
  .legal-body p { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-3); }
  .legal-body a { color: var(--color-accent-primary); }
  .legal-body a:hover { text-decoration: underline; }
  .legal-body ul { padding-left: var(--space-6); margin-bottom: var(--space-4); }
  .legal-body li { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-1); }
  .legal-body hr { border: none; border-top: 1px solid var(--color-border); margin: var(--space-6) 0; }
  .legal-body strong { color: var(--color-text-primary); }
`;
