/**
 * /cpti/theory/page.tsx — 维度白皮书
 * ─────────────────────────────────────────────────────────────
 * Sprint 1 (2026-04-19) — anchor for "CPTI 准不准 / 怎么算的" comments.
 *
 * Static page using CPTI_DIMENSIONS data. Honest answer to "准不准".
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { CPTI_DIMENSIONS, CPTI_MODEL_COLORS, CPTI_MODEL_NAMES } from '@/lib/cpti/dimensions';
import { CPTI_RELATIONSHIP_TYPES, RELATIONSHIP_TIER_INFO } from '@/lib/cpti/relationships';
import { getSiteUrl } from '@/lib/site';
import { CptiTheoryViewTracker } from './CptiTheoryViewTracker';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'CPTI 维度白皮书 — 5 维度 × 25 种关系',
  description:
    '5 个维度（主导力 · 表达力 · 冲突力 · 付出力 · 融合度）怎么算出 25 种关系类型？CPTI 准不准？看完这页就懂。',
  alternates: { canonical: '/cpti/theory/' },
  openGraph: {
    title: 'CPTI 维度白皮书',
    description: '5 维度 × 25 种关系类型，CPTI 是怎么算出来的？',
  },
};

const tierGroups = (['viral', 'deep', 'rare'] as const).map((tier) => ({
  tier,
  info: RELATIONSHIP_TIER_INFO[tier],
  items: CPTI_RELATIONSHIP_TYPES.filter((r) => r.tier === tier),
}));

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'CPTI 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'CPTI 是「Couple Personality Type Indicator」的缩写，一种基于 5 维度模型的关系类型测试。每个人独立完成测试得到一个 CP 角色（共 16 种），两人配对后从 25 种关系类型里匹配出你们的关系。',
      },
    },
    {
      '@type': 'Question',
      name: 'CPTI 准不准？',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          '诚实地说：CPTI 不是一个科学心理学量表，没有信效度验证。它是一个「关系投射工具」——给你和身边人一个共同语言去聊关系里那些说不出口的东西。它的"准"不来自统计，来自你们读到结果时那一句"你看这就是我俩"。',
      },
    },
    {
      '@type': 'Question',
      name: 'CPTI 和 MBTI 的区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'MBTI 测的是个体性格（你是什么样的人），CPTI 测的是关系动力（你在一段关系里扮演什么角色，你们两个人组合起来是哪一种关系）。同一个 MBTI 类型的人可以有完全不同的 CPTI 结果，因为关系是双向的。',
      },
    },
  ],
};

export default function CptiTheoryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'CPTI', item: getSiteUrl('/cpti/') },
              { '@type': 'ListItem', position: 3, name: '维度白皮书', item: getSiteUrl('/cpti/theory/') },
            ],
          }),
        }}
      />
      <CptiTheoryViewTracker />

      <main className="min-h-screen bg-bg-primary text-text-primary">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <Link
            href="/cpti/"
            className="text-xs font-mono tracking-wider text-text-muted uppercase hover:text-text-primary transition-colors"
          >
            ← CPTI 关系测试
          </Link>
          <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl mt-8 mb-4">
            维度白皮书
          </h1>
          <hr className="editorial-rule w-20 mx-auto my-6" />
          <p className="text-base sm:text-lg text-text-secondary leading-[1.85] max-w-xl mx-auto">
            5 个维度怎么算出 25 种关系？CPTI 到底准不准？<br />
            一页讲清楚。
          </p>
        </section>

        {/* 5 Dimensions */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6 text-center">
            5 个维度
          </h2>
          <div className="space-y-4">
            {CPTI_DIMENSIONS.map((dim) => {
              const color = CPTI_MODEL_COLORS[dim.model];
              return (
                <div
                  key={dim.id}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-7"
                >
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-xs font-mono font-bold tracking-wider" style={{ color: color.base }}>
                      {dim.id}
                    </span>
                    <h3 className="text-xl font-semibold">{CPTI_MODEL_NAMES[dim.model]}</h3>
                  </div>
                  <p className="text-sm text-text-muted mb-4">{dim.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['H', 'M', 'L'] as const).map((lvl) => (
                      <div
                        key={lvl}
                        className="rounded-lg border border-border-subtle p-3"
                        style={{ background: lvl === 'H' ? color.bg : 'transparent' }}
                      >
                        <div
                          className="text-[10px] font-mono font-bold tracking-wider mb-1.5"
                          style={{ color: color.base }}
                        >
                          {lvl} · {lvl === 'H' ? '高' : lvl === 'M' ? '中' : '低'}
                        </div>
                        <div className="text-xs text-text-secondary leading-relaxed">{dim.levels[lvl]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-xs text-text-muted text-center leading-relaxed">
            每个维度有 H/M/L 3 个档位 →
            理论上 3<sup>5</sup> = 243 种组合 →
            合并语义相近的组合后，CPTI 把它们浓缩成 16 种 CP 角色和 25 种关系类型。
          </div>
        </section>

        {/* 25 Relationship Types */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6 text-center">
            25 种关系类型
          </h2>
          <div className="space-y-8">
            {tierGroups.map(({ tier, info, items }) => (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{ color: info.color, background: info.bgColor, borderColor: `${info.color}40` }}
                  >
                    {info.label}
                  </span>
                  <span className="text-xs text-text-muted">{items.length} 种</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {items.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/cpti/relationship/${r.slug}/`}
                      className="group rounded-xl border border-border-subtle bg-bg-elevated p-3 text-center hover:border-rose-500/40 transition-all"
                    >
                      <div className="text-2xl mb-1.5">{r.emoji}</div>
                      <div className="text-xs sm:text-sm font-semibold text-text-primary truncate">{r.name}</div>
                      <div className="text-[10px] font-mono text-text-muted mt-0.5 tracking-wider">{r.code}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CPTI 准不准？— 评论区锚点 */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-3">「CPTI 准不准？」</h2>
            <p className="text-text-secondary leading-[1.85] text-base mb-3">
              诚实地说：CPTI 不是一个科学心理学量表，没有信效度验证。
            </p>
            <p className="text-text-secondary leading-[1.85] text-base mb-3">
              它是一个 <strong>关系投射工具</strong>—— 给你和身边人一个共同语言，
              去聊关系里那些说不出口的东西。
            </p>
            <p className="text-text-secondary leading-[1.85] text-base">
              它的「准」不来自统计，来自你们读到结果时那一句「你看这就是我俩」。
              <br />
              如果 25 种里没有一种能让你笑出来或者点头，欢迎在评论区告诉我们你想看的关系类型。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
          <Link
            href="/cpti/test/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-bg-primary font-semibold hover:bg-rose-600 transition-colors"
          >
            开始测试 <span>→</span>
          </Link>
          <div className="mt-4 text-xs text-text-muted">
            3 分钟一份关系画像 · 25 格图鉴可收集
          </div>
        </section>
      </main>
    </>
  );
}
