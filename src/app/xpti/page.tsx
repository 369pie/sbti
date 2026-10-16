import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import XptiHomeContent from './XptiHomeContent';

export const metadata: Metadata = {
  title: 'XPTI 关系沟通测试 — 测测你们怎么沟通、怎么靠近',
  description:
    'XPTI 关系沟通测试：9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟看清关系沟通方式。MBTI 测你是什么人，XPTI 测你们怎么说话、怎么靠近。',
  keywords: ['XPTI', '关系沟通图谱', '关系原型', '亲密关系测试', '性格测试', '恋爱测试'],
  alternates: { canonical: '/xpti/' },
  openGraph: {
    title: 'XPTI 关系沟通测试 — 测测你们怎么沟通、怎么靠近',
    description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟看清关系沟通方式。',
    url: getSiteUrl('/xpti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPTI 关系沟通测试 — 测测你们怎么沟通、怎么靠近',
    description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟看清关系沟通方式。',
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
          name: 'XPTI 关系沟通测试',
          description: '9 大维度、54 题随机抽 27 题、12 种关系原型，三分钟看清关系沟通方式。',
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
