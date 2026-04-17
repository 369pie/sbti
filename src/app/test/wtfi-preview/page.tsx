import type { Metadata } from 'next';
import { WtfiPreviewQuiz } from '@/components/WtfiPreviewQuiz';

export const metadata: Metadata = {
  title: 'WTFI 情境人格 · 30 题预览（内测）| WTFTI',
  description:
    'WTFTI 自有情境人格理论的 30 题预览版。基于 Mischel & Shoda (1995) CAPS 框架，4 轴 W-T-F-I。',
  alternates: { canonical: '/test/wtfi-preview/' },
  robots: { index: false, follow: false },
};

export default function WtfiPreviewPage() {
  return <WtfiPreviewQuiz />;
}
