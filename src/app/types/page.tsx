import type { Metadata } from 'next';
import TypesContent from './TypesContent';

export const metadata: Metadata = {
  title: 'SBTI 27 种人格类型总览',
  description:
    '浏览 SBTI 全部 27 种人格类型：五大模型、十五个维度、二十七种结果，对照查看每种人格类型的核心画像与差异。',
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return <TypesContent />;
}
