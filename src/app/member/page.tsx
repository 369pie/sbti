import type { Metadata } from 'next';

import { MemberContent } from './MemberContent';

export const metadata: Metadata = {
  title: '会员 · ¥19/月 · 到期不自动续费 — WTFTI',
  description: '一个会员，全部权益：完整今日卡、美我换装额度、全站深度报告与「我和他」免费、AI 次数更多、塔罗加抽与月报。一次开通 30 天，到期不自动续费。',
  alternates: { canonical: '/member/' },
};

export default function MemberPage() {
  return <MemberContent />;
}
