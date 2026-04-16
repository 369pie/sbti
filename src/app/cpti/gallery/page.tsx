import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CptiGalleryContent } from '@/components/CptiGalleryContent';

export const metadata: Metadata = {
  title: 'CP关系图鉴 — CPTI',
  description: '25种CP关系类型图鉴 · 3个稀有度梯队 · 邀请朋友测试来收集更多关系类型',
  keywords: ['CPTI', 'CP关系', '关系图鉴', '关系类型', '灵魂伴侣', '相爱相杀'],
  alternates: { canonical: '/cpti/gallery/' },
  openGraph: {
    title: 'CP关系图鉴 — CPTI',
    description: '25种CP关系类型图鉴 · 3个稀有度梯队 · 邀请朋友测试来收集更多关系类型',
    url: getSiteUrl('/cpti/gallery/'),
  },
};

export default function CptiGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-sm text-text-muted">加载中…</div>
        </div>
      }
    >
      <CptiGalleryContent />
    </Suspense>
  );
}
