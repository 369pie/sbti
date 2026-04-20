import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { getDeity } from '@/lib/wtfi/pantheon';
import { getSiteUrl } from '@/lib/site';

import { ShrineClient } from './ShrineClient';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return HOME_PLANET_CATALOG.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug);
  if (!planet) return {};
  const deity = getDeity(slug);
  const url = getSiteUrl(`/wtfti/shrine/${slug}/`);
  const title = `${planet.name} · 个人神龛 · WTFTI`;
  const desc = deity
    ? `${deity.eastern.name} × ${deity.western.name}的私人神龛 — ${planet.headline}`
    : `${planet.name}的私人神龛 — 每日点亮一盏灯，让神域记得你。`;
  return {
    title,
    description: desc,
    keywords: [planet.name, '个人神龛', '人格神域', 'WTFTI', '神域居民', '神龛装饰'],
    alternates: { canonical: url },
    openGraph: { title, description: desc, type: 'profile', url, siteName: 'WTFTI' },
    twitter: { card: 'summary_large_image', title, description: desc },
  };
}

export default async function ShrinePage({ params }: Props) {
  const { slug } = await params;
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug);
  if (!planet) notFound();
  return <ShrineClient slug={slug} />;
}
