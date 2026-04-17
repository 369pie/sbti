import Link from 'next/link';
import NextImage from 'next/image';
import { PERSONALITY_TYPES, getTypeThumbnailImage } from '@/lib/personalities';
import { getLiveUniverses } from '@/lib/universes';
import { withBasePath } from '@/lib/site';
import { FollowMeCard, FollowMeFloating } from '@/components/FollowMeLinks';
import { WtfCardBanner } from '@/components/WtfCardBanner';

// ─── Intent-based data (mirrors Navigation.tsx categories) ───────────────────

/** Hero quick-action cards — 4 core intents */
const HERO_INTENTS = [
  { href: '/test/', emoji: '🎯', label: '去测自己', desc: '选一个宇宙开始', accent: '#ff4d6d' },
  { href: '/cpti/', emoji: '💕', label: '测段关系', desc: '你们的化学反应', accent: '#e06088' },
  { href: '/identify/', emoji: '🔍', label: '鉴定 TA', desc: '偷偷测 ta 是什么人', accent: '#a855f7' },
  { href: '/card/', emoji: '🃏', label: '我的档案', desc: '多宇宙人格卡', accent: '#f59e0b' },
];

/** Hot-pick universes — curated selection */
const HOT_PICKS = [
  { href: '/wtfti/', label: 'WTF 毒舌版', emoji: '🤯', desc: '敢听真话吗？直接骂醒你', tag: '热门', accent: '#ff4d6d' },
  { href: '/soulti/', label: 'SoulTI 灵魂镜像', emoji: '🌙', desc: '安静地看见真正的自己', tag: '深度', accent: '#8b7ec8' },
  { href: '/xpti/', label: 'XPTI 恋爱XP', emoji: '💜', desc: '你的亲密偏好是什么？', tag: '热门', accent: '#7c3aed' },
  { href: '/cpti/', label: 'CPTI 关系深测', emoji: '💕', desc: '你们的关系是什么型？', tag: '新', accent: '#e06088' },
];

/** Style universes (auto-generated from live universes) */
const STYLE_UNIVERSES = getLiveUniverses()
  .filter(u => !['cpti', 'xpti', 'soulti', 'wtfti', 'mysti'].includes(u.id) && !u.isUgc);

/** UGC universes */
const UGC_CARDS = getLiveUniverses().filter(u => u.isUgc);

/** Relationship / social play */
const RELATIONSHIP_PLAYS = [
  { href: '/cpti/', emoji: '💕', label: 'CPTI 关系深测', desc: '24题 · 你们的关系是什么型？' },
  { href: '/cp/', emoji: '💗', label: 'CP 配对', desc: '快速匹配默契度' },
  { href: '/identify/', emoji: '🔍', label: '好友鉴定', desc: '帮朋友做一份人格鉴定书' },
  { href: '/puzzle/', emoji: '🧩', label: '闺蜜拼图', desc: '4人组合人格画' },
  { href: '/squad/', emoji: '🎯', label: '组局测试', desc: '拉群一起测' },
  { href: '/rank/', emoji: '🏆', label: '群组排行', desc: '看看谁人格最多' },
];

/** Casual / quick tests */
const CASUAL_TESTS = [
  { href: '/daily/', emoji: '🎲', label: '今日模式', desc: '6题秒测今天状态' },
  { href: '/gacha/', emoji: '🎴', label: '今日抽签', desc: '每天一抽 · S/A/B/C' },
  { href: '/drunk/', emoji: '🍺', label: '酒后人设', desc: '喝多了你是谁？' },
  { href: '/work/', emoji: '💼', label: '打工人设', desc: '你的职场角色' },
  { href: '/love/', emoji: '💗', label: '恋爱人设', desc: '你的恋爱角色' },
];

/** Explore / collect */
const EXPLORE_ITEMS = [
  { href: '/mysti/', emoji: '🔮', label: '灵鉴 Mysti', desc: '塔罗 × 人格牌' },
  { href: '/combo/', emoji: '🧩', label: '人格拼盘', desc: 'SBTI × MBTI × 星座' },
  { href: '/share-templates/', emoji: '📕', label: '小红书文案', desc: '一键复制发小红书' },
  { href: '/types/', emoji: '📖', label: '人设图鉴', desc: '全部人格类型一览' },
];

const FAQS = [
  {
    question: 'WTFTI 是什么？',
    answer:
      'WTFTI 是一个多宇宙人格测试平台。同一个你，在不同主题宇宙里有不同的人格翻译——毒舌版的你、灵魂版的你、鸟类版的你、花朵版的你。',
  },
  {
    question: '和 MBTI 有什么区别？',
    answer:
      'MBTI 更像经典人格框架，WTFTI 更贴近中文互联网语境。你看到的是生活反应和关系状态，不是四个字母和理论模型。',
  },
  {
    question: '这么多宇宙，从哪个开始？',
    answer:
      '想被骂醒选毒舌版，想安静认识自己选 SoulTI，想测关系选 CPTI，想随便玩玩选今日模式。',
  },
  {
    question: '结果能拿来做严肃诊断吗？',
    answer:
      '不能。WTFTI 的核心是娱乐和自我观察，适合截图发给朋友一起笑，不适合替代专业心理评估。',
  },
];

const FEATURED = PERSONALITY_TYPES.slice(0, 6);

export default function HomeContent() {
  const universes = getLiveUniverses();

  return (
    <div className="min-h-screen">

      {/* ── Hero — Editorial magazine cover ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24 sm:pb-32 relative">
          <div className="animate-fade-up">
            {/* Issue marker */}
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue 01</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">What&apos;s The F* Type Inside</span>
            </div>

            {/* Big brand mark */}
            <h1 className="mb-8 leading-[0.95]">
              <span className="brand-wtf block text-[22vw] sm:text-[14rem] md:text-[16rem]" style={{ color: 'var(--color-rose)' }}>
                WTF<span className="brand-ti text-[14vw] sm:text-[9rem] md:text-[10rem] ml-2" style={{ color: 'var(--color-ink)' }}>ti</span>
              </span>
            </h1>

            {/* Serif subline */}
            <div className="max-w-2xl">
              <p className="editorial-display text-3xl sm:text-5xl md:text-6xl mb-6">
                我居然<span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>是这种人？</span>
              </p>
              <hr className="editorial-rule w-24 mb-6" />
              <p className="text-base sm:text-lg leading-[1.8] text-text-secondary max-w-xl">
                一份写给当代女性的人格图鉴。<br className="hidden sm:block" />
                同一个你，在不同宇宙里，被翻译成完全不同的样子。
              </p>
            </div>
          </div>

          {/* Primary CTA row */}
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-4 animate-fade-up-delay-1">
            <Link href="/test/" prefetch={false} className="btn btn-ink">
              开始测试
              <span className="opacity-60">→</span>
            </Link>
            <Link href="/types/" prefetch={false} className="btn btn-ghost">
              先翻翻图鉴
            </Link>
            <span className="eyebrow ml-2 hidden sm:inline">
              {universes.length} 个宇宙 · 100+ 种人格
            </span>
          </div>
        </div>

        {/* Horizontal rule to separate hero */}
        <hr className="editorial-rule-soft max-w-5xl mx-6 sm:mx-auto" />
      </section>

      {/* ── Intent grid — "你想做什么？" ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-12 animate-fade-up">
            <div>
              <span className="serial-number text-xs mr-3">02</span>
              <span className="eyebrow">Where to start</span>
              <h2 className="section-headline text-3xl sm:text-4xl mt-3">
                你今天想做什么？
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule-soft border border-rule-soft" style={{ backgroundColor: 'var(--color-rule-soft)', borderColor: 'var(--color-rule-soft)' }}>
            {HERO_INTENTS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group relative block p-6 sm:p-8 transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-bg-elevated)', animationDelay: `${i * 60}ms` }}
              >
                <span className="serial-number text-xs block mb-8">
                  0{i + 1}
                </span>
                <div className="text-4xl mb-6 transition-transform duration-500 group-hover:scale-110 origin-left">{item.emoji}</div>
                <h3 className="font-display text-xl text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {item.label}
                </h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
                <span
                  className="absolute left-6 sm:left-8 bottom-4 h-px w-8 transition-all duration-500 group-hover:w-16"
                  style={{ background: item.accent, opacity: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 animate-fade-up-delay-2" style={{ borderTop: '1px solid var(--color-rule-soft)', borderBottom: '1px solid var(--color-rule-soft)' }}>
            {[
              { value: `${universes.length}`, label: '测试宇宙' },
              { value: '100+', label: '种人格' },
              { value: '10+', label: '社交玩法' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="py-8 text-center"
                style={{ borderLeft: idx > 0 ? '1px solid var(--color-rule-soft)' : 'none' }}
              >
                <div className="stat-value text-4xl sm:text-5xl text-text-primary leading-none">{stat.value}</div>
                <div className="eyebrow mt-3">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hot Picks — 推荐测试 ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-up flex items-baseline justify-between">
            <div>
              <span className="serial-number text-xs mr-3">03</span>
              <span className="eyebrow">Editor&apos;s picks</span>
              <h2 className="section-headline text-3xl sm:text-4xl mt-3">
                不知道从哪开始，<br className="sm:hidden" />
                <span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>先试这几个</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {HOT_PICKS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group relative block p-7 sm:p-10 transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-bg-elevated)', animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <span className="serial-number text-xs">N°{String(i + 1).padStart(2, '0')}</span>
                  {item.tag && (
                    <span
                      className="eyebrow"
                      style={{ color: item.accent }}
                    >
                      — {item.tag}
                    </span>
                  )}
                </div>
                <div className="text-5xl mb-8">{item.emoji}</div>
                <h3 className="text-2xl sm:text-3xl mb-3 text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                  {item.label}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md">{item.desc}</p>
                <div className="mt-8 flex items-center gap-3">
                  <span
                    className="h-px flex-1 transition-all duration-500 group-hover:opacity-100"
                    style={{ background: item.accent, opacity: 0.25 }}
                  />
                  <span className="text-sm transition-transform duration-500 group-hover:translate-x-1" style={{ color: item.accent }}>
                    开始 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Universe Hub — 按风格浏览 ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="serial-number text-xs mr-3">04</span>
            <span className="eyebrow">Style universes</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              选一个<span className="editorial-italic">风格宇宙</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              每个宇宙有独立的视觉、题目和人格翻译——像走进不同的美术馆展厅。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {STYLE_UNIVERSES.map((u, i) => (
              <Link
                key={u.id}
                href={u.landingPath}
                prefetch={false}
                className="animate-fade-up group relative block p-6 sm:p-8 transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-bg-elevated)', animationDelay: `${i * 50}ms` }}
              >
                <span className="serial-number text-[10px] absolute top-3 right-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="inline-flex items-center justify-center w-12 h-12 text-2xl mb-6 transition-transform duration-500 group-hover:scale-110 origin-left"
                  style={{ background: `${u.accent}10`, borderRadius: 'var(--radius-soft)' }}
                >
                  {u.emoji || '🧪'}
                </span>
                <h3 className="text-base text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {u.name}
                </h3>
                <span
                  className="mt-6 block h-px w-8 transition-all duration-500 group-hover:w-16"
                  style={{ background: u.accent, opacity: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* UGC Universes */}
          {UGC_CARDS.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-4 mb-6">
                <span className="editorial-mark" style={{ color: 'var(--color-gold)' }}>✦</span>
                <h3 className="eyebrow" style={{ color: 'var(--color-gold)' }}>Creator editions</h3>
                <span className="editorial-rule flex-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {UGC_CARDS.map((u) => (
                  <Link
                    key={u.id}
                    href={u.landingPath}
                    prefetch={false}
                    className="card-editorial group block p-6 text-left"
                    style={{ borderStyle: 'dashed' }}
                  >
                    <span className="text-2xl mb-3 block">{u.emoji || '🧪'}</span>
                    <h3 className="text-sm text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      {u.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── WTF Card Banner ── */}
      <WtfCardBanner />

      {/* ── Relationship Plays — 测关系 ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="serial-number text-xs mr-3">05</span>
            <span className="eyebrow">Together</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              和朋友<span className="editorial-italic">一起玩</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              测完自己，拉上朋友——看看你们之间发生了什么化学反应。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {RELATIONSHIP_PLAYS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group relative block p-6 sm:p-8 transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-bg-elevated)', animationDelay: `${i * 50}ms` }}
              >
                <span className="serial-number text-[10px] absolute top-3 right-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="text-3xl mb-5 transition-transform duration-500 group-hover:scale-110 origin-left">{item.emoji}</div>
                <h3 className="text-lg text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {item.label}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                <span
                  className="mt-4 block h-px w-6 transition-all duration-500 group-hover:w-12"
                  style={{ background: 'var(--color-rose)', opacity: 0.5 }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Casual + Explore — 合并为二栏 editorial 目录 ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div className="animate-fade-up">
            <span className="serial-number text-xs mr-3">06</span>
            <span className="eyebrow">Quick play</span>
            <h2 className="section-headline text-3xl mt-3 mb-8">
              轻松<span className="editorial-italic">一测</span>
            </h2>
            <ul className="space-y-px" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
              {CASUAL_TESTS.map((item) => (
                <li key={item.href} style={{ borderBottom: '1px solid var(--color-rule-soft)' }}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="group flex items-center gap-5 py-5 transition-colors duration-500"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-base text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                        {item.label}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-text-muted transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up-delay-1">
            <span className="serial-number text-xs mr-3">07</span>
            <span className="eyebrow">Explore</span>
            <h2 className="section-headline text-3xl mt-3 mb-8">
              发现<span className="editorial-italic">更多</span>
            </h2>
            <ul className="space-y-px" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
              {EXPLORE_ITEMS.map((item) => (
                <li key={item.href} style={{ borderBottom: '1px solid var(--color-rule-soft)' }}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="group flex items-center gap-5 py-5 transition-colors duration-500"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-base text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                        {item.label}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-text-muted transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Creator Program — editorial feature ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-10 sm:p-16" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
            <div className="flex items-center gap-4 mb-8">
              <span className="serial-number text-xs">08</span>
              <span className="editorial-rule w-16" />
              <span className="eyebrow" style={{ color: 'var(--color-gold)' }}>Creator beta</span>
            </div>
            <h2 className="editorial-display text-4xl sm:text-5xl md:text-6xl max-w-3xl mb-6">
              做你自己的<br />
              <span className="editorial-italic" style={{ color: 'var(--color-gold)' }}>人格宇宙</span>
            </h2>
            <p className="text-base sm:text-lg leading-[1.85] text-text-secondary max-w-xl">
              把你的内容做成可传播的人格测试。<br className="hidden sm:block" />
              免费主题拉新，付费主题变现。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/creator/" prefetch={false} className="btn btn-gold">
                查看创作者计划
                <span className="opacity-60">→</span>
              </Link>
              <Link href="/creator/apply/" prefetch={false} className="btn btn-ghost">
                申请内测
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Types — 图鉴墙 ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <span className="serial-number text-xs mr-3">09</span>
              <span className="eyebrow">The atlas</span>
              <h2 className="section-headline text-3xl sm:text-4xl mt-3">
                先翻几张<span className="editorial-italic">人设卡</span>
              </h2>
            </div>
            <Link href="/types/" prefetch={false} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              全部 27 种 →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
            {FEATURED.map((p, i) => (
              <Link
                key={p.slug}
                href={`/result/${p.slug}`}
                prefetch={false}
                className="group relative block transition-colors duration-500 overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-elevated)' }}
              >
                <span className="serial-number text-[10px] absolute top-4 left-5 z-10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div
                  className="relative w-full aspect-[4/5] flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(180deg, ${p.color}06, ${p.color}14)` }}
                >
                  <NextImage
                    src={getTypeThumbnailImage(p.slug)}
                    alt={p.name}
                    width={320}
                    height={320}
                    sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 280px"
                    className="w-[72%] h-[72%] object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
                  <span className="eyebrow block mb-2" style={{ color: p.color }}>
                    {p.code}
                  </span>
                  <h3 className="text-lg text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}>
                    {p.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — editorial Q&A ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="serial-number text-xs mr-3">10</span>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              常见<span className="editorial-italic">问题</span>
            </h2>
          </div>

          <div style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
            {FAQS.map((item, i) => (
              <article
                key={item.question}
                className="py-8"
                style={{ borderBottom: '1px solid var(--color-rule-soft)' }}
              >
                <div className="flex gap-6">
                  <span className="serial-number text-xs pt-1 shrink-0 w-8">Q{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <h3 className="text-lg text-text-primary mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                      {item.question}
                    </h3>
                    <p className="text-sm sm:text-base text-text-secondary leading-[1.85]">{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <span className="section-label block mb-2">Community</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              加入 WTFTI 社群
            </h2>
            <p className="display-tagline text-text-secondary mt-2 text-base">
              测完想找同类？来群里一起玩
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center hover:shadow-md transition-shadow animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[#07C160]">💬</span>
                <span className="font-medium text-text-primary">微信群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath('/images/qr-wechat.png')}
                  alt="WTFTI 微信交流群二维码"
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="block w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-text-muted mt-4">WTFTI 交流玩耍群</p>
            </div>

            <div
              className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[#12B7F5]">🐧</span>
                <span className="font-medium text-text-primary">QQ 群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath('/images/qr-qq.png')}
                  alt="WTFTI QQ 交流群二维码"
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="block w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-text-muted mt-4">WTFTI QQ 交流群</p>
            </div>
          </div>
        </div>
      </section>

      <FollowMeCard />

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="section-headline text-2xl sm:text-3xl mb-4">
            准备好了吗？
          </h2>
          <p className="display-tagline text-text-secondary mb-8">
            纯前端计算，不上传任何数据。测完直接看结果。
          </p>
          <Link
            href="/test/"
            prefetch={false}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #ff4d6d, #e06088)',
              boxShadow: '0 8px 32px rgba(255,77,109,0.2)',
            }}
          >
            开始经典测试 →
          </Link>
        </div>
      </section>

      <FollowMeFloating />
    </div>
  );
}

