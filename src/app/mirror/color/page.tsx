import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { ColorSeasonClient } from './ColorSeasonClient';

const DESC = '三道小问题测色彩季型，写进你的档案，让今日幸运色更准。';

export const metadata: Metadata = {
  title: '色彩季型 · 美我',
  description: DESC,
  alternates: { canonical: '/mirror/color/' },
  openGraph: {
    title: '色彩季型 · 美我 · WTFTI',
    description: DESC,
    url: getSiteUrl('/mirror/color/'),
    type: 'website',
    siteName: 'WTFTI',
  },
};

export default function ColorSeasonPage() {
  return <ColorSeasonClient />;
}
