import type { Metadata } from 'next';
import TypesContent from './TypesContent';

export const metadata: Metadata = {
  title: 'SBTI 27 种人格图鉴 — 27 张抽象人设卡',
  description:
    '浏览 SBTI 全部 27 张抽象人设卡：五大模型、十五个维度、二十七种结果，对照查看每张卡的核心画像与差异。',
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return <TypesContent />;
}
