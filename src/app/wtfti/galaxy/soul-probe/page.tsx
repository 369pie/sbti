import type { Metadata } from 'next';
import SoulProbeStandalone from '@/components/galaxy/SoulProbeStandalone';
import { getSiteUrl } from '@/lib/site';

const url = getSiteUrl('/wtfti/galaxy/soul-probe/');
const title = '灵魂探针 · 6 题测出你的灵魂频率 · WTFTI';
const description =
  '6 道签 · 60 秒 · 不影响人格判定。当你和 ta 配对时，答案越像，你们的灵魂频率越接近。';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['灵魂频率', '灵魂双星', '人格匹配', 'WTFTI', '灵魂共振', '人格测试'],
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: 'WTFTI' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function SoulProbePage() {
  return <SoulProbeStandalone />;
}
