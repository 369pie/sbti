import { notFound } from 'next/navigation';
import { PERSONALITY_TYPES, getPersonalityBySlug, getAllSlugs, getTypeImage } from '@/lib/personalities';
import { DIMENSIONS, MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { ResultContent } from './ResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— SBTI 人格测试结果`,
    description: `${p.tagline} — SBTI 人格测试结果：${p.name}，了解你的 15 维度人格画像。`,
    keywords: [`${p.name}`, `${p.code}`, `SBTI ${p.name}`, 'SBTI 人格测试结果', '人格类型解释'],
    alternates: { canonical: `/result/${type}/` },
    openGraph: {
      title: `我的 SBTI 人格是 ${p.code}（${p.name}）`,
      description: p.tagline,
      url: getSiteUrl(`/result/${type}/`),
      images: [{ url: getTypeImage(p.slug), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的 SBTI 人格是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getPersonalityBySlug(type);
  if (!personality) notFound();

  // Build dimension scores from the personality profile for display
  const dimensionScores = DIMENSIONS.map(dim => {
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
                { '@type': 'ListItem', position: 2, name: '测试结果', item: getSiteUrl(`/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `SBTI 人格类型 ${personality.code}（${personality.name}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是 SBTI 人格测试的 27 种类型之一。${personality.tagline}` },
                },
                {
                  '@type': 'Question',
                  name: `如何获得 ${personality.code} 结果？`,
                  acceptedAnswer: { '@type': 'Answer', text: `通过 SBTI 人格测试的 5 组切面、15 个维度的问题，系统会综合算出你的人格类型。${personality.code} 是其中一种结果。` },
                },
              ],
            },
          ],
        }) }}
      />
      <ResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
