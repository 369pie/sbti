import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MystiGiftContent } from '@/components/MystiGiftContent';

export const metadata: Metadata = {
  title: '灵魂礼品卡 — WTFTI 灵鉴',
  description: '把灵魂信、合盘报告、月报作为礼物送给 TA，¥39.9 起。',
  alternates: { canonical: '/mysti/gift/' },
  robots: { index: false, follow: false },
};

export default function MystiGiftPage() {
  return (
    <Suspense fallback={null}>
      <MystiGiftContent />
    </Suspense>
  );
}
