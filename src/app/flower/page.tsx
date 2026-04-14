import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import FlowerHomeContent from './FlowerHomeContent';

export const metadata: Metadata = {
  title: '花TI 花格鉴定 — 测测你像自然界的哪朵花',
  description:
    '花TI 花格鉴定测试：4 大花格轴、20 道灵魂拷问、16 种花格，三分钟找到你的专属花朵。植物的生存策略和你的性格是同一套逻辑。',
  keywords: ['花TI', '花格鉴定', '花格测试', '花朵人格', '性格测试', '花语人格'],
  alternates: { canonical: '/flower/' },
  openGraph: {
    title: '花TI 花格鉴定 — 测测你像自然界的哪朵花',
    description: '4 大花格轴、20 道灵魂拷问、16 种花格，三分钟找到你的专属花朵。',
    url: getSiteUrl('/flower/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '花TI 花格鉴定 — 测测你像自然界的哪朵花',
    description: '4 大花格轴、20 道灵魂拷问、16 种花格，三分钟找到你的专属花朵。',
  },
};

export default function FlowerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: '花TI 花格鉴定',
          description: '4 大花格轴、20 道灵魂拷问、16 种花格，三分钟找到你的专属花朵。',
          url: getSiteUrl('/flower/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '花TI', item: getSiteUrl('/flower/') },
            ],
          },
        }) }}
      />
      <FlowerHomeContent />
    </>
  );
}
