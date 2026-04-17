import type { Metadata } from 'next';
import { MystiMoodContent } from '@/components/MystiMoodContent';

export const metadata: Metadata = {
  title: '今日心情 — WTFTI 灵鉴',
  description: '一个 emoji 标记今天的灵魂状态，月底自动汇成你的灵魂月报。',
  alternates: { canonical: '/mysti/mood/' },
  robots: { index: false, follow: false },
};

export default function MystiMoodPage() {
  return <MystiMoodContent />;
}
