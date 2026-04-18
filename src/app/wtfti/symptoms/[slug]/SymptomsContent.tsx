'use client';

import dynamic from 'next/dynamic';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import { WTFTI_PERSONALITIES, getWtftiTypeImage } from '@/lib/wtfti-personalities';
const SymptomsShareImageGenerator = dynamic(
  () => import('@/components/SymptomsShareImageGenerator').then((m) => m.SymptomsShareImageGenerator),
  { ssr: false },
);
import type { SymptomsShareImageHandle } from '@/components/SymptomsShareImageGenerator';
import { getSymptomsHeat } from '@/lib/symptoms-heat';

interface Props {
  personality: WtftiPersonality;
}

function getVerdict(hit: number, total: number, name: string): string {
  if (hit === 0) return '一枪没中？你确定不是在自我欺骗？';
  if (hit === total) return `全中 💀 你就是${name}本名无疑`;
  if (hit >= 4) return `中了 ${hit} 枪 😵 已确诊${name}`;
  if (hit >= 3) return `中了 ${hit} 枪 🫣 高度疑似${name}`;
  if (hit >= 2) return `中了 ${hit} 枪 🤔 有点像但你不想承认`;
  return `中了 ${hit} 枪 😌 轻微症状，还有救`;
}

export function SymptomsContent({ personality: p }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const shareRef = useRef<SymptomsShareImageHandle>(null);
  const heat = getSymptomsHeat(p.slug);

  const toggle = useCallback((i: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const hit = checked.size;
  const total = p.copy.symptoms.length;
  const pct = total > 0 ? hit / total : 0;

  // Suggest exploring another personality
  const others = WTFTI_PERSONALITIES.filter(o => o.slug !== p.slug);
  const randomOthers = others.sort(() => Math.random() - 0.5).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${p.color}10 0%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/wtfti/symptoms/"
              prefetch={false}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-6"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              全部症状清单
            </Link>

            <div className="text-5xl mb-4">{p.emoji}</div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: `${p.color}15`, color: p.color }}
              >
                WTF {p.number}
              </span>
              <span className="text-[11px] font-mono text-text-muted">{p.code}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {p.wtftiName}
            </h1>
            <p className="text-text-secondary text-sm max-w-sm mx-auto">
              {p.tagline}
            </p>

            {/* Heat stats */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <span className="text-red-500">🔥</span>
                {heat.participantsText}人打过勾
              </span>
              <span className="w-px h-3 bg-border-subtle" />
              <span className="text-xs text-text-muted">
                平均中 <span className="font-semibold" style={{ color: p.color }}>{heat.avgHits}</span> 枪
              </span>
              <span className="w-px h-3 bg-border-subtle" />
              <span className="text-xs text-text-muted">
                {heat.fullHitPct}% 全中
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Symptom Checklist */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          {/* Header with counter */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase">
              📋 隐藏症状清单
            </h2>
            <div className="flex items-center gap-1.5">
              <motion.span
                key={hit}
                initial={{ scale: 1.3, color: p.color }}
                animate={{ scale: 1, color: p.color }}
                className="text-2xl font-bold tabular-nums"
              >
                {hit}
              </motion.span>
              <span className="text-sm text-text-muted">/ {total}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full rounded-full"
              style={{ background: p.color }}
              initial={false}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          {/* Symptom items */}
          <div className="space-y-3">
            {p.copy.symptoms.map((symptom, i) => {
              const isChecked = checked.has(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => toggle(i)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isChecked
                      ? 'border-opacity-30 bg-opacity-5'
                      : 'border-border-subtle bg-bg-secondary/20 hover:bg-bg-secondary/40'
                  }`}
                  style={isChecked ? {
                    borderColor: `${p.color}40`,
                    backgroundColor: `${p.color}08`,
                  } : undefined}
                >
                  <span
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                      isChecked ? 'border-transparent' : 'border-border'
                    }`}
                    style={isChecked ? { background: p.color, borderColor: p.color } : undefined}
                  >
                    {isChecked && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </span>
                  <span className={`text-sm leading-relaxed transition-colors ${
                    isChecked ? 'text-text-primary' : 'text-text-secondary'
                  }`}>
                    {symptom}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Verdict */}
          <AnimatePresence>
            {hit > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-5 border-t border-border-subtle text-center">
                  <motion.p
                    key={hit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-text-secondary"
                  >
                    {getVerdict(hit, total, p.wtftiName)}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Share section */}
      <AnimatePresence>
        {hit > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto px-6 pb-8"
          >
            <div
              className="rounded-2xl border p-6 sm:p-8 text-center"
              style={{ borderColor: `${p.color}25`, background: `${p.color}06` }}
            >
              <p className="text-sm text-text-secondary mb-4">
                {hit >= total
                  ? '全中了…不分享一下让朋友也来对号入座？'
                  : `中了 ${hit} 枪，发给朋友看看 ta 能中几枪`}
              </p>
              <div className="max-w-sm mx-auto">
                <SymptomsShareImageGenerator
                  ref={shareRef}
                  personality={p}
                  hitCount={hit}
                  totalSymptoms={total}
                  checkedIndexes={checked}
                />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CTA: 去做完整测试 */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 text-center"
        >
          <p className="text-sm text-text-secondary mb-4">
            想知道你到底是不是{p.wtftiName}？
          </p>
          <Link
            href="/wtfti/test"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ background: p.color }}
          >
            去做完整 WTF 测试 →
          </Link>
        </motion.div>
      </section>

      {/* Other symptoms */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
          看看其他症状
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {randomOthers.map(o => (
            <Link
              key={o.slug}
              href={`/wtfti/symptoms/${o.slug}/`}
              prefetch={false}
              className="group rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all p-4"
            >
              <div className="text-xl mb-1.5">{o.emoji}</div>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                {o.wtftiName}
              </h3>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {o.copy.symptoms[0]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
