'use client';

import Link from 'next/link';
import { IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import type { IdentifyModelType } from '@/lib/identify/dimensions';

const MODELS: { key: IdentifyModelType; label: string }[] = [
  { key: 'social', label: 'ta 在人群中是发电机还是充电器' },
  { key: 'emotion', label: 'ta 的情绪是矿泉水还是浓缩咖啡' },
  { key: 'drive', label: 'ta 是说干就干还是说躺就躺' },
  { key: 'vibe', label: 'ta 给人的感觉是暖阳还是高冷' },
  { key: 'loyalty', label: 'ta 对朋友是掏心掏肺还是点到为止' },
];

const HOW_IT_WORKS = [
  { step: '01', title: '输入好友昵称', desc: '给你要鉴定的人取个名（选填）' },
  { step: '02', title: '回答 10 道题', desc: '每道题都是关于 ta 的日常表现' },
  { step: '03', title: '生成鉴定书', desc: '看看 ta 在你眼中是什么人格' },
  { step: '04', title: '分享给 ta', desc: '不服？让 ta 自己来测！' },
];

export default function IdentifyHomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Friend Identifier · 好友人格鉴定
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              你朋友是
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">什么 WTF 人格？</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-4">
              不用 ta 来测——你来帮 ta 鉴定。
              <br />
              10 道题 · 鉴定 ta 的隐藏人格 · 生成鉴定书 · 分享给 ta 
            </p>

            <p className="text-text-muted text-sm mb-10">
              ta 不服？让 ta 自己来测对比一下 😏
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/identify/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-base hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
              >
                开始鉴定好友
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                ← 返回首页
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '5 维', label: '鉴定维度' },
              { value: '21 种', label: '可鉴定人格' },
              { value: '10 题', label: '约1分钟' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="animate-fade-up">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            鉴定流程
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HOW_IT_WORKS.map(item => (
              <div
                key={item.step}
                className="rounded-xl border border-border-subtle bg-bg-secondary/30 p-4 text-center"
              >
                <div className="text-2xl font-mono font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                  {item.step}
                </div>
                <div className="text-sm font-medium text-text-primary mb-1">{item.title}</div>
                <div className="text-xs text-text-muted">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Dimensions */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="animate-fade-up">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            五大鉴定维度
          </h2>

          <div className="grid gap-3">
            {MODELS.map(m => {
              const color = IDENTIFY_MODEL_COLORS[m.key];
              return (
                <div
                  key={m.key}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border-subtle bg-bg-secondary/30"
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-semibold"
                    style={{ background: color.bg, color: color.base }}
                  >
                    {m.key.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{IDENTIFY_MODEL_NAMES[m.key]}</div>
                    <div className="text-xs text-text-muted">{m.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="animate-fade-up-delay-1">
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary/30 p-8 sm:p-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold mb-3">想好鉴定谁了吗？</h2>
            <p className="text-text-secondary mb-6">10 道题，一分钟，生成鉴定书</p>
            <Link
              href="/identify/test"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-base hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              开始鉴定
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
