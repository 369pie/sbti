/**
 * /xpti/result/[type]/deep/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Light paywall deep page (W3 sprint, 2026-04-20).
 *
 * Free preview: persona hero + tagline + first description excerpt.
 * Paywalled: 9 维 XP 雷达 / 6 类配对 / 8 雷区 / 24 对话开场白 / 跨模块.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getXptiPersonalityBySlug, getAllXptiSlugs } from '@/lib/xpti/personalities';
import { XptiDeepClient } from './XptiDeepClient';

export const dynamic = 'force-static';

type PageProps = { params: Promise<{ type: string }> };

export async function generateStaticParams() {
  return getAllXptiSlugs().map((slug) => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getXptiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.name}（${p.code}）— XPTI 亲密深档`,
    description: `${p.tagline} · 9 维 XP 雷达 + 6 类亲密配对 + 雷区清单 + 24 个对话开场白。`,
    alternates: { canonical: `/xpti/result/${type}/deep/` },
    robots: { index: false, follow: true },
  };
}

export default async function XptiDeepPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getXptiPersonalityBySlug(type);
  if (!personality) notFound();
  return <XptiDeepClient personality={personality} />;
}
