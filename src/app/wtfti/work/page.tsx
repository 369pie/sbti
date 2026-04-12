import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import WtftiWorkLandingContent from './WtftiWorkLandingContent';

export const metadata: Metadata = {
  title: '班TI — WTF 我在职场居然是这种人？',
  description: '班TI 社畜宇宙：29 种职场人格，每一种都是你同事。独立办公室题包，直连 29 张职场图鉴卡。',
  keywords: ['班TI', '职场人格', '社畜测试', 'WTFTI', '职场人设', '性格测试', '职场人格测试'],
  alternates: { canonical: '/wtfti/work/' },
  openGraph: {
    title: '班TI — WTF 我在职场居然是这种人？',
    description: '29 种职场人格，每一种都是你同事。独立职场题包，来测测你的班TI。',
    url: getSiteUrl('/wtfti/work/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '班TI — WTF 我在职场居然是这种人？',
    description: '29 种职场人格，每一种都是你同事。独立职场题包，来测测你的班TI。',
  },
};

export default function WtftiWorkPage() {
  return <WtftiWorkLandingContent />;
}
