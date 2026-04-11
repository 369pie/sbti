import { DrunkQuiz } from '@/components/DrunkQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '酒后人设测试 — SBTI',
  description: '6 道灵魂拷问，一分钟测出你的酒后人设。',
  robots: { index: false, follow: true },
};

export default function DrunkTestPage() {
  return <DrunkQuiz />;
}
