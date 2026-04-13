import type { Metadata } from 'next';
import FlowerHomeContent from './FlowerHomeContent';

export const metadata: Metadata = {
  title: '花TI 花格鉴定 — 测测你像自然界的哪朵花',
  description:
    '花TI 花格鉴定测试：4 大花格轴、20 道灵魂拷问、16 种花格，三分钟找到你的专属花朵。植物的生存策略和你的性格是同一套逻辑。',
  alternates: { canonical: '/flower/' },
};

export default function FlowerPage() {
  return <FlowerHomeContent />;
}
