import type { Metadata } from 'next';
import { MystiSigilContent } from '@/components/MystiSigilContent';

export const metadata: Metadata = {
  title: 'Sigil 灵魂印记 · 年度纪章册 — WTFTI 灵鉴',
  description:
    '12 章月相纪章 · 一整年的灵魂印记被收进同一本暮光册子。每月一枚 SVG 纪章，年终生成印刷级 PDF。',
  alternates: { canonical: '/mysti/sigil/' },
  openGraph: {
    title: 'Sigil · 年度纪章册',
    description: '一整年的暮光被收进 12 枚纪章。',
    type: 'website',
  },
};

export default function MystiSigilPage() {
  return <MystiSigilContent />;
}
