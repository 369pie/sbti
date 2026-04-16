'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import { UNIVERSES as UNIVERSES_DATA } from '@/lib/universes';

const FEATURED = WTFTI_PERSONALITIES.slice(0, 8);

export default function WtftiLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              What The F*** Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <span className="block">WTFTI 人格图鉴</span>
              <span className="gradient-text">WTF 我居然是这种人？</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              29 种 WTF 人格图鉴，不套公式，只说中你。
              <br />
              每一张卡都是一面镜子——照完想骂，骂完想转。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wtfti/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all duration-200"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/test/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-subtle text-text-muted text-sm hover:text-text-secondary hover:border-border transition-all"
              >
                经典 SBTI 版
              </Link>
              <Link
                href="/wtfti/work/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-sky-300/50 text-sky-600 text-sm hover:text-sky-700 hover:border-sky-400/70 hover:bg-sky-50/60 transition-all"
              >
                💼 班TI 职场版
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '29 种', label: 'WTF 人格' },
              { value: '4 段式', label: '毒舌文案' },
              { value: '~32 题', label: '含隐藏分支' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-elevated rounded-2xl border border-border-subtle px-4 py-6 text-center shadow-sm">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Different */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Features</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              同一个你，不同的翻译
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              同样的 15 维度测试，全新的毒舌解读。
            </p>
          </div>

          <div className="space-y-4">
            {[
              { emoji: '🎯', title: 'WTF 一击', desc: '一句话说中你的要害，精准到想报警' },
              { emoji: '🧬', title: '操作系统翻译', desc: '把你的行为模式翻译成人话，让你觉得被理解' },
              { emoji: '📋', title: '隐藏症状清单', desc: '条条打勾，条条被说中，截图传播素材' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5 hover:shadow-md transition-shadow animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-medium text-text-primary">{item.title}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
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
                href="/wtfti/test/"
                className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
              >
                测测我是哪种 WTF 人格
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
