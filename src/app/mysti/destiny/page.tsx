import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import DestinyClient from './DestinyClient';

const DESC =
  '灵鉴 · 命运缮写室 · 命书馆：八字 + 紫微双系统命书内测，每条结论标注典籍出处与四家共识置信度，不蒙猜不打诳语。';

export const metadata: Metadata = {
  title: '命书馆 · 灵鉴 · 命运缮写室',
  description: DESC,
  alternates: { canonical: '/mysti/destiny/' },
  openGraph: {
    title: '命书馆 · 灵鉴 · 命运缮写室',
    description: DESC,
    url: getSiteUrl('/mysti/destiny/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '命书馆 · 灵鉴 · 命运缮写室',
    description: DESC,
  },
};

export default function DestinyPage() {
  return <DestinyClient />;
}
