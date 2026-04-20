import type { Metadata } from 'next';
import { getTypesGalleryData } from '@/app/types/gallery-data';
import { getSiteUrl } from '@/lib/site';
import { decodePairSlug, generateCpPair } from '@/lib/museum/cp-pair';
import CpPairPage from './CpPairPage';

const TYPES_GALLERY_DATA = getTypesGalleryData();
const ALL_TABS = [
  ...TYPES_GALLERY_DATA.coreGroup,
  ...TYPES_GALLERY_DATA.ipGroup,
  ...TYPES_GALLERY_DATA.themeGroup,
];

interface PageProps {
  params: Promise<{ slugs: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugs } = await params;
  const key = decodePairSlug(slugs);
  const fallback: Metadata = {
    title: 'CP 配对 · WTFTI 图鉴馆',
    description: '把任意两张人设卡配在一起，自动生成 CP 名 + 三句锐评 + 拼图截图。',
    alternates: { canonical: `/types/cp/${slugs}/` },
  };
  if (!key) return fallback;
  const pair = generateCpPair(ALL_TABS, key);
  if (!pair) return fallback;

  const title = `${pair.name} — ${pair.kicker} | WTFTI 图鉴馆 CP`;
  return {
    title,
    description: `${pair.tag} · ${pair.roast.join(' ')}`,
    alternates: { canonical: `/types/cp/${pair.pairSlug}/` },
    openGraph: {
      title,
      description: pair.kicker,
      url: getSiteUrl(`/types/cp/${pair.pairSlug}/`),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: pair.kicker,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slugs } = await params;
  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <CpPairPage allTabs={ALL_TABS} slugs={slugs} />
      </div>
    </div>
  );
}
