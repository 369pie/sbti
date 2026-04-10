import type { Metadata } from 'next';
import TypesContent from './TypesContent';

export const metadata: Metadata = {
  title: '27 种人格类型总览 — SBTI 人格测试',
  description:
    '浏览 SBTI 全部 27 种人格类型：五大模型十五维度交叉分析，每种人格都有独特的维度组合和性格画像。',
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return <TypesContent />;
}
