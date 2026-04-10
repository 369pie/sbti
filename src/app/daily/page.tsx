import type { Metadata } from 'next';
import DailyHomeContent from './DailyHomeContent';

export const metadata: Metadata = {
  title: '今日模式测试 — SBTI',
  description:
    '每天 6 道快问，一分钟测出你今天开了什么模式。5 个维度、12 张状态卡，题目每天不一样。',
  alternates: { canonical: '/daily/' },
};

export default function Page() {
  return <DailyHomeContent />;
}
