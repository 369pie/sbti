'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { getSoultiPersonalityBySlug, getSoultiResonance } from '@/lib/soulti/personalities';
import type { SoultiDimensionScore, SoultiLayeredResult } from '@/lib/soulti/scoring';
import {
  getCrossReadingsForCode,
  getRepairForCode,
  getSoulLetterForCode,
  getCurrentWeeklyPrompt,
} from '@/lib/soulti/deep-report';
import { useEffect, useState } from 'react';

interface Props {
  personality: SoultiPersonalityType;
  dimensionScores: SoultiDimensionScore[];
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

/**
 * ⚠️ PAYMENT RESERVATION:
 * This page currently shows all content freely.
 * When payment is integrated, wrap sections 2-4 (cross-readings,
 * repair prescription, soul letter) in a payment gate component.
 * The gate should check a payment token in localStorage or via API.
 * See docs/02-modules/soulti/soulti-payment-features.md for the full plan.
 */
export function SoultiDeepReportContent({ personality, dimensionScores }: Props) {
  const [layered, setLayered] = useState<SoultiLayeredResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('soulti-layered');
      if (!raw) return;
      const data = JSON.parse(raw) as SoultiLayeredResult;
      if (data.overall?.slug === personality.slug) {
        setLayered(data);
      }
    } catch { /* ignore */ }
  }, [personality.slug]);

  const crossReadings = getCrossReadingsForCode(personality.code);
  const repair = getRepairForCode(personality.code);
  const soulLetter = getSoulLetterForCode(personality.code);
  const resonance = getSoultiResonance(personality.slug);
  const weeklyPrompt = getCurrentWeeklyPrompt();

  // Three mirrors data
  const dayP = layered ? getSoultiPersonalityBySlug(layered.daySelf.slug) : null;
  const nightP = layered ? getSoultiPersonalityBySlug(layered.nightSelf.slug) : null;
  const dreamP = layered ? getSoultiPersonalityBySlug(layered.dreamTendency.slug) : null;

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>

      {/* ── Header ── */}
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-4">
        <Link
          href={`/soulti/result/${personality.slug}`}
          className="text-xs tracking-wider text-[#6A6054] hover:text-[#7A6A5A] font-medium transition-colors"
          style={{ fontFamily: monoFont }}
        >
          ← 返回结果页
        </Link>
      </header>

      {/* ══════════════════════════════════════════════
          SECTION 0: Report Hero
         ══════════════════════════════════════════════ */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pt-8 pb-12 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="text-[10px] tracking-[0.35em] uppercase mb-6"
          style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
        >
          DEEP MIRROR REPORT
        </p>

        <div className="text-4xl mb-4">{personality.emoji}</div>

        <h1
          className="text-2xl sm:text-3xl mb-2"
          style={{ fontFamily: serifFont, fontWeight: 400, color: '#2D2A26', letterSpacing: '0.02em' }}
        >
          {personality.name}的深度镜像
        </h1>

        <p
          className="text-sm tracking-[0.2em] mb-3"
          style={{ fontFamily: monoFont, color: personality.color }}
        >
          {personality.code}
        </p>

        <p
          className="text-sm leading-relaxed text-[#6A6054] max-w-md mx-auto"
          style={{ fontFamily: serifFont, fontStyle: 'italic' }}
        >
          {personality.tagline}
        </p>
      </motion.section>

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 1: Three Mirrors Overview (if available)
         ══════════════════════════════════════════════ */}
      {layered && dayP && nightP && dreamP && (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <h2
            className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-2"
            style={{ fontFamily: serifFont }}
          >
            THREE MIRRORS · 三面镜子
          </h2>
          <p className="text-xs text-[#7A6A5A] mb-8 font-medium" style={{ fontFamily: serifFont }}>
            同一个你，在不同时刻呈现的自然力
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Day Self', name: '白天的你', p: dayP, emoji: '☀️' },
              { label: 'Night Self', name: '深夜的你', p: nightP, emoji: '🌙' },
              { label: 'Dream Self', name: '梦里的你', p: dreamP, emoji: '💭' },
            ].map(({ label, name, p, emoji }) => (
              <div
                key={label}
                className="rounded-2xl border p-4 sm:p-5 text-center"
                style={{ borderColor: `${p.color}20`, background: p.slug === personality.slug ? `${p.color}08` : '#FDFCFA' }}
              >
                <p className="text-[10px] tracking-[0.2em] text-[#8b7355] font-medium uppercase mb-3" style={{ fontFamily: serifFont }}>
                  {label}
                </p>
                <div className="text-2xl mb-2">{emoji}</div>
                <p className="text-sm tracking-[0.15em] mb-1" style={{ fontFamily: serifFont, color: p.color }}>
                  {p.name}
                </p>
                <p className="text-[10px] text-[#6A6054] font-semibold tracking-wider font-mono mb-2">
                  {p.code}
                </p>
                <p className="text-[11px] leading-relaxed text-text-primary line-clamp-2 text-[12px] font-medium" style={{ fontFamily: serifFont }}>
                  {p.tagline}
                </p>
                <p className="text-[10px] text-[#6A6054] font-medium mt-2" style={{ fontFamily: serifFont }}>
                  {name}
                </p>
              </div>
            ))}
          </div>

          {layered.daySelf.slug !== layered.nightSelf.slug && (
            <div
              className="rounded-xl border p-5 sm:p-6"
              style={{ borderColor: `${personality.color}15`, background: `${personality.color}04` }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase mb-3"
                style={{ fontFamily: serifFont, color: personality.color, opacity: 0.6 }}
              >
                TENSION · 张力解读
              </p>
              <p
                className="text-sm leading-[2] text-[#6A6054]"
                style={{ fontFamily: serifFont }}
              >
                白天你是<span style={{ color: dayP.color }}>{dayP.name}</span>，
                深夜你变成<span style={{ color: nightP.color }}>{nightP.name}</span>。
                这不是你的"前后不一"——这是你在不同能量状态下的自然切换。
                白天你用一套方式保护自己、维持关系；深夜，当社会面具卸下，
                你的另一层需求和模式才浮出水面。
                理解这种张力，不是为了选一边，而是为了让两个你都被看见。
              </p>
            </div>
          )}
        </motion.section>
      )}

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2: Axis Cross-Interpretations
          ⚠️ PAYMENT GATE: wrap this section when payment is enabled
         ══════════════════════════════════════════════ */}
      <motion.section
        className="max-w-2xl mx-auto px-6 py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        <h2
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-2"
          style={{ fontFamily: serifFont }}
        >
          AXIS CROSS · 轴间交叉解读
        </h2>
        <p className="text-xs text-[#7A6A5A] mb-10 font-medium" style={{ fontFamily: serifFont }}>
          单一维度只能看到轮廓，交叉才能看到你的模式
        </p>

        <div className="space-y-8">
          {crossReadings.map((reading, i) => (
            <motion.div
              key={reading.axes + reading.label}
              className="rounded-2xl border p-6 sm:p-8"
              style={{ borderColor: `${personality.color}12`, background: '#FDFCFA' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[10px] tracking-[0.2em] px-2 py-1 rounded-md"
                  style={{ fontFamily: monoFont, color: personality.color, background: `${personality.color}10` }}
                >
                  {reading.axes}
                </span>
                <span className="text-xs text-[#6A6054]" style={{ fontFamily: serifFont }}>
                  {reading.title}
                </span>
              </div>

              <h3
                className="text-lg mb-1"
                style={{ fontFamily: serifFont, color: '#2D2A26' }}
              >
                {reading.label} · {reading.tagline}
              </h3>

              <p
                className="text-sm leading-[2] text-[#7A6A5A] mb-4 font-medium"
                style={{ fontFamily: serifFont }}
              >
                {reading.interpretation}
              </p>

              <div
                className="text-xs px-4 py-3 rounded-lg"
                style={{
                  fontFamily: serifFont,
                  color: personality.color,
                  background: `${personality.color}08`,
                  fontStyle: 'italic',
                }}
              >
                你的关系模式：{reading.relationalPattern}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 3: Repair Prescription
          ⚠️ PAYMENT GATE: wrap this section when payment is enabled
         ══════════════════════════════════════════════ */}
      {repair && (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2
            className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-2"
            style={{ fontFamily: serifFont }}
          >
            REPAIR · 修复处方
          </h2>
          <p className="text-xs text-[#7A6A5A] mb-4 font-medium" style={{ fontFamily: serifFont }}>
            基于你的蜕变轴：{repair.typeLabel}
          </p>

          <div
            className="rounded-xl border p-5 sm:p-6 mb-8"
            style={{ borderColor: `${personality.color}15`, background: `${personality.color}04` }}
          >
            <p
              className="text-sm leading-[2] text-[#6A6054]"
              style={{ fontFamily: serifFont, fontStyle: 'italic' }}
            >
              {repair.metaphor}
            </p>
          </div>

          <div className="space-y-5">
            {repair.strategies.map((strategy, i) => (
              <motion.div
                key={strategy.title}
                className="rounded-2xl border p-5 sm:p-6"
                style={{ borderColor: `${personality.color}10`, background: '#FDFCFA' }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06, duration: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{ fontFamily: monoFont, color: personality.color, background: `${personality.color}12` }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h4
                      className="text-sm mb-2"
                      style={{ fontFamily: serifFont, color: '#2D2A26' }}
                    >
                      {strategy.title}
                    </h4>
                    <p
                      className="text-[13px] leading-[2] text-[#6A6054]"
                      style={{ fontFamily: serifFont }}
                    >
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 4: Soul Letter
          ⚠️ PAYMENT GATE: wrap this section when payment is enabled
         ══════════════════════════════════════════════ */}
      {soulLetter && (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2
            className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-8"
            style={{ fontFamily: serifFont }}
          >
            SOUL LETTER · 写给你的信
          </h2>

          <div
            className="rounded-2xl border p-8 sm:p-10"
            style={{
              borderColor: `${personality.color}18`,
              background: 'linear-gradient(180deg, #FDFCFA 0%, #F8F5F0 100%)',
            }}
          >
            <p
              className="text-base mb-6"
              style={{ fontFamily: serifFont, color: personality.color }}
            >
              {soulLetter.opening}
            </p>

            <div className="space-y-5">
              {soulLetter.body.map((para, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-[2.2] text-[#6A6054]"
                  style={{ fontFamily: serifFont }}
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: `${personality.color}15` }}>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: serifFont, color: personality.color, fontStyle: 'italic' }}
              >
                {soulLetter.closing}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 5: Soul Resonance (deeper version)
         ══════════════════════════════════════════════ */}
      {resonance && (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <h2
            className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-8"
            style={{ fontFamily: serifFont }}
          >
            DEEP RESONANCE · 灵魂共振深度版
          </h2>

          <div className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(145deg, #2A2520 0%, #1A1715 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(36, 33, 29, 0.1)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3
              className="text-2xl tracking-wider mb-1"
              style={{ fontFamily: serifFont, fontWeight: 400, color: 'rgba(255,255,255,0.95)' }}
            >
              {resonance.soulOrigin.name}
            </h3>
            <p
              className="text-sm tracking-[0.2em] mb-1"
              style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.65)' }}
            >
              {resonance.soulOrigin.zhName}
            </p>
            <p
              className="text-xs tracking-wider mb-6"
              style={{ fontFamily: serifFont, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}
            >
              {resonance.soulOrigin.era}
            </p>

            <p className="text-sm leading-[2] mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {resonance.soulOrigin.description}
            </p>

            {resonance.quote && (
              <blockquote
                className="border-l-2 pl-4 mb-6"
                style={{ borderColor: `${personality.color}60` }}
              >
                <p
                  className="text-sm leading-[1.8]"
                  style={{ fontFamily: serifFont, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}
                >
                  &ldquo;{resonance.quote}&rdquo;
                </p>
              </blockquote>
            )}

            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.75)' }}
            >
              她以和你相同的方式存在过——以{personality.name}的方式。
              你们共享同一种自然力。她的故事还没说完。你的，刚刚开始。
            </p>
          </div>
        </motion.section>
      )}

      {/* ── Thin divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/40" />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 6: Weekly Mirror Prompt
         ══════════════════════════════════════════════ */}
      <motion.section
        className="max-w-2xl mx-auto px-6 py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-2"
          style={{ fontFamily: serifFont }}
        >
          THIS WEEK&apos;S MIRROR · 本周镜像
        </h2>
        <p className="text-xs text-[#7A6A5A] mb-8 font-medium" style={{ fontFamily: serifFont }}>
          每周一个问题，照见你的变化
        </p>

        <div
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{ borderColor: `${personality.color}12`, background: '#FDFCFA' }}
        >
          <span
            className="text-[10px] tracking-[0.2em] px-2 py-1 rounded-md inline-block mb-4"
            style={{ fontFamily: monoFont, color: personality.color, background: `${personality.color}10` }}
          >
            {weeklyPrompt.axis}
          </span>
          <p
            className="text-base leading-[2]"
            style={{ fontFamily: serifFont, color: '#2D2A26' }}
          >
            {weeklyPrompt.prompt}
          </p>
          <p
            className="text-[10px] text-[#6A6054] font-medium mt-4"
            style={{ fontFamily: serifFont }}
          >
            WEEK {weeklyPrompt.week} · 每周更新
          </p>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════
          SECTION 7: Five-axis bars (repeated for context)
         ══════════════════════════════════════════════ */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        <h3
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-6"
          style={{ fontFamily: serifFont }}
        >
          {personality.code} · 五轴画像
        </h3>

        <div className="rounded-2xl border border-border-subtle/60 p-6 sm:p-8 space-y-6" style={{ background: '#FDFCFA' }}>
          {dimensionScores.map(ds => {
            const dim = SOULTI_DIMENSIONS.find(d => d.id === ds.id);
            if (!dim) return null;
            const color = SOULTI_MODEL_COLORS[dim.model];
            const pct = ((ds.score - 1) / 2) * 100;
            return (
              <div key={ds.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                    <span className="text-sm text-text-primary">{SOULTI_MODEL_NAMES[dim.model]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7A6A5A] font-medium">
                    <span>{dim.poleALabel}</span>
                    <span className="font-mono">{ds.level}</span>
                    <span>{dim.poleBLabel}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color.base}, ${color.light})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <p className="text-xs text-[#7A6A5A] font-medium mt-1.5">{dim.levels[ds.level]}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Closing ── */}
      <motion.section
        className="max-w-xl mx-auto px-6 pb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
      >
        <div className="max-w-xs mx-auto mb-8">
          <div className="border-t border-border-subtle/40" />
        </div>
        <p
          className="text-sm leading-[2] text-[#7A6A5A] mb-8 font-medium"
          style={{ fontFamily: serifFont, fontStyle: 'italic' }}
        >
          这份报告不是一个答案，<br />
          而是一面镜子，帮你看见你一直在做的事。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/soulti/result/${personality.slug}`}
            className="px-8 py-3 rounded-full text-sm border border-border-subtle text-[#7A6A5A] font-medium hover:bg-bg-secondary/30 transition-all"
            style={{ fontFamily: serifFont }}
          >
            ← 返回结果
          </Link>
          <Link
            href="/soulti/test"
            className="px-8 py-3 rounded-full text-sm text-white transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${personality.color}cc, ${personality.color})`,
              fontFamily: serifFont,
              letterSpacing: '0.1em',
            }}
          >
            重新探索
          </Link>
        </div>
      </motion.section>

      <div className="h-16" />
    </div>
  );
}
