/**
 * Theory dispatcher · 旧 SBTI 15-dim 与新 WTFI 4-axis 的统一接口
 *
 * 目的：给 result-page / 卡片渲染 / share image 一个**单一调用点**，
 * 不论这个宇宙是 classic-15 还是 wtfi-4，都得到带 4 轴投影的统一结果。
 *
 * 不改 `src/lib/scoring.ts`、不改任何 universe 题库；
 * 只在结果计算后追加一个 WTFI 投影 sidecar，前端选择是否展示。
 */

import type { TestResult } from '@/lib/scoring';
import type { WtfiAxis } from './axes';
import { projectLegacyToWtfi } from './dimension-alias';
import { matchWtfiPersonality, type WtfiPersonality } from './personalities';
import { theoryFor, type TheoryMode, type UniverseTheoryConfig } from './scoring';

export interface WtfiProjection {
  axes: Record<WtfiAxis, number>;
  archetype: WtfiPersonality;
  /** 用什么数据源算出来的（classic-15 投影 / wtfi-4 原生） */
  source: TheoryMode;
}

/**
 * 输入一个老的 TestResult（15 维），输出 WTFI 4 轴 sidecar
 */
export function projectClassicResult(result: TestResult): WtfiProjection {
  const scores: Record<string, number> = {};
  for (const d of result.dimensions) scores[d.id] = d.score;
  const axes = projectLegacyToWtfi(scores);
  return {
    axes,
    archetype: matchWtfiPersonality(axes),
    source: 'classic-15',
  };
}

/**
 * 给定一个 universe slug，返回该宇宙的 theory 配置 + 一个适用于结果页的"是否展示 WTFI sidebar"开关。
 *
 * 使用方式（在结果页）：
 *   const { theory, showWtfiSidecar } = getUniversePresentation('banti');
 *   if (showWtfiSidecar) {
 *     const proj = projectClassicResult(result);
 *     // render <WtfiSidecar projection={proj} />
 *   }
 */
export function getUniversePresentation(universe: string): {
  theory: TheoryMode;
  showWtfiSidecar: boolean;
  config: UniverseTheoryConfig;
} {
  const config = theoryFor(universe);
  return {
    theory: config.theory,
    // 只有"老 classic-15 宇宙且开了 alias"才展示侧边栏；
    // 原生 wtfi-4 宇宙不需要 sidebar，主结果就是 4 轴。
    showWtfiSidecar: config.theory === 'classic-15' && config.projectAlias === true,
    config,
  };
}

export type { TheoryMode, UniverseTheoryConfig };
