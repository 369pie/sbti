import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { DailyEphemerisClient } from './DailyEphemerisClient';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = (() => {
  const url = getSiteUrl('/wtfti/daily/');
  const title = 'WTFTI · 每日天象签 — 神域居民的晨之证神';
  const description = '每日打开一次，主神替你写一句早安签 — 来自 60 个真实天象 + 35 段星尘语录的女性精神生活晨间仪式。';
  return {
    title,
    description,
    keywords: ['WTFTI', '每日天象', '主神早安签', '星尘语录', '人格神域', 'Daily Ephemeris'],
    alternates: { canonical: url },
    openGraph: { title, description, type: 'article', url, siteName: 'WTFTI' },
    twitter: { card: 'summary_large_image', title, description },
  };
})();

export default function DailyPage() {
  return <DailyEphemerisClient />;
}
