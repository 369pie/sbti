'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import {
  MOOD_OPTIONS,
  recordMood,
  getTodayMood,
  getMoodHistory,
  getMoodStats,
  type MoodEntry,
  type MoodId,
} from '@/lib/mysti/mood';

export function MystiMoodContent() {
  const { theme } = useMystiTheme();
  const [today, setToday] = useState<MoodEntry | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<Record<MoodId, number> | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = getTodayMood();
    setToday(t);
    setHistory(getMoodHistory(30));
    setStats(getMoodStats(30));
    if (t?.note) setNote(t.note);
  }, []);

  const handlePick = (mood: MoodId) => {
    const entry = recordMood(mood, note || undefined);
    setToday(entry);
    setHistory(getMoodHistory(30));
    setStats(getMoodStats(30));
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 1800);
  };

  const total = stats ? Object.values(stats).reduce((s, n) => s + n, 0) : 0;

  return (
    <div
      className="min-h-screen px-5 py-12"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link
            href="/mysti/"
            className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
            style={{ color: theme.textMuted }}
          >
            ← 灵鉴首页
          </Link>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            今日心情
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            一个 emoji 标记今天，30 天后自动汇成你的灵魂月报
          </p>
        </div>

        {/* 选择 */}
        <section
          className="rounded-2xl border p-6 mb-8"
          style={{
            background: `${theme.cardSurface}aa`,
            borderColor: theme.cardBorder,
          }}
        >
          <div className="text-xs tracking-[0.16em] uppercase mb-4 text-center" style={{ color: theme.accent }}>
            {today ? '今日已记录 · 可覆盖' : '请选择当下的状态'}
          </div>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {MOOD_OPTIONS.map(opt => {
              const active = today?.mood === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePick(opt.id)}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-4 transition-all hover:scale-[1.04] focus:outline-none"
                  style={{
                    background: active ? theme.accentSoft : 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: active ? theme.accent : theme.divider,
                    color: theme.text,
                  }}
                  aria-pressed={active}
                >
                  <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                  <span className="text-[10px] sm:text-xs" style={{ color: theme.textMuted }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label
              htmlFor="mood-note"
              className="block text-[11px] tracking-[0.16em] uppercase mb-2"
              style={{ color: theme.textSubtle }}
            >
              一句话备注（可选）
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 80))}
              placeholder="今天的灵魂在哪个房间？"
              rows={2}
              className="w-full rounded-lg border p-3 text-sm bg-transparent focus:outline-none focus:ring-1"
              style={{
                borderColor: theme.divider,
                color: theme.text,
              }}
            />
            <div className="text-[10px] mt-1 text-right" style={{ color: theme.textSubtle }}>
              {note.length}/80
            </div>
          </div>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-xs"
                style={{ color: theme.accent }}
              >
                ✦ 已记入今天的灵魂轨迹
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 30 天概览 */}
        {stats && total > 0 && (
          <section
            className="rounded-2xl border p-6 mb-8"
            style={{
              background: `${theme.cardSurface}aa`,
              borderColor: theme.cardBorder,
            }}
          >
            <div className="text-xs tracking-[0.16em] uppercase mb-4" style={{ color: theme.accent }}>
              近 30 天分布
            </div>
            <div className="space-y-2">
              {MOOD_OPTIONS.map(opt => {
                const n = stats[opt.id] ?? 0;
                const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                return (
                  <div key={opt.id} className="flex items-center gap-3 text-xs">
                    <span className="text-base w-6 text-center">{opt.emoji}</span>
                    <span className="w-14 shrink-0" style={{ color: theme.textMuted }}>
                      {opt.label}
                    </span>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: `${theme.divider}` }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right" style={{ color: theme.textSubtle }}>
                      {n}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 最近记录 */}
        {history.length > 0 && (
          <section
            className="rounded-2xl border p-6"
            style={{
              background: `${theme.cardSurface}aa`,
              borderColor: theme.cardBorder,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs tracking-[0.16em] uppercase" style={{ color: theme.accent }}>
                最近记录
              </div>
              <Link
                href="/mysti/monthly/"
                className="text-xs hover:underline"
                style={{ color: theme.textMuted }}
              >
                看月报 →
              </Link>
            </div>
            <ul className="space-y-2">
              {history.slice(0, 12).map(e => {
                const opt = MOOD_OPTIONS.find(o => o.id === e.mood);
                return (
                  <li
                    key={e.recordedAt}
                    className="flex items-start gap-3 text-xs py-1"
                    style={{ color: theme.text }}
                  >
                    <span className="text-base shrink-0">{opt?.emoji ?? '·'}</span>
                    <div className="flex-1 min-w-0">
                      <div>
                        <span style={{ color: theme.textMuted }}>{e.date}</span>
                        <span className="ml-2" style={{ color: theme.text }}>
                          {opt?.label ?? e.mood}
                        </span>
                      </div>
                      {e.note && (
                        <div className="text-[11px] mt-0.5 italic" style={{ color: theme.textSubtle }}>
                          “{e.note}”
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
