import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始分院 — 霍格沃茨TI',
  description: '15 维度人格测试，分院帽将为你选出 HP 角色 + 学院。',
  robots: { index: false, follow: true },
};

export default function HogtiTestPage() {
  return (
    <Suspense>
      <Quiz
        universeId="hogti"
        resultPrefix="/hogti"
        variant="wtfti"
        finishingOverlay={{ emoji: '⚡', text: '分院帽正在推算你的学院…' }}
      />
    </Suspense>
  );
}
