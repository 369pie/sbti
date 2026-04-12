import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getWtftiPersonality, getWtftiSlugs } from '@/lib/wtfti-personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { WtftiResultContent } from './WtftiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getWtftiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const wp = getWtftiPersonality(type);
  if (!wp) return {};

  return {
    title: `WTF ${wp.number}（${wp.wtftiName}）— WTFTI 人格图鉴`,
    description: `${wp.tagline} — WTFTI 人格图鉴卡：${wp.wtftiName}，你的隐藏人格翻译。`,
    keywords: [`${wp.wtftiName}`, `${wp.code}`, `WTFTI ${wp.wtftiName}`, 'WTFTI 人格测试', 'WTF人格'],
    alternates: { canonical: `/wtfti/result/${type}/` },
    openGraph: {
      title: `WTF 我居然是${wp.wtftiName}？？`,
      description: wp.tagline,
      url: getSiteUrl(`/wtfti/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `WTF 我居然是${wp.wtftiName}？？`,
      description: wp.tagline,
    },
  };
}

export default async function WtftiResultPage({ params }: PageProps) {
  const { type } = await params;
  const wtftiPersonality = getWtftiPersonality(type);
  if (!wtftiPersonality) notFound();

  // Get base personality for dimension data (new types won't have one)
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
            { '@type': 'ListItem', position: 2, name: `WTF ${wtftiPersonality.number}`, item: getSiteUrl(`/wtfti/result/${type}/`) },
          ],
        }) }}
      />
      <WtftiResultContent
        wtftiPersonality={wtftiPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
