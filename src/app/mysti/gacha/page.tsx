import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import { MystiGachaContent } from '@/components/MystiGachaContent';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '每日抽卡 — WTFTI 灵鉴',
    description: '每天抽取一张来自不同宇宙的灵魂卡牌，收集稀有卡牌，分享你的收藏。普通、精良、稀有、传说四种稀有度等你来发现！',
    keywords: ['每日抽卡', '灵魂卡牌', 'WTFTI', '灵鉴', '抽卡', '卡牌收集', '稀有度'],
    alternates: { canonical: '/mysti/gacha/' },
    openGraph: {
      title: '每日抽卡 — WTFTI 灵鉴',
      description: '每天抽取一张来自不同宇宙的灵魂卡牌，收集稀有卡牌，分享你的收藏。',
      url: getSiteUrl('/mysti/gacha/'),
      images: [{ url: getSiteUrl('/images/mysti/og-default.png'), width: 1200, height: 630, alt: 'WTFTI 每日抽卡' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: '每日抽卡 — WTFTI 灵鉴',
      description: '每天抽取一张来自不同宇宙的灵魂卡牌，收集稀有卡牌，分享你的收藏。',
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'WTFTI 每日抽卡',
        description: '每天抽取一张来自不同宇宙的灵魂卡牌，收集稀有卡牌，分享你的收藏。',
        url: getSiteUrl('/mysti/gacha/'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WTFTI',
          url: getSiteUrl('/'),
        },
      }),
    },
  };
}

export default function MystiGachaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>加载中…</div>
        </div>
      }
    >
      <MystiGachaContent />
    </Suspense>
  );
}
