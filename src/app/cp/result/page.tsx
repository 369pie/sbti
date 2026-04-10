import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CPResultContent } from './CPResultContent';

export const metadata: Metadata = {
  title: 'CP 配对结果 — SBTI',
  description: '看看你们的 SBTI 人格配对契合度！27 种人格 × 27 种人格 = 729 种配对组合。',
  robots: { index: false, follow: true },
};

export default function CPResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <CPResultContent />
    </Suspense>
  );
}
