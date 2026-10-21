import type { Metadata } from 'next';

import { TodayClient } from './TodayClient';

export const metadata: Metadata = {
  title: '今日',
  description: '每天一张只写给你的今日卡：运势、幸运色、妆容一句，跟着你的档案走。',
};

export default function TodayPage() {
  return <TodayClient />;
}
