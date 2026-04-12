'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiTypeImage } from '@/lib/wtfti-personalities';

const FEATURED = WTFTI_PERSONALITIES.slice(0, 8);

export default function WtftiLandingContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-subtle text-text-muted text-sm hover:text-text-secondary hover:border-border transition-all"
              >
                经典 SBTI 版
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-3"
          >
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
          </motion.div>
        </div>
      </section>

      {/* What's Different */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Features</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              同一个你，不同的翻译
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              同样的 15 维度测试，全新的毒舌解读。
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { emoji: '🎯', title: 'WTF 一击', desc: '一句话说中你的要害，精准到想报警' },
              { emoji: '🧬', title: '操作系统翻译', desc: '把你的行为模式翻译成人话，让你觉得被理解' },
              { emoji: '📋', title: '隐藏症状清单', desc: '条条打勾，条条被说中，截图传播素材' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-medium text-text-primary">{item.title}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
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
                  className="group rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  <div
                    className="aspect-square flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${p.color}08, ${p.color}15)` }}
                  >
                    <NextImage
                      src={getWtftiTypeImage(p.slug)}
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
