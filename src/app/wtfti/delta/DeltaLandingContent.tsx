import Link from 'next/link';
import { DELTA_PERSONALITIES, getDeltaTypeThumbnailImage } from '@/lib/delta/personalities';
import NextImage from 'next/image';

const FEATURED = DELTA_PERSONALITIES.slice(0, 8);

export default function DeltaLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              WTFTI · 战区宇宙
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <span className="block">三角TI 战区人格图鉴</span>
              <span className="gradient-text">WTF 我在三角洲居然是这种兵？</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              同一个你，在战区里的翻译版。
              <br />
              15 维度人格测试，测完直达 29 张战区人格图鉴卡。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wtfti/delta/test/"
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
              { value: '29 种', label: '战区人格' },
              { value: '4 段式', label: '战区文案' },
              { value: '~31 题', label: '共用题包' },
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
              同一个你，战区翻译版
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              同样的 15 维度测试，全新的战区解读。
            </p>
          </div>

          <div className="space-y-4">
            {[
              { emoji: '🎯', title: '干员人格映射', desc: '29 种人格对应 29 种你在战区里的样子：是指挥官还是蹲狗？' },
              { emoji: '🔫', title: 'FPS 梗全覆盖', desc: '舔包、蹲点、改枪、上头…你的游戏习惯就是你的人格写照' },
              { emoji: '🖼️', title: '充气手办图鉴', desc: '29 张充气乙烯手办风格图鉴卡，每张都想收藏' },
              { emoji: '📲', title: '一键分享', desc: '"你打三角洲的风格暴露了你的真实人格💀" 配图直接发小红书' },
            ].map(item => (
              <div
                key={item.title}
                className="flex gap-5 items-start rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6 shadow-sm animate-fade-up"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <h3 className="text-base font-medium text-text-primary mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured types preview */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Preview</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              先看看你可能是谁
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {FEATURED.map((p, i) => (
              <Link
                key={p.slug}
                href={`/wtfti/delta/result/${p.slug}/`}
                className="group rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-md hover:border-border transition-all overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                </div>
                <div className="px-3 py-3">
                  <span
                    className="text-[10px] font-mono tracking-widest block mb-0.5"
                    style={{ color: p.color }}
                  >
                    {p.code}
                  </span>
                  <h3 className="text-sm font-medium text-text-primary truncate">{p.heroName}</h3>
                  <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-text-muted mb-6">
            29 种战区人格，总有一种是你 —— 或者你的队友
          </p>
          <Link
            href="/wtfti/delta/test/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all"
          >
            开始战区人格测试
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
