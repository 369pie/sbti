import type { Metadata } from 'next';
import LoveHomeContent from './LoveHomeContent';

export const metadata: Metadata = {
  title: 'LPTI 恋爱人格测试 — 测测你是哪种恋爱人格',
  description:
    'LPTI (Love Personality Type Indicator) 恋爱人格测试：5 个恋爱维度、15 道灵魂拷问、16 种恋爱人格，三分钟测出你在感情里的真面目。',
  alternates: { canonical: '/love/' },
};

export default function Page() {
  return <LoveHomeContent />;
}
