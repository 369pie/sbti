import type { Metadata } from 'next';

import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'WTFTI · 五感档案 — 你的灵魂频率',
  description:
    'WTFTI · 五感档案：把听觉/视觉/嗅觉/触觉/直觉合成一张你的灵魂频率雷达，附带「灵魂香水」与「灵魂质地」描述。',
  alternates: { canonical: '/wtfti/profile/' },
  openGraph: {
    type: 'profile',
    title: 'WTFTI · 五感档案 — 你的灵魂频率',
    description: '5 维灵魂雷达 + 灵魂香水 + 灵魂质地。',
  },
};

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function ProfilePage() {
  return <ProfileClient />;
}
