import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SBTI 是什么？为什么它会变成一种抽象人格测试',
  description: '了解 SBTI 人格测试的定位、五组切面和十五维结构，知道它到底在测什么。',
  alternates: { canonical: '/guide/what-is-sbti/' },
};

export default function WhatIsSbtiGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">测试说明</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">SBTI 是什么？为什么它会变成一种抽象人格测试</h1>
      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <p>
          SBTI 可以理解成一种更贴近日常表达的人格测试。它不是把人塞回一套传统心理测量语言，而是把中文互联网里大家最熟悉的关系状态、行为习惯、表达风格和生活反应，重新整理成更容易理解的人格标签。你在这里看到的不是“教科书定义”，而是更像朋友会拿来形容你的那种说法。
        </p>
        <p>
          这套测试真正的骨架，其实是五组切面和十五个维度。五组切面分别对应自我、情感、态度、行动和社交，再往下拆成更细的维度。也就是说，SBTI 不是只看你外向不外向，而是会一起看你对自己的评价稳不稳、在关系里更依赖还是更独立、做决定果不果断、推进事情时有没有持续性，以及你在人际边界和表达方式上的习惯。
        </p>
        <p>
          也正因为它不是只看单一特征，所以 SBTI 才会更适合做“抽象人格测试”。很多人做完会发现，结果名看起来很好玩，但背后其实有一套比想象中更细的结构。你可以把它当成一种更轻松的人格观察工具，而不是严肃的临床判断。
        </p>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">它适合什么样的人？</h2>
          <p>
            如果你想快速判断自己更像哪种类型、想和朋友一起对照结果、或者更在意“这个测试说得像不像我平时的状态”，SBTI 会比很多传统术语型测试更容易进入。它的价值不在于给出唯一正确答案，而在于帮你更快看清自己常见的反应模式。
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/test" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all">
          开始测试
        </Link>
        <Link href="/guide/how-to-read-sbti-results" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all">
          看结果说明
        </Link>
      </div>
    </div>
  );
}