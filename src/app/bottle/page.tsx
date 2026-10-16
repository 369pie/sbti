import type { Metadata } from 'next';

import { BottleClient } from './BottleClient';
import { CosmicThemeBinder } from '@/components/wtfti/HomeCosmosThemeBinder';

export const metadata: Metadata = {
  title: '✦ 漂流瓶 · 树洞 · WTFTI',
  description: '匿名扔个瓶子说说心事，每天捞三个陌生人的瓶子——回一句，或者抱抱。',
};

export default function BottlePage() {
  return (
    <>
      <CosmicThemeBinder />
      <BottleClient />
    </>
  );
}
