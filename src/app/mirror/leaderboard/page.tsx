import type { Metadata } from 'next';
import MirrorLeaderboardClient from './MirrorLeaderboardClient';

export const metadata: Metadata = {
  title: '灵镜排行榜 — WTFTI',
  description: '看看大家都在用灵镜测什么，最热门的色彩季节和风格类型。',
  alternates: { canonical: '/mirror/leaderboard/' },
};

export default function MirrorLeaderboardPage() {
  return <MirrorLeaderboardClient />;
}
