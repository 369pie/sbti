import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '经典 SBTI · 46 题完整版 — WTFTI',
  description: '原版 SBTI 46 题完整人格测试。5 组切面、15 个维度、27 种人格等你解锁。新用户推荐先做 3-4 分钟的「初见」测试。',
  alternates: { canonical: '/test/classic/' },
  robots: { index: false, follow: true },
};

export default function ClassicTestPage() {
  return (
    <Suspense>
      <Quiz />
    </Suspense>
  );
}
