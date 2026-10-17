import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import MirrorClient from './MirrorClient';

const DESC = '灵镜 Atelier：上传照片，AI 妆发 / 色彩 / 风格对比。按次灵币，照片不入库。';

export const metadata: Metadata = {
  title: '灵镜 Atelier · 美我 · WTFTI',
  description: DESC,
  alternates: { canonical: '/mirror/atelier/' },
  openGraph: {
    title: '灵镜 Atelier · WTFTI',
    description: DESC,
    url: getSiteUrl('/mirror/atelier/'),
    type: 'website',
    siteName: 'WTFTI',
  },
};

export default function MirrorAtelierPage() {
  return (
    <Suspense fallback={<main className="skin-journal" style={{ minHeight: '40vh' }} />}>
      <MirrorClient />
    </Suspense>
  );
}
