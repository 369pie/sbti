import { FlowerQuiz } from '@/components/FlowerQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — 花TI 花格鉴定',
  description: '20 道灵魂拷问，测出你的专属花朵。4 大花格轴、16 种花格。',
  robots: { index: false, follow: true },
};

export default function FlowerTestPage() {
  return <FlowerQuiz />;
}
