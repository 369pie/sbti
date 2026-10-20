import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FirstLookQuiz } from '@/components/FirstLookQuiz';

export const metadata: Metadata = {
  title: '90 秒首测 · 看看你是谁 — WTFTI',
  description: '10 道凭直觉的小题，约 90 秒。测出你的女生人格，顺手存下一份自己的档案和每天一张今日卡。免费、免注册，仅供娱乐与自我探索。',
  alternates: { canonical: '/test/' },
  openGraph: {
    title: 'WTFTI · 90 秒首测，看看你是谁',
    description: '10 道直觉题 · 9 种女生人格 · 测完送你一张今日卡',
  },
};

export default function TestPage() {
  return (
    <Suspense>
      <FirstLookQuiz />
    </Suspense>
  );
}
