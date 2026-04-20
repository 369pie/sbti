/**
 * XPTI · Partner Mini Quiz (12-Q)
 *
 * Sprint 2 of the v3.0 plan ("CP 关系合并报告").
 *
 * 设计目标：让伴侣方在 90 秒内完成一组够用的问题，从中推出 ITC 三轴张力签名，
 * 与发起方合并。我们不复测原 9 维全貌（54 题/27 题），而是抽 12 题，
 * 每条 ITC 张力轴覆盖 4 题（来自该轴贡献的 9 维子集），保证三轴都有足够信号。
 *
 * 题目从主题库 XPTI_QUESTIONS 中按 ID 选取，避免维护两套文案。
 */
import { XPTI_QUESTIONS, type XptiQuestion } from './questions';

/**
 * Partner pack composition (固定 12 题，每条 ITC 轴 4 题)：
 *
 * CONTROL  : D1×2 (Q1, Q4)  · D6×1 (Q31)  · D9×1 (Q49)
 * DISTANCE : D2×2 (Q7, Q10) · D5×1 (Q25)  · D8×1 (Q43)
 * NOVELTY  : D3×1 (Q13) · D4×2 (Q19, Q22) · D7×1 (Q37)
 *
 * IDs come from src/lib/xpti/questions.ts (1-indexed by appearance order
 * within each dimension block of 6 questions: D1=1-6, D2=7-12, D3=13-18,
 * D4=19-24, D5=25-30, D6=31-36, D7=37-42, D8=43-48, D9=49-54).
 */
export const XPTI_PARTNER_QUESTION_IDS: number[] = [
  // CONTROL ──
  1, 4, 31, 49,
  // DISTANCE ──
  7, 10, 25, 43,
  // NOVELTY ──
  13, 19, 22, 37,
];

/**
 * Resolve the 12 partner questions in a stable order (no shuffling — we want
 * the partner flow to feel quick and predictable, and we do NOT want
 * randomness to introduce score variance on a 12-Q quiz).
 */
export function getPartnerQuestions(): XptiQuestion[] {
  const byId = new Map(XPTI_QUESTIONS.map((q) => [q.id, q]));
  const out: XptiQuestion[] = [];
  for (const id of XPTI_PARTNER_QUESTION_IDS) {
    const q = byId.get(id);
    if (q) out.push(q);
  }
  return out;
}
