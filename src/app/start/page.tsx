import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import { StartContent } from './StartContent';

export const metadata: Metadata = {
  title: '测试大厅 · WTFTI',
  description:
    '从 90 秒首测开始，再看看 SoulTI、我和他、塔罗等女生向测试。每个结果都进你的档案，免费免注册，仅供娱乐与自我探索。',
  alternates: { canonical: '/start/' },
  openGraph: {
    title: '测试大厅 · WTFTI',
    description: '90 秒首测、SoulTI、我和他、塔罗——今天想测点什么？',
    url: getSiteUrl('/start/'),
    images: [{ url: getSiteUrl('/images/og-default.png'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '测试大厅 · WTFTI',
    description: '90 秒首测、SoulTI、我和他、塔罗——今天想测点什么？',
  },
};

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>加载中…</div>
        </main>
      }
    >
      <StartContent />
    </Suspense>
  );
}
