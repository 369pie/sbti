import type { Metadata } from 'next';
import GalaxyPreview from '@/components/galaxy/GalaxyPreview';
import { mockGalaxyFromHome } from '@/lib/wtfi/galaxy-preview';
import { mapPersonalityToHomePlanet } from '@/lib/wtfi/galaxy-mapping';

/**
 * Galaxy 内部预览页（noindex）
 *
 * 仪式完成跳转链路已改到 /wtfti/galaxy/result/[resultId]/（读 cookie 真数据）。
 * 此页保留用于：运营预览指定主神 / 测试 / 邮件链接演示。
 *
 *   /wtfti/galaxy/preview/?seed=<personality-slug>
 *
 * seed 走语义映射（mapPersonalityToHomePlanet），而不是随机哈希。
 */
export const metadata: Metadata = {
  title: 'WTFTI 人格神域 · 内部预览',
  description: 'WTFTI 人格神域结果页 mock 预览（非真实测试结果）',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams?: Promise<{ seed?: string }>;
}

export default async function GalaxyPreviewPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const seed = params.seed?.trim() || '';
  const home = mapPersonalityToHomePlanet(seed);
  const result = mockGalaxyFromHome(home.slug);

  if (!result) {
    const fallback = mockGalaxyFromHome('home-storm-harbor');
    if (!fallback) return null;
    return <GalaxyPreview result={fallback} />;
  }

  return <GalaxyPreview result={result} />;
}
