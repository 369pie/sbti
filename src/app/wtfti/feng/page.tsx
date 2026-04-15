import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import FengLandingContent from './FengLandingContent';

export const metadata: Metadata = {
  title: '疯TI — 发疯宇宙人格测试',
  description: '疯TI 发疯宇宙：29 种纯文本 meme 人格，每一种都是你的互联网嘴替。零插画成本，全是梗。测测你到底是哪种疯。',
  keywords: ['疯TI', '发疯宇宙', 'WTFTI', '人格测试', 'meme人格', '发疯人格'],
  alternates: { canonical: '/wtfti/feng/' },
  openGraph: {
    title: '疯TI — 测测你的发疯人格',
    description: '29 种纯文本 meme 人格，零插画成本，全是梗。',
    url: getSiteUrl('/wtfti/feng/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '疯TI — 测测你的发疯人格',
    description: '29 种纯文本 meme 人格，零插画成本，全是梗。',
  },
};

export default function FengPage() {
  return <FengLandingContent />;
}
