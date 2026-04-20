'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import { UNIVERSES as UNIVERSES_DATA } from '@/lib/universes';

const FEATURED = WTFTI_PERSONALITIES.slice(0, 8);

/** 人格神域 v3 重磅升级 6 模块 */
const PANTHEON_PILLARS: Array<{
  glyph: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  accent: string;
  note?: string;
}> = [
  {
    glyph: '✦',
    eyebrow: 'I · Summon',
    title: '主神召唤',
    body: '90 秒进入仪式，从 8 位主神中召唤属于你这一段人生的那一位。',
    href: '/wtfti/galaxy/test/',
    accent: '#C07A8E',
  },
  {
    glyph: '⚭',
    eyebrow: 'II · Soul Probe',
    title: '灵魂印记',
    body: '6 道五感探针：唱片 / 台词 / 色卡 / 电影 / 香水 / 触感 — 听·视·嗅·触·直觉。',
    href: '/wtfti/profile/',
    accent: '#9C7CFF',
  },
  {
    glyph: '⛤',
    eyebrow: 'III · Shrine',
    title: '私人神龕',
    body: '召唤之后，你会拥有一座专属神龕 — 镜面、供奉、信物、仪式记录都存在这里。',
    href: '/wtfti/galaxy/test/',
    accent: '#C9A676',
    note: '* 完成召唤后自动生成你的专属神龕',
  },
  {
    glyph: '☾',
    eyebrow: 'IV · Lunar',
    title: '月相日课',
    body: '跟月亮走 12 期 — 每一期一句话，最终加冕大祭司，附 30 天 Future Letter。',
    href: '/wtfti/moon/',
    accent: '#C9A676',
  },
  {
    glyph: '⚭',
    eyebrow: 'V · Duet',
    title: '召唤合奏',
    body: '你和 ta 各召唤一位主神 — 引力 G × 共鸣 S × 一枚专属 Pair Sigil。',
    href: '/wtfti/duet/',
    accent: '#9C7CFF',
  },
  {
    glyph: '✶',
    eyebrow: 'VI · Daily',
    title: '今日天象签',
    body: '每天一签 · 主神视角的微叙事，留住归属感与每日打卡。',
    href: '/wtfti/daily/',
    accent: '#C9A676',
  },
];

export default function WtftiLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero · Pantheon v3 */}
      <section className="relative overflow-hidden">
        {/* dark cosmic backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 110% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 18% 22%, rgba(192,122,142,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(156,124,255,0.28), transparent 50%)',
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative" style={{ color: '#F5F0E8' }}>
          <div className="animate-fade-up">
            <span
              className="inline-block text-[11px] font-mono tracking-[0.42em] uppercase mb-6"
              style={{ color: '#C9A676' }}
            >
              ✦ Personal Pantheon · WTFTI v3 ✦
            </span>

            <h1
              className="mb-6 leading-[1.05]"
              style={{
                fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
                fontWeight: 500,
              }}
            >
              <span className="block text-4xl sm:text-5xl md:text-6xl">
                WTFTI · 人格神域
              </span>
              <span
                className="block text-2xl sm:text-3xl md:text-4xl mt-3"
                style={{ color: '#F5F0E8', fontStyle: 'italic', opacity: 0.9 }}
              >
                90 秒被一位主神召唤，<br className="hidden sm:block" />
                留下你的灵魂印记。
              </span>
            </h1>

            <p
              className="text-base sm:text-lg leading-[1.85] max-w-xl mx-auto mb-10"
              style={{ color: 'rgba(245,240,232,0.78)', fontFamily: 'Noto Serif SC, serif' }}
            >
              不是一次性测试，是一座可以被装饰、被分享、随月相成长的精神生活神域。<br />
              8 主神 × 灵魂印记 × 五感档案 × 月相日课 × 召唤合奏 — 一次召唤，长期归属。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wtfti/galaxy/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-base transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #C9A676 0%, #C07A8E 100%)',
                  color: '#1a1530',
                  boxShadow: '0 12px 36px rgba(192,122,142,0.35)',
                }}
              >
                ✦ 召唤你的主神
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/profile/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm transition-all"
                style={{
                  border: '1px solid rgba(245,240,232,0.25)',
                  color: 'rgba(245,240,232,0.85)',
                }}
              >
                进入我的五感档案
              </Link>
            </div>

            {/* 以礼器过渡到其他仪式 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.32em] font-mono">
              <Link href="/wtfti/moon/" prefetch={false} style={{ color: 'rgba(245,240,232,0.55)' }} className="hover:text-amber-300 transition-colors">
                ✦ 月相章节
              </Link>
              <Link href="/wtfti/duet/" prefetch={false} style={{ color: 'rgba(245,240,232,0.55)' }} className="hover:text-rose-300 transition-colors">
                ✦ 召唤合奏
              </Link>
              <Link href="/wtfti/daily/" prefetch={false} style={{ color: 'rgba(245,240,232,0.55)' }} className="hover:text-amber-300 transition-colors">
                ✦ 今日天象签
              </Link>
            </div>
          </div>

          {/* Stats — 重新表达成神域口径 */}
          <div className="mt-14 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '8 主神', label: '人格神域' },
              { value: '6 探针', label: '灵魂印记' },
              { value: '12 章', label: '月相日课' },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl px-4 py-6 text-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(245,240,232,0.10)',
                }}
              >
                <div
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: '#F5F0E8', fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] font-mono tracking-[0.32em] uppercase mt-2"
                  style={{ color: 'rgba(245,240,232,0.55)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pantheon v3 · 重磅升级 6 模块 */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-up text-center">
            <span className="text-xs font-mono tracking-[0.32em] text-text-muted uppercase block mb-3">
              ✦ Apr 2026 · Major Upgrade ✦
            </span>
            <h2
              className="text-3xl sm:text-4xl tracking-tight"
              style={{ fontFamily: 'Cormorant Garamond, Noto Serif SC, serif', fontWeight: 500 }}
            >
              人格神域 v3 · <span className="italic" style={{ color: 'var(--color-rose, #C07A8E)' }}>六重新仪式</span>
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed max-w-2xl mx-auto">
              这一次不再只是一次性测试 — 你会拥有一座可以长期回去的神域。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PANTHEON_PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  href={p.href}
                  prefetch={false}
                  className="group block h-full rounded-2xl p-6 transition-all duration-300"
                  style={{
                    background: `linear-gradient(180deg, ${p.accent}10 0%, transparent 100%)`,
                    border: `1px solid ${p.accent}33`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="text-3xl"
                      style={{ color: p.accent, fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {p.glyph}
                    </span>
                    <span
                      className="text-[10px] font-mono tracking-[0.28em] uppercase"
                      style={{ color: p.accent }}
                    >
                      {p.eyebrow}
                    </span>
                  </div>
                  <h3
                    className="text-xl mb-2"
                    style={{
                      fontFamily: 'Noto Serif SC, serif',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{p.body}</p>
                  {p.note ? (
                    <p className="mt-2 text-[11px] italic text-text-muted">{p.note}</p>
                  ) : null}
                  <div
                    className="mt-5 flex items-center gap-2 text-xs font-medium transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: p.accent }}
                  >
                    进入 →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 经典文本版 · 辅入口 */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 animate-fade-up">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">Classic</span>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  也想念旧版 WTF 毒舌？
                </h2>
              </div>
              <span className="text-2xl">🤯</span>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm">
              29 张 WTF 人格图鉴 · 4 段式毒舌 · ~32 题含隐藏分支 — 经典文本版仍然在线。
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
              <Link
                href="/wtfti/test/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-bg-secondary text-text-primary text-sm font-medium hover:bg-bg-elevated border border-border-subtle transition-all"
              >
                经典 WTFTI 文本版
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Universe Switch */}
      <section className="px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 sm:p-8 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-sky-500 uppercase block mb-3">Universe</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              同一套内核，也能翻译成社畜宇宙
            </h2>
            <p className="text-text-secondary leading-relaxed max-w-2xl">
              如果你想看这套 15 维人格模型落到办公室之后会变成什么样，班TI 已经把 WTFTI 全量翻译成了 29 张职场图鉴卡。
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <Link
                href="/wtfti/work/"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-sky-500 text-white font-medium text-sm hover:bg-sky-600 transition-all"
              >
                进入班TI
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/work/test/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-sky-300/40 text-sky-600 text-sm hover:text-sky-700 hover:border-sky-400/70 hover:bg-sky-50/60 transition-all"
              >
                直接开始班TI测试
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mysti Switch */}
      <section className="px-6 pb-4 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 sm:p-8 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-violet-500 uppercase block mb-3">Mysti</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              🔮 灵鉴 — 用塔罗重新翻译你的人格
            </h2>
            <p className="text-text-secondary leading-relaxed max-w-2xl">
              同一套 WTFTI 人格内核，换一种神秘视角再看一次。29 种 WTF 人格各自对应一张灵魂塔罗。
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <Link
                href="/mysti/"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-violet-500 text-white font-medium text-sm hover:bg-violet-600 transition-all"
              >
                进入灵鉴
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Universes Grid */}
      <section className="px-6 pb-8 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-fade-up">
            <div className="mb-8">
              <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Universes</span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                探索全部宇宙
              </h2>
              <p className="text-text-secondary mt-3 leading-relaxed">
                同一个灵魂，不同的宇宙里有不同的翻译。选择你感兴趣的宇宙开始测试。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {UNIVERSES_DATA.filter(u => u.status === 'live' && u.id !== 'standard' && u.id !== 'xiuxian').map((universe, index) => (
                <motion.div
                  key={universe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={universe.testPath}
                    className="group block rounded-xl border border-border-subtle bg-bg-elevated p-5 shadow-sm hover:shadow-md hover:border-border transition-all h-full"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ 
                          background: `${universe.accent}15`,
                          border: `1px solid ${universe.accent}30`
                        }}
                      >
                        {universe.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text-primary mb-1">{universe.name}</div>
                        <div className="text-sm text-text-muted mb-3 truncate">{universe.shortName}</div>
                        <div 
                          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                          style={{ color: universe.accent }}
                        >
                          开始测试
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/types/"
                className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
              >
                查看所有宇宙详情
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-fade-up">
            <div className="mb-10">
              <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Collection</span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                人格图鉴一览
              </h2>
              <p className="text-text-secondary mt-3 leading-relaxed">
                29 种 WTF 人格 · 每一种都有收集卡
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FEATURED.map(p => (
                <Link
                  key={p.slug}
                  href={`/wtfti/result/${p.slug}/`}
                  prefetch={false}
                  className="group rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  <div
                    className="aspect-square flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                  >
                    <NextImage
                      src={getWtftiTypeThumbnailImage(p.slug)}
                      alt={p.wtftiName}
                      width={200}
                      height={200}
                      className="w-[75%] h-[75%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs font-mono text-accent mb-0.5">{p.number}</div>
                    <div className="font-medium text-sm text-text-primary truncate">{p.wtftiName}</div>
                    <div className="text-xs text-text-muted mt-0.5 truncate">{p.code}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/wtfti/galaxy/test/"
                className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
              >
                召唤我的人格神域
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
