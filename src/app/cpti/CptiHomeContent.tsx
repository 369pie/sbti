import Link from 'next/link';
import { CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import type { CptiModelType } from '@/lib/cpti/dimensions';
import { CPTI_PERSONALITY_TYPES } from '@/lib/cpti/personalities';

const MODELS: { key: CptiModelType; label: string }[] = [
  { key: 'power', label: '这段关系里谁拿主意' },
  { key: 'express', label: '你的爱是说出来还是做出来' },
  { key: 'conflict', label: '吵架时你是爆炸还是沉默' },
  { key: 'care', label: '关系里谁照顾谁多一点' },
  { key: 'fusion', label: '你俩是融为一体还是各自精彩' },
];

const FEATURED = CPTI_PERSONALITY_TYPES;

export default function CptiHomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Couple Personality Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              你在关系里
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">扮演什么角色</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 个关系维度 · 16 种CP角色 · 25 种关系类型
              <br />
              三分钟测出你在关系里的角色，邀请ta配对解锁关系图鉴。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/cpti/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-500 text-white font-medium text-base hover:bg-rose-600 transition-all duration-200"
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
          <div className="mt-16 grid grid-cols-4 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '5 维', label: '关系维度' },
              { value: '16 种', label: 'CP角色' },
              { value: '25 种', label: '关系类型' },
              { value: '3 分钟', label: '完成测试' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal Card */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 text-center animate-fade-up">
            <p className="text-sm text-text-muted mb-3">和其他测试有什么不一样？</p>
            <div className="grid grid-cols-2 gap-4 text-left text-sm">
              <div className="p-3 rounded-xl bg-bg-secondary/50">
                <div className="text-text-muted text-xs mb-1">MBTI / SBTI</div>
                <div className="text-text-primary font-medium">测你是什么人</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/50">
                <div className="text-text-muted text-xs mb-1">XPTI</div>
                <div className="text-text-primary font-medium">测你爱什么人</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/50">
                <div className="text-text-muted text-xs mb-1">LPTI</div>
                <div className="text-text-primary font-medium">测你的恋爱性格</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-rose-400 text-xs mb-1">CPTI ✦ New</div>
                <div className="text-text-primary font-medium">测你在关系里的角色</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three modes */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Three Modes</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">三种玩法</h2>
          </div>

          <div className="grid gap-3">
            {[
              {
                emoji: '🪞', title: '查看我的CP角色', desc: '做完20题，立即获得你的CP角色鉴定。',
                color: '#e11d48', bgColor: 'rgba(225,29,72,0.06)',
              },
              {
                emoji: '💌', title: '邀请ta一起测', desc: '测完后生成邀请链接，ta做完配对题后解锁关系类型。',
                color: '#ec4899', bgColor: 'rgba(236,72,153,0.06)',
              },
              {
                emoji: '👀', title: '帮ta答题（他评模式）', desc: '收到邀请后，以观察者视角回答12道题，鉴定你们的关系。',
                color: '#a855f7', bgColor: 'rgba(168,85,247,0.06)',
              },
            ].map((mode, i) => (
              <div
                key={mode.title}
                className="animate-fade-up flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated shadow-sm"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: mode.bgColor }}
                >
                  {mode.emoji}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{mode.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{mode.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More features */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Explore</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">探索更多</h2>
          </div>

          <div className="grid gap-3">
            {[
              {
                emoji: '📖', title: '我的关系图鉴', desc: '查看已收集的所有CP关系类型，点亮你的关系宇宙。',
                href: '/card', color: '#ec4899', bgColor: 'rgba(236,72,153,0.06)',
              },
              {
                emoji: '🏆', title: '排行榜', desc: '看看谁的关系类型收集最多，谁是最活跃的CP猎人。',
                href: '/cpti/leaderboard', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.06)',
              },
              {
                emoji: '🔗', title: '输入配对码', desc: '收到邀请码？输入即可配对，解锁新的关系类型。',
                href: '/cpti/join', color: '#a855f7', bgColor: 'rgba(168,85,247,0.06)',
              },
            ].map((item, i) => (
              <Link
                key={item.title}
                href={item.href}
                className="animate-fade-up flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated shadow-sm hover:shadow-md hover:border-border transition-all"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: item.bgColor }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">{item.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                </div>
                <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Dimensions */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Dimensions</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">五个关系切面</h2>
          </div>

          <div className="grid gap-3">
            {MODELS.map((m, i) => {
              const color = CPTI_MODEL_COLORS[m.key];
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
                      {CPTI_MODEL_NAMES[m.key]}
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
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Roles</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">16 种CP角色</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURED.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href={`/cpti/result/${p.slug}`}
                  prefetch={false}
                  className="block p-4 sm:p-5 rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm text-center hover:shadow-md hover:border-border transition-all"
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl"
                    style={{ background: `${p.color}15` }}
                  >
                    {p.emoji}
                  </div>
                  <div className="text-lg font-mono tracking-[0.08em] leading-none mb-2" style={{ color: p.color }}>
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
            href="/cpti/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-rose-500 text-white font-medium text-lg hover:brightness-110 transition-all duration-200 shadow-[0_0_40px_rgba(225,29,72,0.2)]"
          >
            测测你的CP角色
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
