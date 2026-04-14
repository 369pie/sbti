import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import RankContent from './RankContent';

export const metadata: Metadata = {
  title: '群组人格排行榜 — 你们群最多的人格是什么 | WTFTI',
  description: '创建群组人格排行榜，发到群里看看你们中最多的是什么人格。水群必备的人格统计工具。',
  keywords: ['群组排行榜', '人格排名', '群组人格', '人格统计', '水群', 'WTFTI'],
  alternates: { canonical: '/rank/' },
  openGraph: {
    title: '群组人格排行榜 — 你们群最多的人格是什么',
    description: '创建群组人格排行榜，发到群里让大家来加入。',
    url: getSiteUrl('/rank/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '群组人格排行榜 — 你们群最多的人格是什么',
    description: '创建群组人格排行榜，发到群里让大家来加入。',
  },
};

export default function RankPage() {
  return (
    <Suspense>
      <RankContent />
    </Suspense>
  );
}
