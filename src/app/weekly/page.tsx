import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WeeklySoulContent } from '@/components/WeeklySoulContent';

export const metadata: Metadata = {
  title: '每周灵魂频率 | WTF Card',
  description: '基于你的人格类型生成的每周灵魂频率 — 关键词、幸运色、能量指数',
};

export default function WeeklySoulPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    }>
      <WeeklySoulContent />
    </Suspense>
  );
}
