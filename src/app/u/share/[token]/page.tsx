import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTypesGalleryData } from '@/app/types/gallery-data';
import { getSiteUrl } from '@/lib/site';
import { decodeSnapshot } from '@/lib/museum/share-snapshot';
import SharedMuseumPage from './SharedMuseumPage';

const TYPES_GALLERY_DATA = getTypesGalleryData();
const ALL_TABS = [
  ...TYPES_GALLERY_DATA.coreGroup,
  ...TYPES_GALLERY_DATA.ipGroup,
  ...TYPES_GALLERY_DATA.themeGroup,
];

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const snap = decodeSnapshot(token);
  if (!snap) {
    return {
      title: '卡册快照 · WTFTI 图鉴馆',
      description: '看不见这份快照，可能链接已过期。',
      robots: { index: false, follow: false },
    };
  }
  const who = snap.name?.trim() || '某位馆主';
  const title = `${who}的图鉴馆 · ${snap.unlockedKeys.length} 张卡`;
  const description = `${who}解锁了 ${snap.unlockedKeys.length} 张人设卡 · 走过 ${snap.touchedTabIds.length} 个系列 · 来自 WTFTI 图鉴馆`;
  return {
    title,
    description,
    alternates: { canonical: `/u/share/${token}/` },
    openGraph: { title, description, url: getSiteUrl(`/u/share/${token}/`) },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const snap = decodeSnapshot(token);
  if (!snap) notFound();
  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <SharedMuseumPage allTabs={ALL_TABS} snapshot={snap} />
      </div>
    </div>
  );
}
