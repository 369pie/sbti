import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始测试 — WTFTI 人格测试',
  description: '同样的 15 维度测试，全新的 WTF 毒舌解读。答完直接落到你的 WTF 人格图鉴卡。',
  robots: { index: false, follow: true },
};

export default function WtftiTestPage() {
  return (
    <Suspense>
      <Quiz
        resultPrefix="/wtfti"
        variant="wtfti"
        finishingOverlay={{ emoji: '🤯', text: 'WTF…正在翻译你的人格…' }}
      />
    </Suspense>
  );
}
