import type { Metadata } from 'next';
import { WhitepaperContent } from './WhitepaperContent';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'ITC v1.0 · 亲密张力坐标系白皮书 | WTFTI',
  description:
    '亲密张力坐标系（ITC）v1.0 白皮书 — 从 9 维到 3 轴的方法学说明、12 原型张力签名、6 类配对模型、引用规范。打印友好版，可在浏览器中“打印 / 另存为 PDF”。',
  alternates: { canonical: getSiteUrl('/xpti/whitepaper/') },
  openGraph: {
    title: 'ITC v1.0 白皮书',
    description:
      '亲密张力坐标系完整方法学，含 12 原型张力签名 + 6 类配对模型 + 引用规范。',
    url: getSiteUrl('/xpti/whitepaper/'),
    type: 'article',
  },
  robots: { index: true, follow: true },
};

export default function WhitepaperPage() {
  return <WhitepaperContent />;
}
