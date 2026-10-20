import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getAllSlugs } from '@/lib/personalities';
import { getXiuxianLaunchOnlySlugs } from '@/lib/xiuxian-v2';
import { getWtftiSlugs } from '@/lib/wtfti-personalities';
import { getAllXptiSlugs } from '@/lib/xpti/personalities';
import { getAllSoultiSlugs } from '@/lib/soulti/personalities';
import { getAllCptiSlugs } from '@/lib/cpti/personalities';
import { getAllRelationshipSlugs } from '@/lib/cpti/relationships';
import { getAllCptiScenarioSlugs } from '@/lib/cpti/scenarios';
import { FIRST_LOOK_ARCHETYPES } from '@/lib/first-look/archetypes';

export const dynamic = 'force-static';

// Only live (200) URLs. Prefixes 308'd in next.config.ts must never appear here
// (audit 2026-10-20 §1.3: the old sitemap submitted 24 redirecting URLs).
type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, changeFrequency: Freq, priority: number) => ({
    url: getSiteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });
  const many = (paths: string[], changeFrequency: Freq, priority: number) =>
    paths.map((p) => page(p, changeFrequency, priority));

  return [
    page('/', 'weekly', 1.0),
    page('/test/', 'weekly', 0.95),
    page('/start/', 'weekly', 0.9),
    page('/today/', 'daily', 0.8),
    page('/mirror/', 'weekly', 0.8),
    page('/mirror/color/', 'monthly', 0.7),
    page('/mirror/face/', 'monthly', 0.7),
    page('/mirror/palm/', 'monthly', 0.7),
    page('/bottle/', 'daily', 0.6),
    page('/test/classic/', 'monthly', 0.7),
    page('/xpti/', 'weekly', 0.85),
    page('/xpti/couple/', 'weekly', 0.85),
    page('/member/', 'monthly', 0.6),
    page('/soulti/', 'weekly', 0.85),
    page('/cpti/', 'weekly', 0.85),
    page('/cpti/theory/', 'monthly', 0.6),
    page('/mysti/', 'weekly', 0.8),
    page('/mysti/daily/', 'daily', 0.7),
    page('/about/', 'monthly', 0.5),
    page('/contact/', 'monthly', 0.4),
    page('/privacy/', 'yearly', 0.3),
    page('/terms/', 'yearly', 0.3),
    ...many(FIRST_LOOK_ARCHETYPES.map((a) => `/test/result/${a.slug}/`), 'monthly', 0.7),
    ...many([...getAllSlugs(), ...getXiuxianLaunchOnlySlugs()].map((s) => `/result/${s}/`), 'monthly', 0.6),
    ...many(getWtftiSlugs().map((s) => `/wtfti/result/${s}/`), 'monthly', 0.6),
    ...many(getAllXptiSlugs().map((s) => `/xpti/result/${s}/`), 'monthly', 0.7),
    ...many(getAllSoultiSlugs().map((s) => `/soulti/result/${s}/`), 'monthly', 0.7),
    ...many(getAllCptiSlugs().map((s) => `/cpti/result/${s}/`), 'monthly', 0.7),
    ...many(getAllRelationshipSlugs().map((s) => `/cpti/relationship/${s}/`), 'monthly', 0.7),
    ...many(getAllCptiScenarioSlugs().map((s) => `/cpti/scenarios/${s}/`), 'weekly', 0.8),
    ...many(getWtftiSlugs().map((s) => `/mysti/result/${s}/`), 'monthly', 0.6),
  ];
}
