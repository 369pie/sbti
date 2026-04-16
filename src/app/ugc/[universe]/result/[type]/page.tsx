import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getUgcUniverse, getUgcPersonality, getUgcSlugs, getUgcUniverseIds } from '@/lib/ugc/registry';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { UgcResultContent } from './UgcResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ universe: string; type: string }>;
};

export async function generateStaticParams() {
  const params: { universe: string; type: string }[] = [];
  for (const uid of getUgcUniverseIds()) {
    for (const slug of getUgcSlugs(uid)) {
      params.push({ universe: uid, type: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universe, type } = await params;
  const config = getUgcUniverse(universe);
  const p = getUgcPersonality(universe, type);
  if (!config || !p) return {};

  return {
    title: `${config.name} ${p.number}（${p.name}）— ${config.name}人格图鉴`,
    description: `${p.tagline} — ${config.name}：${p.name}，你的主题人格翻译。by ${config.creatorName}`,
    keywords: [p.name, p.code, `${config.name} ${p.name}`, `${config.name}人格测试`],
    alternates: { canonical: `/ugc/${config.id}/result/${type}/` },
    openGraph: {
      title: `${config.name} · 我居然是${p.name}？？`,
      description: p.tagline,
      url: getSiteUrl(`/ugc/${config.id}/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `${config.name} · 我居然是${p.name}？？`,
      description: p.tagline,
    },
  };
}

export default async function UgcResultPage({ params }: PageProps) {
  const { universe, type } = await params;
  const config = getUgcUniverse(universe);
  const ugcPersonality = getUgcPersonality(universe, type);
  if (!config || !ugcPersonality) notFound();

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
            { '@type': 'ListItem', position: 1, name: config.name, item: getSiteUrl(`/ugc/${config.id}/`) },
            { '@type': 'ListItem', position: 2, name: `${config.name} ${ugcPersonality.number}`, item: getSiteUrl(`/ugc/${config.id}/result/${type}/`) },
          ],
        }) }}
      />
      <UgcResultContent
        universeConfig={config}
        personality={ugcPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
