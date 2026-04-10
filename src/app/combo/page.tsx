import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ComboContent } from './ComboContent';

export const metadata: Metadata = {
  title: '人格拼盘 — SBTI × MBTI × 星座',
  description: '把你的 SBTI 人格、MBTI 类型和星座拼在一起，解锁专属的组合称号和毒舌分析。',
  alternates: { canonical: '/combo/' },
  robots: { index: true, follow: true },
};

export default function ComboPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <ComboContent />
    </Suspense>
  );
}
