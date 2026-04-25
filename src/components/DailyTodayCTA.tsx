'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadTodayResult, msUntilMidnight } from '@/lib/daily/fortune';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';

const emptySubscribe = () => () => {};

export function DailyTodayCTA() {
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
      const s = Math.floor((ms % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mounted, todaySlug]);

  if (!mounted) {
    // SSR / loading fallback — show default CTA
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/daily/test"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-teal-500 text-bg-primary font-medium text-base hover:bg-teal-600 transition-all duration-200"
        >
          测一测今天开了什么模式
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    );
  }

  if (todaySlug) {
    const status = DAILY_STATUS_TYPES.find(s => s.slug === todaySlug);
    return (
      <div className="flex flex-col items-center gap-4">
        <Link
          href={`/daily/result/${todaySlug}/`}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-teal-500 text-bg-primary font-medium text-base hover:bg-teal-600 transition-all duration-200"
        >
          {status?.emoji} 查看今日结果：{status?.name ?? todaySlug}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        {countdown && (
          <div className="text-center space-y-1">
            <div>
              <span className="text-xs text-text-muted">新模式 </span>
              <span className="text-sm font-mono font-semibold text-teal-400">{countdown}</span>
              <span className="text-xs text-text-muted"> 后刷新</span>
            </div>
            <p className="text-[11px] text-text-muted">
              明天回来看看新状态，每天题目都不一样 ✨
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link
        href="/daily/test"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-teal-500 text-bg-primary font-medium text-base hover:bg-teal-600 transition-all duration-200"
      >
        测一测今天开了什么模式
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
      <Link
        href="/"
        prefetch={false}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
      >
        ← 返回首页
      </Link>
    </div>
  );
}
