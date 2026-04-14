import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import SoultiLandingContent from './SoultiLandingContent';

export const metadata: Metadata = {
  title: 'SoulTI 自然人格觉察 — 你的灵魂像哪种自然力？',
  description:
    'SoulTI 自然人格觉察：5 轴觉察、32 种自然人格、32 位历史女性灵魂共振，三分钟照见你还没说出口的自己。',
  keywords: ['SoulTI', '自然人格', '灵魂共振', '人格觉察', '性格测试', '女性人格测试', 'MBTI', '人格测试'],
  alternates: { canonical: '/soulti/' },
  openGraph: {
    title: 'SoulTI 自然人格觉察 — 你的灵魂像哪种自然力？',
    description: '32 种自然人格 + 32 位历史女性灵魂共振，三分钟照见你还没说出口的自己。',
    url: getSiteUrl('/soulti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoulTI 自然人格觉察 — 你的灵魂像哪种自然力？',
    description: '32 种自然人格 + 32 位历史女性灵魂共振，三分钟照见你还没说出口的自己。',
  },
};

export default function SoultiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'SoulTI 自然人格觉察',
          description: '32 种自然人格 + 32 位历史女性灵魂共振，三分钟照见你还没说出口的自己。',
          url: getSiteUrl('/soulti/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'SoulTI', item: getSiteUrl('/soulti/') },
            ],
          },
        }) }}
      />
      <SoultiLandingContent />
    </>
  );
}
