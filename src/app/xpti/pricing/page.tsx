import type { Metadata } from 'next';
import { PricingLadder } from '@/components/xpti/PricingLadder';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'XPTI · 价值阶梯 | WTFTI',
  description:
    'XPTI v3.0 的 4 档付费方案：¥4.9 单人深度 / ¥6.9 双人各付一半 / ¥12.9 单方付清 / ¥29 年度档案。',
  alternates: { canonical: getSiteUrl('/xpti/pricing/') },
  openGraph: {
    title: 'XPTI · 价值阶梯',
    description:
      '从一个人到两个人到一年里的你 — XPTI v3.0 4 档清晰定价，最低 ¥4.9，最高 ¥29。',
    url: getSiteUrl('/xpti/pricing/'),
    type: 'website',
  },
};

export default function XptiPricingPage() {
  return <PricingLadder />;
}
