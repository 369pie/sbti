import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { FaceClient } from './FaceClient';

const DESC = '三道自述 + 可选自拍，得到脸型妆容建议，写进你的档案。';

export const metadata: Metadata = {
  title: '脸型妆容 · 美我',
  description: DESC,
  alternates: { canonical: '/mirror/face/' },
  openGraph: {
    title: '脸型妆容 · 美我 · WTFTI',
    description: DESC,
    url: getSiteUrl('/mirror/face/'),
    type: 'website',
    siteName: 'WTFTI',
  },
};

export default function FacePage() {
  return <FaceClient />;
}
