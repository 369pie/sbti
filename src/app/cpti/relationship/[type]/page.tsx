/**
 * /cpti/relationship/[type]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Sprint 1 (2026-04-19) — 25 SEO landing pages, one per relationship type.
 *
 * Goal: Capture Xiaohongshu/Baidu long-tail traffic like
 *   "塑料姐妹 cpti", "灵魂伴侣 关系测试", "cpti 老夫老妻是哪个".
 *
 * Each page:
 *   - Static (generateStaticParams), force-static.
 *   - Has full Metadata + JSON-LD (BreadcrumbList + FAQPage).
 *   - Single-test CTA at bottom: "测我和身边谁是这种关系" → /cpti/test/.
 *   - Cross-links to gallery + theory.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getRelationshipBySlug,
  getAllRelationshipSlugs,
  CPTI_RELATIONSHIP_TYPES,
  RELATIONSHIP_TIER_INFO,
  getCptiRelationshipTypeMediumImage,
} from '@/lib/cpti/relationships';
import { getRelationshipRarity } from '@/lib/cpti/relationships-rarity';
import { getSiteUrl } from '@/lib/site';
import { CptiRelationshipSeoTracker } from './CptiRelationshipSeoTracker';

export const dynamic = 'force-static';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllRelationshipSlugs().map((slug) => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const r = getRelationshipBySlug(type);
  if (!r) return {};
  return {
    title: `${r.name}（${r.code}）— CPTI 25 种关系类型`,
    description: `${r.tagline} ${r.description.slice(0, 80)}… 测一测你和身边谁是「${r.name}」。`,
    alternates: { canonical: `/cpti/relationship/${type}/` },
    openGraph: {
      title: `${r.name} · CPTI 25 种关系图鉴`,
      description: r.tagline,
      images: [
        {
          url: getCptiRelationshipTypeMediumImage(r.slug),
          width: 1024,
          height: 1024,
          alt: r.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${r.name} · CPTI 关系图鉴`,
      description: r.tagline,
    },
  };
}

export default async function CptiRelationshipTypePage({ params }: PageProps) {
  const { type } = await params;
  const relationship = getRelationshipBySlug(type);
  if (!relationship) notFound();

  const tierInfo = RELATIONSHIP_TIER_INFO[relationship.tier];
  const rarity = getRelationshipRarity(relationship.slug);
  const otherTiers = CPTI_RELATIONSHIP_TYPES.filter(
    (r) => r.tier === relationship.tier && r.slug !== relationship.slug,
  ).slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'CPTI 关系测试', item: getSiteUrl('/cpti/') },
          { '@type': 'ListItem', position: 3, name: '关系图鉴', item: getSiteUrl('/cpti/gallery/') },
          { '@type': 'ListItem', position: 4, name: relationship.name, item: getSiteUrl(`/cpti/relationship/${relationship.slug}/`) },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `CPTI 里的「${relationship.name}」是什么意思？`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: relationship.description,
            },
          },
          {
            '@type': 'Question',
            name: `怎么知道我和 ta 是不是「${relationship.name}」？`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `两人各自完成 CPTI 的 5 维度测试（约 3 分钟），系统会根据你们在主导力、表达力、冲突力、付出力、融合度上的组合，从 25 种关系类型中匹配出你们的关系。`,
            },
          },
          {
            '@type': 'Question',
            name: `「${relationship.name}」准吗？`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `CPTI 不是科学心理学量表，而是一个基于 5 维度模型的关系投射工具。它的价值不是"判定"你们是什么关系，而是给你们一个共同语言去聊关系里那些说不出口的东西。`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CptiRelationshipSeoTracker slug={relationship.slug} />

      <main className="min-h-screen bg-bg-primary text-text-primary">
        {/* Hero */}
        <section className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
          <Link href="/cpti/" className="text-xs font-mono tracking-wider text-text-muted uppercase hover:text-text-primary transition-colors">
            ← CPTI 关系测试
          </Link>

          <div className="mt-8 mb-6 text-7xl">{relationship.emoji}</div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ color: tierInfo.color, background: tierInfo.bgColor, borderColor: `${tierInfo.color}40` }}
            >
              {tierInfo.label}
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ color: rarity.color, background: rarity.bgColor, borderColor: `${rarity.color}40` }}
            >
              {rarity.label}
            </span>
          </div>

          <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl mb-4">
            {relationship.name}
            <span className="block mt-2 text-base font-mono text-text-muted tracking-[0.4em]">{relationship.code}</span>
          </h1>

          <hr className="editorial-rule w-16 mx-auto my-6" />

          <p
            className="text-xl text-text-secondary max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            {relationship.tagline}
          </p>
        </section>

        {/* Description */}
        <section className="max-w-2xl mx-auto px-6 pb-12">
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
              关于「{relationship.name}」
            </h2>
            <p className="text-text-secondary leading-[1.85] text-base whitespace-pre-line">
              {relationship.description}
            </p>
          </div>
        </section>

        {/* Primary CTA */}
        <section className="max-w-2xl mx-auto px-6 pb-12">
          <div
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${relationship.color}15, ${relationship.color}05)`,
              border: `1px solid ${relationship.color}30`,
            }}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              想知道你和 ta 是不是「{relationship.name}」？
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              3 分钟测出你的 CP 角色，邀请 ta 配对解锁你们的关系类型
            </p>
            <Link
              href="/cpti/test/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold hover:scale-105 transition-transform"
              style={{ background: relationship.color }}
            >
              开始测试 <span>→</span>
            </Link>
          </div>
        </section>

        {/* Cross-links */}
        <section className="max-w-2xl mx-auto px-6 pb-12">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            同梯队的其他关系
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherTiers.map((r) => (
              <Link
                key={r.slug}
                href={`/cpti/relationship/${r.slug}/`}
                className="group rounded-xl border border-border-subtle bg-bg-elevated p-4 text-center hover:border-rose-500/40 transition-all"
              >
                <div className="text-3xl mb-2">{r.emoji}</div>
                <div className="text-xs sm:text-sm font-semibold text-text-primary">{r.name}</div>
                <div className="text-[10px] font-mono text-text-muted mt-1 tracking-wider">{r.code}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Theory + Gallery */}
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/cpti/gallery/"
              className="rounded-xl border border-border-subtle bg-bg-elevated p-5 hover:border-rose-500/40 transition-all"
            >
              <div className="text-xs font-mono tracking-wider text-text-muted uppercase mb-1">25 / 25</div>
              <div className="text-base font-semibold mb-1">查看关系图鉴 →</div>
              <div className="text-xs text-text-muted">25 种关系全收录，看看你已点亮哪几格</div>
            </Link>
            <Link
              href="/cpti/theory/"
              className="rounded-xl border border-border-subtle bg-bg-elevated p-5 hover:border-rose-500/40 transition-all"
            >
              <div className="text-xs font-mono tracking-wider text-text-muted uppercase mb-1">5 维度</div>
              <div className="text-base font-semibold mb-1">维度白皮书 →</div>
              <div className="text-xs text-text-muted">5 个维度怎么算出 25 种关系？看一眼就懂</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
