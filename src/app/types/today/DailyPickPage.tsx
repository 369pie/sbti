'use client';

import DailyPickOverlay from '@/components/museum/DailyPickOverlay';
import type { GalleryTab } from '@/app/types/gallery-data';

export default function DailyPickPage({ allTabs }: { allTabs: GalleryTab[] }) {
  return <DailyPickOverlay allTabs={allTabs} mode="page" />;
}
