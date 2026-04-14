import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于 SBTI 人格测试',
  description:
    '了解 SBTI 人格测试的五组切面、十五维结构、结果解释方式，以及它和 MBTI 的区别。',
  keywords: ['SBTI', '人格测试', '关于SBTI', 'SBTI介绍', 'MBTI区别'],
  alternates: { canonical: '/about/' },
  openGraph: {
    title: '关于 SBTI 人格测试',
    description: '了解 SBTI 人格测试的五组切面、十五维结构、结果解释方式。',
    url: getSiteUrl('/about/'),
  },
  twitter: {
    card: 'summary',
    title: '关于 SBTI 人格测试',
    description: '了解 SBTI 的五组切面、十五维结构和结果解释方式。',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">About</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">关于 SBTI 人格测试</h1>
      <p className="text-text-secondary leading-8 text-base mb-10">
        SBTI 是一个偏轻松、偏中文互联网语境的人格测试。它不会把你塞进一套过于严肃的专业术语里，而是尝试用更接近日常表达的方式，帮助你看清自己平时怎么想、怎么爱、怎么做决定、怎么和人相处。
      </p>

      <section className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">SBTI 会测什么？</h2>
          <p>
            整套测试围绕五组切面展开：自我模型、情感模型、态度模型、行动驱力模型和社交模型。每一组切面下面又会拆成更细的十五个维度，所以你拿到的不是一个单点标签，而是一张更完整的状态画像。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">SBTI 和 MBTI 的区别</h2>
          <p>
            MBTI 更接近经典人格分类框架，SBTI 则更像是把中文互联网里常见的行为表达、关系状态和生活方式重新整理成一套更直观的测试结果。你会看到更接近日常语感的人格名称，也更容易拿来做朋友之间的对照和分享。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">测完之后能得到什么？</h2>
          <p>
            完成测试后，你会进入专属结果页。结果页除了人格名称和简介，还会显示十五维落点、其他人格入口，以及适合分享的图片和链接。你可以直接去看全部人格，也可以再测打工人设和今日模式测试。
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-text-primary mb-3">结果适合怎么使用？</h2>
          <p>
            更适合娱乐、自我观察、朋友交流和内容分享，不适合作为严肃的心理诊断结论。SBTI 的定位一直是“更好玩、更接近日常”的人格测试，而不是临床评估工具。
          </p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/test/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all"
        >
          开始测试
        </Link>
        <Link
          href="/types/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all"
        >
          查看 27 种人格
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