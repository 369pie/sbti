import { notFound } from 'next/navigation';
import { getSoultiPersonalityBySlug, getAllSoultiSlugs } from '@/lib/soulti/personalities';
import { SOULTI_DIMENSIONS } from '@/lib/soulti/dimensions';
import type { DimensionLevel } from '@/lib/soulti/dimensions';
import { SoultiResultContent } from './SoultiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllSoultiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getSoultiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}「${p.name}」— SoulTI 自然人格探索结果`,
    description: `${p.tagline} — SoulTI 自然人格探索结果：${p.name}，五轴画像。`,
    alternates: { canonical: `/soulti/result/${type}/` },
    openGraph: {
      title: `我的自然人格是「${p.name}」${p.code}`,
      description: p.tagline,
      url: getSiteUrl(`/soulti/result/${type}/`),
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的自然人格是「${p.name}」${p.code}`,
      description: p.tagline,
    },
  };
}

export default async function SoultiResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getSoultiPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = SOULTI_DIMENSIONS.map(dim => {
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
                { '@type': 'ListItem', position: 1, name: 'SBTI 人格测试', item: getSiteUrl('/') },
                { '@type': 'ListItem', position: 2, name: 'SoulTI 自然人格', item: getSiteUrl('/soulti/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/soulti/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `SoulTI ${personality.code}「${personality.name}」是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是 SoulTI 自然人格探索测试的 32 种类型之一。${personality.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <SoultiResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
