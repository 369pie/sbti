import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import { StartContent } from './StartContent';

export const metadata: Metadata = {
  title: '90 秒看见我自己 · WTFTI',
  description:
    '三个问题，找到为「她」量身的入口——认识她 / 陪着她 / 一起写下她。WTFTI 新生引导，仅供娱乐与自我观察。',
  alternates: { canonical: '/start/' },
  openGraph: {
    title: '90 秒看见我自己 · WTFTI',
    description: '三个问题，找到属于你的支柱入口。',
    url: getSiteUrl('/start/'),
    images: [{ url: getSiteUrl('/images/og-default.png'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '90 秒看见我自己 · WTFTI',
    description: '三个问题，找到属于你的支柱入口。',
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
