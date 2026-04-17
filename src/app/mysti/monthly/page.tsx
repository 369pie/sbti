import type { Metadata } from 'next';
import { MystiMonthlyContent } from '@/components/MystiMonthlyContent';

export const metadata: Metadata = {
  title: '灵魂月报 — WTFTI 灵鉴',
  description: '基于本月心情、合盘、抽卡轨迹生成的私人月度灵魂报告。',
  alternates: { canonical: '/mysti/monthly/' },
  robots: { index: false, follow: false },
};

export default function MystiMonthlyPage() {
  return <MystiMonthlyContent />;
}
