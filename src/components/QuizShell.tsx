'use client';

/**
 * QuizShell · 统一答题页布局组件（editorial 风）
 *
 * 用法：
 *   <QuizShell
 *     currentIndex={i}
 *     total={n}
 *     direction={dir}
 *     onBack={handleBack}
 *     accent="#A85A6E"
 *     eyebrow="XPTI · Intimacy"
 *     topSlot={<UniversePicker current="xpti" />}
 *     dimensionLabel="操控张力 Dominance"
 *     finishing={isFinishing}
 *     finishingLabel="正在解码你的亲密偏好图谱…"
 *   >
 *     <QuestionBody questionId={q.id}>
 *       <QuestionTitle>{q.text}</QuestionTitle>
 *       <QuizOptions>...</QuizOptions>
 *     </QuestionBody>
 *   </QuizShell>
 *
 * 设计原则：
 *   - 与首页 editorial 一致：cream paper 底、1px rule 进度条、serial-number 题号、serif 题干。
 *   - 移动优先：单列、56px 触控目标、安全区适配。
 *   - 通过 `accent` 单一色变量适配各宇宙（XPTI wine、CPTI rose、SBTI ink…）。
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizShellProps {
  currentIndex: number;
  total: number;
  /** Optional extra progress fragment (e.g. drink branch) appended after `01 / 10`. */
  branchExtraLabel?: string;
  /** Optional progress override 0..1. Defaults to currentIndex / total. */
  progress?: number;
  direction?: 1 | -1;
  onBack?: () => void;
  /** Hex color used for the progress fill / option ring. Defaults to ink. */
  accent?: string;
  /** Small all-caps label shown on the progress row right side. */
  eyebrow?: string;
  /** Optional pill label for the current dimension (above question). */
  dimensionLabel?: string;
  /** Optional element rendered above the progress (e.g. UniversePicker). */
  topSlot?: ReactNode;
  /** Footer brand line. Default: "WTFti · Quiz". */
  footerLabel?: string;
  /** Page bg. Defaults to var(--color-paper). */
  background?: string;
  /** Whether finishing overlay should display. */
  finishing?: boolean;
  finishingLabel?: string;
  children: ReactNode;
}

export function QuizShell({
  currentIndex,
  total,
  branchExtraLabel,
  progress: progressOverride,
  direction = 1,
  onBack,
  accent = 'var(--color-ink)',
  eyebrow,
  dimensionLabel,
  topSlot,
  footerLabel = 'WTFti · Quiz',
  background = 'var(--color-paper)',
  finishing,
  finishingLabel = '正在生成结果…',
  children,
}: QuizShellProps) {
  const pageClass =
    'min-h-[calc(100dvh-3.5rem)] w-full flex flex-col relative overflow-hidden paper-texture';

  const computed = total > 0 ? currentIndex / total : 0;
  const ratio = typeof progressOverride === 'number' ? progressOverride : computed;
  const progress = Math.max(0, Math.min(100, Math.round(ratio * 100)));

  return (
    <div className={pageClass} style={{ background }}>
      {topSlot && (
        <div className="max-w-2xl mx-auto w-full px-6 pt-4 sm:pt-6 flex justify-center">
          {topSlot}
        </div>
      )}

      {/* Top bar: back + serial */}
      <header className="max-w-2xl mx-auto w-full px-6 pt-4 sm:pt-6 pb-2 flex items-center justify-between">
        {onBack && currentIndex > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] tracking-[0.3em] uppercase text-text-muted hover:text-text-primary transition-colors min-h-11 -mx-2 px-2 cursor-pointer"
            aria-label="上一题"
          >
            ← 上一题
          </button>
        ) : (
          <span className="min-h-11" aria-hidden />
        )}
        <div className="flex items-center gap-3">
          {eyebrow && (
            <span className="hidden sm:inline text-[10px] tracking-[0.32em] uppercase text-text-muted">
              {eyebrow}
            </span>
          )}
          <span className="serial-number text-xs" style={{ color: accent }}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            {branchExtraLabel && (
              <span className="ml-1.5 text-[10px] tracking-[0.2em] uppercase opacity-80">
                {branchExtraLabel}
              </span>
            )}
          </span>
        </div>
      </header>

      {/* Progress rule (1px editorial) */}
      <div className="max-w-2xl mx-auto w-full px-6 mt-2">
        <div className="h-[2px] w-full" style={{ background: 'var(--color-rule-soft)' }}>
          <motion.div
            className="h-full"
            style={{ background: accent }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Question body */}
      <main className="max-w-2xl mx-auto w-full px-6 flex-1 flex flex-col justify-center py-8 sm:py-12">
        {dimensionLabel && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-[0.18em] uppercase"
              style={{
                color: accent,
                border: `1px solid ${accent}`,
                background: 'transparent',
              }}
            >
              {dimensionLabel}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, y: direction * 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-2xl mx-auto w-full px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-text-muted">{footerLabel}</p>
      </footer>

      <AnimatePresence>
        {finishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background }}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-8 max-w-md"
            >
              <div
                className="mx-auto mb-8 h-px w-16"
                style={{ background: accent }}
                aria-hidden
              />
              <p className="font-display text-2xl sm:text-3xl text-text-primary leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                {finishingLabel}
              </p>
              <div className="mt-8 flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="block h-1.5 w-1.5 rounded-full"
                    style={{ background: accent }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** ── Question title (serif editorial) ────────────────────────── */
export function QuestionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-center leading-[1.25] tracking-tight text-2xl sm:text-3xl md:text-[2rem] mb-8 sm:mb-10"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        color: 'var(--color-ink)',
        letterSpacing: '-0.015em',
      }}
    >
      {children}
    </h2>
  );
}

/** ── Option list wrapper ─────────────────────────────────────── */
export function QuizOptions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2.5 sm:gap-3 max-w-md mx-auto w-full">{children}</div>;
}

/** ── Single editorial option button ──────────────────────────── */
interface QuizOptionProps {
  /** Optional letter/number marker (A/B/C/1/2/3). */
  marker?: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional secondary line below label. */
  description?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** Hex color used for selected ring + marker. */
  accent?: string;
  onSelect: () => void;
}

export function QuizOption({
  marker,
  label,
  description,
  selected,
  disabled,
  accent = 'var(--color-ink)',
  onSelect,
}: QuizOptionProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileTap={{ scale: 0.985 }}
      className={`group relative w-full text-left transition-all duration-200 cursor-pointer min-h-[60px] disabled:cursor-not-allowed disabled:opacity-70 px-5 py-4 sm:px-6 sm:py-5 rounded-[14px] ${
        selected ? 'shadow-sm' : 'hover:shadow-sm'
      }`}
      style={{
        background: selected ? 'var(--color-bg-elevated)' : 'var(--color-bg-elevated)',
        border: selected ? `1.5px solid ${accent}` : '1px solid var(--color-rule-soft)',
      }}
    >
      <div className="flex items-center gap-4">
        {marker && (
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono transition-colors tabular-nums"
            style={{
              background: selected ? accent : 'transparent',
              color: selected ? '#FFFFFF' : 'var(--color-ink-mute)',
              border: selected ? `1px solid ${accent}` : '1px solid var(--color-rule)',
            }}
          >
            {marker}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span
            className={`block text-[15px] sm:text-base leading-[1.5] transition-colors ${
              selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
            }`}
          >
            {label}
          </span>
          {description && (
            <span className="mt-1 block text-xs text-text-muted leading-relaxed">{description}</span>
          )}
        </span>
        <span
          className="flex-shrink-0 h-px transition-all duration-300"
          style={{
            background: accent,
            width: selected ? 18 : 8,
            opacity: selected ? 1 : 0.4,
          }}
          aria-hidden
        />
      </div>
    </motion.button>
  );
}
