import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import KingsLandingContent from './KingsLandingContent';

export const metadata: Metadata = {
  title: '王者TI — WTF 我在峡谷居然是这种英雄？',
  description: '王者TI 峡谷宇宙：29 种峡谷人格，每一种都是你队友。共用 15 维度题包，直连 29 张峡谷图鉴卡。',
  keywords: ['王者TI', '王者荣耀人格', '峡谷人格', 'WTFTI', '人格测试', '性格测试'],
  alternates: { canonical: '/wtfti/kings/' },
  openGraph: {
    title: '王者TI — WTF 我在峡谷居然是这种英雄？',
    description: '29 种峡谷人格，每一种都是你队友。来测测你的王者TI。',
    url: getSiteUrl('/wtfti/kings/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '王者TI — WTF 我在峡谷居然是这种英雄？',
    description: '29 种峡谷人格，每一种都是你队友。来测测你的王者TI。',
  },
};

export default function KingsPage() {
  return <KingsLandingContent />;
}
