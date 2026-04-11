import { notFound } from 'next/navigation';
import { getDailyStatusBySlug, getAllDailySlugs, getDailyTypeImage } from '@/lib/daily/statuses';
import { DAILY_DIMENSIONS } from '@/lib/daily/dimensions';
import type { DimensionLevel } from '@/lib/daily/dimensions';
import { DailyResultContent } from './DailyResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllDailySlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const s = getDailyStatusBySlug(type);
  if (!s) return {};
  return {
    title: `${s.code}（${s.name}）— 今日模式`,
    description: `${s.tagline} — SBTI 今日模式测试结果：${s.name}。`,
    alternates: { canonical: `/daily/result/${type}/` },
    openGraph: {
      title: `我今天开的模式是 ${s.code}（${s.name}）`,
      description: s.tagline,
      images: [{ url: getDailyTypeImage(s.slug), width: 256, height: 256, alt: s.name }],
    },
    twitter: {
      card: 'summary',
      title: `我今天开的模式是 ${s.code}（${s.name}）`,
      description: s.tagline,
    },
  };
}

export default async function DailyResultPage({ params }: PageProps) {
  const { type } = await params;
  const status = getDailyStatusBySlug(type);
  if (!status) notFound();

  const dimensionScores = DAILY_DIMENSIONS.map(dim => {
    const level = status.profile[dim.id] as DimensionLevel;
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
                { '@type': 'ListItem', position: 2, name: '今日模式', item: getSiteUrl('/daily/') },
                { '@type': 'ListItem', position: 3, name: status.name, item: getSiteUrl(`/daily/result/${status.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `今日模式 ${status.code}（${status.name}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${status.name}是 SBTI 今日模式测试的 12 种状态之一。${status.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <DailyResultContent status={status} dimensionScores={dimensionScores} />
    </>
  );
}
