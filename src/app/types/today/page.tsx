import type { Metadata } from 'next';
import { getTypesGalleryData } from '@/app/types/gallery-data';
import { getSiteUrl } from '@/lib/site';
import DailyPickPage from './DailyPickPage';

const TYPES_GALLERY_DATA = getTypesGalleryData();
const ALL_TABS = [
  ...TYPES_GALLERY_DATA.coreGroup,
  ...TYPES_GALLERY_DATA.ipGroup,
  ...TYPES_GALLERY_DATA.themeGroup,
];

export const metadata: Metadata = {
  title: '今日封印 · WTFTI 每日一卡',
  description:
    '每天一张人格签卡：基于今天的节气、月相和你的解锁进度，给你一句仅属于今日的话。截图发小红书或邀请闺蜜也来翻一张。',
  alternates: { canonical: '/types/today/' },
  openGraph: {
    title: '今日封印 · WTFTI 每日一卡',
    description: '一张属于今天的人格签卡 — 节气 × 月相 × 你的图鉴。',
    url: getSiteUrl('/types/today/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '今日封印 · WTFTI 每日一卡',
    description: '一张属于今天的人格签卡 — 节气 × 月相 × 你的图鉴。',
  },
};

export default function Page() {
  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="text-center mb-8 sm:mb-10 animate-fade-up">
          <span className="serial-number text-xs">02 / Daily</span>
          <h1 className="section-headline text-3xl sm:text-4xl mt-2">今日封印</h1>
          <p className="text-sm text-text-muted mt-3 max-w-md mx-auto leading-relaxed">
            每天一张人设签卡。今天给您的，由节气、月相和图鉴进度共同写成。
          </p>
        </header>

        <DailyPickPage allTabs={ALL_TABS} />
      </div>
    </div>
  );
}
