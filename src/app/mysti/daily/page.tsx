import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import { getDailyCard, formatDateCN } from '@/lib/mysti/daily-card';
import { MystiDailyContent } from '@/components/MystiDailyContent';

export async function generateMetadata(): Promise<Metadata> {
  const card = getDailyCard();
  const dateStr = formatDateCN(new Date());

  return {
    title: `${dateStr} · ${card.arcanaNameCN} — WTFTI 每日一牌`,
    description: `${card.dailyReading} — 今日幸运色：${card.luckyColor}，幸运数：${card.luckyNumber}。`,
    keywords: ['每日塔罗', '塔罗牌', '每日一牌', 'WTFTI', '灵鉴', card.arcanaNameCN, card.arcanaName],
    alternates: { canonical: '/mysti/daily/' },
    openGraph: {
      title: `今日卡牌：${card.arcanaNameCN} — WTFTI`,
      description: card.dailyReading,
      url: getSiteUrl('/mysti/daily/'),
      images: [{ url: getSiteUrl('/images/mysti/og-default.png'), width: 1200, height: 630, alt: `每日一牌 · ${card.arcanaNameCN}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `今日卡牌：${card.arcanaNameCN} — WTFTI`,
      description: card.dailyReading,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `WTFTI 每日一牌 · ${dateStr}`,
        description: card.dailyReading,
        url: getSiteUrl('/mysti/daily/'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WTFTI',
          url: getSiteUrl('/'),
        },
      }),
    },
  };
}

export default function MystiDailyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0D17' }}>
          <div className="text-sm" style={{ color: '#A7B0C8' }}>加载中…</div>
        </div>
      }
    >
      <MystiDailyContent />
    </Suspense>
  );
}
