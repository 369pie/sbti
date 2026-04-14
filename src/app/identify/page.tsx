import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import IdentifyHomeContent from './IdentifyHomeContent';

export const metadata: Metadata = {
  title: '好友鉴定器 — WTF 你朋友居然是这种人',
  description:
    '不用 ta 亲自来测，你来帮 ta 鉴定！10 道题鉴定好友的 WTF 人格，生成鉴定书分享给 ta。',
  keywords: ['好友鉴定器', '帮朋友测人格', '代测人格', '人格鉴定', 'SBTI', '性格测试'],
  alternates: { canonical: '/identify/' },
  openGraph: {
    title: '好友鉴定器 — WTF 你朋友居然是这种人',
    description: '不用 ta 亲自来测，你来帮 ta 鉴定！10 道题生成鉴定书。',
    url: getSiteUrl('/identify/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '好友鉴定器 — WTF 你朋友居然是这种人',
    description: '不用 ta 亲自来测，你来帮 ta 鉴定！10 道题生成鉴定书。',
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
          name: '好友鉴定器',
          description: '不用 ta 亲自来测，你来帮 ta 鉴定！10 道题鉴定好友的 WTF 人格。',
          url: getSiteUrl('/identify/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '好友鉴定器', item: getSiteUrl('/identify/') },
            ],
          },
        }) }}
      />
      <IdentifyHomeContent />
    </>
  );
}
