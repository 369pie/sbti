/**
 * 旧 SBTI 15 维度 → 新 WTFI 4 轴 的映射层
 *
 * 用途：
 * 1. 让所有沿用 15 维的老宇宙（班 TI / 修仙 / WTFTI 毒舌 / Drunk / Daily / Love / Work / SoulTI）
 *    无需改题库，就能被新理论"吃进来"。
 * 2. 让老用户的历史测试结果可以一键投影到 W/T/F/I 4 轴画像。
 *
 * 映射规则：每个旧维度的"高分"对 W/T/F/I 各贡献一个权重（-1..+1），
 * 累加后归一化到 -3..+3。详见白皮书附录 B。
 */

import type { WtfiAxis } from './axes';

/**
 * 旧维度 → 4 轴贡献权重（高分时的方向）
 * 反向映射：低分时取相反符号
 */
export const LEGACY_TO_WTFI: Record<string, Partial<Record<WtfiAxis, number>>> = {
  // ── Self 模型 ────────────────────────────
  S1: { I: 0.8 },                  // 自尊自信 → 自洽型 ↑
  S2: { I: 0.6, F: 0.3 },          // 自我清晰度 → 自洽型 ↑（清晰的人切换也快）
  S3: { I: 0.7, W: 0.3 },          // 核心价值 → 自洽 + 易点燃（有目标的人更易被相关刺激点燃）

  // ── Emotion 模型 ─────────────────────────
  E1: { T: -0.5, I: 0.6 },         // 依恋安全感（高 = 内倾少 + 自洽强）
  E2: { T: 0.7, F: -0.3 },         // 情感投入度（高 = 外倾 + 难切换）
  E3: { F: 0.4, I: 0.6 },          // 边界与依赖（高 = 自洽 + 弹性留白）

  // ── Attitude 模型 ────────────────────────
  A1: { T: 0.5, I: 0.3 },          // 世界观倾向（高 = 偏外向乐观）
  A2: { F: -0.7 },                 // 规则与灵活度（高 = 守序，反弹性）→ 稳定型
  A3: { I: 0.6, W: 0.4 },          // 人生意义感 → 自洽 + 易被理想点燃

  // ── Action 模型 ──────────────────────────
  Ac1: { W: 0.8, T: 0.3 },         // 动机导向（高 = 易点燃）
  Ac2: { F: 0.7, W: 0.3 },         // 决策风格（高 = 弹性 + 反应快）
  Ac3: { W: 0.5, F: 0.4 },         // 执行模式（高 = 行动 + 切换快）

  // ── Social 模型 ──────────────────────────
  So1: { W: 0.6, T: 0.6 },         // 社交主动性（高 = 易点燃 + 外倾）
  So2: { I: 0.7 },                 // 人际边界感（高 = 自洽，不被他人侵入）
  So3: { F: -0.5, I: 0.5 },        // 表达与真实度（高 = 一致，反弹性切换 + 自洽）
};

/**
 * 把"旧维度的 1-3 分均值"投影到 W/T/F/I 4 轴
 * @param legacyScores  Map<dimensionId, avgScore (1..3)>
 * @returns Record<axis, -3..+3>
 */
export function projectLegacyToWtfi(
  legacyScores: Record<string, number>,
): Record<WtfiAxis, number> {
  const sum: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };
  const weight: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };

  for (const [dimId, raw] of Object.entries(legacyScores)) {
    const map = LEGACY_TO_WTFI[dimId];
    if (!map) continue;
    // 把 1..3 → -1..+1（中点 2）
    const centered = raw - 2;
    for (const [axis, w] of Object.entries(map) as [WtfiAxis, number][]) {
      sum[axis] += centered * w;
      weight[axis] += Math.abs(w);
    }
  }

  const out: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };
  for (const a of ['W', 'T', 'F', 'I'] as WtfiAxis[]) {
    if (weight[a] === 0) {
      out[a] = 0;
      continue;
    }
    // 归一化到 -3..+3：raw 中心化值 (-1..+1) × 权重 → 加权平均后 ×3
    const avg = sum[a] / weight[a];
    out[a] = Math.max(-3, Math.min(3, avg * 3));
  }
  return out;
}

/**
 * 反向：拿到一个新 W/T/F/I 画像，找到最相似的旧 15 维 profile（用于经典宇宙人格匹配兜底）
 * 当前实现：返回每个旧维度推断的"H/M/L"等级
 */
export function projectWtfiToLegacyLevels(
  wtfi: Record<WtfiAxis, number>,
): Record<string, 'H' | 'M' | 'L'> {
  const out: Record<string, 'H' | 'M' | 'L'> = {};
  for (const [dimId, map] of Object.entries(LEGACY_TO_WTFI)) {
    let s = 0;
    let w = 0;
    for (const [axis, weight] of Object.entries(map) as [WtfiAxis, number][]) {
      s += (wtfi[axis] / 3) * weight;
      w += Math.abs(weight);
    }
    const norm = w === 0 ? 0 : s / w; // -1..+1
    if (norm >= 0.33) out[dimId] = 'H';
    else if (norm <= -0.33) out[dimId] = 'L';
    else out[dimId] = 'M';
  }
  return out;
}
