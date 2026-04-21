import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteUrl } from '@/lib/site';
import {
  DECISION_SCENARIOS,
  getDecisionScenario,
  listEnabledScenarios,
} from '@/lib/mysti/decision-quotes';
import { MystiDecisionClient } from './MystiDecisionClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return listEnabledScenarios().map((s) => ({ scenario: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scenario: string }>;
}): Promise<Metadata> {
  const { scenario } = await params;
  const s = getDecisionScenario(scenario);
  if (!s) return {};

  const title = `${s.label} · 灵鉴 90 秒决策快卡 — WTFTI`;
  const description = `${s.question} 让暮光替你抽 3 张牌，得到一句可截屏的诗意答案。`;
  const url = getSiteUrl(`/mysti/decision/${s.id}/`);

  return {
    title,
    description,
    keywords: ['决策快卡', s.label, '塔罗', 'WTFTI', '灵鉴'],
    alternates: { canonical: `/mysti/decision/${s.id}/` },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MystiDecisionScenarioPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const s = getDecisionScenario(scenario);
  if (!s || !s.enabled) notFound();

  // Strip enabled flag (client doesn't need it; passes serializable object)
  const safeScenario = DECISION_SCENARIOS.find((x) => x.id === s.id)!;
  return <MystiDecisionClient scenario={safeScenario} />;
}
