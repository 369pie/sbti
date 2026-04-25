'use client';

/**
 * SoulTI Monthly Retest Nudge · 月度复测对照
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E11)
 *
 * Stores the latest tear rate snapshot in localStorage on each visit; if the
 * previous snapshot is ≥ 25 days old, surfaces a soft nudge inviting the
 * user to retest and shows the delta. No login required, no server.
 *
 * Mounted on the result page just below the Tear Rate Hero.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SnapshotPayload {
  slug: string;
  tearRatePercent: number;
  /** ISO datetime of when this snapshot was recorded */
  at: string;
}

type HistoryEntry = SnapshotPayload;

interface HistoryStore {
  /** Most recent snapshot per slug; we keep the last 6 for context */
  byTime: HistoryEntry[];
}

const STORAGE_KEY = 'soulti-tear-history-v1';
const NUDGE_AFTER_DAYS = 25;
const NUDGE_DISMISS_KEY = 'soulti-retest-nudge-dismissed-on';

interface Props {
  personalitySlug: string;
  currentTearRate: number;
  accent?: string;
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

function readHistory(): HistoryStore {
  if (typeof window === 'undefined') return { byTime: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byTime: [] };
    const parsed = JSON.parse(raw) as HistoryStore;
    if (!parsed || !Array.isArray(parsed.byTime)) return { byTime: [] };
    return parsed;
  } catch {
    return { byTime: [] };
  }
}

function writeHistory(s: HistoryStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota exceeded — fine, it's a nudge */
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

export function SoultiMonthlyRetestNudge({
  personalitySlug,
  currentTearRate,
  accent = '#8b7355',
}: Props) {
  // Compute snapshot record + delta lazily during render. We intentionally
  // *write* the snapshot during render (idempotent same-day update) rather
  // than in an effect — this avoids the react-hooks/set-state-in-effect rule
  // and the value is read directly below.
  const { previous, deltaDays, dismissedToday } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { previous: null as HistoryEntry | null, deltaDays: 0, dismissedToday: true };
    }
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const dismissedOn = window.localStorage.getItem(NUDGE_DISMISS_KEY);
    const dismissed = dismissedOn === todayStr;

    const store = readHistory();
    const sameSlugEntries = store.byTime.filter((e) => e.slug === personalitySlug);
    const prev = sameSlugEntries.length > 0 ? sameSlugEntries[sameSlugEntries.length - 1] : null;

    const last = store.byTime[store.byTime.length - 1];
    const sameDaySameValue =
      last &&
      last.slug === personalitySlug &&
      Math.abs(last.tearRatePercent - currentTearRate) < 1 &&
      last.at.slice(0, 10) === todayStr;

    if (!sameDaySameValue) {
      const updated: HistoryStore = {
        byTime: [
          ...store.byTime,
          { slug: personalitySlug, tearRatePercent: currentTearRate, at: today.toISOString() },
        ].slice(-6),
      };
      writeHistory(updated);
    }

    const delta = prev ? daysBetween(today, new Date(prev.at)) : 0;
    return { previous: prev, deltaDays: delta, dismissedToday: dismissed };
  }, [personalitySlug, currentTearRate]);

  if (!previous) return null;
  if (deltaDays < NUDGE_AFTER_DAYS) return null;
  if (dismissedToday) return null;

  const diff = currentTearRate - previous.tearRatePercent;
  const trendLabel =
    Math.abs(diff) < 4
      ? '几乎没变'
      : diff > 0
        ? `比上次高 ${Math.round(diff)} 分`
        : `比上次低 ${Math.round(Math.abs(diff))} 分`;
  const trendColor = Math.abs(diff) < 4 ? '#7A6A5A' : diff > 0 ? '#b07850' : '#5b8a72';

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pb-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      aria-label="月度复测对照"
    >
      <div
        className="rounded-2xl border px-5 py-4 flex items-center justify-between gap-4"
        style={{
          borderColor: `${accent}25`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5), #FDFCFA)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-1"
            style={{ fontFamily: serifFont, color: accent }}
          >
            RETEST · 月度复测
          </p>
          <p
            className="text-[13px] leading-[1.85]"
            style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}
          >
            上一次是 {deltaDays} 天前 · 撕裂度 {previous.tearRatePercent}%
            <span className="mx-1.5 opacity-40">→</span>
            <span style={{ color: trendColor }}>{trendLabel}</span>
          </p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <a
            href="/soulti/test/"
            className="px-3 py-1.5 rounded-full text-[11px] text-bg-primary text-center"
            style={{
              fontFamily: serifFont,
              background: accent,
              letterSpacing: '0.06em',
            }}
          >
            再测一次
          </a>
          <button
            type="button"
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              window.localStorage.setItem(NUDGE_DISMISS_KEY, today);
              // Force re-render via location reload would be ugly; instead
              // hide via parent-scope state in a future iteration.
              // For now, set a body attribute so CSS could hide if desired.
              document.documentElement.setAttribute('data-soulti-retest-dismissed', '1');
              const node = (document.activeElement as HTMLElement | null)?.closest('section');
              if (node) (node as HTMLElement).style.display = 'none';
            }}
            className="px-3 py-1.5 text-[10px]"
            style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
          >
            下次再说
          </button>
        </div>
      </div>
    </motion.section>
  );
}
