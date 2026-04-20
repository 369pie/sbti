import type { Metadata } from 'next';

import { DuetClient } from './DuetClient';

export const metadata: Metadata = {
  title: 'WTFTI · 召唤合奏 — 双人神域共鸣',
  description:
    'WTFTI · 召唤合奏（Convergence Duet）：你和 ta 各答 6 道灵魂签，主神之间的引力 G 与共鸣 S 会合成一枚专属于你们俩的 Pair Sigil。',
  alternates: { canonical: '/wtfti/duet/' },
  openGraph: {
    type: 'profile',
    title: 'WTFTI · 召唤合奏 — 双人神域共鸣',
    description: '把"我和 ta 像不像"做成一场仪式。',
  },
};

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function DuetPage() {
  return <DuetClient />;
}
