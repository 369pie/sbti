import { notFound } from 'next/navigation';
import { getWorkPersonalityBySlug, getAllWorkSlugs } from '@/lib/work/personalities';
import { WORK_DIMENSIONS } from '@/lib/work/dimensions';
import type { DimensionLevel } from '@/lib/work/dimensions';
import { WorkResultContent } from './WorkResultContent';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllWorkSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getWorkPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— 打工人格测试结果`,
    description: `${p.tagline} — WPTI 打工人格测试结果：${p.name}，五维度职场画像。`,
    alternates: { canonical: `/work/result/${type}/` },
    openGraph: {
      title: `我的打工人格是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
    twitter: {
      card: 'summary',
      title: `我的打工人格是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function WorkResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getWorkPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = WORK_DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return <WorkResultContent personality={personality} dimensionScores={dimensionScores} />;
}
