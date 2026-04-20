import type { Metadata } from 'next';
import PairGravityPreview from '@/components/galaxy/PairGravityPreview';

export const metadata: Metadata = {
  title: 'WTFTI 双星引力 · 内部预览',
  description: '人格星系兼容度演示（mock 双方）',
  robots: { index: false, follow: false },
};

export default function PairGravityPreviewPage() {
  return <PairGravityPreview />;
}
