import { BirdQuiz } from '@/components/BirdQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — 鸟TI 鸟格测试',
  description: '30 道鸟界场景题 + 1 个森林派对隐藏分支。答完直飞你的鸟TI 鸟格图鉴卡。',
  robots: { index: false, follow: true },
};

export default function BirdTestPage() {
  return <BirdQuiz />;
}
