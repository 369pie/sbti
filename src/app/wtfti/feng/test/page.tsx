import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始测试 — 疯TI 发疯人格测试',
  description: '15 维度人格测试，测完直达你的发疯人格图鉴卡。纯文本 meme，零插画成本，全是梗。',
  robots: { index: false, follow: true },
};

export default function FengTestPage() {
  return (
    <Suspense>
      <Quiz
        universeId="feng"
        resultPrefix="/wtfti/feng"
        variant="wtfti"
        finishingOverlay={{ emoji: '😈', text: '正在翻译你的发疯人格…' }}
      />
    </Suspense>
  );
}
