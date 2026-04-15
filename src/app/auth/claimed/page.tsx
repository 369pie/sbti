import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ClaimedContent } from './ClaimedContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '认领账号 — WTFTI',
  description: '把你已保存的 CPTI 资产认领成正式账号，换设备也不会丢。',
  robots: { index: false, follow: false },
};

export default function ClaimedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <ClaimedContent />
    </Suspense>
  );
}
