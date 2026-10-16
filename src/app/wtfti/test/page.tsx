import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '经典文本版测试 — WTFTI 人格宇宙',
  description: 'WTFTI 经典文本版：15 维度快测，答完落到你的人格图鉴卡。想要完整仪式感，去人格神域花 90 秒召唤主神。',
  robots: { index: false, follow: true },
};

export default function WtftiTestPage() {
  return (
    <Suspense>
      <Quiz
        universeId="wtfti"
        resultPrefix="/wtfti"
        variant="wtfti"
        finishingOverlay={{ emoji: '🤯', text: 'WTF…正在翻译你的人格…' }}
      />
    </Suspense>
  );
}
