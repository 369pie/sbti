/**
 * /cpti/relationship/[type]/his/page.tsx
 * ─────────────────────────────────────────────────────────────
 * v2.0 W2 — 男性反向报告（"在她眼里你是谁"）
 *
 * Static per relationship type. Client component reads optional URL params:
 *   ?his=<personality-slug>&her=<personality-slug>&c=<compatibility-0-100>
 * If params missing, falls back to the relationship's archetype defaults.
 *
 * No paywall — this page is itself the conversion mechanism for male users:
 * they finish reading → CTA → "测一下你自己的 CPTI 角色 →" or
 * "测你想要的亲密关系 → XPTI".
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  getRelationshipBySlug,
  getAllRelationshipSlugs,
} from '@/lib/cpti/relationships';
import { CptiHisPovClient } from './CptiHisPovClient';

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
    title: `在她眼里你是谁 · ${r.name} — CPTI`,
    description: `她邀请你测了「${r.name}」。这是给你的反向报告：她为什么这样看你、这段关系正在向哪里走、想稳住你可以先做这件事。`,
    alternates: { canonical: `/cpti/relationship/${type}/his/` },
    robots: { index: false, follow: true },
  };
}

export default async function CptiHisPovPage({ params }: PageProps) {
  const { type } = await params;
  const relationship = getRelationshipBySlug(type);
  if (!relationship) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8]" />}>
      <CptiHisPovClient relationship={relationship} />
    </Suspense>
  );
}
