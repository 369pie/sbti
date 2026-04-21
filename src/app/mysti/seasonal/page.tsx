import type { Metadata } from 'next';
import { MystiSeasonalContent } from '@/components/MystiSeasonalContent';

export const metadata: Metadata = {
  title: '节气年中报 — WTFTI 灵鉴',
  description: '24 节气的暮光仪式与中场清算。每个节气一篇专属于你的「不发朋友圈的小报」。',
  alternates: { canonical: '/mysti/seasonal/' },
};

export default function MystiSeasonalPage() {
  return <MystiSeasonalContent />;
}
