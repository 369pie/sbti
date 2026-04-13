import { notFound } from 'next/navigation';
import { getIdentifyPersonaBySlug, getAllIdentifySlugs, getIdentifyTypeImage } from '@/lib/identify/personas';
import { IDENTIFY_DIMENSIONS } from '@/lib/identify/dimensions';
import type { DimensionLevel } from '@/lib/identify/dimensions';
import { IdentifyResultContent } from './IdentifyResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllIdentifySlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getIdentifyPersonaBySlug(type);
  if (!p) return {};
  return {
    title: `好友鉴定结果：${p.code}（${p.name}）— WTF 好友鉴定器`,
    description: `WTF 好友鉴定书：你的好友被鉴定为 ${p.name}。${p.tagline}`,
    alternates: { canonical: `/identify/result/${type}/` },
    openGraph: {
      title: `WTF 鉴定书：ta 居然是 ${p.code}（${p.name}）`,
      description: p.tagline,
      images: [{ url: getIdentifyTypeImage(p.slug), width: 256, height: 256, alt: p.name }],
    },
    twitter: {
      card: 'summary',
      title: `WTF 鉴定书：ta 居然是 ${p.code}（${p.name}）`,
      description: p.tagline,
    },
  };
}

export default async function IdentifyResultPage({ params }: PageProps) {
  const { type } = await params;
  const persona = getIdentifyPersonaBySlug(type);
  if (!persona) notFound();

  const dimensionScores = IDENTIFY_DIMENSIONS.map(dim => {
    const level = persona.profile[dim.id] as DimensionLevel;
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
                { '@type': 'ListItem', position: 2, name: '好友鉴定器', item: getSiteUrl('/identify/') },
                { '@type': 'ListItem', position: 3, name: persona.name, item: getSiteUrl(`/identify/result/${persona.slug}/`) },
              ],
            },
          ],
        }) }}
      />
      <IdentifyResultContent persona={persona} dimensionScores={dimensionScores} />
    </>
  );
}
