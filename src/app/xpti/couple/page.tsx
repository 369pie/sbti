import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { CoupleClient } from './CoupleClient';

export const metadata: Metadata = {
  title: 'XPTI · 关系合并报告 / 亲密张力配对',
  description:
    '用 12 道精简题完成另一半的 XPTI 测试，与你的张力签名合并，生成关系雷达 + 6 类配对模型 + 24 句对话脚本。',
  alternates: { canonical: '/xpti/couple/' },
  openGraph: {
    title: 'XPTI · 关系合并报告',
    description: '12 道精简题 → 双人张力雷达 + 配对模型 + 对话脚本。',
    url: getSiteUrl('/xpti/couple/'),
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export default function XptiCouplePage() {
  return <CoupleClient />;
}
