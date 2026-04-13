import { LoveQuiz } from '@/components/LoveQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — 恋爱人格测试 LPTI',
  description: '15 道灵魂拷问，测出你是哪种恋爱人设。5 个恋爱维度、16 张恋爱人设卡。',
  robots: { index: false, follow: true },
};

export default function LoveTestPage() {
  return <LoveQuiz />;
}
