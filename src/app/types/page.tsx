import type { Metadata } from 'next';
import TypesContent from './TypesContent';

export const metadata: Metadata = {
  title: 'SBTI 全人格图鉴馆 — 83 张抽象人设卡',
  description:
    '浏览 SBTI 全部 83 张抽象人设卡：人格图鉴、恋爱人格、职场人格、今日状态、酒后人设，五大系列一次刷完。',
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return <TypesContent />;
}
