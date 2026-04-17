import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FanrentiResultContent } from './FanrentiResultContent';
import { getFanrentiPersonality, getFanrentiSlugs, getFanrentiCharacter } from '@/lib/fanrenti/personalities';
import { FR_REALMS } from '@/lib/fanrenti/characters';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getFanrentiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getFanrentiPersonality(type);
  const c = getFanrentiCharacter(type);
  if (!p || !c) return {};
  const realm = FR_REALMS[c.realm];

  return {
    title: `凡人TI · 修仙 · 我是${c.name}（${realm.name}）`,
    description: `${p.tagline} — 凡人TI：${c.name} · ${realm.name}，你的修仙人格。`,
    keywords: [
      c.name,
      `${c.name} 人格`,
      `${c.name} MBTI`,
      '凡人修仙传',
      realm.name,
      '道友请留步',
      '凡人TI',
    ],
    alternates: { canonical: `/fanrenti/result/${type}/` },
    openGraph: {
      title: `凡人TI · 我是${c.name}`,
      description: p.tagline,
      url: getSiteUrl(`/fanrenti/result/${type}/`),
    },
    twitter: {
      card: 'summary',
      title: `凡人TI · 我是${c.name}`,
      description: p.tagline,
    },
  };
}

export default async function FanrentiResultPage({ params }: PageProps) {
  const { type } = await params;
  const p = getFanrentiPersonality(type);
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
              { '@type': 'ListItem', position: 2, name: '凡人TI', item: getSiteUrl('/fanrenti/') },
              { '@type': 'ListItem', position: 3, name: p.number, item: getSiteUrl(`/fanrenti/result/${type}/`) },
            ],
          }),
        }}
      />
      <FanrentiResultContent personality={p} />
    </>
  );
}
