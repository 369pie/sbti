import type { Metadata } from 'next';

import { MoonClient } from './MoonClient';

export const metadata: Metadata = {
  title: 'WTFTI · 月相章节 — 12 题灵魂日课',
  description:
    'WTFTI · 月相章节：跟随月相 12 期，每期一道灵魂日课，解锁神龛装饰物 + 大祭司称号 + 30 天后的未来信件。',
  alternates: { canonical: '/wtfti/moon/' },
  openGraph: {
    type: 'profile',
    title: 'WTFTI · 月相章节 — 12 题灵魂日课',
    description: '跟月亮一起，写一个 12 期的精神日记。',
  },
};

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function MoonPage() {
  return <MoonClient />;
}
