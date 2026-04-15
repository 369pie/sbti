import Link from 'next/link';
import NextImage from 'next/image';
import { PERSONALITY_TYPES, getTypeThumbnailImage } from '@/lib/personalities';
import { getLiveUniverses } from '@/lib/universes';
import { withBasePath } from '@/lib/site';
import { FollowMeCard, FollowMeFloating } from '@/components/FollowMeLinks';
import { WtfCardBanner } from '@/components/WtfCardBanner';

// ─── Universe descriptions for the hub cards ─────────────────────────────────

const UNIVERSE_CARDS: Record<string, { tagline: string; stats: string }> = {
  standard: { tagline: '经典 15 维 × 27 种人格基线', stats: '27 种 · ~32 题' },
  xiuxian: { tagline: '修仙体质 × 人格维度', stats: '27 种 · ~32 题' },
  wtfti: { tagline: '直接骂醒你的毒舌版', stats: '29 种 · ~32 题' },
  banti: { tagline: '社畜宇宙 · 你在工位是什么角色', stats: '29 种 · ~32 题' },
  kings: { tagline: '王者峡谷 × 人格联名', stats: '29 种 · ~32 题' },
  bird: { tagline: '你是哪种禽 · 鸟类人格鉴定', stats: '29 种 · 31 题' },
  flower: { tagline: '花格鉴定 · 测测你像哪朵花', stats: '16 种 · 20 题' },
  delta: { tagline: '三角洲行动 × 人格联名', stats: '29 种 · ~32 题' },
  soulti: { tagline: '觉察深层自我 · 文艺内省版', stats: '16 种 · 20 题' },
  xpti: { tagline: '亲密偏好图谱 · 你想要的是谁', stats: '12 种 · 随机27题' },
};

const FUN_ITEMS = [
  { href: '/cp/', emoji: '💕', label: 'CP 配对', desc: '看看谁和你最配' },
  { href: '/work/', emoji: '💼', label: '打工人设', desc: '16 种职场角色' },
  { href: '/love/', emoji: '💗', label: '恋爱人设', desc: '16 种恋爱角色' },
  { href: '/daily/', emoji: '🎲', label: '今日模式', desc: '每天换一种人格' },
  { href: '/drunk/', emoji: '🍺', label: '酒后人设', desc: '12 种醉后真面目' },
  { href: '/identify/', emoji: '🔍', label: '好友鉴定', desc: '帮朋友鉴定人格' },
  { href: '/squad/', emoji: '🎯', label: '组局测试', desc: '拉上朋友一起来' },
  { href: '/combo/', emoji: '🧩', label: '人格拼盘', desc: '拼出你的多面体' },
  { href: '/rank/', emoji: '🏆', label: '群组排行', desc: '看看谁人格最多' },
  { href: '/puzzle/', emoji: '🧩', label: '闺蜜拼图', desc: '四人人格拼图' },
  { href: '/share-templates/', emoji: '📕', label: '分享文案', desc: '一键复制发小红书' },
];

const FAQS = [
  {
    question: 'WTFTI 是什么？',
    answer:
      'WTFTI 是一个多宇宙人格测试平台。同一个你，在不同主题宇宙里有不同的人格翻译——毒舌版的你、社畜版的你、鸟类版的你、花朵版的你，每个宇宙都有独立的视觉风格和测试体验。',
  },
  {
    question: '和 MBTI 有什么区别？',
    answer:
      'MBTI 更像经典人格框架，WTFTI 更贴近中文互联网语境。在这里你看到的是生活反应、关系状态和行为习惯，不是四个字母和理论模型。',
  },
  {
    question: '这么多宇宙，我该从哪个开始？',
    answer:
      '推荐先测经典版（27 种人格 × 15 维度），拿到你的基线人格后再去其他宇宙看看你变成了什么。每个宇宙都有自己的风格和乐趣。',
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="section-label mb-8 block">
              What&apos;s The F* Type Inside
            </span>

            <h1 className="mb-6 leading-[1.05]">
              <span className="brand-wtf text-5xl sm:text-6xl md:text-7xl" style={{ color: '#ff4d6d' }}>
                WTF
              </span>
              <span className="brand-ti text-5xl sm:text-6xl md:text-7xl text-text-primary">
                TI
              </span>
              <br />
              <span className="wtfti-gradient-text text-2xl sm:text-3xl md:text-4xl mt-2 inline-block section-headline">
                我居然是这种人？
              </span>
            </h1>

            <p className="display-tagline text-text-secondary text-lg sm:text-xl leading-relaxed max-w-md mx-auto mb-10">
              多宇宙人格测试平台
              <span className="mx-2 text-border">·</span>
              同一个你，不同宇宙里完全不同的人格翻译
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #ff4d6d, #e06088)',
                  boxShadow: '0 8px 32px rgba(255,77,109,0.25)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                开始经典测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/types/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-border text-text-secondary font-medium text-base hover:border-text-muted hover:text-text-primary transition-all duration-200"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                先刷 27 张人设卡
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: `${universes.length}`, label: '个测试宇宙' },
              { value: '100+', label: '种人格类型' },
              { value: '10+', label: '种玩法' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-elevated rounded-2xl border border-border-subtle px-4 py-6 text-center shadow-sm">
                <div className="stat-value text-2xl text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Universe Hub ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="section-label block mb-3">Universes</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              选一个宇宙，开始测试
            </h2>
            <p className="display-tagline text-text-secondary mt-3 text-base leading-relaxed">
              每个宇宙有独立的视觉、题目和人格翻译 <span className="text-border mx-1">—</span> 先挑一个感兴趣的
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {universes.map((u, i) => {
              const meta = UNIVERSE_CARDS[u.id];
              return (
                <Link
                  key={u.id}
                  href={u.landingPath}
                  prefetch={false}
                  className="group animate-fade-up block rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-lg transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl"
                        style={{ background: `${u.accent}15` }}
                      >
                        {u.emoji || '🧪'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-text-primary transition-colors">
                          {u.name}
                        </h3>
                        <span className="text-xs font-mono text-text-muted">{meta?.stats}</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {meta?.tagline}
                    </p>
                    {/* Accent bar */}
                    <div
                      className="mt-4 h-0.5 rounded-full opacity-20 group-hover:opacity-60 transition-opacity"
                      style={{ background: u.accent }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WTF Card Banner ── */}
      <WtfCardBanner />

      {/* ── Fun Plays ── */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="section-label block mb-3">More Fun</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              趣味玩法
            </h2>
            <p className="display-tagline text-text-secondary mt-3 text-base">
              基于人格结果的二次衍生，换个姿势了解自己
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {FUN_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group block rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-md transition-all p-5 text-center"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-medium text-text-primary text-sm">{item.label}</h3>
                <p className="text-xs text-text-muted mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Types ── */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <span className="section-label block mb-3">Types</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              先刷几张人设卡
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href={`/result/${p.slug}`}
                  prefetch={false}
                  className="group block rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all overflow-hidden"
                >
                  <div
                    className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                  >
                    <NextImage
                      src={getTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      width={200}
                      height={200}
                      sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 220px"
                      className="w-[70%] h-[70%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-3.5 py-3">
                    <span className="text-[11px] font-mono tracking-wider block mb-0.5" style={{ color: p.color }}>
                      {p.code}
                    </span>
                    <span className="text-base font-medium text-text-primary">{p.name}</span>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{p.tagline}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/types/"
              prefetch={false}
              className="text-sm text-text-muted hover:text-accent transition-colors"
            >
              查看全部 27 种 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label block mb-3">FAQ</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              常见问题
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-text-primary leading-7">{item.question}</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-7 mt-3">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-up">
            <span className="section-label block mb-3">Community</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              加入 WTFTI 社群
            </h2>
            <p className="display-tagline text-text-secondary mt-3 text-base">
              测完想找同类？来群里一起交流、玩耍、对线吧
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
      <section className="py-24 px-6 text-center">
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

