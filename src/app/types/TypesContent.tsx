'use client';

import Link from 'next/link';
import { PERSONALITY_TYPES } from '@/lib/personalities';
import { PersonalityCard } from '@/components/PersonalityCard';
import { motion } from 'framer-motion';
import { GUIDE_ARTICLES } from '@/lib/guides';

export default function TypesContent() {
  const regular = PERSONALITY_TYPES.filter(p => !p.isSpecial);
  const special = PERSONALITY_TYPES.filter(p => p.isSpecial);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-12"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          All Types
        </span>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          27 种人格类型总览
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          五大模型十五维度交叉分析，每种人格都有独特的维度组合。你可以先把 27 种人格类型过一遍，再决定开始测试，或者拿结果回来做对照。
        </p>
      </motion.div>

      {/* Regular types — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
        {regular.map((p, i) => (
          <PersonalityCard key={p.slug} personality={p} index={i} />
        ))}
      </div>

      {/* Special types */}
      {special.length > 0 && (
        <>
          <div className="mb-6 sm:mb-8">
            <span className="text-xs font-mono tracking-[0.2em] text-accent uppercase block mb-2">
              Special
            </span>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              特殊人格类型
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">需要触发特定条件才可能出现的结果。</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {special.map((p, i) => (
              <PersonalityCard key={p.slug} personality={p} index={i} />
            ))}
          </div>
        </>
      )}

      <section className="mt-12 sm:mt-16 pt-12 border-t border-border-subtle">
        <div className="max-w-4xl">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Guide</span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            怎么看 SBTI 人格类型？
          </h2>
          <div className="space-y-4 text-text-secondary leading-8 text-sm sm:text-base">
            <p>
              SBTI 的 27 种人格类型不是单纯的标签列表，它们本质上是五组切面和十五个维度的不同组合。也就是说，两个人看起来都很外向，最后也可能落到完全不同的人格上，因为他们在关系、行动、价值感和边界感上的侧重点并不一样。
            </p>
            <p>
              如果你是第一次接触这套测试，最好的顺序通常是：先快速浏览人格图鉴，再去做正式测试，然后回到结果页对照“人格类型解释”“适合人群”和“相近人格对比”。这样比只看一个结果名更容易理解自己为什么会落到那个类型。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {GUIDE_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5 hover:shadow-md hover:border-border transition-all"
              >
                <span className="text-xs font-mono tracking-wider text-text-muted uppercase block mb-2">
                  {article.category}
                </span>
                <h3 className="text-base font-medium text-text-primary leading-7">{article.title}</h3>
                <p className="text-sm text-text-secondary leading-6 mt-3">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
