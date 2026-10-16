import type { Metadata } from 'next';

import { TodayClient } from './TodayClient';
import { CosmicThemeBinder } from '@/components/wtfti/HomeCosmosThemeBinder';

export const metadata: Metadata = {
  title: '✦ 一个今日 · Today · WTFTI',
  description:
    '今日天象签 × 灵鉴抽牌 × 月相日课 × 待拆的星尘信——她每天回来一次的地方。',
};

export default function TodayPage() {
  return (
    <>
      <CosmicThemeBinder />
      <TodayClient />
    </>
  );
}
