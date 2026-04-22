/**
 * /cpti/pricing/page.tsx
 * ─────────────────────────────────────────────────────────────
 * v2.0 W3 — CPTI 5 档付费方案 + Mysti Pass 顶档.
 *
 * 阶梯定价（与 XPTI pricing 风格一致，但锚点不同）:
 *   ¥6.9   cpti-deep-relationship   单段关系深档
 *   ¥9.9   cpti-cosign-edition      双签金箔限定卡
 *   ¥29    cpti-codex-pass-yearly   关系图鉴年卡（主轴）
 *   ¥39    cpti-squad-pack          闺蜜组团购（4 人）
 *   ¥19    cpti-seasonal-pack       季节限定皮肤年包
 *   ¥19/月 monthly-pass             Mysti 通行证（顶档，覆盖 deep-relationship）
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CptiPricingLadder } from '@/components/cpti/CptiPricingLadder';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'CPTI · 价值阶梯 | WTFTI',
  description:
    'CPTI 2.0 的 5 档关系付费方案：¥6.9 单段深档 / ¥9.9 双签金箔卡 / ¥29 关系图鉴年卡 / ¥39 闺蜜组团购 / ¥19 季节限定皮肤年包。',
  alternates: { canonical: getSiteUrl('/cpti/pricing/') },
  openGraph: {
    title: 'CPTI · 价值阶梯',
    description:
      '命名一段关系，¥6.9；留下所有关系，¥29/年；一年三次限定换装，¥19。CPTI 2.0 关系图鉴 5 档定价。',
    url: getSiteUrl('/cpti/pricing/'),
    type: 'website',
  },
};

export default function CptiPricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8]" />}>
      <CptiPricingLadder />
    </Suspense>
  );
}
