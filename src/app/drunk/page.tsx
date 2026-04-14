import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import DrunkHomeContent from './DrunkHomeContent';

export const metadata: Metadata = {
  title: '酒后人设测试 — 测测你喝醉后是什么人设 | SBTI',
  description:
    '6 道灵魂拷问，一分钟测出你喝醉后会变成什么样的人。5 个醉态维度、12 张酒后人设卡。',
  keywords: ['酒后人设', '醉后人格', '喝醉测试', '酒品测试', '性格测试', 'SBTI'],
  alternates: { canonical: '/drunk/' },
  openGraph: {
    title: '酒后人设测试 — 测测你喝醉后是什么人设',
    description: '6 道灵魂拷问，一分钟测出你喝醉后会变成什么样的人。12 张酒后人设卡等你解锁。',
    url: getSiteUrl('/drunk/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '酒后人设测试 — 测测你喝醉后是什么人设',
    description: '6 道灵魂拷问，一分钟测出你喝醉后会变成什么样的人。12 张酒后人设卡等你解锁。',
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
          name: '酒后人设测试',
          description: '6 道灵魂拷问，一分钟测出你喝醉后会变成什么样的人。12 张酒后人设卡。',
          url: getSiteUrl('/drunk/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'SBTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '酒后人设', item: getSiteUrl('/drunk/') },
            ],
          },
        }) }}
      />
      <DrunkHomeContent />
    </>
  );
}
