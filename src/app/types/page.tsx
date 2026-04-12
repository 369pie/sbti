import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDE_ARTICLES } from '@/lib/guides';
import TypesContent from './TypesContent';
import { getTypesGalleryData } from './gallery-data';

const TYPES_GALLERY_DATA = getTypesGalleryData();

export const metadata: Metadata = {
  title: `SBTI 全人格图鉴馆 — ${TYPES_GALLERY_DATA.standardTotalCount} 张抽象人设卡`,
  description:
    `浏览 SBTI 全部 ${TYPES_GALLERY_DATA.standardTotalCount} 张抽象人设卡：人格图鉴、WTFTI、班TI、恋爱人格、职场人格、今日状态、酒后人设，${TYPES_GALLERY_DATA.seriesCount} 个系列一次刷完。`,
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8 sm:mb-10 animate-fade-up">
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Gallery · {TYPES_GALLERY_DATA.standardTotalCount} Types
        </span>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          全人格图鉴馆
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
          从基础人格、WTFTI、班TI 到恋爱、职场、每日状态、酒后人设，先刷一遍图鉴，再去做对应测试，会比只记一个结果名更容易看懂这套宇宙。
        </p>
      </div>

      <TypesContent
        standardSbtiTab={TYPES_GALLERY_DATA.standardSbtiTab}
        xiuxianSbtiTab={TYPES_GALLERY_DATA.xiuxianSbtiTab}
        otherTabs={TYPES_GALLERY_DATA.otherTabs}
      />

      <section className="mt-12 sm:mt-16 pt-12 border-t border-border-subtle">
        <div className="max-w-4xl">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Guide</span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            这些抽象名字到底咋看？
          </h2>
          <div className="space-y-4 text-text-secondary leading-8 text-sm sm:text-base">
            <p>
              SBTI 的人设卡不是随便起梗的标签列表，基础人格是五组切面、十五个维度的交叉组合；WTFTI 用同一套核心维度切进更毒舌的命名宇宙；班TI 再把这套人格翻译进办公室场景；恋爱、职场、今日状态、酒后人设各有独立维度模型。两个人看起来相似，最后也可能落到完全不同的卡上。
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
  );
}
