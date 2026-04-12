import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import WtftiLandingContent from './WtftiLandingContent';

export const metadata: Metadata = {
  title: 'WTFTI — WTF 我居然是这种人？',
  description: 'WTFTI 人格图鉴：29 种 WTF 人格，每一种都说中你。同样的 15 维度测试，全新的毒舌解读。',
  keywords: ['WTFTI', 'WTF人格', '人格测试', '人格图鉴', 'SBTI', '性格测试', '心理测试'],
  alternates: { canonical: '/wtfti/' },
  openGraph: {
    title: 'WTFTI — WTF 我居然是这种人？',
    description: '29 种 WTF 人格，每一种都说中你。来测测你的 WTF 人格。',
    url: getSiteUrl('/wtfti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WTFTI — WTF 我居然是这种人？',
    description: '29 种 WTF 人格，每一种都说中你。来测测你的 WTF 人格。',
  },
};

export default function WtftiPage() {
  return <WtftiLandingContent />;
}
