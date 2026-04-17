import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import SoultiMapContent from './SoultiMapContent';

export const metadata: Metadata = {
  title: 'SoulTI 灵魂图谱 · 32 种自然力全景',
  description: 'SoulTI 全部 32 种自然力人格类型按 5 轴聚类的全景图谱，一眼看清你和每个人的距离。',
  alternates: { canonical: '/soulti/map/' },
  openGraph: {
    title: 'SoulTI 灵魂图谱 · 32 种自然力全景',
    description: '32 种自然力 × 5 轴聚类的完整图谱。',
    url: getSiteUrl('/soulti/map/'),
  },
};

export default function Page() {
  return <SoultiMapContent />;
}
