import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import LoveHomeContent from './LoveHomeContent';

export const metadata: Metadata = {
  title: 'LPTI 恋爱人格测试 — 测测你的恋爱人设是哪一挂',
  description:
    'LPTI (Love Personality Type Indicator) 恋爱人格测试：5 个恋爱维度、15 道灵魂拷问、16 张恋爱人设卡，三分钟测出你在感情里的真面目。',
  keywords: ['LPTI', '恋爱人格测试', '恋爱人设', '恋爱测试', '情侣测试', '性格测试'],
  alternates: { canonical: '/love/' },
  openGraph: {
    title: 'LPTI 恋爱人格测试 — 测测你的恋爱人设是哪一挂',
    description: '5 个恋爱维度、15 道灵魂拷问、16 张恋爱人设卡，三分钟测出你在感情里的真面目。',
    url: getSiteUrl('/love/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LPTI 恋爱人格测试 — 测测你的恋爱人设是哪一挂',
    description: '5 个恋爱维度、15 道灵魂拷问、16 张恋爱人设卡，三分钟测出你在感情里的真面目。',
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
          name: 'LPTI 恋爱人格测试',
          description: '5 个恋爱维度、15 道灵魂拷问、16 张恋爱人设卡，三分钟测出你在感情里的真面目。',
          url: getSiteUrl('/love/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'SBTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'LPTI', item: getSiteUrl('/love/') },
            ],
          },
        }) }}
      />
      <LoveHomeContent />
    </>
  );
}
