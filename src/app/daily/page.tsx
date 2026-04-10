import type { Metadata } from 'next';
import DailyHomeContent from './DailyHomeContent';

export const metadata: Metadata = {
  title: '今日状态测试 — SBTI',
  description:
    '每天 6 道快问，一分钟测出你今天的真实状态。5 个维度、12 种状态结果，题目每天不一样。',
  alternates: { canonical: '/daily/' },
};

export default function Page() {
  return <DailyHomeContent />;
}
