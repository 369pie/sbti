import { Quiz } from '@/components/Quiz';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '开始测试 — SBTI 人格测试',
  description: '一题一题答，最后直接落到你的人格页。',
};

export default function TestPage() {
  return (
    <Suspense>
      <Quiz />
    </Suspense>
  );
}
