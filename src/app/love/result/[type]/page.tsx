import { notFound } from 'next/navigation';
import { getLovePersonalityBySlug, getAllLoveSlugs, getLoveTypeImage } from '@/lib/love/personalities';
import { LOVE_DIMENSIONS } from '@/lib/love/dimensions';
import type { DimensionLevel } from '@/lib/love/dimensions';
import { LoveResultContent } from './LoveResultContent';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllLoveSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getLovePersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— 恋爱人格测试结果`,
    description: `${p.tagline} — LPTI 恋爱人格测试结果：${p.name}，五维度恋爱画像。`,
    alternates: { canonical: `/love/result/${type}/` },
    openGraph: {
      title: `我的恋爱人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
      images: [{ url: getLoveTypeImage(p.slug), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的恋爱人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function LoveResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getLovePersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = LOVE_DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return <LoveResultContent personality={personality} dimensionScores={dimensionScores} />;
}
