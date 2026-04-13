import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始测试 — 三角TI 战区人格测试',
  description: '15 维度人格测试，测完直达你的战区人格图鉴卡。',
  robots: { index: false, follow: true },
};

export default function DeltaTestPage() {
  return (
    <Suspense>
      <Quiz
        resultPrefix="/wtfti/delta"
        variant="wtfti"
        finishingOverlay={{ emoji: '🎯', text: '正在翻译你的战区人格…' }}
      />
    </Suspense>
  );
}
