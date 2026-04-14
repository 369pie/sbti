import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import PuzzleContent from './PuzzleContent';

export const metadata: Metadata = {
  title: '闺蜜人格拼图 — 4人拼出你们的化学反应 | WTFTI',
  description: '4个人，4块拼图，1张闺蜜卡。每人填一块人格拼图，拼完看你们的化学反应类型。',
  keywords: ['闺蜜拼图', '人格拼图', '闺蜜测试', '好友人格', '四人拼图', 'WTFTI'],
  alternates: { canonical: '/puzzle/' },
  openGraph: {
    title: '闺蜜人格拼图 — 4人拼出你们的化学反应',
    description: '4个人，4块拼图，1张闺蜜卡。每人填一块，拼完看化学反应。',
    url: getSiteUrl('/puzzle/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '闺蜜人格拼图 — 4人拼出你们的化学反应',
    description: '4个人，4块拼图，1张闺蜜卡。每人填一块，拼完看化学反应。',
  },
};

export default function PuzzlePage() {
  return (
    <Suspense>
      <PuzzleContent />
    </Suspense>
  );
}
