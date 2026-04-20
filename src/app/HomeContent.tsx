import Link from 'next/link';
import NextImage from 'next/image';
import { getLiveUniverses } from '@/lib/universes';
import { withBasePath } from '@/lib/site';
import { FollowMeCard, FollowMeFloating } from '@/components/FollowMeLinks';
import type { MystiSku } from '@/lib/mysti/unlock';

// ─── Data ────────────────────────────────────────────────────────────────────

/**
 * 6-universe magazine grid — the single "What's Inside" surface that anchors
 * pricing and routes each visitor into a deep funnel. Order = strategic
 * priority: WTFTI / SoulTI flagships first, then relationships, then Mysti
 * (subscription) and WTFCard (collector).
 */
const UNIVERSE_GRID: Array<{
  href: string;
  numeral: string;
  eyebrow: string;
  title: string;
  italic: string;
  desc: string;
  free: string;
  sku: MystiSku;
  accent: string;
}> = [
  {
    href: '/wtfti/',
    numeral: 'I',
    eyebrow: 'WTFTI · Pantheon',
    title: '人格神域',
    italic: '召唤你的主神',
    desc: '主神 × 神侍三位 × 暗面副形 × 月相日课 × 五感档案。一份只属于你的神祇身份。',
    free: '免费 90 秒召唤',
    sku: 'wtfti-deep-pantheon',
    accent: '#C07A8E',
  },
  {
    href: '/soulti/',
    numeral: 'II',
    eyebrow: 'SOULTI · Mirror',
    title: '灵魂镜像',
    italic: '安静地看见自己',
    desc: '九轴交叉 × 修复处方 × 写给你的灵魂长信。这一面镜子很轻，但很狠。',
    free: '免费完整测试',
    sku: 'soulti-deep-mirror',
    accent: '#8B7AD9',
  },
  {
    href: '/cpti/',
    numeral: 'III',
    eyebrow: 'CPTI · Together',
    title: '关系深测',
    italic: '你们是什么型？',
    desc: '24 题双人 × 8 维关系雷达 × 30 条共修建议 × 12 个月主题。',
    free: '免费 24 题双人测',
    sku: 'cpti-deep-relationship',
    accent: '#B85A78',
  },
  {
    href: '/xpti/',
    numeral: 'IV',
    eyebrow: 'XPTI · Intimacy',
    title: '恋爱 XP',
    italic: '你的偏好与雷区',
    desc: 'XP 雷达 × 6 类亲密配对推荐 × 8 个雷区清单 × 24 个对话开场白。',
    free: '免费 XP 测试',
    sku: 'xpti-deep-xp',
    accent: '#A855F7',
  },
  {
    href: '/mysti/',
    numeral: 'V',
    eyebrow: 'MYSTI · Daily',
    title: '灵鉴 Mysti',
    italic: '每日抽牌 · 长期陪伴',
    desc: '塔罗 × 人格牌 × 灵魂信。订阅制陪伴你看见每一天的小预兆。',
    free: '每日免费抽牌',
    sku: 'monthly-pass',
    accent: '#9C7CFF',
  },
  {
    href: '/card/',
    numeral: 'VI',
    eyebrow: 'WTFCARD · Archive',
    title: '多宇宙档案',
    italic: '你的人格收藏册',
    desc: '把所有测过的宇宙合并为一张可下载的典藏档案。集邮 / 印刷级 PDF / 1080×1920 壁纸。',
    free: '免费集邮',
    sku: 'wtfcard-collector',
    accent: '#C9A676',
  },
];

/** Style universes (auto-generated from live universes) */
const STYLE_UNIVERSES = getLiveUniverses()
  .filter(u => !['cpti', 'xpti', 'soulti', 'wtfti', 'mysti'].includes(u.id) && !u.isUgc);

/** Relationship / social play — shrunk to 3 marquee cards */
const RELATIONSHIP_PLAYS = [
  { href: '/cp/', emoji: '💗', label: 'CP 配对', desc: '快速匹配默契度' },
  { href: '/identify/', emoji: '🔍', label: '好友鉴定', desc: '帮朋友做一份人格鉴定书' },
  { href: '/squad/', emoji: '🎯', label: '组局测试', desc: '拉群一起测' },
];

const FAQS = [
  {
    question: 'WTFTI 是什么？',
    answer:
      'WTFTI 是一个多宇宙人格测试平台。同一个你，在不同主题宇宙里有不同的人格翻译——毒舌版的你、灵魂版的你、关系版的你、收藏版的你。',
  },
  {
    question: '和 MBTI 有什么区别？',
    answer:
      'MBTI 更像经典人格框架，WTFTI 更贴近中文互联网语境。你看到的是生活反应和关系状态，不是四个字母和理论模型。',
  },
  {
    question: '这么多宇宙，从哪个开始？',
    answer:
      '先从 WTFTI 人格神域开始：90 秒召唤主神，拿到你的主星与神龛，再去 SoulTI、CPTI、XPTI 看同一个你在不同主题里的翻译。',
  },
  {
    question: '付费内容是什么？为什么不全部订阅？',
    answer:
      '六大宇宙的核心测试和结果页全部免费。如果想读到「深度档案」（深档主神三联档 / 灵魂长信 / 关系雷达 / XP 雷达），可以单次解锁 ¥3.9–9.9；想长期陪伴和每日抽牌再考虑 Mysti 月度通行证 ¥19/月。',
  },
  {
    question: '结果能拿来做严肃诊断吗？',
    answer:
      '不能。WTFTI 的核心是娱乐和自我观察，适合截图发给朋友一起笑，不适合替代专业心理评估。',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeContent() {
  const universes = getLiveUniverses();

  return (
    <div className="min-h-screen">

      {/* ── Hero — Editorial magazine cover ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24 sm:pb-32 relative">
          <div>
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
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-4">
            <Link href="/wtfti/galaxy/test/" prefetch={false} className="btn btn-ink">
              ✦ 召唤你的主神
              <span className="opacity-60">→</span>
            </Link>
            <Link href="/wtfti/" prefetch={false} className="btn btn-ghost">
              人格神域首页
            </Link>
            <span className="eyebrow ml-2 hidden sm:inline">
              {universes.length} 个宇宙 · 100+ 种人格
            </span>
          </div>
          {/* 经典初见兜底链接 — 低承诺用户分流 */}
          <p className="mt-4 text-xs text-text-muted">
            不想进神域？
            <Link href="/test/" prefetch={false} className="underline underline-offset-2 hover:text-text-secondary transition-colors ml-1">
              经典初见版（文字版 · 3-5 分钟）→
            </Link>
          </p>
        </div>

        <hr className="editorial-rule-soft max-w-5xl mx-6 sm:mx-auto" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°02 What's Inside · 6 大宇宙 magazine grid
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <span className="serial-number text-xs mr-3">02</span>
              <span className="eyebrow">What&apos;s Inside</span>
              <h2 className="section-headline text-3xl sm:text-4xl mt-3">
                六大<span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>宇宙</span>
              </h2>
              <p className="display-tagline text-text-secondary mt-3 text-base max-w-xl">
                每个宇宙都能先免费体验核心测试与结果，再按你喜欢的方向慢慢深入。
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}
          >
            {UNIVERSE_GRID.map((u) => (
              <Link
                key={u.href}
                href={u.href}
                prefetch={false}
                className="group relative block p-7 sm:p-9 transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-bg-elevated)' }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <span className="serial-number text-xs" style={{ color: u.accent }}>
                    N°{u.numeral.padStart(3, '0')}
                  </span>
                  <span className="eyebrow text-[10px]" style={{ color: u.accent, opacity: 0.85 }}>
                    {u.eyebrow}
                  </span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl text-text-primary leading-[1.1] mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}
                >
                  {u.title}
                </h3>
                <p
                  className="text-base mb-5"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    color: u.accent,
                  }}
                >
                  {u.italic}
                </p>

                <p className="text-[13.5px] text-text-secondary leading-[1.85] mb-6">
                  {u.desc}
                </p>

                <p
                  className="text-[11px] tracking-wider"
                  style={{ fontFamily: 'var(--font-display)', color: '#7A6A5A' }}
                >
                  {u.free}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <span
                    className="h-px flex-1 transition-all duration-500 group-hover:opacity-100"
                    style={{ background: u.accent, opacity: 0.25 }}
                  />
                  <span
                    className="text-sm transition-transform duration-500 group-hover:translate-x-1"
                    style={{ color: u.accent }}
                  >
                    走进 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <span className="eyebrow text-text-muted">
              本期统计 · {universes.length} 个测试宇宙 · 100+ 种人格
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°03 Together · 关系玩法（精选 3 张）
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="serial-number text-xs mr-3">03</span>
            <span className="eyebrow">Together</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              和朋友<span className="editorial-italic">一起玩</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              测完自己，拉上朋友——看看你们之间发生了什么化学反应。
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}
          >
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

      {/* ══════════════════════════════════════════════════════════════════════
          N°04 Style universes（缩到 1 行 grid）
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
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

          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px"
            style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}
          >
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

          <div className="mt-8 text-center">
            <Link href="/types/" prefetch={false} className="text-sm text-text-secondary hover:text-text-primary transition-colors underline-offset-2 hover:underline">
              查看完整人设图鉴 →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°05 Creator program
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-10 sm:p-16" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
            <div className="flex items-center gap-4 mb-8">
              <span className="serial-number text-xs">05</span>
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

      {/* ══════════════════════════════════════════════════════════════════════
          N°06 FAQ
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="serial-number text-xs mr-3">06</span>
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

      {/* ══════════════════════════════════════════════════════════════════════
          N°07 Community + Bottom CTA（合并）
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="serial-number text-xs mr-3">07</span>
            <span className="eyebrow">Community</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              加入 <span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>WTFTI</span> 社群
            </h2>
            <p className="display-tagline text-text-secondary mt-3 text-base">
              测完想找同类？来群里一起玩；想从头开始？下方一键召唤主神。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center hover:shadow-md transition-shadow animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[#07C160]">💬</span>
                <span className="font-medium text-text-primary">微信群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block">
                <NextImage
                  src={withBasePath('/images/qr-wechat.png')}
                  alt="WTFTI 微信交流群二维码"
                  width={200}
                  height={200}
                  sizes="192px"
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
                <NextImage
                  src={withBasePath('/images/qr-qq.png')}
                  alt="WTFTI QQ 交流群二维码"
                  width={200}
                  height={200}
                  sizes="192px"
                  fetchPriority="low"
                  className="block w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-text-muted mt-4">WTFTI QQ 交流群</p>
            </div>
          </div>

          {/* Bottom CTA — folded into community footer */}
          <div className="text-center pt-6" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
            <span className="eyebrow block mb-4">首选路径</span>
            <h3 className="section-headline text-2xl sm:text-3xl mb-4">
              从召唤主神开始<span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>最对味</span>
            </h3>
            <p className="display-tagline text-text-secondary mb-8 text-base max-w-md mx-auto">
              90 秒仪式 · 拿到主星与神龛 · 之后再慢慢解锁五感、月相、合奏。
            </p>
            <Link
              href="/wtfti/galaxy/test/"
              prefetch={false}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #C9A676, #C07A8E)',
                boxShadow: '0 8px 32px rgba(192,122,142,0.28)',
              }}
            >
              ✦ 召唤主神 →
            </Link>
            <p className="mt-5 text-xs text-text-muted">
              想先快速预览人格轮廓？
              <Link href="/test/" prefetch={false} className="underline underline-offset-2 hover:text-text-secondary transition-colors ml-1">
                经典初见版（文字版，3-5 分钟）→
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-16">
          <FollowMeCard />
        </div>
      </section>

      <FollowMeFloating />
    </div>
  );
}
