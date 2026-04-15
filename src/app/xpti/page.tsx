import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import XptiHomeContent from './XptiHomeContent';

export const metadata: Metadata = {
  title: 'XPTI 亲密偏好图谱测试 — 测测你在关系里你想要的是谁',
  description:
    'XPTI 亲密偏好图谱测试：9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟照见你的靠近方式。MBTI 测你是什么人，XPTI 测你想要的是谁。',
  keywords: ['XPTI', '亲密偏好图谱', '关系原型', '亲密关系测试', '性格测试', '恋爱测试'],
  alternates: { canonical: '/xpti/' },
  openGraph: {
    title: 'XPTI 亲密偏好图谱测试 — 测测你在关系里你想要的是谁',
    description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟照见你的靠近方式。',
    url: getSiteUrl('/xpti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPTI 亲密偏好图谱测试 — 测测你在关系里你想要的是谁',
    description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟照见你的靠近方式。',
  },
};

export default function XptiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'XPTI 亲密偏好图谱测试',
          description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟照见你的靠近方式。',
          url: getSiteUrl('/xpti/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'XPTI', item: getSiteUrl('/xpti/') },
            ],
          },
        }) }}
      />
      <XptiHomeContent />
    </>
  );
}
