import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { Suspense } from 'react';
import { MystiCollectionContent } from '@/components/MystiCollectionContent';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '我的图鉴 — WTFTI 灵鉴',
    description: '你的专属人格图鉴墙，收集所有宇宙的测试结果，看看你解锁了多少种隐藏人格。',
    keywords: ['图鉴墙', '人格收藏', 'WTFTI', '灵鉴', '人格测试结果'],
    alternates: { canonical: '/mysti/collection/' },
    openGraph: {
      title: '我的图鉴墙 — WTFTI 灵鉴',
      description: '收集所有宇宙的测试结果，看看你解锁了多少种隐藏人格。',
      url: getSiteUrl('/mysti/collection/'),
      images: [{ url: getSiteUrl('/images/mysti/og-default.png'), width: 1200, height: 630, alt: 'WTFTI 图鉴墙' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '我的图鉴墙 — WTFTI 灵鉴',
      description: '收集所有宇宙的测试结果，看看你解锁了多少种隐藏人格。',
      images: [getSiteUrl('/images/mysti/og-default.png')],
    },
    robots: { index: false, follow: true },
  };
}

export default function MystiCollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0D17]" />}>
      <MystiCollectionContent />
    </Suspense>
  );
}
