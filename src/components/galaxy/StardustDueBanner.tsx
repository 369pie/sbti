/**
 * StardustDueBanner · 在 WTFTI 主页/结果页顶部自动浮现
 *
 * 当用户有到期未拆封的星尘信件时显示。
 * - 不弹窗、不打扰；只是一条柔和的金色横幅。
 * - 已 dismiss 一次的状态（sessionStorage）当前会话内不再出现。
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  listDueStardustLetters,
  type StardustUserLetter,
} from '@/lib/wtfi/letters-archive';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { basePath } from '@/lib/site';

const DISMISS_KEY = 'wtfti.letters.banner.dismissed.v1';

export function StardustDueBanner() {
  const [letters, setLetters] = useState<StardustUserLetter[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const sessionDismissed = window.sessionStorage.getItem(DISMISS_KEY) === '1';
        setDismissed(sessionDismissed);
      } catch {
        /* noop */
      }
      setLetters(listDueStardustLetters());
    });
  }, []);

  if (dismissed || !letters || letters.length === 0) return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
    setDismissed(true);
  };

  const retestLetters = letters.filter((l) => l.kind === 'retest');
  const hasRetest = retestLetters.length > 0;
  const retestSlug = retestLetters[0]?.personalitySlug;

  const primaryHref = hasRetest
    ? `${basePath}/wtfti/galaxy/test/`
    : '/wtfti/letters/';
  const primaryLabel = hasRetest ? '✦ 月相复测仪式' : '✦ 去拆封';

  const handlePrimaryClick = () => {
    if (hasRetest) {
      trackGalaxyEvent('galaxy_retest_click', {
        slug: retestSlug ?? 'unknown',
        step: 'banner_cta',
        props: { dueCount: retestLetters.length },
      });
    }
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 80,
        padding: '10px 14px',
        background: hasRetest
          ? 'linear-gradient(180deg, rgba(156,124,255,.92) 0%, rgba(192,122,142,.88) 100%)'
          : 'linear-gradient(180deg, rgba(201,166,118,.92) 0%, rgba(192,122,142,.88) 100%)',
        color: '#1a1530',
        boxShadow: hasRetest
          ? '0 2px 16px rgba(156,124,255,.45)'
          : '0 2px 16px rgba(201,166,118,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        flexWrap: 'wrap',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontStyle: 'italic',
          letterSpacing: 1,
        }}
      >
        {hasRetest ? (
          <>
            ✦ 月亮转满了一圈 — 神域邀你{' '}
            <strong>第 {retestLetters.length + 1} 次</strong> 重走仪式。
          </>
        ) : (
          <>
            ✦ 你有 <strong>{letters.length}</strong> 封星尘信件已经到期 — 月光在替你拆封。
          </>
        )}
      </span>
      <Link
        href={primaryHref}
        onClick={handlePrimaryClick}
        style={{
          padding: '6px 14px',
          borderRadius: 999,
          background: '#1a1530',
          color: '#F5F0E8',
          fontSize: 11.5,
          letterSpacing: 3,
          textTransform: 'uppercase',
          textDecoration: 'none',
          fontStyle: 'italic',
        }}
      >
        {primaryLabel}
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="本次会话不再提示"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(26,21,48,.55)',
          fontSize: 12,
          cursor: 'pointer',
          padding: '4px 6px',
        }}
      >
        ×
      </button>
    </aside>
  );
}
