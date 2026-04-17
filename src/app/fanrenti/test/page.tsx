import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '入门问道 — 凡人TI · 修仙',
  description: '15 维度人格测试，你的道心将决定你在凡修世界里是哪一号修士。',
  robots: { index: false, follow: true },
};

export default function FanrentiTestPage() {
  return (
    <Suspense>
      <Quiz
        universeId="fanrenti"
        resultPrefix="/fanrenti"
        variant="wtfti"
        finishingOverlay={{ emoji: '🪷', text: '灵气运转中，正在推算你的道心…' }}
      />
    </Suspense>
  );
}
