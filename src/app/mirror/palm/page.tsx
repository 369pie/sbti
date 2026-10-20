import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { PalmClient } from './PalmClient';

const DESC = '拍一张掌心，在照片上标出四条主线。照片只用于本次，处理完即删除。';

export const metadata: Metadata = {
  title: '掌纹 · 美我',
  description: DESC,
  alternates: { canonical: '/mirror/palm/' },
  openGraph: {
    title: '掌纹 · 美我 · WTFTI',
    description: DESC,
    url: getSiteUrl('/mirror/palm/'),
    type: 'website',
    siteName: 'WTFTI',
  },
};

export default function PalmPage() {
  return <PalmClient />;
}
