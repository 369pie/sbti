import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于 WTFTI',
  description:
    '了解 WTFTI 多宇宙人格测试平台、经典 SBTI 测试结构，以及它和 MBTI 的区别。',
  keywords: ['WTFTI', 'SBTI', '人格测试', '关于WTFTI', 'SBTI介绍', 'MBTI区别'],
  alternates: { canonical: '/about/' },
  openGraph: {
    title: '关于 WTFTI',
    description: '了解 WTFTI 多宇宙人格测试平台与经典 SBTI 测试结构。',
    url: getSiteUrl('/about/'),
  },
  twitter: {
    card: 'summary',
    title: '关于 WTFTI',
    description: '了解 WTFTI 多宇宙人格测试平台与经典 SBTI 测试结构。',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">About</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">关于 WTFTI</h1>
      <p className="text-text-secondary leading-8 text-base mb-10">
        WTFTI 是一个多宇宙人格测试平台。SBTI 是它的经典基线宇宙，负责用五组切面、十五个维度和二十七种结果给出你的核心人格底图；其他宇宙则是在同一套人性观察上，换一种主题、语言和视觉，把同一个你重新翻译一遍。
      </p>

      <section className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">WTFTI 在做什么？</h2>
          <p>
            平台不是只做一张结果图，而是把同一个人的不同侧面放进不同宇宙里观察。你可以先拿到经典人格，再去看自己在毒舌宇宙、社畜宇宙、鸟类宇宙、花格宇宙里会变成什么样，这也是 WTFTI 最核心的体验。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">经典宇宙 SBTI 会测什么？</h2>
          <p>
            经典 SBTI 测试围绕五组切面展开：自我模型、情感模型、态度模型、行动驱力模型和社交模型。每一组切面下面又会拆成更细的十五个维度，所以你拿到的不是一个单点标签，而是一张更完整的状态画像。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">WTFTI 和 MBTI 的区别</h2>
          <p>
            MBTI 更接近经典人格分类框架，WTFTI 则更像是把中文互联网里常见的行为表达、关系状态和生活方式重新整理成一套更直观的测试结果。你会看到更接近日常语感的人格名称，也更容易拿来做朋友之间的对照、分享和二创。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">测完之后能得到什么？</h2>
          <p>
            完成测试后，你会进入专属结果页。结果页除了人格名称和简介，还会显示维度落点、其他宇宙入口，以及适合分享的图片和链接。你可以直接去看全部图鉴，也可以继续测打工人格、恋爱人格、今日模式等衍生玩法。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">结果适合怎么使用？</h2>
          <p>
            更适合娱乐、自我观察、朋友交流和内容分享，不适合作为严肃的心理诊断结论。WTFTI 的定位一直是“更好玩、更接近日常”的人格测试平台，而不是临床评估工具。
          </p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/test/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all"
        >
          开始经典测试
        </Link>
        <Link
          href="/types/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all"
        >
          查看全站图鉴
        </Link>
        <Link
          href="/guide/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all"
        >
          进入说明栏目
        </Link>
      </div>
    </div>
  );
}