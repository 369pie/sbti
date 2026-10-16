import type { Metadata } from 'next';
import { MystiSubscribeContent } from '@/components/MystiSubscribeContent';

export const metadata: Metadata = {
  title: '暮光通行证 · 灵鉴会籍 — 她的私人神谕室',
  description:
    '把神谕室的钥匙留给自己。无限暮光抽牌 · 合盘长文 · 历年命书 · 节气暗信 · 年度灵魂纪章。¥19/月 起，单次内容 7 折。',
  alternates: { canonical: '/mysti/subscribe/' },
  robots: { index: true, follow: true },
};

export default function MystiSubscribePage() {
  return <MystiSubscribeContent />;
}
