import { notFound } from 'next/navigation';
import { PERSONALITY_TYPES, getPersonalityBySlug, getAllSlugs } from '@/lib/personalities';
import { DIMENSIONS, MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { ResultContent } from './ResultContent';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— SBTI 人格测试结果`,
    description: p.tagline,
    openGraph: {
      title: `我的 SBTI 人格是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getPersonalityBySlug(type);
  if (!personality) notFound();

  // Build dimension scores from the personality profile for display
  const dimensionScores = DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return <ResultContent personality={personality} dimensionScores={dimensionScores} />;
}
