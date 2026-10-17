import type { Metadata } from 'next';

import { BottleClient } from './BottleClient';

export const metadata: Metadata = {
  title: '懂我 · 树洞 · WTFTI',
  description: '写下心情，先收到一句温柔回应。想匿名公开会先过审；别人只能抱抱或点「我也是」。',
};

export default function BottlePage() {
  return <BottleClient />;
}
