import { notFound } from 'next/navigation';
import { getPersonalityBySlug } from '@/lib/personalities';
import { getFengPersonality, getFengSlugs } from '@/lib/feng/personalities';
import { DIMENSIONS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { FengResultContent } from './FengResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getFengSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const fp = getFengPersonality(type);
  if (!fp) return {};

  return {
    title: `疯TI ${fp.number}（${fp.fengName}）— 发疯宇宙人格图鉴`,
    description: `${fp.tagline} — 疯TI 发疯宇宙：${fp.fengName}，纯文本 meme 人格测试。`,
    keywords: [`${fp.fengName}`, `${fp.code}`, `疯TI ${fp.fengName}`, '发疯宇宙', '疯TI 人格测试'],
    alternates: { canonical: `/wtfti/feng/result/${type}/` },
    openGraph: {
      title: `疯TI · 我竟然是${fp.fengName}？？`,
      description: fp.tagline,
      url: getSiteUrl(`/wtfti/feng/result/${type}/`),
      images: [{ url: getSiteUrl('/images/og-default.png'), width: 1200, height: 630, alt: fp.fengName }],
    },
    twitter: {
      card: 'summary',
      title: `疯TI · 我竟然是${fp.fengName}？？`,
      description: fp.tagline,
    },
  };
}

export default async function FengResultPage({ params }: PageProps) {
  const { type } = await params;
  const fengPersonality = getFengPersonality(type);
  if (!fengPersonality) notFound();

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
            { '@type': 'ListItem', position: 2, name: '疯TI', item: getSiteUrl('/wtfti/feng/') },
            { '@type': 'ListItem', position: 3, name: `疯TI ${fengPersonality.number}`, item: getSiteUrl(`/wtfti/feng/result/${type}/`) },
          ],
        }) }}
      />
      <FengResultContent
        fengPersonality={fengPersonality}
        dimensionScores={dimensionScores}
      />
    </>
  );
}
