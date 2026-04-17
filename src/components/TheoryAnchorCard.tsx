/**
 * TheoryAnchorCard — 在每个宇宙的 landing/result 页展示
 * "此宇宙激活的情境维度是 W + F" 小卡片。
 *
 * 用法：
 *   <TheoryAnchorCard universe="xiuxian" />
 *   <TheoryAnchorCard universe="wtfti" variant="dark" compact />
 *
 * 设计意图：
 * - 把 WTFTI W-T-F-I 4 轴理论"露出"在每个测试结果旁边，
 *   让用户感知"这套测试不是瞎选选项"，而是有学术框架（CAPS / Mischel & Shoda 1995）。
 * - 战略上把所有宇宙串成一个理论体系，建立品牌护城河。
 */

import Link from 'next/link';
import { theoryFor } from '@/lib/wtfi/scoring';
import { WTFI_AXES, type WtfiAxis } from '@/lib/wtfi/axes';

interface Props {
  universe: string;
  /** 'light' = 米色面板（默认）；'dark' = 深底面板 */
  variant?: 'light' | 'dark';
  /** compact = 一行版（用于 sidebar 或 header）；full = 两行带注脚（默认） */
  compact?: boolean;
  className?: string;
  /** 隐藏底部的"了解 WTFTI 理论"链接 */
  hideLink?: boolean;
}

export function TheoryAnchorCard({
  universe,
  variant = 'light',
  compact = false,
  className = '',
  hideLink = false,
}: Props) {
  const cfg = theoryFor(universe);
  const axes = cfg.activatedAxes ?? ['W', 'T', 'F', 'I'];

  const isDark = variant === 'dark';
  const wrapClass = isDark
    ? 'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm'
    : 'rounded-xl border border-border-subtle bg-bg-secondary';

  return (
    <div className={`${wrapClass} px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] tracking-[0.2em] uppercase ${
            isDark ? 'text-white/55' : 'text-text-muted'
          }`}
        >
          WTFTI · 此宇宙激活
        </span>
        <div className="flex items-center gap-1.5">
          {axes.map(a => (
            <AxisChip key={a} axis={a} variant={variant} />
          ))}
        </div>
      </div>
      {!compact && cfg.axisNote && (
        <p
          className={`mt-2 text-[12px] leading-relaxed ${
            isDark ? 'text-white/70' : 'text-text-secondary'
          }`}
        >
          {cfg.axisNote}
        </p>
      )}
      {!hideLink && !compact && (
        <Link
          href="/theory/"
          className={`mt-2 inline-block text-[11px] underline-offset-2 hover:underline ${
            isDark ? 'text-white/55' : 'text-text-muted'
          }`}
        >
          了解 WTFTI 4 轴理论 →
        </Link>
      )}
    </div>
  );
}

function AxisChip({ axis, variant }: { axis: WtfiAxis; variant: 'light' | 'dark' }) {
  const def = WTFI_AXES.find(a => a.id === axis)!;
  const bg = variant === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: bg,
        color: def.color,
        border: `1px solid ${def.color}40`,
      }}
      title={def.testing}
    >
      <span style={{ fontWeight: 700 }}>{axis}</span>
      <span className="opacity-80">{def.name}</span>
    </span>
  );
}
