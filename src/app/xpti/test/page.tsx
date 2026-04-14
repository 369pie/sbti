import { XptiQuiz } from '@/components/XptiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — XPTI 恋爱XP体质测试',
  description: '从大题池随机抽 20 题，测出你的恋爱XP体质。4 大恋爱轴、16 种XP体质。',
  robots: { index: false, follow: true },
};

export default function XptiTestPage() {
  return <XptiQuiz />;
}
