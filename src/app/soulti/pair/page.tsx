import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import SoultiPairPickerContent from './SoultiPairPickerContent';

export const metadata: Metadata = {
  title: 'SoulTI 双人共振 · 你和 TA 的 5 轴关系报告',
  description: '选择你和 TA 各自的 SoulTI 自然人格，读取你们在 5 轴上的同频、张力和成长章节。',
  alternates: { canonical: '/soulti/pair/' },
  openGraph: {
    title: 'SoulTI 双人共振',
    description: '5 轴共振指数 · 三章叙事 · 历史共振',
    url: getSiteUrl('/soulti/pair/'),
  },
};

export default function Page() {
  return <SoultiPairPickerContent />;
}
