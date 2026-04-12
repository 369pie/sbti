import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getBantiPersonality, getBantiSlugs } from '@/lib/banti/personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { BantiResultContent } from './BantiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getBantiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const bp = getBantiPersonality(type);
  if (!bp) return {};

  return {
    title: `班TI ${bp.number}（${bp.workName}）— 职场人格图鉴`,
    description: `${bp.tagline} — 班TI 社畜宇宙：${bp.workName}，你的职场人设翻译。`,
    keywords: [`${bp.workName}`, `${bp.code}`, `班TI ${bp.workName}`, '班TI 职场人格', '社畜测试'],
    alternates: { canonical: `/wtfti/work/result/${type}/` },
    openGraph: {
      title: `班TI · 我在职场居然是${bp.workName}？？`,
      description: bp.tagline,
      url: getSiteUrl(`/wtfti/work/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `班TI · 我在职场居然是${bp.workName}？？`,
      description: bp.tagline,
    },
  };
}

export default async function BantiResultPage({ params }: PageProps) {
  const { type } = await params;
  const bantiPersonality = getBantiPersonality(type);
  if (!bantiPersonality) notFound();

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
            { '@type': 'ListItem', position: 2, name: '班TI', item: getSiteUrl('/wtfti/work/') },
            { '@type': 'ListItem', position: 3, name: `班TI ${bantiPersonality.number}`, item: getSiteUrl(`/wtfti/work/result/${type}/`) },
          ],
        }) }}
      />
      <BantiResultContent
        bantiPersonality={bantiPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
