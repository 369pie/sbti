import Link from 'next/link';
import { getDailyCard, formatDateCN } from '@/lib/mysti/daily-card';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CosmicThemeBinder } from '@/components/wtfti/HomeCosmosThemeBinder';

// ═══════════════════════════════════════════════════════════════════════════════
// Home V6 · 编辑部索引（2026-08-16）
// 去 AI 味三原则：不对称、少装饰、说人话。
// 版式：不对称 hero（左字右球）→ 今日签窄条 → 杂志目录式六行索引 →
// 一句引言 → 左对齐收口。无玻璃卡阵列、无英文 eyebrow、无罗马数字、无胶囊。
// ═══════════════════════════════════════════════════════════════════════════════

function seededStars(count: number) {
  let h = 0x9e3779b9;
  const rand = () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    top: `${(rand() * 100).toFixed(2)}%`,
    left: `${(rand() * 100).toFixed(2)}%`,
    size: rand() > 0.88 ? 2.2 : rand() > 0.5 ? 1.5 : 1.1,
    tw: `${(2.8 + rand() * 4).toFixed(1)}s`,
    twd: `${(rand() * 4).toFixed(1)}s`,
  }));
}
const HERO_STARS = seededStars(40);

const SIX_VERBS = ['测人格', '测恋爱', '读文学', '看玄学', '养星灵', '交朋友'];

// ─── 目录：六件事，说人话（2026-08-16 大众化重定位裁决版）──────────────────
const INDEX: Array<{ num: string; title: string; desc: string; href: string; accent: string }> = [
  {
    num: '01',
    title: '测测你是啥',
    desc: '先玩最上头的疯TI——29 种梗人格，测完直接截图发疯。想认真点，还有 90 秒主测。',
    href: '/wtfti/feng/',
    accent: '#D4A59A',
  },
  {
    num: '02',
    title: '测测你们俩',
    desc: '有伴的测你们能走多远，单身的测你到底吃哪一套。',
    href: '/cpti/',
    accent: '#F0A8C0',
  },
  {
    num: '03',
    title: '抽象文学部',
    desc: '发疯文学、牛马语录、发圈文案——生成一段，抄走就发。',
    href: '/start/',
    accent: '#D4B889',
  },
  {
    num: '04',
    title: '今日运势',
    desc: '每天一张牌、一句签。不算命，就给今天一点心理暗示。',
    href: '/mysti/',
    accent: '#A88FE8',
  },
  {
    num: '05',
    title: '我的电子小宠',
    desc: '测完送你一只，每天来喂它星尘。它不会死，别怕。',
    href: '/today',
    accent: '#A8C4A0',
  },
  {
    num: '06',
    title: '漂流瓶 · 树洞',
    desc: '匿名扔个瓶子想说啥说啥，捞捞陌生人的心事，顺便交个朋友。',
    href: '/bottle',
    accent: '#C9B6FF',
  },
];

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export default async function HomeContentV2() {
  const authedRibbon = await renderAuthedRibbonIfSession();
  const card = getDailyCard(new Date());

  return (
    <div className="home-cosmos min-h-screen">
      {/* 暮紫主题：server 直出防闪白脚本 + 持锁 binder（锁防全局 provider 覆盖） */}
      <CosmicThemeBinder />

      {authedRibbon}

      <CosmosHero />

      <TodaySign cardName={card.arcanaNameCN} cardAction={card.action} />

      <IndexSection />

      <EchoSection />

      <FinalCtaSection />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO · 两栏网格（PC：左字右球可预期对齐；移动：小光球置顶 + 文字居中）
// ═══════════════════════════════════════════════════════════════════════════════

function CosmosHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:px-10 sm:pb-24 sm:pt-28 lg:px-20 lg:pb-28 lg:pt-32">
      {/* 星野（更暗淡，克制） */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {HERO_STARS.map((s, i) => (
          <span
            key={i}
            className="home-star"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, ['--tw' as string]: s.tw, ['--twd' as string]: s.twd, opacity: 0.8 }}
          />
        ))}
      </div>

      <div className="relative z-[1] mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-8">
        {/* 左：文字 */}
        <div>
          {/* 移动端小光球（PC 由右栏大球承担） */}
          <div aria-hidden className="mb-8 flex justify-center lg:hidden">
            <div className="relative" style={{ width: 150, height: 150 }}>
              <div className="home-orbit-spin absolute inset-0">
                <div
                  className="absolute inset-[14%] rounded-full border"
                  style={{ borderColor: 'rgba(201,166,118,.3)', transform: 'scaleX(1.16) rotate(-16deg)' }}
                />
              </div>
              <div
                className="home-orb-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ width: '52%', height: '52%' }}
              />
            </div>
          </div>

          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] lg:text-left" style={{ color: 'var(--color-gold-text)' }}>
            ✦ WTFTI
          </p>

          <h1 className="mb-7" style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontWeight: 500 }}>
            <span className="block leading-[1.14]" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', letterSpacing: '-0.015em', color: 'var(--color-text-primary)' }}>
              先测你是谁，
            </span>
            <span
              className="home-gold-wordmark block italic leading-[1.14]"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', letterSpacing: '-0.015em' }}
            >
              再看今天顺不顺。
            </span>
          </h1>

          <p className="mb-9 max-w-xl text-[14px] leading-[1.95]" style={{ color: 'var(--color-text-secondary)' }}>
            你可以
            <span className="home-verb-stack mx-1" style={{ color: 'var(--color-gold-soft)', fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontStyle: 'italic', fontSize: '1.15em' }}>
              {SIX_VERBS.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </span>
            ——六件事，都是为 18–32 岁的你准备的。
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/start/" prefetch={false} className="wtfti-cta-primary">
              开始 90 秒人格测试
              <ArrowIcon />
            </Link>
            <a
              href="#index"
              className="text-sm tracking-[0.06em] underline-offset-8 transition-colors hover:underline"
              style={{ color: 'var(--color-gold-soft)' }}
            >
              或者，先看看都能干嘛
            </a>
          </div>
        </div>

        {/* 右：光球视觉柱（PC 专属；占满右栏，自带手绘标注） */}
        <div aria-hidden className="relative hidden justify-center lg:flex">
          <div className="relative" style={{ width: 'min(30vw, 460px)', height: 'min(30vw, 460px)' }}>
            <div className="home-orbit-spin absolute inset-0">
              <div
                className="absolute inset-[15%] rounded-full border"
                style={{ borderColor: 'rgba(201,166,118,.3)', transform: 'scaleX(1.16) rotate(-16deg)' }}
              />
            </div>
            <div className="home-orbit-spin-reverse absolute inset-0">
              <div
                className="absolute inset-[26%] rounded-full border"
                style={{ borderColor: 'rgba(192,122,142,.24)', transform: 'scaleX(1.28) rotate(22deg)' }}
              />
            </div>
            <div
              className="home-orb-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: '50%', height: '50%' }}
            />
          </div>

          {/* 手绘标注：贴在球柱右下，不再漂在版心 */}
          <div className="home-annot absolute -bottom-2 right-2" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="46" height="54" viewBox="0 0 54 64" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.7 }}>
              <path d="M50 6c-14 2-30 14-36 34" strokeLinecap="round" />
              <path d="M10 34l4 7 7-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-[11px] italic" style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif' }}>
              今天也在这里
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 今日签 · 窄条（活数据，直接当分隔用）
// ═══════════════════════════════════════════════════════════════════════════════

function TodaySign({ cardName, cardAction }: { cardName: string; cardAction: string }) {
  return (
    <section className="px-6 sm:px-10 lg:px-20">
      <Link
        href="/today"
        prefetch={false}
        className="group mx-auto flex max-w-6xl flex-col gap-1.5 border-y py-5 sm:flex-row sm:items-baseline sm:gap-6"
        style={{ borderColor: 'rgba(212,184,137,.16)' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] shrink-0" style={{ color: 'var(--color-sage-text)' }}>
          今日 · {formatDateCN(new Date())}
        </span>
        <span
          className="min-w-0 flex-1 text-[14.5px] italic"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {cardName} —— {cardAction}
        </span>
        <span
          className="shrink-0 text-[12.5px] italic transition-transform duration-500 group-hover:translate-x-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold-text)' }}
        >
          去打开 →
        </span>
      </Link>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 目录 · 六件事（杂志索引式大字排版）
// ═══════════════════════════════════════════════════════════════════════════════

function IndexSection() {
  return (
    <section id="index" className="scroll-mt-10 px-6 py-20 sm:px-10 sm:py-28 lg:px-20">
      <div className="mx-auto max-w-6xl">
        {INDEX.map((row) => (
          <Link
            key={row.num}
            href={row.href}
            prefetch={false}
            className="home-index-row"
            style={{ ['--row-accent' as string]: row.accent }}
          >
            <span className="home-index-num">{row.num}</span>
            <span>
              <span className="home-index-title">{row.title}</span>
              <span className="home-index-desc block">{row.desc}</span>
            </span>
            <span className="home-index-arrow text-lg">→</span>
          </Link>
        ))}

        <p className="mt-8 text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
          还有 17 个风格宇宙塞在{' '}
          <Link href="/start/" prefetch={false} className="underline underline-offset-4" style={{ color: 'var(--color-gold-text)' }}>
            人设图鉴
          </Link>{' '}
          里，闲了去逛。
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 一句引言（无卡片，纯文字 + 短线）
// ═══════════════════════════════════════════════════════════════════════════════

function EchoSection() {
  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
      <figure className="mx-auto max-w-3xl text-center">
        <span aria-hidden className="mb-6 inline-block h-px w-10" style={{ background: 'var(--color-gold-text)', opacity: 0.6 }} />
        <blockquote
          className="text-[17px] leading-[1.8]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--color-text-primary)' }}
        >
          “给自己买了张演唱会门票，突然觉得我值得。”
        </blockquote>
        <figcaption className="mt-4 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          树洞里，一位匿名用户 · 本周
        </figcaption>
        <Link
          href="/bottle/"
          prefetch={false}
          className="mt-6 inline-block text-[13px] italic underline underline-offset-8"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-violet-text)' }}
        >
          我也去说一句
        </Link>
      </figure>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 收口 · 左对齐，一句话
// ═══════════════════════════════════════════════════════════════════════════════

function FinalCtaSection() {
  return (
    <section className="px-6 pb-24 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="border-t pt-14" style={{ borderColor: 'rgba(212,184,137,.16)' }}>
          <h2
            className="mb-4"
            style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontWeight: 500, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}
          >
            90 秒，<em className="home-gold-wordmark italic">测完再说。</em>
          </h2>
          <p className="mb-8 text-[13.5px]" style={{ color: 'var(--color-text-secondary)' }}>
            测完有一份你的说明书、一只电子小宠、一颗时间胶囊——和一个每天回来的理由。
          </p>
          <Link href="/start/" prefetch={false} className="wtfti-cta-primary">
            去测
            <ArrowIcon />
          </Link>
          <p className="mt-16 text-[11px] italic" style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', color: 'var(--color-text-muted)' }}>
            — WTFTI 编辑部，一群自己也天天测的人
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Authed ribbon
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

async function renderAuthedRibbonIfSession() {
  let userEmail: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    userEmail = data.user.email ?? null;
  } catch {
    return null;
  }

  const blocks = [
    { title: '最近的我', cta: '回看结果 →', href: '/me/', accent: 'var(--color-rose-text)' },
    { title: '今日', cta: '打开 →', href: '/today', accent: 'var(--color-sage-text)' },
    { title: '待拆的信', cta: '去信箱 →', href: '/wtfti/letters/', accent: 'var(--color-gold-text)' },
    { title: '树洞', cta: '去听听 →', href: '/bottle/', accent: 'var(--color-violet-text)' },
  ] as const;

  return (
    <section aria-label="Authed ribbon" className="px-6 pb-3 pt-6 sm:px-10 lg:px-20" style={{ background: 'rgba(35,26,61,.5)', borderBottom: '1px solid rgba(212,184,137,.14)' }}>
      <div className="mx-auto max-w-6xl">
        <p
          className="mb-3 font-mono text-[10px] uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {userEmail ? `WELCOME · ${userEmail}` : 'WELCOME BACK'}
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {blocks.map((b) => (
            <Link key={b.title} href={b.href} prefetch={false} className="group flex items-baseline gap-2">
              <span className="text-[15px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                {b.title}
              </span>
              <span
                className="text-[11px] italic transition-transform duration-300 group-hover:translate-x-0.5"
                style={{ fontFamily: 'var(--font-display)', color: b.accent }}
              >
                {b.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
