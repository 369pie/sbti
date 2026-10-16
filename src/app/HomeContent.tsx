import Link from 'next/link';
import NextImage from 'next/image';
import { CoupleRadar } from '@/components/xpti/CoupleRadar';
import { withBasePath } from '@/lib/site';
import { FollowMeCard, FollowMeFloating } from '@/components/FollowMeLinks';
import { SKU_PRICES, type MystiSku } from '@/lib/mysti/unlock';

// ─── Data ────────────────────────────────────────────────────────────────────

/**
 * 6-universe magazine grid — the single "What's Inside" surface that anchors
 * pricing and routes each visitor into a deep funnel. Order = strategic
 * priority: WTFTI / SoulTI flagships first, then relationships, then Mysti
 * (subscription) and WTFCard (collector).
 */
/** XPTI 情侣关系报告价格 — 与 SKU_PRICES['xpti-couple-report'] 同源（src/lib/mysti/unlock.ts） */
const XPTI_COUPLE_REPORT_PRICE = SKU_PRICES['xpti-couple-report'].price;

/** Phase 0 首页收敛：只保留 3 个主入口 */
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
  accentDeep: string;
}> = [
  {
    href: '/mysti/daily/',
    numeral: 'I',
    eyebrow: 'MYSTI · Today',
    title: '今日一牌',
    italic: '听懂今天的自己',
    desc: '每天一张牌，给情绪一个名字。适合深夜打开，先安抚，再决定要不要深聊。',
    free: '每日免费抽牌',
    sku: 'monthly-pass',
    accent: 'var(--color-sage)',
    accentDeep: 'var(--color-gem)',
  },
  {
    href: '/cpti/',
    numeral: 'II',
    eyebrow: 'CPTI · Us',
    title: '我们合不合',
    italic: '把关系说清楚',
    desc: '双人关系深测：默契、冲突、修复建议。想懂一段关系时，从这里开始。',
    free: '免费 24 题双人测',
    sku: 'cpti-deep-relationship',
    accent: 'var(--color-gold)',
    accentDeep: 'var(--color-gold-leaf)',
  },
  {
    href: '/test/',
    numeral: 'III',
    eyebrow: 'CLASSIC · First Look',
    title: '经典测试',
    italic: '三分钟认识自己',
    desc: '低承诺的人格初见。测完再决定要不要走进今日一牌或关系合盘。',
    free: '免费文字版测试',
    sku: 'wtfti-deep-pantheon',
    accent: 'var(--color-rose)',
    accentDeep: 'var(--color-rose-deep)',
  },
];

/** Relationship / social play — shrunk to 3 marquee cards */
const RELATIONSHIP_PLAYS = [
  { href: '/xpti/', mark: 'XC', label: '关系沟通', desc: '测测你们怎么说话、怎么靠近' },
  { href: '/cpti/', mark: 'CP', label: '我们合不合', desc: '双人关系深测' },
  { href: '/soulti/', mark: 'SL', label: '灵魂长信', desc: '写给自己的一封长信' },
];

/** 首页 hero 关系报告预览用的示例数据（非真实用户） */
const PREVIEW_A = { archetype: { name: '你', slug: 'preview-a', color: 'var(--color-rose)' }, dims: [3, 2, 3, 1, 2, 3, 2, 1, 3] };
const PREVIEW_B = { archetype: { name: 'ta', slug: 'preview-b', color: 'var(--color-rose-deep)' }, dims: [1, 3, 2, 3, 2, 1, 3, 2, 2] };

const FAQS = [
  {
    question: 'WTFTI 是什么？',
    answer:
      'WTFTI 是写给女生的情绪陪伴站：每天一张牌帮你安顿情绪，关系报告帮你看懂你和 ta 怎么沟通、怎么靠近。',
  },
  {
    question: '和 MBTI 有什么区别？',
    answer:
      'MBTI 更像经典人格框架，WTFTI 更贴近中文互联网语境。你看到的是生活反应和关系状态，不是四个字母和理论模型。',
  },
  {
    question: '我该从哪个开始？',
    answer:
      '先抽「今日一牌」安顿情绪；想看关系就去「我们合不合」；只想快速认识自己，走「经典测试」。',
  },
  {
    question: '付费内容是什么？',
    answer:
      '核心体验先免费。想要更完整的情绪解读、关系合盘或灵魂长信，再按次解锁；需要每天陪伴可以考虑 Mysti 月卡。',
  },
  {
    question: '结果能拿来做严肃诊断吗？',
    answer:
      '不能。WTFTI 的核心是娱乐和自我观察，适合用来更了解自己和身边的人，不能替代专业心理评估。',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function CodeMark({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`site-code-mark h-11 w-11 ${className}`}>{children}</span>;
}

export default function HomeContent() {
  return (
    <div className="min-h-screen">

      {/* ── Hero — Editorial magazine cover ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid items-center gap-12 px-6 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-24 lg:grid-cols-[0.98fr_0.82fr] relative">
          <div className="relative z-[1]">
            {/* Issue marker */}
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue 01</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">What&apos;s The F* Type Inside</span>
            </div>

            {/* Big brand mark */}
            <h1 className="mb-8 leading-[0.95]">
              <span className="brand-wtf block text-[clamp(5rem,13vw,11.5rem)]" style={{ color: 'var(--color-rose)' }}>
                WTF<span className="brand-ti text-[0.62em] ml-2" style={{ color: 'var(--color-ink)' }}>ti</span>
              </span>
            </h1>

            {/* Serif subline */}
            <div className="max-w-2xl">
              <p className="editorial-display text-3xl sm:text-5xl md:text-6xl mb-6">
                我居然<span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>是这种人？</span>
              </p>
              <hr className="editorial-rule w-24 mb-6" />
              <p className="text-base sm:text-lg leading-[1.8] text-text-secondary max-w-xl">
                写给当代女性的情绪陪伴站。<br className="hidden sm:block" />
                先听懂今天的自己，再看清一段关系。
              </p>
            </div>

          {/* Primary CTA row — XPTI 情侣关系报告主推 */}
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-4">
            <Link href="/xpti/test/" prefetch={false} className="btn btn-ink">
              测测我们怎么沟通
              <ArrowIcon />
            </Link>
            <Link href="/mysti/daily/" prefetch={false} className="btn btn-ghost">
              今日一牌
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            一个人也能测，拉上 ta 一起测，就能解锁你们的关系报告。
          </p>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]" aria-label="情侣关系报告预览">
            <div className="site-hero-card relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">关系报告 · 预览</span>
                <span className="text-xs font-medium text-text-secondary">¥{XPTI_COUPLE_REPORT_PRICE}</span>
              </div>
              <div className="mx-auto max-w-[300px]">
                <CoupleRadar inviter={PREVIEW_A} partner={PREVIEW_B} size={300} />
              </div>
              <div className="mt-3 rounded-2xl border border-border-subtle bg-bg-elevated/80 p-4">
                <p className="text-[11px] text-text-muted mb-1">今晚可以试着这样说</p>
                <p className="text-sm leading-relaxed text-text-primary">
                  “我不是想赢这场架，我只是想你先抱抱我。”
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="editorial-rule-soft max-w-5xl mx-6 sm:mx-auto" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°01½ XPTI 情侣关系报告 · 主推卡
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-16 sm:pt-20 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/xpti/test/"
            prefetch={false}
            className="group block rounded-[2rem] border border-border-subtle bg-bg-elevated p-8 sm:p-10 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md"
            style={{ background: 'var(--color-paper-warm)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <CodeMark className="text-[10px]">XC</CodeMark>
              <span className="eyebrow">XPTI · 关系沟通 · 最受欢迎</span>
            </div>
            <h2 className="section-headline text-3xl sm:text-4xl mb-4">
              你们不是不爱，<span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>只是没说对</span>
            </h2>
            <p className="text-base sm:text-lg leading-[1.85] text-text-secondary max-w-2xl mb-6">
              吵架后谁先低头、委屈时想听什么、哪句话最容易戳中 ta——情侣关系报告把你们的沟通方式放在一起看，
              帮你读懂 ta，也被 ta 读懂。
            </p>
            <ul className="grid gap-3 sm:grid-cols-3 text-sm text-text-secondary mb-8">
              <li>· 双人合并雷达：一眼看清你们哪里合拍、哪里拧巴</li>
              <li>· 6 类张力配对：冷战、翻旧账、报喜不报忧……各有解法</li>
              <li>· 24 句对话脚本：下次想说软话时，直接用得上</li>
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <span className="btn btn-ink">
                和 ta 一起测
                <ArrowIcon />
              </span>
              <span className="text-sm font-medium text-text-primary">
                ¥{XPTI_COUPLE_REPORT_PRICE} 解锁关系报告
              </span>
              <span className="text-xs text-text-muted">免费开测 · 也可以双人各付一半</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°02 What's Inside · 三个主入口
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <span className="serial-number text-xs mr-3">02</span>
              <span className="eyebrow">What&apos;s Inside</span>
              <h2 className="section-headline text-3xl sm:text-4xl mt-3">
                先从这<span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>三件事</span>开始
              </h2>
              <p className="display-tagline text-text-secondary mt-3 text-base max-w-xl">
                今日一牌安顿情绪，我们合不合看清关系，经典测试快速认识自己。
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle border border-border-subtle"
          >
            {UNIVERSE_GRID.map((u) => (
              <Link
                key={u.href}
                href={u.href}
                prefetch={false}
                className="group relative block p-7 sm:p-9 transition-colors duration-500 bg-bg-elevated"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <span className="serial-number text-xs" style={{ color: u.accentDeep }}>
                    N°{u.numeral.padStart(3, '0')}
                  </span>
                  <span className="eyebrow text-[10px]" style={{ color: u.accent, opacity: 0.9 }}>
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
                    color: u.accentDeep,
                  }}
                >
                  {u.italic}
                </p>

                <p className="text-[13.5px] text-text-secondary leading-[1.85] mb-6">
                  {u.desc}
                </p>

                <p
                  className="text-[11px] tracking-wider"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)' }}
                >
                  {u.free}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <span
                    className="h-px flex-1 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: u.accentDeep, opacity: 0.35 }}
                  />
                  <span
                    className="text-sm transition-transform duration-500 group-hover:translate-x-1"
                    style={{ color: u.accentDeep }}
                  >
                    走进
                  </span>
                </div>
              </Link>
            ))}
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
              关系里的<span className="editorial-italic">更多答案</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              恋人、闺蜜、家人——每段在意的关系，都值得被认真看一次。
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-subtle border border-border-subtle"
          >
            {RELATIONSHIP_PLAYS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group relative block p-6 sm:p-8 transition-colors duration-500 bg-bg-elevated"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="serial-number text-[10px] absolute top-3 right-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <CodeMark className="mb-5 transition-transform duration-500 group-hover:scale-105">{item.mark}</CodeMark>
                <h3 className="text-lg text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {item.label}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                <span
                  className="mt-4 block h-px w-6 transition-[width] duration-500 group-hover:w-12"
                  style={{ background: 'var(--color-rose)', opacity: 0.5 }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°06 FAQ
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-24 sm:py-32 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
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
                className="py-12"
                style={{ borderBottom: '1px solid var(--color-rule-soft)' }}
              >
                <div className="flex gap-6">
                  <span className="serial-number text-xs pt-1 shrink-0 w-8">Q{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <h3 className="text-lg text-text-primary mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                      {item.question}
                    </h3>
                    <p className="text-sm sm:text-base text-text-secondary leading-[1.9]">{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°06½ 合规声明
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-20 sm:py-28 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="serial-number text-xs mr-3">§</span>
            <span className="eyebrow">Disclaimer</span>
            <h2 className="section-headline text-2xl sm:text-3xl mt-3">
              合规<span className="editorial-italic">声明</span>
            </h2>
          </div>

          <div className="space-y-6 text-text-secondary leading-[1.9] text-[15px] sm:text-base">
            <div className="p-6 sm:p-8 rounded-xl" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
              <h3 className="text-base font-medium text-text-primary mb-3 flex items-center gap-2">
                <span className="site-code-mark h-6 w-8 text-[8px]" style={{ color: 'var(--color-gold-leaf)' }}>01</span>
                内容性质声明
              </h3>
              <p>
                本平台所有测试相关内容（包括但不限于人格测试、关系测试、塔罗占卜、灵鉴解读等）均仅供<strong className="text-text-primary">娱乐与自我观察</strong>使用，不构成任何形式的专业心理诊断、医疗建议、法律意见或人生决策依据。测试结果不可用于招聘筛选、信用评估、司法鉴定或其他严肃决策场景。
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
              <h3 className="text-base font-medium text-text-primary mb-3 flex items-center gap-2">
                <span className="site-code-mark h-6 w-8 text-[8px]" style={{ color: 'var(--color-gold-leaf)' }}>02</span>
                隐私承诺
              </h3>
              <p>
                本平台<strong className="text-text-primary">不收集、不存储、不出售任何个人身份信息</strong>（包括但不限于姓名、手机号、身份证号、邮箱地址、人脸数据等）。测试流程以浏览器端本地计算为主，你的测试答案仅在当前设备上生成结果，不会上传至服务器用于用户画像、商业分析或第三方共享。
              </p>
              <p className="mt-3 text-sm text-text-muted">
                详见 <Link href="/privacy/" prefetch={false} className="underline underline-offset-2 hover:text-text-primary transition-colors">隐私说明</Link> · <Link href="/terms/" prefetch={false} className="underline underline-offset-2 hover:text-text-primary transition-colors">使用条款</Link>
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
              <h3 className="text-base font-medium text-text-primary mb-3 flex items-center gap-2">
                <span className="site-code-mark h-6 w-8 text-[8px]" style={{ color: 'var(--color-gold-leaf)' }}>03</span>
                使用者责任
              </h3>
              <p>
                使用本平台即表示你已理解并同意：测试结果仅供参考，不应作为判断自己或他人心理状态、关系质量、人格优劣的唯一依据。如需专业心理帮助，请咨询持证心理咨询师或医疗机构。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          N°07 Community + Bottom CTA（合并）
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="defer-section py-24 sm:py-32 px-6 sm:px-10" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="serial-number text-xs mr-3">07</span>
            <span className="eyebrow">Community</span>
            <h2 className="section-headline text-3xl sm:text-4xl mt-3">
              加入 <span className="editorial-italic" style={{ color: 'var(--color-rose)' }}>WTFTI</span> 社群
            </h2>
            <p className="display-tagline text-text-secondary mt-3 text-base">
              测完想聊聊？群里有很多和你一样认真对待感情的人。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-14">
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center hover:shadow-md transition-shadow animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="site-code-mark h-7 w-9 text-[9px]" style={{ color: 'var(--color-sage)' }}>WX</span>
                <span className="font-medium text-text-primary">微信群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block" data-keep-white>
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
                <span className="site-code-mark h-7 w-9 text-[9px]" style={{ color: 'var(--color-gold-leaf)' }}>QQ</span>
                <span className="font-medium text-text-primary">QQ 群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block" data-keep-white>
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
            <span className="eyebrow block mb-4">从这里开始</span>
            <h3 className="section-headline text-2xl sm:text-3xl mb-4">
              想被 ta 读懂，<span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>先一起测一次</span>
            </h3>
            <p className="display-tagline text-text-secondary mb-8 text-base max-w-md mx-auto">
              三分钟答题，拿到你们的沟通方式和一句今晚就能用的话。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/xpti/test/" prefetch={false} className="btn btn-ink">
                和 ta 一起测
                <ArrowIcon />
              </Link>
              <Link href="/mysti/daily/" prefetch={false} className="btn btn-ghost">
                今日一牌
              </Link>
            </div>
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
