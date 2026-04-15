import { Suspense } from 'react';
import type { Metadata } from 'next';
import JoinContent from './JoinContent';

export const metadata: Metadata = {
  title: '输入配对码 — CPTI',
  description: '输入六位配对码，加入你的CP测试。',
  robots: { index: false, follow: false },
};

export default function CptiJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
