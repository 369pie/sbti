import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getSiteUrl } from '@/lib/site';
import { fetchLeaderboard } from '@/lib/ugc/earnings';
import { createPublicServerSupabaseClient } from '@/lib/supabase/server-public';
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

const loadCreatorLeaderboard = unstable_cache(
  async () => {
    const supabase = createPublicServerSupabaseClient();
    return fetchLeaderboard(supabase, 50);
  },
  ['creator-public-leaderboard-v1'],
  { revalidate: 60 },
);

export default async function LeaderboardPage() {
  const entries = await loadCreatorLeaderboard();
  return <LeaderboardContent entries={entries} />;
}
