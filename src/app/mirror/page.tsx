import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import MirrorClient from './MirrorClient';

const MIRROR_DESCRIPTION =
  '灵镜 · 形象档案馆：上传一张照片，AI 给你三页式整体诊断卡（色彩 / 妆发 / 穿搭），看见你将成为的样子。';

export const metadata: Metadata = {
  title: '灵镜 · 形象档案馆 · WTFTI',
  description: MIRROR_DESCRIPTION,
  alternates: { canonical: '/mirror/' },
  openGraph: {
    title: '灵镜 · 形象档案馆 · WTFTI',
    description: MIRROR_DESCRIPTION,
    url: getSiteUrl('/mirror/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '灵镜 · 形象档案馆 · WTFTI',
    description: MIRROR_DESCRIPTION,
  },
};

export default function MirrorPage() {
  return <MirrorClient />;
}
