import { notFound } from 'next/navigation';
import { getPersonalityBySlug, getAllSlugs, getTypeImage, getXiuxianTypeImage } from '@/lib/personalities';
import { DIMENSIONS, MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { ResultContent } from './ResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getXiuxianSkin } from '@/lib/xiuxian';
import { getXiuxianLaunchOnlySlugs, getXiuxianLaunchOnlyTypeBySlug } from '@/lib/xiuxian-v2';
type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return [...getAllSlugs(), ...getXiuxianLaunchOnlySlugs()].map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getPersonalityBySlug(type) ?? getXiuxianLaunchOnlyTypeBySlug(type);
  if (!p) return {};

  const xiuxianSkin = p.isLaunchOnly ? getXiuxianSkin(p.slug) : undefined;
  const displayName = xiuxianSkin?.displayName ?? p.name;
  const displayTagline = xiuxianSkin?.tagline ?? p.tagline;
  const ogImage = p.isLaunchOnly ? getXiuxianTypeImage(p.slug) : getTypeImage(p.slug);

  return {
    title: `${p.code}（${displayName}）— SBTI 人格测试结果`,
    description: `${displayTagline} — SBTI 人格测试结果：${displayName}，了解你的 15 维度人格画像。`,
    keywords: [`${displayName}`, `${p.code}`, `SBTI ${displayName}`, 'SBTI 人格测试结果', '人格类型解释'],
    alternates: { canonical: `/result/${type}/` },
    openGraph: {
      title: p.isLaunchOnly ? `我的 SBTI 本命灵兽是 ${p.code}（${displayName}）` : `我的 SBTI 人格是 ${p.code}（${displayName}）`,
      description: displayTagline,
      url: getSiteUrl(`/result/${type}/`),
      images: [{ url: ogImage, width: 256, height: 256, alt: displayName }],
    },
    twitter: {
      card: 'summary',
      title: p.isLaunchOnly ? `我的 SBTI 本命灵兽是 ${p.code}（${displayName}）` : `我的 SBTI 人格是 ${p.code}（${displayName}）`,
      description: displayTagline,
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { type } = await params;
  const personality = getPersonalityBySlug(type) ?? getXiuxianLaunchOnlyTypeBySlug(type);
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
                { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
                { '@type': 'ListItem', position: 2, name: '测试结果', item: getSiteUrl(`/result/${personality.slug}/`) },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `SBTI 人格类型 ${personality.code}（${personality.name}）是什么？`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: personality.isLaunchOnly
                      ? `${personality.name}是 SBTI 修仙 2.0 首发隐藏卡之一。${personality.tagline}`
                      : `${personality.name}是 SBTI 人格测试的 27 种类型之一。${personality.tagline}`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `如何获得 ${personality.code} 结果？`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: personality.isLaunchOnly
                      ? `${personality.code} 当前作为修仙 2.0 首发隐藏卡提供浏览和分享入口，暂不进入主测试打分链路。`
                      : `通过 SBTI 人格测试的 5 组切面、15 个维度的问题，系统会综合算出你的人格类型。${personality.code} 是其中一种结果。`,
                  },
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
