import type { Metadata } from 'next';
import WorkHomeContent from './WorkHomeContent';

export const metadata: Metadata = {
  title: 'WPTI 打工人格测试 — 测测你是哪种打工人',
  description:
    'WPTI (Work Personality Type Indicator) 打工人格测试：5 个职场维度、15 道灵魂拷问、16 种打工人格，三分钟测出你的职场真面目。',
  alternates: { canonical: '/work/' },
};

export default function Page() {
  return <WorkHomeContent />;
}
