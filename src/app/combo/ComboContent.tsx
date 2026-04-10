'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { PERSONALITY_TYPES, getTypeImage } from '@/lib/personalities';
import {
  MBTI_TYPES, ZODIAC_SIGNS, ELEMENT_LABELS,
  generateCombo,
} from '@/lib/combo';
import type { ComboResult } from '@/lib/combo';
import { ComboShareImageGenerator } from '@/components/ComboShareImageGenerator';
import type { ComboShareImageGeneratorHandle } from '@/components/ComboShareImageGenerator';

// ─── Step indicator ──────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-8 bg-accent' : i === current ? 'w-8 bg-accent/50' : 'w-4 bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}

// ─── SBTI type picker ────────────────────────────────────

function SBTIPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的 SBTI 人格</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        还没测过？<Link href="/test" className="text-accent hover:underline">先去测一下</Link>
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {PERSONALITY_TYPES.filter(p => !p.isSpecial).map(p => (
          <button
            key={p.slug}
            onClick={() => onSelect(p.slug)}
            className={`group relative rounded-xl border p-2 text-center transition-all cursor-pointer ${
              selected === p.slug
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="w-10 h-10 mx-auto mb-1 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
              <NextImage
                src={getTypeImage(p.slug)}
                alt={p.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[10px] font-mono tracking-wider" style={{ color: p.color }}>{p.code}</div>
            <div className="text-xs text-text-primary">{p.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MBTI picker ─────────────────────────────────────────

function MBTIPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的 MBTI</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        不确定？挑一个你觉得最像的就行
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MBTI_TYPES.map(m => (
          <button
            key={m.code}
            onClick={() => onSelect(m.code)}
            className={`rounded-xl border py-3 px-2 text-center transition-all cursor-pointer ${
              selected === m.code
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="text-sm font-mono font-semibold text-text-primary">{m.code}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Zodiac picker ───────────────────────────────────────

function ZodiacPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的星座</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        你的太阳星座就行
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ZODIAC_SIGNS.map(z => (
          <button
            key={z.id}
            onClick={() => onSelect(z.id)}
            className={`rounded-xl border py-3 px-2 text-center transition-all cursor-pointer ${
              selected === z.id
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="text-xl mb-0.5">{z.emoji}</div>
            <div className="text-sm text-text-primary">{z.name}</div>
            <div className="text-[10px] text-text-muted">{ELEMENT_LABELS[z.element]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Result display ──────────────────────────────────────

function ComboResultDisplay({ result }: { result: ComboResult }) {
  const shareRef = useRef<ComboShareImageGeneratorHandle>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Easter egg badge */}
      {result.isEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border border-amber-400/30 bg-amber-400/10 text-amber-400">
            🥚 隐藏彩蛋组合
          </span>
        </motion.div>
      )}

      {/* Three badges row */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
          style={{ color: result.personality.color, background: `${result.personality.color}12`, borderColor: `${result.personality.color}30` }}
        >
          {result.personality.emoji} {result.personality.code}
        </span>
        <span className="text-text-muted text-xs">×</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-purple-400/30 bg-purple-400/10 text-purple-300">
          {result.mbti.code}
        </span>
        <span className="text-text-muted text-xs">×</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          {result.zodiac.emoji} {result.zodiac.name}
        </span>
      </div>

      {/* Character image */}
      <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden" style={{ background: `${result.personality.color}15` }}>
        <NextImage
          src={getTypeImage(result.personality.slug)}
          alt={result.personality.name}
          width={128}
          height={128}
          className="w-full h-full object-contain p-1"
        />
      </div>

      {/* Combo title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent"
      >
        {result.title}
      </motion.h1>

      {/* Sub info */}
      <p className="text-sm text-text-muted text-center mb-8">
        {result.personality.name} · {result.mbti.code} · {result.zodiac.name}
      </p>

      {/* Roast card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm mb-8"
      >
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-5">
          毒舌拼盘分析
        </h2>
        <div className="space-y-4">
          {result.roasts.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex gap-3"
            >
              <span className="text-accent shrink-0 mt-0.5">▸</span>
              <p className="text-text-secondary leading-relaxed text-[15px]">{line}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Share section */}
      <div className="space-y-3 mb-8">
        <ComboShareImageGenerator ref={shareRef} result={result} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/result/${result.personality.slug}/`}
          className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
        >
          查看 SBTI 详情
        </Link>
        <Link
          href="/test"
          className="flex-1 py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/10 transition-all text-center"
        >
          重新测试
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main content ────────────────────────────────────────

export function ComboContent() {
  const searchParams = useSearchParams();
  const preselectedSBTI = searchParams.get('sbti');

  const [sbtiSlug, setSbtiSlug] = useState<string | null>(preselectedSBTI);
  const [mbtiCode, setMbtiCode] = useState<string | null>(null);
  const [zodiacId, setZodiacId] = useState<string | null>(null);
  const [result, setResult] = useState<ComboResult | null>(null);

  const handleSBTISelect = useCallback((slug: string) => {
    setSbtiSlug(slug);
  }, []);

  const handleMBTISelect = useCallback((code: string) => {
    setMbtiCode(code);
  }, []);

  const handleZodiacSelect = useCallback((id: string) => {
    setZodiacId(id);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!sbtiSlug || !mbtiCode || !zodiacId) return;
    const comboResult = generateCombo(sbtiSlug, mbtiCode, zodiacId);
    if (comboResult) {
      setResult(comboResult);
    }
  }, [sbtiSlug, mbtiCode, zodiacId]);

  const handleReset = useCallback(() => {
    setResult(null);
    setMbtiCode(null);
    setZodiacId(null);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-4">
            🧩 人格拼盘
          </div>
          {!result && (
            <>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                解锁你的人格拼盘
              </h1>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                把 SBTI 人格 × MBTI × 星座拼在一起，看看能拼出什么离谱称号
              </p>
            </>
          )}
        </motion.div>

        {!result && <StepIndicator current={sbtiSlug ? (mbtiCode ? (zodiacId ? 3 : 2) : 1) : 0} total={3} />}

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComboResultDisplay result={result} />
              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="text-sm text-text-muted hover:text-accent transition-colors cursor-pointer"
                >
                  换个组合试试 →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Step 1: SBTI */}
              {!preselectedSBTI && (
                <div className="mb-10">
                  <SBTIPicker selected={sbtiSlug} onSelect={handleSBTISelect} />
                </div>
              )}

              {/* Pre-selected SBTI badge */}
              {preselectedSBTI && sbtiSlug && (() => {
                const p = PERSONALITY_TYPES.find(t => t.slug === sbtiSlug);
                return p ? (
                  <div className="flex items-center justify-center gap-2 mb-8 p-3 rounded-xl border border-border-subtle bg-bg-secondary/40">
                    <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
                      <NextImage src={getTypeImage(p.slug)} alt={p.name} width={32} height={32} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-medium">{p.code}（{p.name}）</span>
                    <span className="text-xs text-text-muted">— 你的 SBTI 人格</span>
                  </div>
                ) : null;
              })()}

              {/* Step 2: MBTI */}
              {sbtiSlug && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <MBTIPicker selected={mbtiCode} onSelect={handleMBTISelect} />
                </motion.div>
              )}

              {/* Step 3: Zodiac */}
              {sbtiSlug && mbtiCode && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <ZodiacPicker selected={zodiacId} onSelect={handleZodiacSelect} />
                </motion.div>
              )}

              {/* Generate button */}
              {sbtiSlug && mbtiCode && zodiacId && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <button
                    onClick={handleGenerate}
                    className="w-full py-4 rounded-2xl bg-accent text-bg-primary font-semibold text-base hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    🧩 解锁我的人格拼盘
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
