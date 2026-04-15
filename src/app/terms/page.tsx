import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '使用条款',
  description: '查看 WTFTI 的使用范围、结果性质、分享规范和免责声明。',
  alternates: { canonical: '/terms/' },
  openGraph: {
    title: '使用条款 — WTFTI',
    description: 'WTFTI 的使用范围与免责声明。',
    url: getSiteUrl('/terms/'),
  },
  twitter: {
    card: 'summary',
    title: '使用条款 — WTFTI',
    description: 'WTFTI 的使用范围与免责声明。',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Terms</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">使用条款</h1>
      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">内容定位</h2>
          <p>
            WTFTI 旨在提供轻松的人格测试与图鉴体验，包含经典 SBTI、主题宇宙和相关衍生玩法。站内结果适合娱乐、自我观察、朋友之间的比较和内容分享，不构成专业心理诊断、医疗建议或法律意见。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">结果的使用方式</h2>
          <p>
            你可以自由查看、分享自己的测试结果，但不应把结果当作对他人的绝对定义，也不应将其用于歧视、骚扰、招聘筛选或其他高风险决策场景。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">站点可用性</h2>
          <p>
            我们会尽量保证页面、图片和结果页正常可用，但不承诺站点永不出错、永不中断。若发生临时故障、资源丢失或部署异常，站点可能出现短时间不可访问的情况。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">条款更新</h2>
          <p>
            如果功能范围、数据处理方式或使用场景发生变化，本页内容也会随之调整。继续使用站点，意味着你理解并接受更新后的说明。
          </p>
        </section>
      </div>
    </div>
  );
}