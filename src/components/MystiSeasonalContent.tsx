'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { getCurrentSeasonalReport } from '@/lib/mysti/seasonal-reports';

export function MystiSeasonalContent() {
  const { theme } = useMystiTheme();
  const reduce = useReducedMotion();
  const report = useMemo(() => getCurrentSeasonalReport(), []);

  return (
    <div
      className="min-h-screen px-5 py-12"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Link
          href="/mysti/"
          className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
          style={{ color: theme.textMuted }}
        >
          ← 灵鉴首页
        </Link>

        {/* ── Hero ── */}
        <motion.header
          className="mt-6 text-center"
          initial={reduce ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-[11px] tracking-[0.42em] uppercase"
            style={{ color: report.accentHex }}
          >
            WTFTI · MYSTI · SEASONAL
          </p>
          <h1
            className="mt-3 text-5xl sm:text-6xl"
            style={{ color: theme.text, fontFamily: 'var(--font-display)', fontWeight: 400 }}
          >
            {report.label}
          </h1>
          <p
            className="mt-2 text-sm italic"
            style={{ color: theme.accentGold, fontFamily: 'var(--font-serif)' }}
          >
            {report.signLine}
          </p>
        </motion.header>

        {/* ── Epigraph ── */}
        <motion.blockquote
          className="mt-10 px-5 py-6 rounded-2xl border text-center"
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            background: `${theme.cardSurface}aa`,
            borderColor: report.accentHex + '55',
          }}
        >
          <p
            className="text-xl italic leading-relaxed"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            「{report.epigraph}」
          </p>
          {report.epigraphAttr && (
            <p className="mt-3 text-[11px] tracking-[0.32em] uppercase" style={{ color: theme.textSubtle }}>
              {report.epigraphAttr}
            </p>
          )}
        </motion.blockquote>

        {/* ── 5 章节 ── */}
        <ol className="mt-12 space-y-8 list-none">
          {report.sections.map((s, idx) => (
            <motion.li
              key={s.numeral}
              initial={reduce ? {} : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="rounded-2xl border p-6"
              style={{
                background: `${theme.cardSurface}cc`,
                borderColor: theme.cardBorder,
              }}
            >
              <header className="flex items-baseline gap-3 mb-3">
                <span
                  className="text-2xl italic"
                  style={{ color: report.accentHex, fontFamily: 'var(--font-display)' }}
                >
                  {s.numeral}
                </span>
                <span
                  className="text-[10px] tracking-[0.36em] uppercase"
                  style={{ color: theme.accentGold }}
                >
                  {s.eyebrow}
                </span>
              </header>
              <h2
                className="text-lg sm:text-xl mb-3"
                style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
              >
                {s.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
              >
                {s.body}
              </p>
            </motion.li>
          ))}
        </ol>

        {/* ── 仪式建议 ── */}
        <section
          className="mt-12 rounded-2xl border p-6"
          style={{
            background: `linear-gradient(135deg, ${theme.cardSurfaceElevated} 0%, ${theme.cardSurface} 100%)`,
            borderColor: theme.accentGold + '88',
          }}
        >
          <h3
            className="text-[11px] tracking-[0.42em] uppercase mb-4"
            style={{ color: theme.accentGold }}
          >
            ✦ 今夜的三件小事
          </h3>
          <ul className="space-y-3">
            {report.rituals.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm"
                style={{ color: theme.text, fontFamily: 'var(--font-serif)' }}
              >
                <span
                  className="shrink-0 italic"
                  style={{ color: report.accentHex }}
                >
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Footer / Disclaimer ── */}
        <footer className="mt-10 text-center">
          <p
            className="text-[10px] italic opacity-55"
            style={{ color: theme.textSubtle, fontFamily: 'var(--font-serif)' }}
          >
            灵鉴所述仅为暮光时分的隐喻 · 决定权永远在你手里
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs">
            <Link href="/mysti/decision/" style={{ color: theme.accent }}>
              ✦ 今日决策
            </Link>
            <span style={{ color: theme.divider }}>·</span>
            <Link href="/mysti/monthly/" style={{ color: theme.accent }}>
              ✦ 灵魂月报
            </Link>
            <span style={{ color: theme.divider }}>·</span>
            <Link href="/mysti/archive/" style={{ color: theme.accent }}>
              ✦ 关系档案
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
