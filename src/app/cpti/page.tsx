import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import CptiHomeContent from './CptiHomeContent';

export const metadata: Metadata = {
  title: 'CPTI 关系图鉴 — 测测你在关系里是什么角色',
  description:
    'CPTI (Couple Personality Type Indicator) 关系角色测试：5 个关系维度、20 道真实场景、16 种关系角色，三分钟测出你在这段关系里的真实角色。',
  keywords: ['CPTI', '关系角色测试', '恋爱角色', '情侣测试', '关系测试'],
  alternates: { canonical: '/cpti/' },
  openGraph: {
    title: 'CPTI 关系图鉴 — 测测你在关系里是什么角色',
    description: '5 个关系维度、20 道真实场景、16 种关系角色，三分钟测出你在关系里的真实角色。',
    url: getSiteUrl('/cpti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CPTI 关系图鉴 — 测测你在关系里是什么角色',
    description: '5 个关系维度、20 道真实场景、16 种关系角色，三分钟测出你在关系里的真实角色。',
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
          name: 'CPTI 关系图鉴',
          description: '5 个关系维度、20 道真实场景、16 种关系角色，三分钟测出你在关系里的真实角色。',
          url: getSiteUrl('/cpti/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'CPTI', item: getSiteUrl('/cpti/') },
            ],
          },
        }) }}
      />
      <CptiHomeContent />
    </>
  );
}
