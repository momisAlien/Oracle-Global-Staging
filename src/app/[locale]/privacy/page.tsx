'use client';

import { useParams } from 'next/navigation';

const CONTENT: Record<string, { title: string; updated: string; body: string }> = {
    ko: {
        title: '개인정보 처리방침',
        updated: '최종 수정: 2026-03-03',
        body: `
## 1. 데이터 컨트롤러
TarotAIHub ("서비스")는 [LEGAL_ENTITY_NAME]이(가) 운영합니다.
- **주소:** [BUSINESS_ADDRESS]
- **이메일:** support@tarotaihub.com

## 2. 수집하는 정보

| 유형 | 세부 사항 |
|------|-----------|
| 계정 정보 | 이메일 주소, 표시 이름, 프로필 사진 (소셜 로그인 시) |
| 사용자 입력 | 생년월일, 성별, 질문 내용 등 운세 분석에 사용되는 항목 |
| 이용 데이터 | 방문 페이지, 클릭, 접속 시간, 세션 정보 |
| 기기 정보 | IP 주소, 브라우저 유형, OS, 화면 해상도 |
| 쿠키/추적 | 하단 "쿠키" 항목 참조 |

## 3. 정보 이용 목적
- 서비스 제공 및 운영 (운세 분석, 계정 관리)
- 서비스 개선 및 분석
- 결제 처리 및 고객 지원
- 광고 표시 (무료 사용자)
- 법적 의무 준수

## 4. 쿠키 및 추적 기술
본 서비스는 다음의 쿠키 및 추적 기술을 사용합니다:
- **필수 쿠키:** 로그인 세션, 보안 등 서비스 운영에 필요
- **분석 쿠키:** Google Analytics 등을 통한 이용 패턴 분석
- **광고 쿠키:** Google AdSense를 통한 맞춤형/비맞춤형 광고 제공

귀하의 동의 상태에 따라 맞춤형 또는 비맞춤형 광고가 표시됩니다. **쿠키 설정**을 통해 언제든지 동의를 변경하거나 철회할 수 있습니다.

## 5. 제3자 서비스 제공업체

| 서비스 | 목적 | 처리 데이터 |
|--------|------|-------------|
| Google AdSense | 광고 제공 | 쿠키, 기기 정보, IP |
| Google Analytics | 이용 분석 | 이용 데이터, 기기 정보 |
| Firebase (Google) | 인증, 데이터베이스 | 계정 정보, 사용자 입력 |
| AWS (Amazon) | 웹 호스팅 | 서버 로그 |
| 결제 서비스 | 결제 처리 | 결제 정보 (직접 저장하지 않음) |

## 6. GDPR / UK GDPR / 스위스 FADP 상의 권리
EU/EEA, 영국, 스위스 거주자는 관련 법률에 따라 다음의 권리를 갖습니다:
- **접근권:** 본인 개인정보 사본 요청
- **정정권:** 부정확한 정보 수정 요청
- **삭제권:** 개인정보 삭제 요청 ("잊힐 권리")
- **처리 제한권:** 특정 상황에서 처리 제한 요청
- **이동권:** 구조화된 형식으로 정보 수령
- **이의 제기권:** 정당한 이익에 기반한 처리에 이의
- **동의 철회:** 동의에 기반한 처리의 효력을 향후부터 철회

법적 근거: 동의, 계약 이행, 정당한 이익 (서비스 개선 및 보안), 법적 의무.

해당 지역 감독 기관에 불만을 제기할 권리도 있습니다.

## 7. 국제 데이터 이전
귀하의 정보는 귀하의 거주 국가 이외의 서버에서 처리될 수 있습니다. 이 경우 적절한 보호 조치를 적용합니다.

## 8. 보관 기간
- 계정 정보: 계정 활성 기간 + 삭제 요청 후 30일
- 사용자 입력: 계정 삭제 시 함께 삭제
- 이용/기기 데이터: 최대 26개월

## 9. 보안
업계 표준 기술적·관리적 보안 조치를 적용합니다. 다만 인터넷을 통한 전송은 100% 안전을 보장할 수 없습니다.

## 10. 아동 개인정보
본 서비스는 만 16세 미만 아동을 대상으로 하지 않습니다. 아동의 개인정보가 수집된 사실을 인지할 경우 즉시 삭제합니다.

## 11. 변경 사항
본 방침은 수시로 업데이트될 수 있으며, 중요한 변경 시 서비스 내 공지를 통해 알려드립니다.

## 12. 문의
개인정보 관련 문의: **support@tarotaihub.com** (제목에 "Privacy Request" 기재)
`,
    },
    ja: {
        title: 'プライバシーポリシー',
        updated: '最終更新: 2026-03-03',
        body: `
## 1. データ管理者
TarotAIHub（「本サービス」）は [LEGAL_ENTITY_NAME] が運営しています。
- **住所:** [BUSINESS_ADDRESS]
- **メール:** support@tarotaihub.com

## 2. 収集する情報

| 種類 | 詳細 |
|------|------|
| アカウント情報 | メールアドレス、表示名、プロフィール写真（ソーシャルログイン時） |
| ユーザー入力 | 生年月日、性別、質問内容など占い分析に使用する項目 |
| 利用データ | 閲覧ページ、クリック、アクセス時間、セッション情報 |
| デバイス情報 | IPアドレス、ブラウザ種類、OS、画面解像度 |
| Cookie/トラッキング | 下記「Cookie」セクション参照 |

## 3. 情報の利用目的
- サービスの提供・運営（占い分析、アカウント管理）
- サービスの改善・分析
- 決済処理およびカスタマーサポート
- 広告表示（無料ユーザー向け）
- 法的義務の遵守

## 4. Cookieおよびトラッキング技術
本サービスでは以下のCookieおよびトラッキング技術を使用しています：
- **必須Cookie:** ログインセッション、セキュリティなどサービス運営に必要
- **分析Cookie:** Google Analyticsなどによる利用パターン分析
- **広告Cookie:** Google AdSenseによるパーソナライズド/非パーソナライズド広告の配信

同意の状況に応じてパーソナライズドまたは非パーソナライズド広告が表示されます。**Cookieの設定**からいつでも同意を変更・撤回できます。

## 5. 第三者サービスプロバイダー

| サービス | 目的 | 処理データ |
|----------|------|-----------|
| Google AdSense | 広告配信 | Cookie、デバイス情報、IP |
| Google Analytics | 利用分析 | 利用データ、デバイス情報 |
| Firebase (Google) | 認証、データベース | アカウント情報、ユーザー入力 |
| AWS (Amazon) | ウェブホスティング | サーバーログ |
| 決済サービス | 決済処理 | 決済情報（直接保存しません） |

## 6. GDPR / UK GDPR / スイスFADP上の権利
EU/EEA、英国、スイスにお住まいの方は、関連法に基づき以下の権利を有します：
- **アクセス権:** ご自身の個人データのコピーを要求する権利
- **訂正権:** 不正確な情報の訂正を要求する権利
- **削除権:** 個人データの削除を要求する権利（「忘れられる権利」）
- **処理制限権:** 特定の状況で処理の制限を要求する権利
- **ポータビリティ権:** 構造化された形式でデータを受領する権利
- **異議申立権:** 正当な利益に基づく処理に異議を唱える権利
- **同意撤回:** 同意に基づく処理を将来にわたり撤回する権利

法的根拠：同意、契約の履行、正当な利益（サービス改善・セキュリティ）、法的義務。

お住まいの地域の監督機関に苦情を申し立てる権利もあります。

## 7. 国際データ移転
お客様の情報は、お客様がお住まいの国以外のサーバーで処理される場合があります。その場合、適切な保護措置を講じます。

## 8. 保持期間
- アカウント情報：アカウント有効期間 + 削除要求後30日
- ユーザー入力：アカウント削除時に同時削除
- 利用/デバイスデータ：最長26ヶ月

## 9. セキュリティ
業界標準の技術的・管理的セキュリティ対策を講じています。ただしインターネットを通じた送信を100%安全と保証することはできません。

## 10. 子どものプライバシー
本サービスは16歳未満のお子様を対象としていません。お子様の個人情報が収集されたことが判明した場合は直ちに削除します。

## 11. 変更について
本ポリシーは随時更新される場合があります。重要な変更がある場合はサービス内でお知らせいたします。

## 12. お問い合わせ
個人情報に関するお問い合わせ：**support@tarotaihub.com**（件名に「Privacy Request」とご記入ください）
`,
    },
    en: {
        title: 'Privacy Policy',
        updated: 'Last updated: 2026-03-03',
        body: `
## 1. Data Controller
TarotAIHub (the "Service") is operated by [LEGAL_ENTITY_NAME].
- **Address:** [BUSINESS_ADDRESS]
- **Email:** support@tarotaihub.com

## 2. Information We Collect

| Type | Details |
|------|---------|
| Account Information | Email address, display name, profile picture (via social login) |
| User Input | Date of birth, gender, questions—used for fortune analysis |
| Usage Data | Pages viewed, clicks, access time, session information |
| Device Information | IP address, browser type, OS, screen resolution |
| Cookies/Tracking | See "Cookies" section below |

## 3. How We Use Your Information
- Providing and operating the Service (fortune analysis, account management)
- Improving and analyzing the Service
- Processing payments and customer support
- Displaying advertisements (free-tier users)
- Complying with legal obligations

## 4. Cookies and Tracking Technologies
This Service uses the following cookies and tracking technologies:
- **Essential Cookies:** Required for login sessions, security, and core functionality
- **Analytics Cookies:** Usage pattern analysis via Google Analytics or similar tools
- **Advertising Cookies:** Personalized or non-personalized ads served via Google AdSense

Depending on your consent status, you will see personalized or non-personalized ads. You may change or withdraw your consent at any time through **Cookie Settings**.

## 5. Third-Party Service Providers

| Service | Purpose | Data Processed |
|---------|---------|----------------|
| Google AdSense | Ad delivery | Cookies, device info, IP |
| Google Analytics | Usage analytics | Usage data, device info |
| Firebase (Google) | Authentication, database | Account info, user input |
| AWS (Amazon) | Web hosting | Server logs |
| Payment Processors | Payment processing | Payment info (not stored directly) |

## 6. Your Rights under GDPR / UK GDPR / Swiss FADP
If you reside in the EU/EEA, United Kingdom, or Switzerland, you have the following rights under applicable law:
- **Right of Access:** Request a copy of your personal data
- **Right to Rectification:** Request correction of inaccurate data
- **Right to Erasure:** Request deletion of your personal data ("right to be forgotten")
- **Right to Restrict Processing:** Request restriction of processing in certain circumstances
- **Right to Data Portability:** Receive your data in a structured format
- **Right to Object:** Object to processing based on legitimate interests
- **Withdraw Consent:** Withdraw consent for future processing at any time

Legal bases: consent, performance of a contract, legitimate interests (service improvement and security), and legal obligations.

You also have the right to lodge a complaint with your local supervisory authority.

## 7. International Data Transfers
Your information may be processed on servers located outside your country of residence. When this occurs, we apply appropriate safeguards, to the extent permitted by law.

## 8. Data Retention
- Account information: duration of active account + 30 days after deletion request
- User input: deleted upon account deletion
- Usage/device data: up to 26 months

## 9. Security
We apply industry-standard technical and organizational security measures. However, no method of transmission over the Internet is 100% secure.

## 10. Children's Privacy
This Service is not intended for children under the age of 16. If we become aware that personal data from a child has been collected, we will delete it promptly.

## 11. Changes to This Policy
We may update this policy from time to time. Material changes will be communicated through in-service notices.

## 12. Contact Us
For privacy-related inquiries: **support@tarotaihub.com** (please include "Privacy Request" in the subject line)
`,
    },
    zh: {
        title: '隐私政策',
        updated: '最后更新：2026-03-03',
        body: `
## 1. 数据控制者
TarotAIHub（"本服务"）由 [LEGAL_ENTITY_NAME] 运营。
- **地址：** [BUSINESS_ADDRESS]
- **邮箱：** support@tarotaihub.com

## 2. 我们收集的信息

| 类型 | 详情 |
|------|------|
| 账户信息 | 电子邮箱、显示名称、头像（通过社交登录时） |
| 用户输入 | 出生日期、性别、问题内容等用于运势分析的信息 |
| 使用数据 | 访问页面、点击、访问时间、会话信息 |
| 设备信息 | IP 地址、浏览器类型、操作系统、屏幕分辨率 |
| Cookie / 追踪 | 请参阅以下"Cookie"部分 |

## 3. 信息用途
- 提供和运营服务（运势分析、账户管理）
- 改进和分析服务
- 处理付款和客户支持
- 向免费用户展示广告
- 遵守法律义务

## 4. Cookie 和追踪技术
本服务使用以下 Cookie 和追踪技术：
- **必要 Cookie：** 登录会话、安全性及核心功能所需
- **分析 Cookie：** 通过 Google Analytics 等工具分析使用模式
- **广告 Cookie：** 通过 Google AdSense 提供个性化/非个性化广告

根据您的同意状态，将向您展示个性化或非个性化广告。您可以随时通过 **Cookie 设置** 更改或撤回同意。

## 5. 第三方服务提供商

| 服务 | 用途 | 处理的数据 |
|------|------|-----------|
| Google AdSense | 广告投放 | Cookie、设备信息、IP |
| Google Analytics | 使用分析 | 使用数据、设备信息 |
| Firebase (Google) | 身份验证、数据库 | 账户信息、用户输入 |
| AWS (Amazon) | 网站托管 | 服务器日志 |
| 支付服务 | 支付处理 | 支付信息（我们不直接存储） |

## 6. GDPR / UK GDPR / 瑞士 FADP 下的权利
如果您居住在欧盟/欧洲经济区、英国或瑞士，您根据相关法律享有以下权利：
- **访问权：** 请求获取您个人数据的副本
- **更正权：** 请求更正不准确的数据
- **删除权：** 请求删除您的个人数据（"被遗忘权"）
- **限制处理权：** 在特定情况下请求限制处理
- **数据可携权：** 以结构化格式接收您的数据
- **反对权：** 对基于合法利益的处理提出反对
- **撤回同意：** 随时撤回对未来处理的同意

法律依据：同意、合同履行、合法利益（服务改进和安全）、法律义务。

您还有权向当地监管机构提出投诉。

## 7. 国际数据传输
您的信息可能在您居住国以外的服务器上处理。在此情况下，我们会在法律允许的范围内采取适当的保护措施。

## 8. 数据保留
- 账户信息：账户活跃期间 + 删除请求后30天
- 用户输入：账户删除时一并删除
- 使用/设备数据：最长26个月

## 9. 安全措施
我们采用行业标准的技术和管理安全措施。但通过互联网传输的方式无法保证100%安全。

## 10. 儿童隐私
本服务不面向16岁以下的儿童。如果我们发现收集了儿童的个人信息，将立即删除。

## 11. 政策变更
我们可能会不时更新本政策。重大变更将通过服务内通知告知。

## 12. 联系我们
隐私相关问询请发送邮件至：**support@tarotaihub.com**（请在主题中注明"Privacy Request"）
`,
    },
};

export default function PrivacyPage() {
    const { locale } = useParams();
    const loc = (locale as string) || 'en';
    const c = CONTENT[loc] || CONTENT.en;

    return (
        <section className="section">
            <div className="container legal-page">
                <h1 className="legal-title">{c.title}</h1>
                <p className="legal-updated">{c.updated}</p>
                <div className="legal-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(c.body) }} />
            </div>
            <style>{LEGAL_STYLES}</style>
        </section>
    );
}

/* simple md → html (headings, tables, bold, lists, paragraphs) */
function markdownToHtml(md: string): string {
    return md
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\| (.+)/g, (_, row) => {
            const cells = row.split('|').map((c: string) => c.trim());
            const tag = cells.every((c: string) => /^-+$/.test(c)) ? null : 'td';
            if (!tag) return '';
            return '<tr>' + cells.map((c: string) => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
        })
        .replace(/(<tr>.*<\/tr>\n?)+/g, (table) => `<table>${table}</table>`)
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<[htuol])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');
}

const LEGAL_STYLES = `
  .legal-page { max-width: 800px; }
  .legal-title {
    font-size: var(--text-3xl);
    font-weight: 800;
    margin-bottom: var(--space-2);
    background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .legal-updated {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-8);
  }
  .legal-body h2 {
    font-size: var(--text-xl);
    font-weight: 700;
    margin: var(--space-8) 0 var(--space-3);
    color: var(--color-text-primary);
  }
  .legal-body h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: var(--space-6) 0 var(--space-2);
  }
  .legal-body p {
    color: var(--color-text-secondary);
    line-height: 1.8;
    margin-bottom: var(--space-3);
  }
  .legal-body ul {
    padding-left: var(--space-6);
    margin-bottom: var(--space-4);
  }
  .legal-body li {
    color: var(--color-text-secondary);
    line-height: 1.8;
    margin-bottom: var(--space-1);
  }
  .legal-body table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--space-4) 0;
    font-size: var(--text-sm);
  }
  .legal-body td {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }
  .legal-body tr:first-child td {
    background: var(--color-bg-glass);
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .legal-body strong {
    color: var(--color-text-primary);
  }
`;
