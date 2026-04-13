import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getBirdPersonality, getBirdSlugs } from '@/lib/bird/personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { BirdResultContent } from './BirdResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getBirdSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const bp = getBirdPersonality(type);
  if (!bp) return {};

  return {
    title: `鸟TI ${bp.number}（${bp.birdName}·${bp.birdTitle}）— 鸟格图鉴`,
    description: `${bp.tagline} — 鸟TI 鸟类宇宙：${bp.birdName}·${bp.birdTitle}，你的鸟格翻译。`,
    keywords: [`${bp.birdTitle}`, `${bp.code}`, `鸟TI ${bp.birdName}`, '鸟TI 鸟格', '鸟类人格测试'],
    alternates: { canonical: `/bird/result/${type}/` },
    openGraph: {
      title: `鸟TI · 我居然是${bp.birdName}？？`,
      description: bp.tagline,
      url: getSiteUrl(`/bird/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `鸟TI · 我居然是${bp.birdName}？？`,
      description: bp.tagline,
    },
  };
}

export default async function BirdResultPage({ params }: PageProps) {
  const { type } = await params;
  const birdPersonality = getBirdPersonality(type);
  if (!birdPersonality) notFound();

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
            { '@type': 'ListItem', position: 2, name: '鸟TI', item: getSiteUrl('/bird/') },
            { '@type': 'ListItem', position: 3, name: `鸟TI ${birdPersonality.number}`, item: getSiteUrl(`/bird/result/${type}/`) },
          ],
        }) }}
      />
      <BirdResultContent
        birdPersonality={birdPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
