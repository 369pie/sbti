import { notFound } from 'next/navigation';
import { getWtftiPersonality, getWtftiSlugs } from '@/lib/wtfti-personalities';
import { MystiResultContent } from '@/components/MystiResultContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getMystiTarotData } from '@/lib/mysti/tarot-mapping';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getWtftiSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const wp = getWtftiPersonality(type);
  if (!wp) return {};

  const mysti = getMystiTarotData(type);
  const arcanaName = mysti?.majorArcana.name ?? '未知卡牌';

  return {
    title: `${wp.wtftiName} · ${arcanaName} — WTFTI 灵鉴`,
    description: `${mysti?.tagline ?? wp.tagline} — WTFTI 灵鉴：${wp.wtftiName} 的灵魂卡牌是 ${arcanaName}。`,
    keywords: [`${wp.wtftiName}`, `${wp.code}`, `WTFTI ${wp.wtftiName}`, 'WTFTI 灵鉴', '灵魂卡牌', '大阿卡纳'],
    alternates: { canonical: `/mysti/result/${type}/` },
    openGraph: {
      title: `我的灵鉴结果：${wp.wtftiName}`,
      description: mysti?.tagline ?? wp.tagline,
      url: getSiteUrl(`/mysti/result/${type}/`),
      images: [{ url: getSiteUrl('/images/mysti/og-default.png'), width: 1200, height: 630, alt: wp.wtftiName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `我的灵鉴结果：${wp.wtftiName}`,
      description: mysti?.tagline ?? wp.tagline,
    },
  };
}

export default async function MystiResultPage({ params }: PageProps) {
  const { type } = await params;
  const wtftiPersonality = getWtftiPersonality(type);
  if (!wtftiPersonality) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/wtfti/') },
              { '@type': 'ListItem', position: 2, name: '灵鉴', item: getSiteUrl('/mysti/') },
              { '@type': 'ListItem', position: 3, name: wtftiPersonality.wtftiName, item: getSiteUrl(`/mysti/result/${type}/`) },
            ],
          }),
        }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0B0D17 0%, #12152B 100%)' }}><div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>加载中…</div></div>}>
        <MystiResultContent wtftiPersonality={wtftiPersonality} />
      </Suspense>
    </>
  );
}
