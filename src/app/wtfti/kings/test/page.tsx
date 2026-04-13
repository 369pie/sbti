import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始测试 — 王者TI 峡谷人格测试',
  description: '15 维度人格测试，测完直达你的峡谷人格图鉴卡。',
  robots: { index: false, follow: true },
};

export default function KingsTestPage() {
  return (
    <Suspense>
      <Quiz
        resultPrefix="/wtfti/kings"
        variant="wtfti"
        finishingOverlay={{ emoji: '⚔️', text: '正在翻译你的峡谷人格…' }}
      />
    </Suspense>
  );
}
