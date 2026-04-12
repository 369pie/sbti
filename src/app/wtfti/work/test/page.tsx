import { BantiQuiz } from '@/components/BantiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — 班TI 职场人格测试',
  description: '16 道办公室题 + 1 个酒局隐藏分支。答完直接落到你的班TI 职场图鉴卡。',
  robots: { index: false, follow: true },
};

export default function BantiTestPage() {
  return <BantiQuiz />;
}
