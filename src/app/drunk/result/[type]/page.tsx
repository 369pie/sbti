import { notFound } from 'next/navigation';
import { getDrunkPersonaBySlug, getAllDrunkSlugs, getDrunkTypeImage } from '@/lib/drunk/personas';
import { DRUNK_DIMENSIONS } from '@/lib/drunk/dimensions';
import type { DimensionLevel } from '@/lib/drunk/dimensions';
import { DrunkResultContent } from './DrunkResultContent';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllDrunkSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getDrunkPersonaBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— 酒后人设`,
    description: `${p.tagline} — SBTI 酒后人设测试结果：${p.name}。`,
    alternates: { canonical: `/drunk/result/${type}/` },
    openGraph: {
      title: `我的酒后人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
      images: [{ url: getDrunkTypeImage(p.slug), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的酒后人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function DrunkResultPage({ params }: PageProps) {
  const { type } = await params;
  const persona = getDrunkPersonaBySlug(type);
  if (!persona) notFound();

  const dimensionScores = DRUNK_DIMENSIONS.map(dim => {
    const level = persona.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return <DrunkResultContent persona={persona} dimensionScores={dimensionScores} />;
}
