'use client';

/**
 * <CciPanel /> — 跨情境一致性指数面板
 * 自动从 localStorage 读取所有宇宙画像，计算 CCI 并展示。
 */

import { useEffect, useState } from 'react';
import {
  computeCci,
  loadUniverseProfiles,
  type CciResult,
  type UniverseProfile,
} from '@/lib/wtfi/cci';
import { WTFI_AXES } from '@/lib/wtfi/axes';

interface Props {
  variant?: 'light' | 'dark';
  className?: string;
}

export function CciPanel({ variant = 'light', className = '' }: Props) {
  const [profiles, setProfiles] = useState<UniverseProfile[] | null>(null);
  useEffect(() => {
    setProfiles(loadUniverseProfiles());
  }, []);

  if (profiles === null) return null;
  const result = computeCci(profiles);
  const isDark = variant === 'dark';
  const wrap = isDark
    ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white'
    : 'rounded-2xl border border-border-subtle bg-bg-secondary text-text-primary';

  if (profiles.length < 2) {
    return (
      <div className={`${wrap} px-5 py-4 ${className}`}>
        <p className={`text-[11px] tracking-[0.2em] uppercase ${isDark ? 'text-white/55' : 'text-text-muted'}`}>
          CCI · 跨情境一致性
        </p>
        <p className={`mt-2 text-[13px] leading-relaxed ${isDark ? 'text-white/75' : 'text-text-secondary'}`}>
          已记录 {profiles.length} 个宇宙的画像。再完成 1 个测试，就能算出你跨宇宙的一致性指数。
        </p>
      </div>
    );
  }

  return (
    <div className={`${wrap} px-5 py-4 ${className}`}>
      <div className="flex items-baseline justify-between">
        <p className={`text-[11px] tracking-[0.2em] uppercase ${isDark ? 'text-white/55' : 'text-text-muted'}`}>
          CCI · 跨情境一致性
        </p>
        <p className={`text-[10px] ${isDark ? 'text-white/45' : 'text-text-muted'}`}>
          基于 {result.universeCount} 个宇宙
        </p>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl font-semibold tracking-tight">{result.total}</span>
        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-text-secondary'}`}>
          {result.bandLabel}
        </span>
      </div>
      <p className={`mt-1 text-[12px] leading-relaxed ${isDark ? 'text-white/65' : 'text-text-secondary'}`}>
        {result.bandTagline}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {(['W', 'T', 'F', 'I'] as const).map(a => {
          const def = WTFI_AXES.find(x => x.id === a)!;
          const score = result.perAxis[a];
          return (
            <div
              key={a}
              className={`rounded-lg px-2 py-1.5 ${
                isDark ? 'bg-white/5' : 'bg-bg-primary'
              }`}
            >
              <div
                className="text-[10px] font-bold tracking-wide"
                style={{ color: def.color }}
              >
                {a} · {def.name}
              </div>
              <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-text-primary'}`}>
                {score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 副本：使用方手动传入 CCI 结果，用于 SSR / 测试 */
export function CciPanelStatic({
  result,
  variant = 'light',
  className = '',
}: {
  result: CciResult;
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = variant === 'dark';
  const wrap = isDark
    ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white'
    : 'rounded-2xl border border-border-subtle bg-bg-secondary text-text-primary';
  return (
    <div className={`${wrap} px-5 py-4 ${className}`}>
      <p className={`text-[11px] tracking-[0.2em] uppercase ${isDark ? 'text-white/55' : 'text-text-muted'}`}>
        CCI · 跨情境一致性 · {result.universeCount} 宇宙
      </p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl font-semibold tracking-tight">{result.total}</span>
        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-text-secondary'}`}>
          {result.bandLabel}
        </span>
      </div>
      <p className={`mt-1 text-[12px] leading-relaxed ${isDark ? 'text-white/65' : 'text-text-secondary'}`}>
        {result.bandTagline}
      </p>
    </div>
  );
}
