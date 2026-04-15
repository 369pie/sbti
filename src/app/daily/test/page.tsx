import { DailyQuiz } from '@/components/DailyQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '今日模式测试 — WTFTI',
  description: '6 道快问，一分钟测出你今天开了什么模式。每天题目不一样。',
  robots: { index: false, follow: true },
};

export default function DailyTestPage() {
  return <DailyQuiz />;
}
