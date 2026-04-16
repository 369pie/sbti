import { Quiz } from '@/components/Quiz';
import { getUgcUniverse, getUgcUniverseIds } from '@/lib/ugc/registry';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ universe: string }>;
};

export async function generateStaticParams() {
  return getUgcUniverseIds().map(id => ({ universe: id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universe } = await params;
  const config = getUgcUniverse(universe);
  if (!config) return {};

  return {
    title: `开始测试 — ${config.name} 人格测试`,
    description: `${config.name} · 15 维度人格测试，测完直达你的主题人格图鉴卡。by ${config.creatorName}`,
    robots: { index: false, follow: true },
  };
}

export default async function UgcTestPage({ params }: PageProps) {
  const { universe } = await params;
  const config = getUgcUniverse(universe);
  if (!config) notFound();

  return (
    <Suspense>
      <Quiz
        universeId={`ugc-${config.id}`}
        resultPrefix={`/ugc/${config.id}`}
        variant="wtfti"
        finishingOverlay={{ emoji: config.emoji, text: `正在翻译你的${config.shortName}人格…` }}
      />
    </Suspense>
  );
}
