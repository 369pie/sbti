'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WorkPersonalityAvatar } from '@/components/WorkPersonalityAvatar';
import { WORK_MODEL_NAMES, WORK_MODEL_COLORS } from '@/lib/work/dimensions';
import type { WorkModelType } from '@/lib/work/dimensions';
import { WORK_PERSONALITY_TYPES } from '@/lib/work/personalities';

const MODELS: { key: WorkModelType; label: string }[] = [
  { key: 'drive', label: '你干活靠的是什么' },
  { key: 'social', label: '在公司你是社牛还是社恐' },
  { key: 'stress', label: '扛得住压还是一碰就碎' },
  { key: 'slack', label: '你在上班还是在摸鱼' },
  { key: 'ambition', label: '你对职场的野心有多大' },
];

const FEATURED = WORK_PERSONALITY_TYPES;

export default function WorkHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Work Personality Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              你是哪种
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">打工人</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 个职场维度 · 15 道灵魂拷问 · 16 种打工人格
              <br />
              三分钟测出你的职场真面目。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/work/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 text-white font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                ← SBTI 抽象人格测试
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden"
          >
            {[
              { value: '5 维', label: '职场维度' },
              { value: '16 种', label: '打工人格' },
              { value: '15 题', label: '约3分钟' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5 Dimensions */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Dimensions</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">五个职场切面</h2>
          </motion.div>

          <div className="grid gap-3">
            {MODELS.map((m, i) => {
              const color = WORK_MODEL_COLORS[m.key];
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-secondary/40 hover:bg-bg-secondary/60 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-semibold flex-shrink-0"
                    style={{ background: color.bg, color: color.base }}
                  >
                    {m.key[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: color.base }}>
                      {WORK_MODEL_NAMES[m.key]}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">{m.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured types */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Types</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">16 种打工人格</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURED.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/work/result/${p.slug}`}
                  className="block p-4 sm:p-5 rounded-2xl border border-border-subtle bg-bg-secondary/40 text-center hover:bg-bg-secondary/60 hover:border-border transition-all"
                >
                  <WorkPersonalityAvatar
                    personality={p}
                    alt=""
                    sizes="(max-width: 640px) 96px, 112px"
                    className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 rounded-2xl overflow-hidden"
                    style={{ background: `${p.color}15` }}
                    imageClassName="object-contain p-2"
                    fallbackClassName="w-full h-full flex items-center justify-center text-5xl"
                  />
                  <div className="text-2xl font-mono tracking-[0.08em] leading-none mb-2" style={{ color: p.color }}>
                    {p.code}
                  </div>
                  <div className="text-base font-medium text-text-primary">{p.name}</div>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-1">{p.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-text-muted text-sm mb-6">准备好了吗？</p>
          <Link
            href="/work/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-indigo-500 text-white font-medium text-lg hover:brightness-110 transition-all duration-200 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          >
            开始打工人格测试
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
