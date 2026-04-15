import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDE_ARTICLES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'WTFTI 指南：SBTI 经典测试说明与结果解读',
  description: '查看 WTFTI 经典 SBTI 测试说明、结果怎么看、SBTI 和 MBTI 的区别，以及图鉴阅读入口。',
  alternates: { canonical: '/guide/' },
};

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Guide</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">WTFTI 指南：SBTI 经典测试说明与结果解读</h1>
      <p className="max-w-3xl text-text-secondary leading-8 text-base mb-10">
        这里集中整理 WTFTI 经典 SBTI 测试的说明、结果阅读方法和常见问题。如果你已经搜到了 “SBTI 人格测试” 并准备开测，这个栏目会帮你先理解它在测什么；如果你已经拿到结果，也可以从这里继续读懂十五维、稀有度和相近人格之间的差别。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {GUIDE_ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/guide/${article.slug}`}
            className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 hover:shadow-md hover:border-border transition-all"
          >
            <span className="text-xs font-mono tracking-wider text-text-muted uppercase block mb-2">
              {article.category}
            </span>
            <h2 className="text-lg font-medium text-text-primary leading-7">{article.title}</h2>
            <p className="text-sm text-text-secondary leading-6 mt-3">{article.description}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border-subtle bg-bg-secondary/30 p-6 sm:p-8">
        <h2 className="text-xl font-medium text-text-primary mb-4">从哪里开始最合适？</h2>
        <div className="space-y-4 text-text-secondary leading-8 text-sm sm:text-base">
          <p>
            如果你还没做过测试，建议先看《SBTI 是什么》再去答题；如果你已经拿到结果，建议先读《SBTI 结果怎么看》，再回头对照人设图鉴和相近人格。至于 “SBTI 和 MBTI 的区别”，更适合在你已经对结果有初步理解之后再看。
          </p>
          <p>
            这套结构的目标，是让站内既有工具页，也有解释页。这样不管你是通过搜索进来，还是通过朋友分享进来，都能在站内找到下一步要读的内容，而不是停留在一个孤立页面上。
          </p>
        </div>
      </section>
    </div>
  );
}