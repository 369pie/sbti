import type { Metadata } from 'next';
import { MystiSubscribeContent } from '@/components/MystiSubscribeContent';

export const metadata: Metadata = {
  title: '灵魂通行证 — WTFTI 灵鉴',
  description: '¥19/月 起，每日翻牌 + 全 Plus 分享卡 + 灵魂月报 + 单次内容 7 折。',
  alternates: { canonical: '/mysti/subscribe/' },
  robots: { index: true, follow: true },
};

export default function MystiSubscribePage() {
  return <MystiSubscribeContent />;
}
