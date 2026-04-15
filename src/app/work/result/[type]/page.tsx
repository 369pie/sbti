import { notFound } from 'next/navigation';
import { getWorkPersonalityBySlug, getAllWorkSlugs, getWorkTypeImage } from '@/lib/work/personalities';
import { WORK_DIMENSIONS } from '@/lib/work/dimensions';
import type { DimensionLevel } from '@/lib/work/dimensions';
import { WorkResultContent } from './WorkResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllWorkSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getWorkPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— 打工人格测试结果`,
    description: `${p.tagline} — WPTI 打工人格测试结果：${p.name}，五维度职场画像。`,
    alternates: { canonical: `/work/result/${type}/` },
    openGraph: {
      title: `我的打工人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
      images: [{ url: getWorkTypeImage(p.slug), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的打工人设是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function WorkResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getWorkPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = WORK_DIMENSIONS.map(dim => {
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
                { '@type': 'ListItem', position: 2, name: '打工人格', item: getSiteUrl('/work/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/work/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `打工人格 ${personality.code}（${personality.name}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是 WPTI 打工人格测试的 16 种类型之一。${personality.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <WorkResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
