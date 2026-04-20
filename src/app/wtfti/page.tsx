import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { StardustDueBanner } from '@/components/galaxy/StardustDueBanner';
import WtftiLandingContent from './WtftiLandingContent';

const WTFTI_TAGLINE = 'WTFTI · 人格神域 — 90 秒被一位主神召唤，留下你的灵魂印记。';
const WTFTI_DESCRIPTION =
  '不是测试，是一座可以被装饰、被分享、随月相成长的女性精神生活神域。8 主神 × 灵魂印记 × 五感探针 × 月相日课 — 一次召唤，长期归属。';

export const metadata: Metadata = {
  title: 'WTFTI · 人格神域 — 90 秒召唤你的主神',
  description: WTFTI_DESCRIPTION,
  keywords: [
    'WTFTI',
    '人格神域',
    '灵魂印记',
    '主神召唤',
    '五感人格',
    '神域居民',
    '人格测试',
    '女性向人格测试',
    '神性人格',
    'Personal Pantheon',
    'Soul Sigil',
  ],
  alternates: { canonical: '/wtfti/' },
  openGraph: {
    title: WTFTI_TAGLINE,
    description: WTFTI_DESCRIPTION,
    url: getSiteUrl('/wtfti/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: WTFTI_TAGLINE,
    description: WTFTI_DESCRIPTION,
  },
};

export default function WtftiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'WTFTI 人格神域',
          description: WTFTI_DESCRIPTION,
          url: getSiteUrl('/wtfti/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'WTFTI', item: getSiteUrl('/wtfti/') },
            ],
          },
        }) }}
      />
      <StardustDueBanner />
      <WtftiLandingContent />
    </>
  );
}
