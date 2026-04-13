import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import DeltaLandingContent from './DeltaLandingContent';

export const metadata: Metadata = {
  title: '三角TI — WTF 我在三角洲居然是这种兵？',
  description: '三角TI 战区宇宙：29 种战区人格，每一种都是你的队友。共用 15 维度题包，直连 29 张战区图鉴卡。',
  keywords: ['三角TI', '三角洲行动人格', '战区人格', 'WTFTI', '人格测试', '性格测试', 'Delta Force'],
  alternates: { canonical: '/wtfti/delta/' },
  openGraph: {
    title: '三角TI — WTF 我在三角洲居然是这种兵？',
    description: '29 种战区人格，每一种都是你的队友。来测测你的三角TI。',
    url: getSiteUrl('/wtfti/delta/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '三角TI — WTF 我在三角洲居然是这种兵？',
    description: '29 种战区人格，每一种都是你的队友。来测测你的三角TI。',
  },
};

export default function DeltaPage() {
  return <DeltaLandingContent />;
}
