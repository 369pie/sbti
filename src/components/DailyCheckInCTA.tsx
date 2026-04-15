'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadTodayResult, msUntilMidnight } from '@/lib/daily/fortune';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';

const emptySubscribe = () => () => {};

/**
 * Lightweight daily check-in CTA for result pages.
 * - Not tested today → "测测今天开了什么模式"
 * - Already tested → shows result + countdown to refresh
 */
interface Props {
  variant?: 'default' | 'xpti';
}

export function DailyCheckInCTA({ variant = 'default' }: Props) {
  const isXpti = variant === 'xpti';
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [todaySlug, setTodaySlug] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!mounted) return;
    setTodaySlug(loadTodayResult());
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !todaySlug) return;
    const tick = () => {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setCountdown(`${h}小时${m}分`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [mounted, todaySlug]);

  if (!mounted) return null;

  if (todaySlug) {
    const status = DAILY_STATUS_TYPES.find(s => s.slug === todaySlug);
    return (
      <section className="max-w-2xl mx-auto px-6 pb-6">
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
          isXpti
            ? 'border-[#A3526E]/20 bg-gradient-to-r from-[#A3526E]/12 to-[#6A2A3E]/12'
            : 'border-teal-500/15 bg-gradient-to-r from-teal-500/5 to-emerald-500/5'
        }`}>
          <div className="text-2xl flex-shrink-0">{status?.emoji ?? '🎲'}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted">
              今日模式: <span className={`font-medium ${isXpti ? 'text-[#E6CDD5]' : 'text-teal-600'}`}>{status?.name ?? todaySlug}</span>
            </p>
            {countdown && (
              <p className="text-[11px] text-text-muted mt-0.5">
                新模式 {countdown}后刷新
              </p>
            )}
          </div>
          <Link
            href={`/daily/result/${todaySlug}/`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isXpti
                ? 'text-[#E6CDD5] bg-[#A3526E]/20 hover:bg-[#A3526E]/30'
                : 'text-teal-600 bg-teal-500/10 hover:bg-teal-500/20'
            }`}
          >
            查看
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 pb-6">
      <Link
        href="/daily/test"
        className={`group flex items-center gap-3 rounded-2xl border p-4 transition-all ${
          isXpti
            ? 'border-[#A3526E]/20 bg-gradient-to-r from-[#A3526E]/12 to-[#6A2A3E]/12 hover:border-[#A3526E]/35'
            : 'border-teal-500/15 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 hover:border-teal-500/30'
        }`}
      >
        <div className="text-2xl flex-shrink-0">🎲</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isXpti ? 'text-[#F3E8EB]' : 'text-text-primary'}`}>今天你开了什么模式？</p>
          <p className="text-xs text-text-muted mt-0.5">6 道快问 · 每天题目不一样</p>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-all flex-shrink-0 ${isXpti ? 'group-hover:text-[#E6CDD5]' : 'group-hover:text-teal-500'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </section>
  );
}
