import type { Metadata } from 'next';
import WorkHomeContent from './WorkHomeContent';

export const metadata: Metadata = {
  title: 'WPTI 打工人格测试 — 测测你的打工人设是哪一挂',
  description:
    'WPTI (Work Personality Type Indicator) 打工人格测试：5 个职场维度、15 道灵魂拷问、16 张打工人设卡，三分钟测出你的职场真面目。',
  alternates: { canonical: '/work/' },
};

export default function Page() {
  return <WorkHomeContent />;
}
