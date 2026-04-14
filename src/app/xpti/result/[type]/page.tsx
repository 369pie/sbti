import { notFound } from 'next/navigation';
import { getXptiPersonalityBySlug, getAllXptiSlugs, getXptiTypeImage } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';
import type { DimensionLevel } from '@/lib/xpti/dimensions';
import { XptiResultContent } from './XptiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllXptiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getXptiPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）— 恋爱XP体质测试结果 | XPTI`,
    description: `${p.tagline} — XPTI 恋爱XP体质测试结果：${p.name}，四轴恋爱DNA画像。`,
    alternates: { canonical: `/xpti/result/${type}/` },
    openGraph: {
      title: `我的恋爱XP体质是 ${p.code}（${p.name}）`,
      description: p.tagline,
      url: getSiteUrl(`/xpti/result/${type}/`),
      images: [{ url: getXptiTypeImage(type), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的恋爱XP体质是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function XptiResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getXptiPersonalityBySlug(type);
  if (!personality) notFound();

  const dimensionScores = XPTI_DIMENSIONS.map(dim => {
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
                { '@type': 'ListItem', position: 2, name: 'XPTI 恋爱XP体质', item: getSiteUrl('/xpti/') },
                { '@type': 'ListItem', position: 3, name: personality.name, item: getSiteUrl(`/xpti/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `恋爱XP体质 ${personality.code}（${personality.name}）是什么？`,
                  acceptedAnswer: { '@type': 'Answer', text: `${personality.name}是 XPTI 恋爱XP体质测试的 16 种类型之一。${personality.tagline}` },
                },
              ],
            },
          ],
        }) }}
      />
      <XptiResultContent personality={personality} dimensionScores={dimensionScores} />
    </>
  );
}
