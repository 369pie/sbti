import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SBTI 结果怎么看？十五维、稀有度和人格速写怎么理解',
  description: '看懂 SBTI 结果页中的人格速写、十五维落点、稀有度和相近人格对比。',
  alternates: { canonical: '/guide/how-to-read-sbti-results/' },
};

export default function HowToReadSbtiResultsGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">结果解读</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">SBTI 结果怎么看？十五维、稀有度和人格速写怎么理解</h1>
      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <p>
          SBTI 的结果页不是只有一个人格名称。真正值得看的至少有四块：人格速写、十五维落点、稀有度，以及相近人格对比。人格名称只是入口，后面这些内容才是帮助你理解“为什么是这个结果”的关键。
        </p>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">1. 人格速写：先看整体气质</h2>
          <p>
            人格速写是最适合第一眼判断“像不像我”的部分。它通常会把这个类型的底色、常见行为方式和典型状态浓缩成一段描述。你不用要求每一句都完全命中，更应该看整体气质是不是贴近你平时的表达方式和处事风格。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">2. 十五维落点：再看为什么会落到这里</h2>
          <p>
            十五维其实是结果页里最有信息量的部分。它会把你的状态拆到自我、情感、态度、行动和社交五组切面里。你可以把它理解成：人格名称负责给你一个记忆点，十五维负责解释这个结果是怎么长出来的。真正看懂结果，通常都要回到这些维度上。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">3. 稀有度和相近人格：看你和谁最容易混淆</h2>
          <p>
            稀有度更多是补充信息，用来表达这个结果在整套人格里的分布感；它不能证明“越稀有越高级”，但有助于你理解这个人格在整体中的位置。相近人格对比则更实用，因为很多人并不是完全不认识自己，而是不确定自己到底更像 A 还是更像 B。对比页会告诉你，你和另一个相似人格到底差在哪几个关键维度上。
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/types" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all">
          查看人格图鉴
        </Link>
        <Link href="/guide/sbti-vs-mbti" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all">
          看 SBTI / MBTI 区别
        </Link>
      </div>
    </div>
  );
}