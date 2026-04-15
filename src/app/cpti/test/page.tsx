import { Suspense } from 'react';
import { CptiQuizWrapper } from '@/components/CptiQuizWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — CP角色图鉴 CPTI',
  description: '20 道真实恋爱场景，测出你在关系里是什么角色。5 个关系维度、16 种CP角色。',
  robots: { index: false, follow: true },
};

export default function CptiTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <CptiQuizWrapper />
    </Suspense>
  );
}
