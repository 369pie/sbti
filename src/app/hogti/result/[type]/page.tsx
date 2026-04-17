import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HogtiResultContent } from './HogtiResultContent';
import { getHogtiPersonality, getHogtiSlugs, getHogtiCharacter } from '@/lib/hogti/personalities';
import { HOG_HOUSES } from '@/lib/hogti/characters';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getHogtiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getHogtiPersonality(type);
  const c = getHogtiCharacter(type);
  if (!p || !c) return {};
  const house = HOG_HOUSES[c.house];

  return {
    title: `霍格沃茨TI · 我是${c.name}（${house.name}）`,
    description: `${p.tagline} — 霍格沃茨TI：${c.name} · ${house.name}，你的魔法世界人格。`,
    keywords: [
      c.name,
      c.nameEn,
      house.name,
      `${c.name} 人格测试`,
      `${c.name} MBTI`,
      '霍格沃茨TI',
      '哈利波特人格',
      '分院帽',
      '哈利波特 MBTI',
    ],
    alternates: { canonical: `/hogti/result/${type}/` },
    openGraph: {
      title: `霍格沃茨TI · 我是${c.name}`,
      description: p.tagline,
      url: getSiteUrl(`/hogti/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `霍格沃茨TI · 我是${c.name}`,
      description: p.tagline,
    },
  };
}

export default async function HogtiResultPage({ params }: PageProps) {
  const { type } = await params;
  const p = getHogtiPersonality(type);
  if (!p) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '霍格沃茨TI', item: getSiteUrl('/hogti/') },
              { '@type': 'ListItem', position: 3, name: `${p.number}`, item: getSiteUrl(`/hogti/result/${type}/`) },
            ],
          }),
        }}
      />
      <HogtiResultContent hogtiPersonality={p} />
    </>
  );
}
