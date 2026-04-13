import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import BirdLandingContent from './BirdLandingContent';

export const metadata: Metadata = {
  title: '鸟TI — 测一下你是什么鸟？',
  description: '鸟TI 鸟类宇宙：29 种鸟格类型，每一种都是你。30 道鸟界场景题，看看你在鸟类世界是哪种鸟。',
  keywords: ['鸟TI', 'BDTI', '测一下你是什么鸟', '鸟格测试', 'WTFTI', '鸟类人格', '性格测试'],
  alternates: { canonical: '/bird/' },
  openGraph: {
    title: '鸟TI — 测一下你是什么鸟？',
    description: '29 种鸟 × 29 种你。30 道鸟界场景题，测测你是哪种鸟。',
    url: getSiteUrl('/bird/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '鸟TI — 测一下你是什么鸟？',
    description: '29 种鸟 × 29 种你。30 道鸟界场景题，测测你是哪种鸟。',
  },
};

export default function BirdPage() {
  return <BirdLandingContent />;
}
