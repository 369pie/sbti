import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { ArchiveClient } from './ArchiveClient';

export const metadata: Metadata = {
  title: 'XPTI · 张力档案 / 复测对照',
  description:
    '回看你过去几次的 XPTI 测试，对比张力签名变化轨迹，发现你这一年里在亲密偏好上的真实位移。',
  alternates: { canonical: '/xpti/archive/' },
  openGraph: {
    title: 'XPTI · 张力档案',
    description: '复测、对比、年度轨迹——把每一次自我描述都收进档案。',
    url: getSiteUrl('/xpti/archive/'),
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export default function XptiArchivePage() {
  return <ArchiveClient />;
}
