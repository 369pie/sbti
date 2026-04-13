import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getKingsPersonality, getKingsSlugs } from '@/lib/kings/personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { KingsResultContent } from './KingsResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getKingsSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const kp = getKingsPersonality(type);
  if (!kp) return {};

  return {
    title: `王者TI ${kp.number}（${kp.heroName}）— 峡谷人格图鉴`,
    description: `${kp.tagline} — 王者TI 峡谷宇宙：${kp.heroName}，你的峡谷人格翻译。`,
    keywords: [`${kp.heroName}`, `${kp.code}`, `王者TI ${kp.heroName}`, '王者TI 峡谷人格', '王者荣耀人格测试'],
    alternates: { canonical: `/wtfti/kings/result/${type}/` },
    openGraph: {
      title: `王者TI · 我在峡谷居然是${kp.heroName}？？`,
      description: kp.tagline,
      url: getSiteUrl(`/wtfti/kings/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `王者TI · 我在峡谷居然是${kp.heroName}？？`,
      description: kp.tagline,
    },
  };
}

export default async function KingsResultPage({ params }: PageProps) {
  const { type } = await params;
  const kingsPersonality = getKingsPersonality(type);
  if (!kingsPersonality) notFound();

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
            { '@type': 'ListItem', position: 2, name: '王者TI', item: getSiteUrl('/wtfti/kings/') },
            { '@type': 'ListItem', position: 3, name: `王者TI ${kingsPersonality.number}`, item: getSiteUrl(`/wtfti/kings/result/${type}/`) },
          ],
        }) }}
      />
      <KingsResultContent
        kingsPersonality={kingsPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
