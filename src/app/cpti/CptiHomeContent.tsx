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

const MODES = [
  { n: '01', title: '查看我的 CP 角色', desc: '20 题快测，立即拿到属于你的 CP 角色身份卡。' },
  { n: '02', title: '邀请 ta 一起测', desc: '生成专属配对链接，ta 完成 12 题后解锁你们的关系类型。' },
  { n: '03', title: '帮 ta 答题（他评）', desc: '收到邀请后以观察者视角作答，鉴定你们之间的关系。' },
];

const EXPLORE = [
  { href: '/cpti/gallery/', label: '我的关系图鉴', desc: '25 种 CP 关系图鉴，每多测一个人就多解锁一格。' },
  { href: '/cpti/leaderboard/', label: '关系排行榜', desc: '看看谁是当周收集最多关系类型的玩家。' },
  { href: '/cpti/join/', label: '输入配对码', desc: '用 ta 发来的六位码加入配对，解锁新的关系。' },
  { href: '/cpti/theory/', label: '维度白皮书', desc: '5 个维度怎么算出 25 种关系？看一眼就懂。' },
  { href: '/cpti/scenarios/lover/', label: '情侣 CP 测试', desc: '你和对象是灵魂伴侣还是相爱相杀？' },
  { href: '/cpti/scenarios/bestie/', label: '闺蜜浓度测试', desc: '塑料姐妹 / 双子星 / 怪咖联盟，你们是哪一种？' },
  { href: '/cpti/scenarios/family/', label: '家人关系测试', desc: '和妈、和爸、和兄弟姐妹，到底是哪一种关系？' },
  { href: '/cpti/scenarios/work/', label: '同事关系测试', desc: '战略同盟、狱友、塑料死敌，打工人必测。' },
  { href: '/cpti/scenarios/enemy/', label: '死对头测试', desc: '相爱相杀、欢喜冤家、桃园结义到底是哪一种？' },
];

export default function CptiHomeContent() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-28 pb-16 sm:pb-24">
          <div className="animate-fade-up">
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue · CPTI</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">Couple Personality Type Indicator</span>
            </div>

            <h1 className="mb-8 leading-[0.95]">
              <span className="brand-wtf block text-[26vw] sm:text-[12rem] md:text-[14rem]" style={{ color: 'var(--color-rose-deep)' }}>
                CP<span className="brand-ti text-[18vw] sm:text-[8rem] md:text-[9rem] ml-2" style={{ color: 'var(--color-ink)' }}>ti</span>
              </span>
            </h1>

            <div className="max-w-2xl">
              <p className="editorial-display text-3xl sm:text-5xl md:text-6xl mb-6">
                你和 ta
                <br />
                <span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>是什么关系？</span>
              </p>
              <hr className="editorial-rule w-24 mb-6" />
              <p className="text-base sm:text-lg leading-[1.8] text-text-secondary max-w-xl">
                情侣 · 闺蜜 · 妈 · 同事 · 死对头 —— 任何一段关系都能测。
                <br className="hidden sm:block" />
                5 个关系维度 · 16 种角色 · 25 种关系类型。3 分钟一对，集齐图鉴。
              </p>
            </div>

            <div className="mt-10 sm:mt-14 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/cpti/test/" prefetch={false} className="btn btn-rose">
                开始测试 <span className="opacity-70">→</span>
              </Link>
              <Link href="/cpti/join/" prefetch={false} className="btn btn-ghost">
                输入配对码
              </Link>
              <Link href="/" prefetch={false} className="eyebrow ml-1 hover:text-text-primary transition-colors">
                ← 返回 WTFti
              </Link>
            </div>

            {/* Scenario quick-jump chips (Sprint 2 polish, 2026-04-19) */}
            <div className="mt-8 sm:mt-10">
              <div className="eyebrow mb-3">和谁测？</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: '/cpti/scenarios/lover/', label: '👫 对象 / 暧昧' },
                  { href: '/cpti/scenarios/bestie/', label: '👯 闺蜜 / 死党' },
                  { href: '/cpti/scenarios/family/', label: '👨\u200d👩\u200d👧 家人' },
                  { href: '/cpti/scenarios/work/', label: '💼 同事 / 队友' },
                  { href: '/cpti/scenarios/enemy/', label: '⚔️ 死对头' },
                ].map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    prefetch={false}
                    className="px-4 py-2 rounded-full text-sm border border-border-subtle bg-bg-secondary/40 text-text-secondary hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <hr className="editorial-rule-soft max-w-5xl mx-6 sm:mx-auto" />
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section className="px-6 sm:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4" style={{ borderBottom: '1px solid var(--color-rule-soft)' }}>
          {[
            { value: '5', label: '关系维度' },
            { value: '16', label: 'CP 角色' },
            { value: '25', label: '关系类型' },
            { value: '3 min', label: '完成测试' },
          ].map((stat, idx) => (
            <div key={stat.label} className="py-8 sm:py-10 text-center" style={{ borderLeft: idx > 0 ? '1px solid var(--color-rule-soft)' : 'none' }}>
              <div className="stat-value text-3xl sm:text-5xl text-text-primary leading-none">{stat.value}</div>
              <div className="eyebrow mt-3">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compare ─────────────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">02</span>
            <span className="eyebrow">What is CPTI</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              它和别的测试，<br className="sm:hidden" />
              <span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>不一样在哪</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {[
              { tag: 'MBTI / SBTI', body: '测你是什么人' },
              { tag: 'XPTI', body: '测你爱什么人' },
              { tag: 'LPTI', body: '测你的恋爱性格' },
              { tag: 'CPTI', body: '测你在关系里的角色', highlight: true },
            ].map((item, i) => (
              <div key={item.tag} className="p-6 sm:p-8 relative" style={{ background: item.highlight ? 'linear-gradient(180deg, var(--color-paper-warm) 0%, var(--color-bg-elevated) 100%)' : 'var(--color-bg-elevated)' }}>
                <span className="serial-number text-xs block mb-6">N°0{i + 1}</span>
                <span className="eyebrow block mb-3" style={{ color: item.highlight ? 'var(--color-rose-deep)' : undefined }}>
                  {item.tag}{item.highlight && <span className="ml-2">✦ New</span>}
                </span>
                <p className="text-base sm:text-lg leading-snug" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modes ──────────────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">03</span>
            <span className="eyebrow">Three modes</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">三种玩法</h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              单测、合测、他评——同一份维度模型，三种叙事角度。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {MODES.map((m, i) => (
              <div key={m.title} className="p-7 sm:p-10 animate-fade-up" style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 60}ms` }}>
                <span className="serial-number text-xs block mb-8" style={{ color: 'var(--color-rose-deep)' }}>N°{m.n}</span>
                <h3 className="text-xl sm:text-2xl text-text-primary mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {m.title}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{m.desc}</p>
                <span className="block mt-8 h-px w-10" style={{ background: 'var(--color-rose-deep)', opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 Dimensions ──────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">04</span>
            <span className="eyebrow">Five dimensions</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              五个<span className="editorial-italic">关系切面</span>
            </h2>
          </div>

          <div className="grid gap-px" style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {MODELS.map((m, i) => {
              const color = CPTI_MODEL_COLORS[m.key];
              return (
                <div key={m.key} className="flex items-center gap-6 sm:gap-8 px-5 sm:px-8 py-6 sm:py-7 animate-fade-up" style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 60}ms` }}>
                  <span className="serial-number text-base sm:text-lg flex-shrink-0 w-10" style={{ color: color.base }}>0{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg leading-snug" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-ink)' }}>
                      {CPTI_MODEL_NAMES[m.key]}
                    </div>
                    <div className="text-xs sm:text-sm text-text-muted mt-1">{m.label}</div>
                  </div>
                  <span className="hidden sm:block h-px w-12 flex-shrink-0" style={{ background: color.base, opacity: 0.6 }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 16 Roles ────────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">05</span>
            <span className="eyebrow">Roles gallery</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              16 种 <span className="editorial-italic">CP 角色</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              每个角色都是一种关系叙事——你最像哪一个？
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {FEATURED.map((p, i) => (
              <Link key={p.slug} href={`/cpti/result/${p.slug}/`} prefetch={false} className="group block p-5 sm:p-7 transition-colors duration-500 animate-fade-up" style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between mb-6">
                  <span className="serial-number text-[10px]">N°{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono tracking-wider" style={{ color: p.color }}>{p.code}</span>
                </div>
                <div className="text-4xl sm:text-5xl mb-5 transition-transform duration-500 group-hover:scale-105 origin-left">{p.emoji}</div>
                <div className="text-base sm:text-lg leading-tight text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {p.name}
                </div>
                <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">{p.tagline}</p>
                <span className="block mt-5 h-px transition-all duration-500 group-hover:w-12" style={{ background: p.color, width: 8, opacity: 0.6 }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore ─────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">06</span>
            <span className="eyebrow">Explore</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">探索更多</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {EXPLORE.map((item, i) => (
              <Link key={item.href} href={item.href} prefetch={false} className="group p-7 sm:p-10 animate-fade-up transition-colors duration-500" style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 60}ms` }}>
                <span className="serial-number text-xs block mb-8">N°0{i + 1}</span>
                <h3 className="text-lg sm:text-xl mb-3 text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {item.label}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="h-px flex-1" style={{ background: 'var(--color-rose-deep)', opacity: 0.3 }} />
                  <span className="text-sm transition-transform duration-500 group-hover:translate-x-1" style={{ color: 'var(--color-rose-deep)' }}>进入 →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────── */}
      <section className="py-20 sm:py-32 px-6 sm:px-10 text-center" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-2xl mx-auto">
          <span className="serial-number text-xs mr-3">07</span>
          <span className="eyebrow">Ready</span>
          <h2 className="editorial-display text-3xl sm:text-5xl md:text-6xl mt-6 mb-4">
            准备好开测了吗？
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-10 leading-[1.8]">
            一份关于关系的图鉴，<br className="sm:hidden" />送给在意身边任何一段关系的你。
          </p>
          <hr className="editorial-rule w-16 mx-auto mb-10" />
          <Link href="/cpti/test/" prefetch={false} className="btn btn-rose">
            测测你和身边人是什么关系 <span className="opacity-70">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
