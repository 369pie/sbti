import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '隐私说明',
  description: '查看 WTFTI 关于测试答案、分享图片、本地计算与基础访问日志的隐私说明。',
  alternates: { canonical: '/privacy/' },
  openGraph: {
    title: '隐私说明 — WTFTI',
    description: 'WTFTI 的数据处理与隐私保护说明。',
    url: getSiteUrl('/privacy/'),
  },
  twitter: {
    card: 'summary',
    title: '隐私说明 — WTFTI',
    description: 'WTFTI 的数据处理与隐私保护说明。',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Privacy</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">隐私说明</h1>

      <div className="p-6 sm:p-8 rounded-xl mb-10" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
        <p className="text-text-primary font-medium leading-relaxed">
          核心承诺：本平台不收集、不存储、不出售任何个人身份信息。测试答案在你的设备上本地计算，不上传服务器。
        </p>
      </div>

      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">我们不收集的信息</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>真实姓名、手机号、身份证号、邮箱地址</li>
            <li>人脸数据、生物识别信息</li>
            <li>精确地理位置、GPS 坐标</li>
            <li>通讯录、相册、短信等设备权限数据</li>
            <li>第三方平台账号信息（微信、QQ 等登录凭证）</li>
          </ul>
          <p className="mt-3">
            本平台不要求注册账号即可使用核心测试功能。你可以在完全匿名的状态下完成所有测试。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">测试答案如何处理</h2>
          <p>
            当前站点的核心测试流程以浏览器端计算为主。你在题目页做出的选择，主要用于本地生成结果页，不要求注册账号，也不会默认把你的答案公开展示给其他人。你的测试数据不会被用于用户画像、商业分析或第三方共享。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">分享图片与复制链接</h2>
          <p>
            当你生成分享图片、复制链接或使用系统分享功能时，相关内容主要在你的设备内完成处理。站点不会因为你点击这些按钮，就自动把个人测试结果发布到公开页面。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">灵镜实验室照片生成</h2>
          <p>
            当你使用灵镜实验室上传照片生成发型、色彩或妆容报告时，照片会经由 WTFTI 服务端转发至 APIMart GPT-Image-2 生成接口。当前 MVP 不会把原始照片写入 WTFTI 数据库；生成结果链接由第三方图像服务返回，可能存在有效期。
          </p>
          <p className="mt-3">
            灵镜实验室只提供审美与娱乐向建议，不用于身份识别、颜值评分、医疗判断或命运判断。请只上传你本人或你已获得明确授权的照片。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">服务器与基础日志</h2>
          <p>
            站点部署平台可能会保留最基础的访问日志，例如 IP、浏览器信息、请求时间和错误日志。这些信息主要用于稳定性、安全性和故障排查，不会被当作心理画像或商业画像去售卖。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">CPTI 关系测试数据</h2>

          <h3 className="text-base font-medium text-text-primary mb-2 mt-4">收集哪些数据</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>你的 CP 角色测试结果与五维画像分数</li>
            <li>配对码记录（用于匹配双方测试结果）</li>
            <li>匹配后的 CP 关系类型与兼容度</li>
            <li>排行榜所需的匿名统计数据（灵魂伴侣数、稀有关系数等）</li>
          </ul>

          <h3 className="text-base font-medium text-text-primary mb-2 mt-4">数据如何存储</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>数据存储在 Supabase 数据库中，传输过程使用 HTTPS 加密</li>
            <li>配对码在 24 小时后自动过期失效</li>
            <li>不收集真实姓名、邮箱或手机号等实名信息</li>
          </ul>

          <h3 className="text-base font-medium text-text-primary mb-2 mt-4">谁能看见你的数据</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>只有你自己可以看到完整的关系记录和匹配历史</li>
            <li>配对的双方可以看到彼此的 CP 角色类型（不含原始测试答案）</li>
            <li>排行榜仅显示昵称和匿名统计数据，不展示个人画像细节</li>
          </ul>

          <h3 className="text-base font-medium text-text-primary mb-2 mt-4">排行榜与数据删除</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>你可以选择不在排行榜中展示你的数据（联系站点管理员）</li>
            <li>你有权要求删除所有与你相关的 CPTI 数据（通过站点管理员处理）</li>
            <li>删除后，已匹配的关系记录将不再可访问</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">Cookie 与追踪</h2>
          <p>
            本平台不使用任何第三方追踪 Cookie、广告像素或行为追踪脚本。不接入 Google Analytics、Facebook Pixel 或任何用户行为追踪服务。站点仅使用必要的技术性 Cookie（如主题偏好）以维持基本功能。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">未成年人保护</h2>
          <p>
            本平台不面向 14 周岁以下未成年人提供服务，也不会主动收集未成年人的任何个人信息。如果你是未成年人的监护人，发现我们无意中收集了未成年人信息，请联系我们，我们将在核实后尽快删除相关数据。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">隐私声明的边界</h2>
          <p>
            WTFTI 不是医疗、金融或实名认证服务，站点也不建议你在公开分享时附带敏感身份信息。如果未来站点引入登录、提交、排行榜或分析能力，本页会同步更新。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">联系我们</h2>
          <p>
            如果你对本隐私说明有任何疑问，或需要行使数据删除权，请通过 <Link href="/contact/" prefetch={false} className="underline underline-offset-2 hover:text-text-primary transition-colors">联系页面</Link> 与我们取得联系。
          </p>
        </section>
      </div>
    </div>
  );
}
