import { notFound } from 'next/navigation';
import { getSoultiPersonalityBySlug, getAllSoultiSlugs } from '@/lib/soulti/personalities';
import { SOULTI_DIMENSIONS } from '@/lib/soulti/dimensions';
import type { DimensionLevel } from '@/lib/soulti/dimensions';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { SoultiDeepReportContent } from './SoultiDeepReportContent';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllSoultiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getSoultiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `深度镜像报告「${p.name}」— SoulTI`,
    description: `${p.name}的轴间交叉解读、修复处方与灵魂长信。理解你为什么在关系里累——不是因为做错了什么，而是因为你的保护机制一直在默默运转。`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/soulti/report/${type}/` },
    openGraph: {
      title: `深度镜像报告「${p.name}」— SoulTI`,
      description: `${p.tagline} — 轴间交叉解读 · 修复处方 · 灵魂长信`,
      url: getSiteUrl(`/soulti/report/${type}/`),
    },
  };
}

export default async function SoultiReportPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getSoultiPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = SOULTI_DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return (
    <SoultiDeepReportContent personality={personality} dimensionScores={dimensionScores} />
  );
}
