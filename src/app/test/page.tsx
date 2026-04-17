import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FirstLookQuiz } from '@/components/FirstLookQuiz';

export const metadata: Metadata = {
  title: '初见 · 3 分钟人格测试 — WTFti First Look',
  description:
    '10 道直觉题，3-4 分钟完成。九种女性原型、稀有度收藏、深潜方向自动推荐——毒舌 / 灵魂 / 塔罗。不是问卷，是一次被看见的小仪式。',
  alternates: { canonical: '/test/' },
  openGraph: {
    title: 'WTFti · 初见 · 翻开你的第一张牌',
    description: '10 道直觉题 · 9 种女性原型 · 3-4 分钟揭晓你的初见牌。',
  },
};

export default function TestPage() {
  return (
    <Suspense>
      <FirstLookQuiz />
    </Suspense>
  );
}
