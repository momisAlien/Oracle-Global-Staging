'use client';

import { useParams } from 'next/navigation';

const CONTENT: Record<string, { title: string; updated: string; body: string }> = {
    ko: {
        title: '이용약관',
        updated: '최종 수정: 2026-03-03',
        body: `
## 1. 약관의 수락
TarotAIHub ("서비스")에 접속하거나 사용함으로써 귀하는 본 이용약관에 동의합니다. 동의하지 않는 경우 서비스를 이용하지 마십시오.

## 2. 오락 목적 고지
**본 서비스는 오락 및 개인적 성찰 목적으로만 제공됩니다.** AI 기반 운세, 타로, 점성술, 사주 분석은 의료, 법률, 심리, 금융 조언이 아닙니다. 분석 결과의 정확성이나 예측력을 보장하지 않으며, 모든 결정에 대한 책임은 사용자 본인에게 있습니다.

## 3. 이용 자격
서비스를 이용하려면 만 16세 이상이어야 합니다. 계정 등록 시 정확한 정보를 제공해야 하며, 계정 보안을 유지할 책임은 사용자에게 있습니다.

## 4. 유료 구독
### 결제 및 갱신
- 구독은 각 결제 주기(예: 월간) 시작 시 선불로 청구됩니다.
- 취소 시 현재 결제 주기가 종료될 때까지 서비스를 이용할 수 있으며, 다음 주기부터 갱신이 중지됩니다.

### 환불
- 현재 결제 주기 동안 서비스를 1회 이상 이용한 경우, 법률이 허용하는 범위 내에서 해당 주기 요금은 환불되지 않습니다.
- 부분 기간에 대한 일할 환불 또는 크레딧은 제공되지 않습니다.
- 법률에 의해 요구되거나 당사가 서면으로 명시적으로 동의한 경우는 예외입니다.
- 제3자 플랫폼(예: App Store, Google Play)을 통해 구매한 경우, 해당 플랫폼의 결제 및 환불 정책이 적용될 수 있습니다.

### 가격 및 요금제 변경
가격 또는 요금제 변경 시 사전에 공지합니다. 변경된 조건에 동의하지 않는 경우 다음 갱신 전에 구독을 취소할 수 있습니다.

### 세금
거주 지역에 따라 적용 가능한 세금이 추가될 수 있습니다.

## 5. 금지 행위
다음 행위는 금지됩니다:
- 서비스를 불법적 목적으로 사용
- 자동화 도구를 이용한 대량 접근 또는 스크래핑
- 타인을 사칭하거나 허위 정보 제공
- 서비스의 보안을 침해하거나 시도
- 다른 사용자의 서비스 이용을 방해

## 6. 지식재산권
서비스의 모든 콘텐츠, 디자인, 소프트웨어, 기술은 tarotaihub 또는 라이선스 제공자의 재산입니다. 귀하에게 서비스를 개인적·비상업적 목적으로 사용할 수 있는 제한적 라이선스가 부여됩니다.

## 7. 보증의 부인
법률이 허용하는 최대 범위 내에서, 서비스는 "있는 그대로" 그리고 "사용 가능한 그대로" 제공됩니다. 특정 목적 적합성, 상품성, 비침해에 대한 명시적 또는 묵시적 보증을 부인합니다.

## 8. 책임 제한
법률이 허용하는 최대 범위 내에서, 서비스 이용으로 인해 발생하는 간접적, 부수적, 결과적, 징벌적 손해에 대해 책임을 지지 않습니다.

## 9. 면책
귀하의 서비스 이용 또는 본 약관 위반으로 인해 발생하는 모든 청구, 손해, 비용으로부터 당사를 면책하는 데 동의합니다.

## 10. 분쟁 해결
본 약관에 관한 분쟁은 법률이 허용하는 범위 내에서 해당 관할 법원의 관할에 따릅니다. 분쟁 발생 시 먼저 support@tarotaihub.com으로 문의하여 원만한 해결을 시도해 주시기 바랍니다.

## 11. 약관 변경
본 약관은 수시로 업데이트될 수 있습니다. 중요한 변경 사항은 서비스 내 공지를 통해 알려드립니다. 변경 후 계속 서비스를 이용하시면 변경된 약관에 동의하는 것으로 간주합니다.

## 12. 문의
**support@tarotaihub.com**
`,
    },
    ja: {
        title: '利用規約',
        updated: '最終更新: 2026-03-03',
        body: `
## 1. 規約への同意
TarotAIHub（「本サービス」）にアクセスまたは利用することにより、本利用規約に同意したものとみなされます。同意できない場合は、サービスをご利用にならないでください。

## 2. エンターテインメント目的に関する告知
**本サービスはエンターテインメントおよび個人的な内省を目的としてのみ提供されています。** AI ベースの占い、タロット、占星術、四柱推命の分析は、医療、法律、心理、金融に関するアドバイスではありません。分析結果の正確性や予測力を保証するものではなく、すべての判断はご自身の責任で行ってください。

## 3. 利用資格
本サービスをご利用いただくには、16歳以上であることが条件です。アカウント登録時には正確な情報を提供する必要があり、アカウントのセキュリティを維持する責任はお客様にあります。

## 4. 有料サブスクリプション
### 請求と更新
- サブスクリプションは各請求サイクルの開始時（例：月次）に前払いで請求されます。
- 解約した場合、現在の請求サイクル終了までサービスをご利用いただけます。次のサイクルから更新が停止されます。

### 返金
- 現在の請求サイクル中にサービスを1回でもご利用になった場合、法律で認められる範囲において、当該サイクルの料金は返金対象外となります。
- 部分期間に対する日割り返金やクレジットは提供されません。
- 法律で義務付けられている場合、または当社が書面で明示的に同意した場合は除きます。
- 第三者プラットフォーム（例：App Store、Google Play）を通じて購入した場合は、そのプラットフォームの請求・返金ポリシーが適用される場合があります。

### 価格・プランの変更
価格またはプランの変更時は事前にお知らせいたします。変更された条件に同意できない場合は、次の更新前にサブスクリプションを解約できます。

### 税金
お住まいの地域に応じて適用される税金が加算される場合があります。

## 5. 禁止行為
以下の行為は禁止されています：
- 本サービスを違法な目的で使用すること
- 自動化ツールによる大量アクセスまたはスクレイピング
- 他者の身元を詐称したり虚偽の情報を提供すること
- サービスのセキュリティを侵害または侵害を試みること
- 他のユーザーのサービス利用を妨害すること

## 6. 知的財産権
サービスのすべてのコンテンツ、デザイン、ソフトウェア、技術は tarotaihub またはライセンス提供者の所有物です。お客様には個人的・非商用目的でサービスを使用する限定的なライセンスが付与されます。

## 7. 保証の否認
法律で認められる最大の範囲において、サービスは「現状のまま」かつ「利用可能な状態で」提供されます。特定目的への適合性、商品性、非侵害に関する明示的または黙示的保証を行いません。

## 8. 責任の制限
法律で認められる最大の範囲において、サービスの利用に起因するいかなる間接的、偶発的、結果的、懲罰的損害についても責任を負いません。

## 9. 免責
お客様のサービス利用または本規約違反に起因するすべての請求、損害、費用から当社を免責することに同意します。

## 10. 紛争解決
本規約に関する紛争は、法律が認める範囲内で管轄裁判所にて解決します。紛争が生じた場合はまず support@tarotaihub.com にご連絡いただき、円満な解決をお試しください。

## 11. 規約の変更
本規約は随時更新される場合があります。重要な変更はサービス内のお知らせにより通知いたします。変更後もサービスの利用を継続された場合は、変更後の規約に同意したものとみなされます。

## 12. お問い合わせ
**support@tarotaihub.com**
`,
    },
    en: {
        title: 'Terms of Service',
        updated: 'Last updated: 2026-03-03',
        body: `
## 1. Acceptance of Terms
By accessing or using TarotAIHub (the "Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.

## 2. Entertainment Disclaimer
**This Service is provided for entertainment and personal reflection purposes only.** AI-based fortune-telling, tarot, astrology, and saju analysis do not constitute medical, legal, psychological, or financial advice. We make no guarantees regarding the accuracy or predictive value of any analysis. All decisions you make based on the Service are your own responsibility.

## 3. Eligibility
You must be at least 16 years old to use the Service. You must provide accurate information when registering an account and are responsible for maintaining the security of your account.

## 4. Paid Subscriptions
### Billing and Renewal
- Subscriptions are billed in advance at the start of each billing cycle (e.g., monthly).
- If you cancel, you will retain access until the end of the current billing cycle; renewal stops from the next cycle.

### Refunds
- If you have used the Service at least once during the current billing cycle, charges for that cycle are non-refundable, to the extent permitted by law.
- No prorated refunds or credits are provided for partial periods.
- Exceptions apply where required by law or where we explicitly agree in writing.
- If purchased through a third-party platform (e.g., App Store, Google Play), that platform's billing and refund policies may apply.

### Price and Plan Changes
We will provide advance notice of any price or plan changes. If you do not agree with the updated terms, you may cancel your subscription before the next renewal.

### Taxes
Applicable taxes may be added depending on your jurisdiction.

## 5. Prohibited Conduct
The following activities are prohibited:
- Using the Service for any unlawful purpose
- Automated bulk access or scraping using bots or similar tools
- Impersonating another person or providing false information
- Attempting to breach or circumvent the Service's security
- Interfering with other users' use of the Service

## 6. Intellectual Property
All content, design, software, and technology in the Service are the property of tarotaihub or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes.

## 7. Disclaimer of Warranties
To the maximum extent permitted by law, the Service is provided "AS IS" and "AS AVAILABLE." We disclaim all warranties, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.

## 8. Limitation of Liability
To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from your use of the Service.

## 9. Indemnification
You agree to indemnify and hold us harmless from any claims, damages, and expenses arising out of your use of the Service or violation of these Terms.

## 10. Dispute Resolution
Any disputes relating to these Terms shall be subject to the jurisdiction of the competent courts, to the extent permitted by law. Before initiating formal proceedings, please contact us at support@tarotaihub.com to attempt an amicable resolution.

## 11. Changes to Terms
We may update these Terms from time to time. Material changes will be communicated through in-service notices. Your continued use of the Service after changes constitutes acceptance of the revised Terms.

## 12. Contact
**support@tarotaihub.com**
`,
    },
    zh: {
        title: '服务条款',
        updated: '最后更新：2026-03-03',
        body: `
## 1. 条款接受
访问或使用 TarotAIHub（"本服务"），即表示您同意本服务条款。如不同意，请勿使用本服务。

## 2. 娱乐用途声明
**本服务仅供娱乐和个人反思之用。** 基于 AI 的占卜、塔罗、占星术和四柱分析不构成医疗、法律、心理或财务建议。我们不保证分析结果的准确性或预测能力，您根据本服务做出的所有决定均由您自行负责。

## 3. 使用资格
您必须年满16岁方可使用本服务。注册账户时须提供准确信息，维护账户安全是您的责任。

## 4. 付费订阅
### 计费与续费
- 订阅在每个计费周期开始时（例如按月）预先收费。
- 如果取消，您可在当前计费周期结束前继续使用服务，下一周期起停止续费。

### 退款
- 如果您在当前计费周期内使用过至少一次服务，在法律允许的范围内，该周期的费用不予退还。
- 不提供部分期间的按比例退款或抵用金。
- 法律要求的情况，或我们以书面形式明确同意的情况除外。
- 如通过第三方平台（如 App Store、Google Play）购买，该平台的计费和退款政策可能适用。

### 价格与方案变更
价格或方案变更时将提前通知。如不同意变更后的条件，您可在下次续费前取消订阅。

### 税费
根据您所在地区，可能需缴纳适用的税费。

## 5. 禁止行为
以下行为被禁止：
- 将本服务用于任何非法目的
- 使用自动化工具进行批量访问或抓取
- 冒充他人或提供虚假信息
- 侵犯或试图绕过服务的安全机制
- 干扰其他用户使用服务

## 6. 知识产权
服务中的所有内容、设计、软件和技术均为 tarotaihub 或其许可方的财产。我们授予您有限的、非独占性的、不可转让的许可，以个人非商业目的使用本服务。

## 7. 免责声明
在法律允许的最大范围内，本服务按"原样"和"可用状态"提供。我们不做任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权的保证。

## 8. 责任限制
在法律允许的最大范围内，我们不承担因您使用本服务而产生的任何间接、附带、后果性、特殊或惩罚性损害赔偿责任。

## 9. 赔偿
您同意赔偿并使我们免受因您使用本服务或违反本条款而产生的任何索赔、损失和费用。

## 10. 争议解决
与本条款相关的争议应在法律允许的范围内提交有管辖权的法院管辖。提起正式程序前，请先联系 support@tarotaihub.com 尝试友好解决。

## 11. 条款变更
我们可能会不时更新本条款。重大变更将通过服务内通知告知。变更后继续使用本服务即视为接受修订后的条款。

## 12. 联系方式
**support@tarotaihub.com**
`,
    },
};

export default function TermsPage() {
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

function markdownToHtml(md: string): string {
    return md
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<[htuol])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');
}

const LEGAL_STYLES = `
  .legal-page { max-width: 800px; }
  .legal-title { font-size: var(--text-3xl); font-weight: 800; margin-bottom: var(--space-2); background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .legal-updated { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-8); }
  .legal-body h2 { font-size: var(--text-xl); font-weight: 700; margin: var(--space-8) 0 var(--space-3); color: var(--color-text-primary); }
  .legal-body h3 { font-size: var(--text-lg); font-weight: 600; margin: var(--space-6) 0 var(--space-2); }
  .legal-body p { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-3); }
  .legal-body ul { padding-left: var(--space-6); margin-bottom: var(--space-4); }
  .legal-body li { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: var(--space-1); }
  .legal-body strong { color: var(--color-text-primary); }
`;
