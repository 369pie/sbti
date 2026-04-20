'use client';

/**
 * SoulTI Night Mode — 夜灯模式
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E2)
 *
 * Auto-triggers between 22:00–06:00 local time. Sets `data-soulti-night="1"`
 * on document.documentElement so result/landing pages can opt into a soft
 * dark adjustment via CSS attribute selectors. Always shows a small banner
 * with toggle + remember-my-choice, so users can opt out without rage.
 *
 * Design intent (per strategy):
 *   - Time = product. Not a setting buried in a menu.
 *   - Soft, not aggressive. No black; warm midnight cream.
 *   - One-tap dismiss; respects choice via localStorage.
 */

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'soulti-night-mode'; // 'auto' | 'on' | 'off'

type Mode = 'auto' | 'on' | 'off';

function isNightHour(hour: number): boolean {
  return hour >= 22 || hour < 6;
}

function readMode(): Mode {
  if (typeof window === 'undefined') return 'auto';
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'on' || v === 'off' || v === 'auto') return v;
  return 'auto';
}

function applyAttribute(active: boolean) {
  if (typeof document === 'undefined') return;
  if (active) {
    document.documentElement.setAttribute('data-soulti-night', '1');
  } else {
    document.documentElement.removeAttribute('data-soulti-night');
  }
}

export function SoultiNightMode() {
  // Lazy init from storage to avoid synchronous setState in effects.
  // SSR safe: returns defaults on server; client rehydrates without flicker
  // because the banner is gated by `now !== null` below.
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'auto';
    return readMode();
  });
  const [bannerHidden, setBannerHidden] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('soulti-night-banner') === '1';
  });
  const [now, setNow] = useState<Date | null>(null);

  // First tick + minute-interval. Both setNow calls happen inside async
  // timer callbacks (not synchronously in the effect body), which satisfies
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    const t0 = window.setTimeout(() => setNow(new Date()), 0);
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, []);

  // Derive whether night styling is active from props/state — no setState.
  const active = useMemo(() => {
    if (!now) return false;
    const auto = isNightHour(now.getHours());
    return mode === 'on' || (mode === 'auto' && auto);
  }, [mode, now]);

  // Mirror `active` onto <html> as a side effect (DOM only, no setState)
  useEffect(() => {
    applyAttribute(active);
    return () => applyAttribute(false);
  }, [active]);

  // Persist mode changes (DOM/storage only, no setState)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Don't render banner during SSR / before hydration
  if (!now) return null;
  if (bannerHidden) return null;

  // Only show the banner when night hours are active or user already toggled on
  const showBanner = active || mode === 'on';
  if (!showBanner) return null;

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');

  return (
    <>
      <style jsx global>{`
        html[data-soulti-night='1'] {
          background: #14121b !important;
        }
        html[data-soulti-night='1'] body {
          background: #14121b !important;
        }
        /* Adjust SoulTI cream surfaces to soft midnight while preserving copy hierarchy */
        html[data-soulti-night='1'] [data-soulti-surface='cream'] {
          background: #1c1925 !important;
          color: #e8e3d6 !important;
        }
        html[data-soulti-night='1'] .soulti-night-dim {
          opacity: 0.85;
        }
        html[data-soulti-night='1'] body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(60% 40% at 20% 10%, rgba(139, 159, 212, 0.06) 0%, transparent 60%),
            radial-gradient(50% 40% at 80% 90%, rgba(176, 120, 80, 0.05) 0%, transparent 60%);
        }
      `}</style>

      <div
        className="fixed left-1/2 -translate-x-1/2 z-50"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          maxWidth: 'calc(100vw - 32px)',
        }}
        role="status"
        aria-live="polite"
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg"
          style={{
            background: active
              ? 'rgba(28, 25, 37, 0.92)'
              : 'rgba(253, 252, 250, 0.96)',
            color: active ? '#e8e3d6' : '#3a352f',
            border: `1px solid ${active ? 'rgba(232,227,214,0.18)' : 'rgba(139,115,85,0.18)'}`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontFamily:
              "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif",
            fontSize: '12px',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: active ? '#8b9fd4' : '#c4883a',
              boxShadow: active
                ? '0 0 8px rgba(139,159,212,0.7)'
                : '0 0 6px rgba(196,136,58,0.5)',
            }}
          />
          <span style={{ letterSpacing: '0.06em' }}>
            {hh}:{mm} · {active ? '夜灯模式' : '日间模式'}
          </span>
          <button
            type="button"
            onClick={() => setMode(active ? 'off' : 'on')}
            className="text-[11px] underline-offset-2 hover:underline"
            style={{
              color: active ? '#b8c4e0' : '#8b7355',
              cursor: 'pointer',
            }}
          >
            {active ? '关掉夜灯' : '开夜灯'}
          </button>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem('soulti-night-banner', '1');
              setBannerHidden(true);
            }}
            className="opacity-50 hover:opacity-100 transition-opacity"
            aria-label="收起提示"
            style={{ cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
