import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShardDetailContent } from './ShardDetailContent';

export const metadata: Metadata = {
  title: '人格碎片详情 — WTFTI',
  description: '你的人格碎片今天说了什么？看看这枚碎片的语气、节拍、心绪和共鸣。',
  alternates: { canonical: '/card/shard/' },
  robots: { index: false, follow: false },
};

export default function ShardDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShardDetailContent />
    </Suspense>
  );
}
