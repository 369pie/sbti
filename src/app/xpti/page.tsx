import type { Metadata } from 'next';
import XptiHomeContent from './XptiHomeContent';

export const metadata: Metadata = {
  title: 'XPTI 恋爱XP体质测试 — 测测你在爱情里是什么体质',
  description:
    'XPTI 恋爱XP体质测试：4 大恋爱轴、20 道灵魂拷问、16 种XP体质，三分钟测出你的恋爱DNA。MBTI 测你是什么人，XPTI 测你爱上什么人。',
  alternates: { canonical: '/xpti/' },
};

export default function XptiPage() {
  return <XptiHomeContent />;
}
