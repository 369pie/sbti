import type { Metadata } from 'next';
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
      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">测试答案如何处理</h2>
          <p>
            当前站点的核心测试流程以浏览器端计算为主。你在题目页做出的选择，主要用于本地生成结果页，不要求注册账号，也不会默认把你的答案公开展示给其他人。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">分享图片与复制链接</h2>
          <p>
            当你生成分享图片、复制链接或使用系统分享功能时，相关内容主要在你的设备内完成处理。站点不会因为你点击这些按钮，就自动把个人测试结果发布到公开页面。
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
          <h2 className="text-xl font-medium text-text-primary mb-3">隐私声明的边界</h2>
          <p>
            WTFTI 不是医疗、金融或实名认证服务，站点也不建议你在公开分享时附带敏感身份信息。如果未来站点引入登录、提交、排行榜或分析能力，本页会同步更新。
          </p>
        </section>
      </div>
    </div>
  );
}