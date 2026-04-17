import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDE_ARTICLES } from '@/lib/guides';
import { getSiteUrl } from '@/lib/site';
import TypesContent from './TypesContent';
import { getTypesGalleryData } from './gallery-data';
import { getDailyFeatured } from '@/lib/museum/featured';

const TYPES_GALLERY_DATA = getTypesGalleryData();
const ALL_TABS = [
  ...TYPES_GALLERY_DATA.coreGroup,
  ...TYPES_GALLERY_DATA.ipGroup,
  ...TYPES_GALLERY_DATA.themeGroup,
];

export const metadata: Metadata = {
  title: `WTFTI 全人格图鉴馆 — ${TYPES_GALLERY_DATA.totalCount} 张抽象人设卡`,
  description:
    `浏览 WTFTI 全部 ${TYPES_GALLERY_DATA.totalCount} 张抽象人设卡：经典 SBTI、修仙版、WTFTI、班TI、王者TI、三角TI、恋爱、职场、XPTI、花TI、今日状态、酒后人设，${TYPES_GALLERY_DATA.seriesCount} 个系列一次刷完。`,
  keywords: ['WTFTI人格图鉴', 'SBTI人格图鉴', '人格类型大全', '人格图鉴馆', '抽象人设卡', '人格测试类型'],
  alternates: { canonical: '/types/' },
  openGraph: {
    title: `WTFTI 全人格图鉴馆 — ${TYPES_GALLERY_DATA.totalCount} 张抽象人设卡`,
    description: `${TYPES_GALLERY_DATA.seriesCount} 个系列、${TYPES_GALLERY_DATA.totalCount} 张人设卡，一次刷完全部人格类型。`,
    url: getSiteUrl('/types/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: `WTFTI 全人格图鉴馆 — ${TYPES_GALLERY_DATA.totalCount} 张抽象人设卡`,
    description: `${TYPES_GALLERY_DATA.seriesCount} 个系列、${TYPES_GALLERY_DATA.totalCount} 张人设卡一次刷完。`,
  },
};

export default function Page() {
  const featured = getDailyFeatured(ALL_TABS, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `WTFTI 全人格图鉴馆`,
          description: `${TYPES_GALLERY_DATA.seriesCount} 个系列、${TYPES_GALLERY_DATA.totalCount} 张人设卡，一次刷完全部人格类型。`,
          url: getSiteUrl('/types/'),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '全人格图鉴馆', item: getSiteUrl('/types/') },
            ],
          },
        }) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <TypesContent
          coreGroup={TYPES_GALLERY_DATA.coreGroup}
          ipGroup={TYPES_GALLERY_DATA.ipGroup}
          themeGroup={TYPES_GALLERY_DATA.themeGroup}
          totalCount={TYPES_GALLERY_DATA.totalCount}
          seriesCount={TYPES_GALLERY_DATA.seriesCount}
          featured={featured}
        />

        <section className="mt-12 sm:mt-16 pt-12 border-t border-border-subtle">
          <div className="max-w-4xl">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Guide</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              这些抽象名字到底咋看？
            </h2>
            <div className="space-y-4 text-text-secondary leading-8 text-sm sm:text-base">
              <p>
                WTFTI 的人设卡不是随便起梗的标签列表。经典 SBTI 宇宙负责提供五组切面、十五个维度的基础人格底图；WTFTI 毒舌版用同一套核心维度切进更狠的命名宇宙；班TI 再把这套人格翻译进办公室场景；恋爱、职场、今日状态、酒后人设各有独立维度模型。两个人看起来相似，最后也可能落到完全不同的卡上。
              </p>
              <p>
                最顺手的打开方式：先刷一遍感兴趣的系列图鉴，再去做对应测试，然后回到结果页对照详细解读。比只看一个结果名更容易理解自己为什么会落到那个类型。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {GUIDE_ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  href={`/guide/${article.slug}`}
                  prefetch={false}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5 hover:shadow-md hover:border-border transition-all"
                >
                  <span className="text-xs font-mono tracking-wider text-text-muted uppercase block mb-2">
                    {article.category}
                  </span>
                  <h3 className="text-base font-medium text-text-primary leading-7">{article.title}</h3>
                  <p className="text-sm text-text-secondary leading-6 mt-3">{article.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
