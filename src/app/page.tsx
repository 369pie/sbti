import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'SBTI 人格测试 — 测测你是哪种抽象人格',
  description:
    'SBTI (Silly Behavioral Type Indicator) 是一个轻松向的人格测试。5 组切面、15 个维度、27 种人格，找到最像你的那一个。纯前端计算，不上传任何数据。',
  alternates: { canonical: '/' },
};

export default function Page() {
  return <HomeContent />;
}
