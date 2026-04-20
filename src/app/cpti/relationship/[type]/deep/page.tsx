/**
 * /cpti/relationship/[type]/deep/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Light paywall deep page (W3 sprint, 2026-04-20).
 *
 * Free preview: relationship hero + tagline + description.
 * Paywalled: 8-axis radar / 30 共修 / 12-month theme / landmines / cross-link.
 *
 * Fully static (`generateStaticParams` over all 25 slugs).
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getRelationshipBySlug,
  getAllRelationshipSlugs,
  RELATIONSHIP_TIER_INFO,
} from '@/lib/cpti/relationships';
import { CptiDeepClient } from './CptiDeepClient';

export const dynamic = 'force-static';

type PageProps = { params: Promise<{ type: string }> };

export async function generateStaticParams() {
  return getAllRelationshipSlugs().map((slug) => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const r = getRelationshipBySlug(type);
  if (!r) return {};
  return {
    title: `${r.name}（${r.code}）— 关系深档 · CPTI`,
    description: `${r.tagline} 8 维关系雷达 × 30 条共修建议 × 12 月主题 × 雷区清单。`,
    alternates: { canonical: `/cpti/relationship/${type}/deep/` },
    robots: { index: false, follow: true },
  };
}

export default async function CptiDeepPage({ params }: PageProps) {
  const { type } = await params;
  const relationship = getRelationshipBySlug(type);
  if (!relationship) notFound();

  const tierInfo = RELATIONSHIP_TIER_INFO[relationship.tier];

  return <CptiDeepClient relationship={relationship} tierInfo={tierInfo} />;
}
