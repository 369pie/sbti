import Link from 'next/link';
import NextImage from 'next/image';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import type { XptiModelType } from '@/lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiTypeThumbnailImage } from '@/lib/xpti/personalities';

const AXES: { key: XptiModelType; poleA: string; poleB: string; question: string }[] = [
  { key: 'power', poleA: '👑 女王体质', poleB: '🐑 配合体质', question: '你在关系里主导还是被安排' },
  { key: 'sense', poleA: '🕯️ 氛围体质', poleB: '⚡ 直觉体质', question: '你的心动靠仪式感还是电光火石' },
  { key: 'focus', poleA: '💗 纯爱体质', poleB: '🃏 反转体质', question: '你在感情里专一还是享受不确定' },
  { key: 'imagine', poleA: '🌙 脑补体质', poleB: '📊 务实体质', question: '你的理想型活在脑子里还是Excel里' },
];

export default function XptiHomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              XP Personality Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              你在爱情里
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">是什么XP体质</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-4">
              4 大恋爱轴 · 20 道灵魂拷问 · 16 种XP体质
              <br />
              三分钟测出你的恋爱DNA。
            </p>

            <p className="text-sm text-text-muted mb-10 max-w-md mx-auto">
              MBTI 测你是什么人，XPTI 测你爱上什么人。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/xpti/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(236,72,153,0.25)]"
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
                ← SBTI 抽象人格测试
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '4 轴', label: '恋爱维度' },
              { value: '16 种', label: 'XP体质' },
              { value: '20 题', label: '约3分钟' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Axes */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Four Axes</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">四大恋爱轴</h2>
          </div>

          <div className="grid gap-3">
            {AXES.map((ax, i) => {
              const color = XPTI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="animate-fade-up rounded-xl border border-border-subtle bg-bg-elevated shadow-sm hover:shadow-md transition-shadow p-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-semibold flex-shrink-0"
                      style={{ background: color.bg, color: color.base }}
                    >
                      {ax.key[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: color.base }}>
                        {XPTI_MODEL_NAMES[ax.key]}
                      </div>
                      <div className="text-xs text-text-muted">{ax.question}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary">{ax.poleA}</span>
                    <span className="text-text-muted">↔</span>
                    <span className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary">{ax.poleB}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 16 XP Types */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Types</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">16 种恋爱XP体质</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {XPTI_PERSONALITY_TYPES.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={`/xpti/result/${p.slug}`}
                  prefetch={false}
                  className="block p-4 rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm text-center hover:shadow-md hover:border-border transition-all"
                >
                  <div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-2xl overflow-hidden"
                    style={{ background: `${p.color}15` }}
                  >
                    <NextImage
                      src={getXptiTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="text-lg font-mono tracking-[0.06em] leading-none mb-1.5" style={{ color: p.color }}>
                    {p.code}
                  </div>
                  <div className="text-sm font-medium text-text-primary">{p.name}</div>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.tagline}</p>
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
            href="/xpti/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-lg hover:brightness-110 transition-all duration-200 shadow-[0_0_40px_rgba(192,132,252,0.2)]"
          >
            测测你的XP体质
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
