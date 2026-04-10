'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeImage } from '@/lib/personalities';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { ModelType } from '@/lib/dimensions';

const MODELS: { key: ModelType; dims: string[] }[] = [
  { key: 'self', dims: ['S1 自尊自信', 'S2 自我清晰度', 'S3 核心价值'] },
  { key: 'emotion', dims: ['E1 依恋安全感', 'E2 情感投入度', 'E3 边界与依赖'] },
  { key: 'attitude', dims: ['A1 世界观倾向', 'A2 规则与灵活度', 'A3 人生意义感'] },
  { key: 'action', dims: ['Ac1 动机导向', 'Ac2 决策风格', 'Ac3 执行模式'] },
  { key: 'social', dims: ['So1 社交主动性', 'So2 人际边界感', 'So3 表达与真实度'] },
];

const FEATURED = PERSONALITY_TYPES.slice(0, 6);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Silly Behavioral Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              测测你到底是
              <br />
              <span className="gradient-text">哪种抽象人格</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 组切面 · 15 个维度 · 27 种结果
              <br />
              不套术语，只看你平时怎么想、怎么爱、怎么活。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/types"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                浏览 27 种人格
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
              { value: '15 维', label: '人格维度' },
              { value: '27 种', label: '结果类型' },
              { value: '~32 题', label: '含隐藏分支' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5 Models */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Models</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              5 组切面看人格状态
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              不只给一个名字，还会把你的状态落到十五个维度上。
            </p>
          </motion.div>

          <div className="space-y-4">
            {MODELS.map((m, i) => {
              const c = MODEL_COLORS[m.key];
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-5 hover:bg-bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: c.base }}
                    />
                    <h3 className="font-medium" style={{ color: c.base }}>
                      {MODEL_NAMES[m.key]}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.dims.map(d => (
                      <span
                        key={d}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: c.bg, color: c.light }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured types */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Types</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              部分人格一览
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/result/${p.slug}`}
                  className="group block rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden mb-2" style={{ background: `${p.color}15` }}>
                    <NextImage
                      src={getTypeImage(p.slug)}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                    {p.code}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{p.name}</span>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/types"
              className="text-sm text-text-muted hover:text-accent transition-colors"
            >
              查看全部 27 种 →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            准备好了吗？
          </h2>
          <p className="text-text-secondary mb-8">
            纯前端计算，不上传任何数据。测完直接看结果。
          </p>
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all shadow-[0_0_30px_rgba(249,115,22,0.15)]"
          >
            开始测试 →
          </Link>
        </div>
      </section>
    </div>
  );
}
