import type { Metadata } from 'next';
import { getTypesGalleryData } from '@/app/types/gallery-data';
import { getSiteUrl } from '@/lib/site';
import { formatYmTitle, isValidYm } from '@/lib/museum/monthly-recap';
import MonthlyRecapPage from './MonthlyRecapPage';

const TYPES_GALLERY_DATA = getTypesGalleryData();
const ALL_TABS = [
  ...TYPES_GALLERY_DATA.coreGroup,
  ...TYPES_GALLERY_DATA.ipGroup,
  ...TYPES_GALLERY_DATA.themeGroup,
];

interface PageProps {
  params: Promise<{ ym: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ym } = await params;
  const isValid = isValidYm(ym);
  const title = isValid ? `${formatYmTitle(ym)} 月度合辑 · WTFTI 图鉴馆` : '月度合辑 · WTFTI 图鉴馆';
  const description = '本月你抽到/收藏过的所有人设签卡，自动拼成一张可截图的合辑。';
  return {
    title,
    description,
    alternates: { canonical: `/types/month/${ym}/` },
    openGraph: { title, description, url: getSiteUrl(`/types/month/${ym}/`) },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function Page({ params }: PageProps) {
  const { ym } = await params;
  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <MonthlyRecapPage allTabs={ALL_TABS} ym={ym} />
      </div>
    </div>
  );
}
