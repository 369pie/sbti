import { notFound } from 'next/navigation';
import { getFlowerPersonalityBySlug, getAllFlowerSlugs } from '@/lib/flower/personalities';
import { FLOWER_DIMENSIONS } from '@/lib/flower/dimensions';
import type { DimensionLevel } from '@/lib/flower/dimensions';
import { FlowerResultContent } from './FlowerResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllFlowerSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getFlowerPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.flower}（${p.name}）— 花格鉴定结果 | 花TI`,
    description: `${p.flowerLang} — 花TI 花格人格测试结果：${p.name}，四轴花格画像。`,
    alternates: { canonical: `/flower/result/${type}/` },
    openGraph: {
      title: `我的花格是 ${p.flower}（${p.name}）`,
      description: p.flowerLang,
    },
    twitter: {
      card: 'summary',
      title: `我的花格是 ${p.flower}（${p.name}）`,
      description: p.flowerLang,
    },
  };
}

export default async function FlowerResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getFlowerPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = FLOWER_DIMENSIONS.map(dim => {
    const level = personality.profile[dim.id] as DimensionLevel;
    const score = level === 'H' ? 2.7 : 1.3;
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
                { '@type': 'ListItem', position: 2, name: '花TI 花格鉴定', item: getSiteUrl('/flower/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/flower/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `花格 ${personality.code}（${personality.flower}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.flower}是花TI花格鉴定的 16 种花格之一。${personality.flowerLang}` },
                },
              ],
            },
          ],
        }) }}
      />
      <FlowerResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
