import type { Metadata } from 'next';
import DrunkHomeContent from './DrunkHomeContent';

export const metadata: Metadata = {
  title: '酒后人设测试 — SBTI',
  description:
    '6 道灵魂拷问，一分钟测出你喝醉后会变成什么样的人。5 个醉态维度、12 张酒后人设卡。',
  alternates: { canonical: '/drunk/' },
};

export default function Page() {
  return <DrunkHomeContent />;
}
