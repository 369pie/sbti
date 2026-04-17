import type { Metadata } from 'next';
import { MystiArchiveContent } from '@/components/MystiArchiveContent';

export const metadata: Metadata = {
  title: '关系档案 — WTFTI 灵鉴',
  description: '回看你与每一个 TA 的合盘瞬间，沉淀属于你们的灵魂轨迹。',
  alternates: { canonical: '/mysti/archive/' },
  robots: { index: false, follow: false },
};

export default function MystiArchivePage() {
  return <MystiArchiveContent />;
}
