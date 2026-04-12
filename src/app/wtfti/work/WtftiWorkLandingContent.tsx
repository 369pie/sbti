import Link from 'next/link';
import NextImage from 'next/image';
import { BANTI_PERSONALITIES, getBantiTypeThumbnailImage } from '@/lib/banti/personalities';

const FEATURED = BANTI_PERSONALITIES.slice(0, 8);

export default function WtftiWorkLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              WTFTI · 社畜宇宙
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <span className="block">班TI 职场人格图鉴</span>
              <span className="gradient-text">WTF 我在职场居然是这种人？</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              同一个你，在办公室里的翻译版。
              <br />
              16 道办公室题 + 1 个酒局隐藏分支，测完直达 29 张社畜图鉴卡。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wtfti/work/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all duration-200"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-subtle text-text-muted text-sm hover:text-text-secondary hover:border-border transition-all"
              >
                经典 WTFTI 版
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '29 种', label: '职场人格' },
              { value: '4 段式', label: '社畜文案' },
              { value: '16+1 题', label: '独立题包' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-elevated rounded-2xl border border-border-subtle px-4 py-6 text-center shadow-sm">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Different */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Features</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              同一个你，职场翻译版
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              同样的 15 维度测试，全新的社畜解读。
            </p>
          </div>

          <div className="space-y-4">
            {[
              { emoji: '🧾', title: '办公室题包', desc: '不再复用经典题面，全部换成工位、会议、群聊和茶水间场景' },
              { emoji: '🎯', title: '职场一击', desc: '一句话点破你的工位人设，精准到想提辞职' },
              { emoji: '📋', title: '工位症状清单', desc: '你以为只有你这样？不好意思，全中' },
              { emoji: '💬', title: '收口金句', desc: '骂完了还给你兜底——这就是班TI的温柔' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border-subtle bg-bg-elevated p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-medium text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Personalities Grid */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Gallery</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              部分职场人格预览
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED.map(p => (
              <Link
                key={p.slug}
                href={`/wtfti/work/result/${p.slug}/`}
                prefetch={false}
                className="group rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-sm hover:shadow-md hover:border-border transition-all text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                >
                  <NextImage
                    src={getBantiTypeThumbnailImage(p.slug)}
                    alt={p.workName}
                    width={160}
                    height={160}
                    sizes="64px"
                    className="w-[84%] h-[84%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="font-medium text-sm text-text-primary truncate">{p.workName}</div>
                <div className="text-xs text-text-muted font-mono mt-1">{p.code}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <span className="text-sm text-text-muted">
              还有 {BANTI_PERSONALITIES.length - FEATURED.length} 种职场人格等你解锁
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">💼</div>
          <h2 className="text-2xl font-semibold mb-3">测测你的班TI</h2>
          <p className="text-text-secondary mb-8">
            同一套 15 维度测试，直接翻译成你在办公室里的样子。
          </p>
          <Link
            href="/wtfti/work/test/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all"
          >
            开始测试
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
