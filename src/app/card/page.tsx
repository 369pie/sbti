import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardContent } from './CardContent';

export const metadata: Metadata = {
  title: 'WTF Card — 你的多宇宙人格卡',
  description: '集齐所有宇宙测试结果，解锁你的专属 WTF Card。看看朋友和你有多像？',
  alternates: { canonical: '/card/' },
  robots: { index: true, follow: true },
};

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <CardContent />
    </Suspense>
  );
}
