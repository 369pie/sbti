'use client';

/**
 * <WtfiTheoryWiring /> — 一行就把宇宙串到 WTFTI 4 轴理论体系。
 *
 * 干两件事：
 * 1. 渲染 <TheoryAnchorCard /> 露出"此宇宙激活 W+F"
 * 2. 把这次结果的 W/T/F/I 画像写进 localStorage，喂 CCI
 *
 * 用法：
 *   <WtfiTheoryWiring universe="xpti" dimensionScores={dimensionScores} />
 *
 * dimensionScores 是 SBTI 的 15 维结构 [{ dimensionId, score (1..3) }]
 * — 自动通过 dimension-alias 投影到 4 轴。
 *
 * 已经原生 4 轴的宇宙（wtfti-preview）应直接调用 persistUniverseProfile + TheoryAnchorCard。
 */

import { useEffect } from 'react';
import { TheoryAnchorCard } from '@/components/TheoryAnchorCard';
import { persistUniverseProfile } from '@/lib/wtfi/cci';
import { projectLegacyToWtfi } from '@/lib/wtfi/dimension-alias';

interface DimensionLike {
  /** SBTI 用 dimensionId；XPTI/CPTI/SoulTI 用 id */
  dimensionId?: string;
  id?: string;
  score: number;
}

interface Props {
  universe: string;
  dimensionScores?: DimensionLike[] | null;
  /** 已是 4 轴画像时直接传，跳过 alias */
  wtfiAxes?: { W: number; T: number; F: number; I: number };
  variant?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
  /** true = 不渲染锚点卡，只做 CCI 持久化（用于 sidebar 已经放过卡的页面） */
  persistOnly?: boolean;
}

export function WtfiTheoryWiring({
  universe,
  dimensionScores,
  wtfiAxes,
  variant = 'light',
  compact = false,
  className = '',
  persistOnly = false,
}: Props) {
  useEffect(() => {
    if (wtfiAxes) {
      persistUniverseProfile({ universe, axes: wtfiAxes });
      return;
    }
    if (!dimensionScores || dimensionScores.length === 0) return;
    const legacyMap: Record<string, number> = {};
    for (const d of dimensionScores) {
      const key = d.dimensionId ?? d.id;
      if (!key) continue;
      legacyMap[key] = d.score;
    }
    const projected = projectLegacyToWtfi(legacyMap);
    // 只有真正命中 SBTI 15 维（任意一个）时才记录 CCI，避免脏数据
    const hitAny = Object.keys(legacyMap).some(k => /^(S\d|E\d|A\d|Ac\d|So\d)$/.test(k));
    if (!hitAny) return;
    persistUniverseProfile({ universe, axes: projected });
  }, [universe, dimensionScores, wtfiAxes]);

  if (persistOnly) return null;
  return (
    <TheoryAnchorCard
      universe={universe}
      variant={variant}
      compact={compact}
      className={className}
    />
  );
}
