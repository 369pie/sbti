import Link from 'next/link';
import NextImage from 'next/image';
import { LOVE_MODEL_NAMES, LOVE_MODEL_COLORS } from '@/lib/love/dimensions';
import type { LoveModelType } from '@/lib/love/dimensions';
import { LOVE_PERSONALITY_TYPES, getLoveTypeThumbnailImage } from '@/lib/love/personalities';

const MODELS: { key: LoveModelType; label: string }[] = [
  { key: 'depend', label: '你在恋爱里有多黏人' },
  { key: 'jealous', label: '你的醋坛子有多大' },
  { key: 'brain', label: '你是不是恋爱脑' },
  { key: 'secure', label: '你在关系里有多踏实' },
  { key: 'drama', label: '你在感情里有多能折腾' },
];

const FEATURED = LOVE_PERSONALITY_TYPES;

export default function LoveHomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Love Personality Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              你谈恋爱时
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">是哪种恋爱人设</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 个恋爱维度 · 15 道灵魂拷问 · 16 张恋爱人设卡
              <br />
              三分钟测出你在感情里的真面目。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/love/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-bg-primary font-medium text-base hover:brightness-110 transition-all duration-200"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                ← 返回 WTFTI
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '5 维', label: '恋爱维度' },
              { value: '16 张', label: '恋爱人设' },
              { value: '15 题', label: '约3分钟' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Dimensions */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Dimensions</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">五个恋爱切面</h2>
          </div>

          <div className="grid gap-3">
            {MODELS.map((m, i) => {
              const color = LOVE_MODEL_COLORS[m.key];
              return (
                <div
                  key={m.key}
                  className="animate-fade-up flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated shadow-sm hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-semibold flex-shrink-0"
                    style={{ background: color.bg, color: color.base }}
                  >
                    {m.key[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: color.base }}>
                      {LOVE_MODEL_NAMES[m.key]}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">{m.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured types */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Types</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">16 张恋爱人设卡</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURED.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href={`/love/result/${p.slug}`}
                  prefetch={false}
                  className="block p-4 sm:p-5 rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm text-center hover:shadow-md hover:border-border transition-all"
                >
                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 rounded-2xl overflow-hidden"
                    style={{ background: `${p.color}15` }}
                  >
                    <NextImage
                      src={getLoveTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="text-2xl font-mono tracking-[0.08em] leading-none mb-2" style={{ color: p.color }}>
                    {p.code}
                  </div>
                  <div className="text-base font-medium text-text-primary">{p.name}</div>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-1">{p.tagline}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-text-muted text-sm mb-6">准备好了吗？</p>
          <Link
            href="/love/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-accent text-bg-primary font-medium text-lg hover:brightness-110 transition-all duration-200"
          >
            开始测恋爱人设
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
