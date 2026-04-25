import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CptiCodexClient } from './CptiCodexClient';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '我的关系图鉴 · CPTI Codex | WTFTI',
  description:
    '把你测过的每一段关系都留下来。CPTI 关系档案夹按对象 / 闺蜜 / 家人 / 同事 / 死对头分组，可重测、可备注、可导出。',
  alternates: { canonical: getSiteUrl('/cpti/me/codex/') },
  robots: { index: false, follow: true },
};

export default function CptiCodexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <CptiCodexClient />
    </Suspense>
  );
}
