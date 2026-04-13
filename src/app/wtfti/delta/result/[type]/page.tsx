import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getDeltaPersonality, getDeltaSlugs } from '@/lib/delta/personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { DeltaResultContent } from './DeltaResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getDeltaSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const dp = getDeltaPersonality(type);
  if (!dp) return {};

  return {
    title: `三角TI ${dp.number}（${dp.heroName}）— 战区人格图鉴`,
    description: `${dp.tagline} — 三角TI 战区宇宙：${dp.heroName}，你的战区人格翻译。`,
    keywords: [`${dp.heroName}`, `${dp.code}`, `三角TI ${dp.heroName}`, '三角TI 战区人格', '三角洲行动人格测试'],
    alternates: { canonical: `/wtfti/delta/result/${type}/` },
    openGraph: {
      title: `三角TI · 我在三角洲居然是${dp.heroName}？？`,
      description: dp.tagline,
      url: getSiteUrl(`/wtfti/delta/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `三角TI · 我在三角洲居然是${dp.heroName}？？`,
      description: dp.tagline,
    },
  };
}

export default async function DeltaResultPage({ params }: PageProps) {
  const { type } = await params;
  const deltaPersonality = getDeltaPersonality(type);
  if (!deltaPersonality) notFound();

  const basePersonality = getPersonalityBySlug(type);
  const dimensionScores = basePersonality
    ? DIMENSIONS.map(dim => {
        const level = basePersonality.profile[dim.id] as DimensionLevel;
        const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
        return { id: dim.id, score, level };
      })
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/wtfti/') },
            { '@type': 'ListItem', position: 2, name: '三角TI', item: getSiteUrl('/wtfti/delta/') },
            { '@type': 'ListItem', position: 3, name: `三角TI ${deltaPersonality.number}`, item: getSiteUrl(`/wtfti/delta/result/${type}/`) },
          ],
        }) }}
      />
      <DeltaResultContent
        deltaPersonality={deltaPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
