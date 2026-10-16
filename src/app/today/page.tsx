import type { Metadata } from 'next';

import { TodayClient } from './TodayClient';
import { CosmicThemeBinder } from '@/components/wtfti/HomeCosmosThemeBinder';
import { DailyReminderToggle } from '@/components/DailyReminderToggle';
import { DailyEmailToggle } from '@/components/DailyEmailToggle';

export const metadata: Metadata = {
  title: '✦ 一个今日 · Today · WTFTI',
  description:
    '今日天象签 × 灵鉴抽牌 × 月相日课 × 待拆的星尘信——她每天回来一次的地方。',
};

export default function TodayPage() {
  return (
    <>
      <CosmicThemeBinder />
      {/* Interim placement until /today is rebuilt in P1. */}
      <div className="skin-journal px-6 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <DailyReminderToggle />
          <DailyEmailToggle />
        </div>
      </div>
      <TodayClient />
    </>
  );
}
