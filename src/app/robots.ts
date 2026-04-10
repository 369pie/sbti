import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/test/', '/work/test/', '/daily/test/'],
      },
    ],
    sitemap: getSiteUrl('/sitemap.xml'),
  };
}
