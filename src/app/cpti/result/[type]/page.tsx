import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCptiPersonalityBySlug, getAllCptiSlugs } from '@/lib/cpti/personalities';
import { CPTI_DIMENSIONS } from '@/lib/cpti/dimensions';
import type { DimensionLevel } from '@/lib/cpti/dimensions';
import { CptiResultContent } from './CptiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllCptiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getCptiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— CP角色鉴定结果`,
    description: `${p.tagline} — CPTI CP角色鉴定结果：${p.name}，五维度关系画像。`,
    alternates: { canonical: `/cpti/result/${type}/` },
    openGraph: {
      title: `我在关系里的CP角色是 ${p.code}（${p.name}）`,
      description: p.tagline,
      images: [{ url: `/images/types/cpti-${p.slug}.png`, width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我在关系里的CP角色是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function CptiResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getCptiPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = CPTI_DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
    return { id: dim.id, score, level };
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
                { '@type': 'ListItem', position: 2, name: 'CP角色鉴定', item: getSiteUrl('/cpti/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/cpti/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `CP角色 ${personality.code}（${personality.name}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是 CPTI CP角色鉴定的 16 种类型之一。${personality.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
        <CptiResultContent personality={personality} dimensionScores={dimensionScores} />
      </Suspense>
    </>
  );
}
