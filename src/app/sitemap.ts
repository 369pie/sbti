import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getAllSlugs } from '@/lib/personalities';
import { WORK_PERSONALITY_TYPES } from '@/lib/work/personalities';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: getSiteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: getSiteUrl('/about/'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: getSiteUrl('/contact/'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: getSiteUrl('/privacy/'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: getSiteUrl('/terms/'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: getSiteUrl('/types/'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: getSiteUrl('/cp/'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: getSiteUrl('/work/'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: getSiteUrl('/daily/'), lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ];

  const resultPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
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

  const dailyResultPages: MetadataRoute.Sitemap = DAILY_STATUS_TYPES.map((s) => ({
    url: getSiteUrl(`/daily/result/${s.slug}/`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...resultPages, ...workResultPages, ...dailyResultPages];
}
