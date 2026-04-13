import { JuetiQuiz } from '@/components/JuetiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始觉察 — 觉TI 自然人格测试',
  description: '20 道自问，向内看见你是哪种自然力。4 轴觉察、16 种自然人格。',
  robots: { index: false, follow: true },
};

export default function JuetiTestPage() {
  return <JuetiQuiz />;
}
