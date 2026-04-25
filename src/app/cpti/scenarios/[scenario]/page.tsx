/**
 * /cpti/scenarios/[scenario]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Sprint 2 (2026-04-19) — 5 scenario landing pages targeting
 * Xiaohongshu autocomplete long-tails:
 *   /cpti/scenarios/lover/   → "cpti 情侣"
 *   /cpti/scenarios/bestie/  → "cpti 闺蜜"
 *   /cpti/scenarios/family/  → "cpti 母子" / "cpti 母女"
 *   /cpti/scenarios/work/    → "cpti 同事"
 *   /cpti/scenarios/enemy/   → "cpti 死对头" / "cpti 桃园结义"
 *
 * Each page:
 *   - Static (force-static, generateStaticParams).
 *   - Has full Metadata + FAQPage JSON-LD.
 *   - Cross-links to 5–8 most-relevant /cpti/relationship/[slug]/ pages.
 *   - Primary CTA → /cpti/test/.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import type { Metadata } from 'next';
import {
  CPTI_SCENARIOS,
  getAllCptiScenarioSlugs,
  getCptiScenarioBySlug,
  getFeaturedRelationshipsForScenario,
} from '@/lib/cpti/scenarios';
import { RELATIONSHIP_TIER_INFO, getCptiRelationshipTypeMediumImage } from '@/lib/cpti/relationships';
import { getSiteUrl } from '@/lib/site';
import { CptiScenarioTracker } from './CptiScenarioTracker';

export const dynamic = 'force-static';

type PageProps = {
  params: Promise<{ scenario: string }>;
};

export async function generateStaticParams() {
  return getAllCptiScenarioSlugs().map((scenario) => ({ scenario }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { scenario } = await params;
  const s = getCptiScenarioBySlug(scenario);
  if (!s) return {};
  return {
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    alternates: { canonical: `/cpti/scenarios/${scenario}/` },
    openGraph: {
      title: s.title,
      description: s.description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.title,
      description: s.description,
    },
  };
}

export default async function CptiScenarioPage({ params }: PageProps) {
  const { scenario } = await params;
  const config = getCptiScenarioBySlug(scenario);
  if (!config) notFound();

  const featured = getFeaturedRelationshipsForScenario(scenario);
  const siteUrl = getSiteUrl();

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'CPTI', item: `${siteUrl}/cpti/` },
      { '@type': 'ListItem', position: 2, name: '场景', item: `${siteUrl}/cpti/scenarios/` },
      { '@type': 'ListItem', position: 3, name: config.name, item: `${siteUrl}/cpti/scenarios/${scenario}/` },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `CPTI ${config.name}测试是什么？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `CPTI（Couple Personality Type Indicator）是一个 3 分钟的关系测试，根据你和对方在 5 个关系维度（主导力、表达力、冲突力、付出力、融合度）的组合，把你们归类到 25 种关系类型里的一种。${config.name}是其中最常被搜索的场景之一。`,
        },
      },
      {
        '@type': 'Question',
        name: `${config.name}最常出现的 CPTI 关系类型有哪些？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `根据已有数据，${config.name}最常出现的关系类型是：${featured
            .slice(0, 5)
            .map((r) => `${r.name}（${r.code}）`)
            .join('、')}。每一种都对应不同的相处模式。`,
        },
      },
      {
        '@type': 'Question',
        name: `准吗？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `CPTI 不是科学诊断，是关系叙事工具。它的"准"来自于 25 种关系类型本身就足够细 —— 比 MBTI 配对具体得多，比塔罗可解释得多。多数用户的反馈是"准到笑出声"。`,
        },
      },
    ],
  };

  const tintBg = `${config.color}1A`; // 10% alpha

  return (
    <div className="min-h-screen bg-bg-primary">
      <CptiScenarioTracker scenario={scenario} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-4">
        <Link
          href="/cpti/"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors mb-4 inline-block"
        >
          ← 返回 CPTI
        </Link>
      </div>

      {/* Hero */}
      <section
        className="max-w-2xl mx-auto px-6 pt-2 pb-10 text-center"
        style={{ background: `linear-gradient(180deg, ${tintBg}, transparent)` }}
      >
        <div className="text-5xl mb-3">{config.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-3 whitespace-pre-line">
          {config.heroHeadline}
        </h1>
        <p className="text-sm text-text-secondary italic mb-6">{config.heroSub}</p>
        <Link
          href="/cpti/test/"
          className="inline-block px-7 py-3 rounded-full text-bg-primary font-semibold shadow-lg hover:shadow-xl transition-shadow"
          style={{ background: config.color }}
        >
          {config.cta}
        </Link>
        <p className="text-xs text-text-muted mt-3">3 分钟一对 · 25 种关系类型</p>
      </section>

      {/* Intro */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <div className="rounded-2xl bg-bg-secondary/50 border border-border-subtle p-5 sm:p-6">
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{config.intro}</p>
        </div>
      </section>

      {/* Featured relationships */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
          {config.name}最常出现的 {featured.length} 种关系
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featured.map((r) => {
            const tier = RELATIONSHIP_TIER_INFO[r.tier];
            return (
              <Link
                key={r.slug}
                href={`/cpti/relationship/${r.slug}/`}
                className="group rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden hover:border-border transition-colors"
              >
                <div className="aspect-square relative bg-bg-primary">
                  <NextImage
                    src={getCptiRelationshipTypeMediumImage(r.slug)}
                    alt={r.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-text-muted mb-1">
                    {r.code}
                  </div>
                  <div className="text-sm font-semibold text-text-primary truncate">{r.name}</div>
                  <div className="text-xs text-text-muted line-clamp-2 mt-1">{r.tagline}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cross-links to other scenarios */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">其他场景</h2>
        <div className="flex flex-wrap gap-2">
          {CPTI_SCENARIOS.filter((s) => s.slug !== scenario).map((s) => (
            <Link
              key={s.slug}
              href={`/cpti/scenarios/${s.slug}/`}
              className="px-4 py-2 rounded-full bg-bg-secondary border border-border-subtle text-sm text-text-secondary hover:border-border transition-colors"
            >
              {s.emoji} {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Theory + gallery cross-links */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/cpti/gallery/"
            className="rounded-2xl bg-bg-secondary border border-border-subtle p-4 text-center hover:border-border transition-colors"
          >
            <div className="text-2xl mb-1">🗂</div>
            <div className="text-sm font-semibold text-text-primary">25 种关系图鉴</div>
            <div className="text-xs text-text-muted mt-1">看完全部</div>
          </Link>
          <Link
            href="/cpti/theory/"
            className="rounded-2xl bg-bg-secondary border border-border-subtle p-4 text-center hover:border-border transition-colors"
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="text-sm font-semibold text-text-primary">CPTI 理论</div>
            <div className="text-xs text-text-muted mt-1">5 个维度怎么测</div>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <Link
          href="/cpti/test/"
          className="inline-block px-8 py-3.5 rounded-full text-bg-primary font-semibold shadow-lg hover:shadow-xl transition-shadow"
          style={{ background: config.color }}
        >
          {config.cta}
        </Link>
      </section>
    </div>
  );
}
