import Link from 'next/link';
import NextImage from 'next/image';
import { BIRD_PERSONALITIES, getBirdTypeThumbnailImage } from '@/lib/bird/personalities';

const FEATURED = BIRD_PERSONALITIES.slice(0, 8);

export default function BirdLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              WTFTI · 鸟类宇宙
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <span className="block">鸟TI 鸟格图鉴</span>
              <span className="gradient-text">测一下你是什么鸟？</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              29 种鸟 × 29 种你。
              <br />
              30 道鸟界场景题 + 1 个派对隐藏分支，答完直飞你的鸟格图鉴卡。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/bird/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-bg-primary font-medium text-base hover:bg-accent/90 transition-all duration-200"
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
              { value: '29 种', label: '鸟格类型' },
              { value: '5 段式', label: '鸟格解读' },
              { value: '30+1 题', label: '鸟界题包' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-elevated rounded-2xl border border-border-subtle px-4 py-6 text-center shadow-sm">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Features</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              你不是人，你是鸟
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              同样的 15 维度测试，这次翻译成你在鸟界的样子。
            </p>
          </div>

          <div className="space-y-4">
            {[
              { emoji: '🐦', title: '鸟界场景题', desc: '筑巢、觅食、迁徙、求偶——全部换成鸟类世界的场景' },
              { emoji: '🎯', title: '鸟格一击', desc: '一句话点破你的鸟格，精准到想飞走' },
              { emoji: '📋', title: '鸟格症状清单', desc: '你以为只有你这样？不好意思，都中了' },
              { emoji: '💬', title: '叫声代号', desc: '每种鸟有专属叫声密码——SCREEE、HOOT、QUACK' },
              { emoji: '🎨', title: '29 张图鉴卡', desc: '真实鸟种 × 人格维度，每张都值得发朋友圈' },
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
              部分鸟格预览
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED.map(p => (
              <Link
                key={p.slug}
                href={`/bird/result/${p.slug}/`}
                prefetch={false}
                className="group rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-sm hover:shadow-md hover:border-border transition-all text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                >
                  <NextImage
                    src={getBirdTypeThumbnailImage(p.slug)}
                    alt={p.birdTitle}
                    width={160}
                    height={160}
                    sizes="64px"
                    className="w-[84%] h-[84%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="font-medium text-sm text-text-primary truncate">{p.birdName}·{p.birdTitle}</div>
                <div className="text-xs text-text-muted font-mono mt-1">{p.code}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <span className="text-sm text-text-muted">
              还有 {BIRD_PERSONALITIES.length - FEATURED.length} 种鸟格等你解锁
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">🐦</div>
          <h2 className="text-2xl font-semibold mb-3">测测你是什么鸟</h2>
          <p className="text-text-secondary mb-8">
            同一套 15 维度测试，直接翻译成你在鸟类世界里的样子。
          </p>
          <Link
            href="/bird/test/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-bg-primary font-medium text-base hover:bg-accent/90 transition-all"
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
