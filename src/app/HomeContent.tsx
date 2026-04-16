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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center relative">
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
              同一个你，不同宇宙完全不同的人格翻译
            </p>
          </div>

          {/* 4 intent cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up-delay-1">
            {HERO_INTENTS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group block rounded-2xl border border-border-subtle bg-bg-elevated p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.label}</h3>
                <p className="text-[11px] text-text-muted">{item.desc}</p>
                <div
                  className="mt-3 h-0.5 rounded-full opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ background: item.accent }}
                />
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-3 animate-fade-up-delay-2">
            {[
              { value: `${universes.length}`, label: '个测试宇宙' },
              { value: '100+', label: '种人格类型' },
              { value: '10+', label: '种社交玩法' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-elevated rounded-2xl border border-border-subtle px-4 py-5 text-center shadow-sm">
                <div className="stat-value text-2xl text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hot Picks — 推荐测试 ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="section-label block mb-2">Recommended</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              不知道从哪开始？先试这几个
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOT_PICKS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group block rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50/60 via-white to-fuchsia-50/40 p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-text-primary">{item.label}</h3>
                        {item.tag && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: item.accent }}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Universe Hub — 按风格浏览 ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="section-label block mb-2">Style Universes</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              选一个风格宇宙
            </h2>
            <p className="display-tagline text-text-secondary mt-2 text-base">
              每个宇宙有独立的视觉、题目和人格翻译
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STYLE_UNIVERSES.map((u, i) => (
              <Link
                key={u.id}
                href={u.landingPath}
                prefetch={false}
                className="animate-fade-up group block rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-md transition-all p-5 text-center"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-3"
                  style={{ background: `${u.accent}12` }}
                >
                  {u.emoji || '🧪'}
                </span>
                <h3 className="font-semibold text-text-primary text-sm mb-1">{u.name}</h3>
                <div
                  className="mt-3 h-0.5 rounded-full mx-auto w-12 opacity-20 group-hover:opacity-60 transition-opacity"
                  style={{ background: u.accent }}
                />
              </Link>
            ))}
          </div>

          {/* UGC Universes */}
          {UGC_CARDS.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                <span className="text-pink-400">✨</span>
                创作者主题
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {UGC_CARDS.map((u, i) => (
                  <Link
                    key={u.id}
                    href={u.landingPath}
                    prefetch={false}
                    className="group block rounded-2xl border border-dashed border-border bg-bg-elevated/60 hover:shadow-md transition-all p-4 text-center"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="text-2xl mb-2 block">{u.emoji || '🧪'}</span>
                    <h3 className="font-medium text-text-primary text-sm">{u.name}</h3>
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
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="section-label block mb-2">Relationships</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              和朋友一起玩
            </h2>
            <p className="display-tagline text-text-secondary mt-2 text-base">
              测完自己，拉上朋友看看你们的化学反应
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RELATIONSHIP_PLAYS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="animate-fade-up group block rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-md transition-all p-5 text-center"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Casual Tests — 轻松一测 ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="section-label block mb-2">Quick Play</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              轻松一测
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CASUAL_TESTS.map((item, i) => (
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

      {/* ── Explore — 发现更多 ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <span className="section-label block mb-2">Explore</span>
            <h2 className="section-headline text-2xl sm:text-3xl">
              发现更多
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXPLORE_ITEMS.map((item, i) => (
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

      {/* ── Creator Program ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border-subtle bg-gradient-to-r from-pink-50/60 via-white to-amber-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1">
                <span className="section-label block mb-2">Creator Beta</span>
                <h2 className="section-headline text-xl sm:text-2xl">
                  做你自己的人格宇宙
                </h2>
                <p className="display-tagline text-text-secondary mt-2 text-sm leading-relaxed">
                  把你的内容做成可传播的人格测试。免费主题拉新，付费主题变现。
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/creator/"
                    prefetch={false}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    查看创作者计划
                  </Link>
                  <Link
                    href="/creator/apply/"
                    prefetch={false}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:text-text-primary hover:border-border transition-colors"
                  >
                    申请内测
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Types ── */}
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="section-label block mb-2">Types</span>
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

          <div className="mt-6 text-center">
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
      <section className="py-16 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-label block mb-2">FAQ</span>
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
                <h3 className="text-base font-medium text-text-primary leading-7">{item.question}</h3>
                <p className="text-sm text-text-secondary leading-7 mt-2">{item.answer}</p>
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

