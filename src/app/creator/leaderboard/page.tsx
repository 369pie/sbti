import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { LeaderboardContent } from './LeaderboardContent';

export const metadata: Metadata = {
  title: '创作者排行榜 — WTFTI 创作者平台',
  description: 'WTFTI 创作者排行榜：查看最受欢迎的创作者和人格宇宙。',
  alternates: { canonical: '/creator/leaderboard/' },
  openGraph: {
    title: 'WTFTI 创作者排行榜',
    description: '最受欢迎的创作者和人格宇宙',
    url: getSiteUrl('/creator/leaderboard/'),
  },
};

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
