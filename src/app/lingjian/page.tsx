import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import LingjianClient from './LingjianClient';

const DESC =
  '灵笺 · 人生档案：把你在 WTFTI 主神、灵镜形象档案、灵鉴命书、关系合盘的所有印记，缮写成同一本书。';

export const metadata: Metadata = {
  title: '灵笺 · 人生档案',
  description: DESC,
  alternates: { canonical: '/lingjian/' },
  openGraph: {
    title: '灵笺 · 人生档案 · WTFTI',
    description: DESC,
    url: getSiteUrl('/lingjian/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '灵笺 · 人生档案 · WTFTI',
    description: DESC,
  },
};

export default function LingjianPage() {
  return <LingjianClient />;
}
