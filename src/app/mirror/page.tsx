import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import MirrorClient from './MirrorClient';

const MIRROR_DESCRIPTION =
  'WTFTI 灵镜实验室：上传一张照片，生成发型、个人色彩、妆容与穿搭方向的 GPT-Image-2 风格报告。';

export const metadata: Metadata = {
  title: '灵镜实验室 · 发型色彩妆容分析',
  description: MIRROR_DESCRIPTION,
  alternates: { canonical: '/mirror/' },
  openGraph: {
    title: '灵镜实验室 · WTFTI',
    description: MIRROR_DESCRIPTION,
    url: getSiteUrl('/mirror/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '灵镜实验室 · WTFTI',
    description: MIRROR_DESCRIPTION,
  },
};

export default function MirrorPage() {
  return <MirrorClient />;
}
