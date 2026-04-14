import { SoultiQuiz } from '@/components/SoultiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开启探索 — SoulTI 自然人格测试',
  description: '从更大题库里随机抽取 25 道自问，向内看见你是哪种自然力。5 轴觉察、32 种自然人格。',
  robots: { index: false, follow: true },
};

export default function SoultiTestPage() {
  return <SoultiQuiz />;
}
