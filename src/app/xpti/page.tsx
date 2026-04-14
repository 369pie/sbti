import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import XptiHomeContent from './XptiHomeContent';

export const metadata: Metadata = {
  title: 'XPTI 恋爱XP体质测试 — 测测你在爱情里是什么体质',
  description:
    'XPTI 恋爱XP体质测试：4 大恋爱轴、大题池随机 20 题、16 种XP体质，三分钟测出你的恋爱DNA。MBTI 测你是什么人，XPTI 测你爱上什么人。',
  keywords: ['XPTI', '恋爱XP体质', '恋爱人格', 'XP体质测试', '恋爱测试', '性格测试'],
  alternates: { canonical: '/xpti/' },
  openGraph: {
    title: 'XPTI 恋爱XP体质测试 — 测测你在爱情里是什么体质',
    description: '4 大恋爱轴、大题池随机 20 题、16 种XP体质，三分钟测出你的恋爱DNA。',
    url: getSiteUrl('/xpti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPTI 恋爱XP体质测试 — 测测你在爱情里是什么体质',
    description: '4 大恋爱轴、大题池随机 20 题、16 种XP体质，三分钟测出你的恋爱DNA。',
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
          name: 'XPTI 恋爱XP体质测试',
          description: '4 大恋爱轴、大题池随机 20 题、16 种XP体质，三分钟测出你的恋爱DNA。',
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
