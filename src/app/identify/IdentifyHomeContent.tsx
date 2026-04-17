'use client';

import Link from 'next/link';
import { IdentifyHistoryPanel } from '@/components/IdentifyHistoryPanel';
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
      {/* ── Hero · Editorial magazine cover ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24 sm:pb-32">
          <div className="animate-fade-up">
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue 02</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">Friend Identifier</span>
            </div>

            <h1 className="editorial-display text-5xl sm:text-7xl md:text-8xl mb-8 max-w-4xl">
              你朋友<br />
              <span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>
                是什么 WTF 人格？
              </span>
            </h1>

            <hr className="editorial-rule w-24 mb-8" />

            <p className="text-base sm:text-lg leading-[1.85] text-text-secondary max-w-xl">
              不用 ta 来测——你来帮 ta 鉴定。<br className="hidden sm:block" />
              <span className="text-text-muted">ta 不服？让 ta 自己来测对比一下。</span>
            </p>
          </div>

          <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-4 animate-fade-up-delay-1">
            <Link href="/identify/test" className="btn btn-ink">
              开始鉴定
              <span className="opacity-60">→</span>
            </Link>
            <Link href="/" prefetch={false} className="btn btn-ghost">
              ← 返回首页
            </Link>
            <span className="eyebrow ml-2 hidden sm:inline">
              10 题 · 约 1 分钟 · 5 维度
            </span>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-3 animate-fade-up-delay-2" style={{ borderTop: '1px solid var(--color-rule-soft)', borderBottom: '1px solid var(--color-rule-soft)' }}>
            {[
              { value: '5', label: '鉴定维度' },
              { value: '21', label: '可鉴定人格' },
              { value: '10', label: '题 · 约 1 分钟' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="py-8 text-center"
                style={{ borderLeft: idx > 0 ? '1px solid var(--color-rule-soft)' : 'none' }}
              >
                <div className="stat-value text-4xl sm:text-5xl text-text-primary leading-none">{stat.value}</div>
                <div className="eyebrow mt-3">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-16" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="animate-fade-up">
          <IdentifyHistoryPanel variant="home" />
        </div>
      </section>

      {/* How it works — editorial index */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="animate-fade-up mb-12">
          <span className="serial-number text-xs mr-3">03</span>
          <span className="eyebrow">How it works</span>
          <h2 className="section-headline text-3xl sm:text-4xl mt-3">
            鉴定<span className="editorial-italic">流程</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}>
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="p-6 sm:p-8"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <div className="stat-value text-4xl mb-6 text-text-primary">{item.step}</div>
              <div className="text-base text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                {item.title}
              </div>
              <div className="text-xs text-text-muted leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Dimensions — editorial list */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="animate-fade-up mb-12">
          <span className="serial-number text-xs mr-3">04</span>
          <span className="eyebrow">Five dimensions</span>
          <h2 className="section-headline text-3xl sm:text-4xl mt-3">
            五大<span className="editorial-italic">鉴定维度</span>
          </h2>
        </div>

        <ul style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
          {MODELS.map((m, idx) => {
            const color = IDENTIFY_MODEL_COLORS[m.key];
            return (
              <li
                key={m.key}
                className="group flex items-center gap-6 sm:gap-10 py-6 sm:py-8"
                style={{ borderBottom: '1px solid var(--color-rule-soft)' }}
              >
                <span className="serial-number text-sm w-10 shrink-0">0{idx + 1}</span>
                <span
                  className="eyebrow shrink-0 w-20"
                  style={{ color: color.base }}
                >
                  {m.key}
                </span>
                <div className="flex-1">
                  <div className="text-lg sm:text-xl text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}>
                    {IDENTIFY_MODEL_NAMES[m.key]}
                  </div>
                  <div className="text-sm text-text-secondary italic" style={{ fontFamily: 'var(--font-editorial)' }}>
                    {m.label}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Final CTA — editorial block */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="animate-fade-up-delay-1 p-10 sm:p-16" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
          <div className="flex items-center gap-4 mb-8">
            <span className="serial-number text-xs">Coda</span>
            <span className="editorial-rule w-16" />
            <span className="eyebrow" style={{ color: 'var(--color-rose-deep)' }}>Final call</span>
          </div>
          <h2 className="editorial-display text-4xl sm:text-6xl mb-6 max-w-3xl">
            想好<span className="editorial-italic">鉴定谁</span>了吗？
          </h2>
          <p className="text-base sm:text-lg leading-[1.85] text-text-secondary max-w-xl mb-10">
            10 道题，约一分钟。鉴定书一份，分享链接一枚——足够让 ta 惊掉下巴。
          </p>
          <Link href="/identify/test" className="btn btn-rose">
            开始鉴定
            <span className="opacity-70">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
