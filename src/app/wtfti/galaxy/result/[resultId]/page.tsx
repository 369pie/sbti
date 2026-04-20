import type { Metadata } from 'next';

import GalaxyResultClient from './GalaxyResultClient';

export const metadata: Metadata = {
  title: 'WTFTI 人格神域 · 你的星图',
  description: '主神化身 × 神侍三位 × 暗面副形 × 月相日课 × 五感档案',
  // 真实结果页不索引（用户隐私 & 每人一份）
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ resultId: string }>;
}

export default async function GalaxyResultPage({ params }: Props) {
  const { resultId } = await params;
  return <GalaxyResultClient resultId={resultId} />;
}
