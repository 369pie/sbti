import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { MirrorHubClient } from './MirrorHubClient';

const MIRROR_DESCRIPTION =
  '美我：色彩季型、脸型妆容、静态换装与掌纹——写进你的档案，让今日更懂你。';

export const metadata: Metadata = {
  title: '美我',
  description: MIRROR_DESCRIPTION,
  alternates: { canonical: '/mirror/' },
  openGraph: {
    title: '美我 · WTFTI',
    description: MIRROR_DESCRIPTION,
    url: getSiteUrl('/mirror/'),
    type: 'website',
    siteName: 'WTFTI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '美我 · WTFTI',
    description: MIRROR_DESCRIPTION,
  },
};

export default function MirrorPage() {
  return <MirrorHubClient />;
}
