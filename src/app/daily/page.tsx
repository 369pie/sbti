import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import DailyHomeContent from './DailyHomeContent';

export const metadata: Metadata = {
  title: '今日模式测试 — 每天一测看你今天什么状态 | WTFTI',
  description:
    '每天 6 道快问，一分钟测出你今天开了什么模式。5 个维度、12 张状态卡，题目每天不一样。',
  keywords: ['今日模式', '每日测试', '今日状态', '心情测试', '每日人格', 'WTFTI'],
  alternates: { canonical: '/daily/' },
  openGraph: {
    title: '今日模式测试 — 每天一测看你今天什么状态',
    description: '每天 6 道快问，一分钟测出你今天开了什么模式。题目每天不一样。',
    url: getSiteUrl('/daily/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '今日模式测试 — 每天一测看你今天什么状态',
    description: '每天 6 道快问，一分钟测出你今天开了什么模式。题目每天不一样。',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: '今日模式测试',
          description: '每天 6 道快问，一分钟测出你今天开了什么模式。题目每天不一样。',
          url: getSiteUrl('/daily/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '今日模式', item: getSiteUrl('/daily/') },
            ],
          },
        }) }}
      />
      <DailyHomeContent />
    </>
  );
}
