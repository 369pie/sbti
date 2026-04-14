import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import WorkHomeContent from './WorkHomeContent';

export const metadata: Metadata = {
  title: 'WPTI 打工人格测试 — 测测你的打工人设是哪一挂',
  description:
    'WPTI (Work Personality Type Indicator) 打工人格测试：5 个职场维度、15 道灵魂拷问、16 张打工人设卡，三分钟测出你的职场真面目。',
  keywords: ['WPTI', '打工人格测试', '职场人格', '打工人设', '职场测试', '性格测试'],
  alternates: { canonical: '/work/' },
  openGraph: {
    title: 'WPTI 打工人格测试 — 测测你的打工人设是哪一挂',
    description: '5 个职场维度、15 道灵魂拷问、16 张打工人设卡，三分钟测出你的职场真面目。',
    url: getSiteUrl('/work/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WPTI 打工人格测试 — 测测你的打工人设是哪一挂',
    description: '5 个职场维度、15 道灵魂拷问、16 张打工人设卡，三分钟测出你的职场真面目。',
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
          name: 'WPTI 打工人格测试',
          description: '5 个职场维度、15 道灵魂拷问、16 张打工人设卡，三分钟测出你的职场真面目。',
          url: getSiteUrl('/work/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'SBTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'WPTI', item: getSiteUrl('/work/') },
            ],
          },
        }) }}
      />
      <WorkHomeContent />
    </>
  );
}
