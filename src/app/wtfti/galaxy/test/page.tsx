import type { Metadata } from 'next';
import { Suspense } from 'react';

import { GalaxyRitualTestClient } from './GalaxyRitualTestClient';

export const metadata: Metadata = {
  title: 'WTFTI · 人格神域召唤 — 90 秒仪式测',
  description:
    '90 秒，请一位主神来认领你 — 4 章节 + 6 道灵魂签 + 1 枚专属灵魂印记。',
  robots: { index: false, follow: true },
};

export default function GalaxyRitualTestPage() {
  return (
    <Suspense>
      <GalaxyRitualTestClient />
    </Suspense>
  );
}
