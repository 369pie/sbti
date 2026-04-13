import { notFound } from 'next/navigation';
import { getJuetiPersonalityBySlug, getAllJuetiSlugs } from '@/lib/jueti/personalities';
import { JUETI_DIMENSIONS } from '@/lib/jueti/dimensions';
import type { DimensionLevel } from '@/lib/jueti/dimensions';
import { JuetiResultContent } from './JuetiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllJuetiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getJuetiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}「${p.name}」— 觉TI 自然人格觉察结果`,
    description: `${p.tagline} — 觉TI 自然人格觉察结果：${p.name}，四轴觉察画像。`,
    alternates: { canonical: `/jueti/result/${type}/` },
    openGraph: {
      title: `我的自然人格是「${p.name}」${p.code}`,
      description: p.tagline,
    },
    twitter: {
      card: 'summary',
      title: `我的自然人格是「${p.name}」${p.code}`,
      description: p.tagline,
    },
  };
}

export default async function JuetiResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getJuetiPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = JUETI_DIMENSIONS.map(dim => {
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
                { '@type': 'ListItem', position: 2, name: '觉TI 自然人格', item: getSiteUrl('/jueti/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/jueti/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `觉TI ${personality.code}「${personality.name}」是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是觉TI 自然人格觉察测试的 16 种类型之一。${personality.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <JuetiResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
