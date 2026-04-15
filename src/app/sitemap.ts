import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getAllSlugs } from '@/lib/personalities';
import { WORK_PERSONALITY_TYPES } from '@/lib/work/personalities';
import { LOVE_PERSONALITY_TYPES } from '@/lib/love/personalities';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';
import { DRUNK_PERSONA_TYPES } from '@/lib/drunk/personas';
import { GUIDE_ARTICLES } from '@/lib/guides';
import { getXiuxianLaunchOnlySlugs } from '@/lib/xiuxian-v2';
import { getWtftiSlugs } from '@/lib/wtfti-personalities';
import { getBantiSlugs } from '@/lib/banti/personalities';
import { getKingsSlugs } from '@/lib/kings/personalities';
import { getDeltaSlugs } from '@/lib/delta/personalities';
import { getAllXptiSlugs } from '@/lib/xpti/personalities';
import { getAllSoultiSlugs } from '@/lib/soulti/personalities';
import { getBirdSlugs } from '@/lib/bird/personalities';
import { getAllFlowerSlugs } from '@/lib/flower/personalities';
import { getAllIdentifySlugs } from '@/lib/identify/personas';
import { getAllCptiSlugs } from '@/lib/cpti/personalities';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: getSiteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: getSiteUrl('/about/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/contact/'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: getSiteUrl('/guide/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/privacy/'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: getSiteUrl('/terms/'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: getSiteUrl('/types/'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: getSiteUrl('/cp/'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: getSiteUrl('/work/'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: getSiteUrl('/love/'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: getSiteUrl('/daily/'), lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: getSiteUrl('/combo/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/squad/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/drunk/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/wtfti/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/wtfti/work/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/wtfti/kings/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/wtfti/delta/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/xpti/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/soulti/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/bird/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/flower/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/identify/'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: getSiteUrl('/cpti/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/wtfti/symptoms/'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: getSiteUrl('/mysti/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: getSiteUrl('/mysti/daily/'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const guidePages: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((article) => ({
    url: getSiteUrl(`/guide/${article.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const resultPages: MetadataRoute.Sitemap = [...getAllSlugs(), ...getXiuxianLaunchOnlySlugs()].map((slug) => ({
    url: getSiteUrl(`/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const workResultPages: MetadataRoute.Sitemap = WORK_PERSONALITY_TYPES.map((p) => ({
    url: getSiteUrl(`/work/result/${p.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const loveResultPages: MetadataRoute.Sitemap = LOVE_PERSONALITY_TYPES.map((p) => ({
    url: getSiteUrl(`/love/result/${p.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const dailyResultPages: MetadataRoute.Sitemap = DAILY_STATUS_TYPES.map((s) => ({
    url: getSiteUrl(`/daily/result/${s.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const drunkResultPages: MetadataRoute.Sitemap = DRUNK_PERSONA_TYPES.map((p) => ({
    url: getSiteUrl(`/drunk/result/${p.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const wtftiResultPages: MetadataRoute.Sitemap = getWtftiSlugs().map((slug) => ({
    url: getSiteUrl(`/wtfti/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const bantiResultPages: MetadataRoute.Sitemap = getBantiSlugs().map((slug) => ({
    url: getSiteUrl(`/wtfti/work/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const kingsResultPages: MetadataRoute.Sitemap = getKingsSlugs().map((slug) => ({
    url: getSiteUrl(`/wtfti/kings/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const deltaResultPages: MetadataRoute.Sitemap = getDeltaSlugs().map((slug) => ({
    url: getSiteUrl(`/wtfti/delta/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const xptiResultPages: MetadataRoute.Sitemap = getAllXptiSlugs().map((slug) => ({
    url: getSiteUrl(`/xpti/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const soultiResultPages: MetadataRoute.Sitemap = getAllSoultiSlugs().map((slug) => ({
    url: getSiteUrl(`/soulti/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const birdResultPages: MetadataRoute.Sitemap = getBirdSlugs().map((slug) => ({
    url: getSiteUrl(`/bird/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const flowerResultPages: MetadataRoute.Sitemap = getAllFlowerSlugs().map((slug) => ({
    url: getSiteUrl(`/flower/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const identifyResultPages: MetadataRoute.Sitemap = getAllIdentifySlugs().map((slug) => ({
    url: getSiteUrl(`/identify/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const cptiResultPages: MetadataRoute.Sitemap = getAllCptiSlugs().map((slug) => ({
    url: getSiteUrl(`/cpti/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const symptomsPages: MetadataRoute.Sitemap = getWtftiSlugs().map((slug) => ({
    url: getSiteUrl(`/wtfti/symptoms/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const mystiResultPages: MetadataRoute.Sitemap = getWtftiSlugs().map((slug) => ({
    url: getSiteUrl(`/mysti/result/${slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...guidePages, ...resultPages, ...workResultPages, ...loveResultPages, ...cptiResultPages, ...dailyResultPages, ...drunkResultPages, ...wtftiResultPages, ...bantiResultPages, ...kingsResultPages, ...deltaResultPages, ...xptiResultPages, ...soultiResultPages, ...birdResultPages, ...flowerResultPages, ...identifyResultPages, ...symptomsPages, ...mystiResultPages];
}
