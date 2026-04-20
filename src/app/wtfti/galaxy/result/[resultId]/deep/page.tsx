import type { Metadata } from 'next';

import GalaxyDeepClient from './GalaxyDeepClient';

export const metadata: Metadata = {
  title: 'WTFTI 人格神域 · 深度主神档案',
  description: '主神档案 · Sigil 高清 · 30 天月相封信 · 灵魂香水全谱 · 镜面碎片',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ resultId: string }>;
}

export default async function GalaxyDeepPage({ params }: Props) {
  const { resultId } = await params;
  return <GalaxyDeepClient resultId={resultId} />;
}
