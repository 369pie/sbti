/**
 * WTFTI S 轴打分（latency-weighted + 节奏模式匹配）
 *
 * 与主测 W/T/F/I 的 scoring.ts 平行；不污染老逻辑。
 *
 * 调用时机：暗面星球解锁页 12 题做完后，把答题原始数据丢进来，
 * 输出 axisScore ∈ [-3, +3] + 暗面桶元数据。
 */

import {
  pickShadowBucket,
  type ShadowBucketMeta,
} from './s-axis';
import {
  S_AXIS_QUESTIONS,
  getSQuestionById,
  type STempoQuestion,
  type SQuestion,
} from './s-questions';

export interface SAssociationAnswer {
  questionId: string;
  /** 选中的 option key；timeout 时为 null */
  optionKey: string | null;
  latencyMs: number;
}

export interface SLatencyAnswer {
  questionId: string;
  optionKey: string | null;
  latencyMs: number;
}

export interface STempoAnswer {
  questionId: string;
  /** 用户最终排序后的 items 顺序 */
  order: string[];
  /** 拖动总次数（用于检测高犹豫） */
  dragCount: number;
}

export type SAnswer = SAssociationAnswer | SLatencyAnswer | STempoAnswer;

export interface SScoreResult {
  axisScore: number;
  shadow: ShadowBucketMeta;
  /** 内部诊断：每题贡献向量（不存数据库，仅供 dev/QA） */
  contributions: Array<{ questionId: string; raw: number; weighted: number }>;
  /** 完成情况 */
  completion: {
    answered: number;
    total: number;
    timeouts: number;
  };
}

/**
 * 反应时权重：< 1.5s = 1.0；1.5-3s = 0.7；> 3s 或 timeout = 0.4
 */
function latencyWeight(ms: number): number {
  if (ms < 1500) return 1.0;
  if (ms < 3000) return 0.7;
  return 0.4;
}

function isTempoAnswer(a: SAnswer): a is STempoAnswer {
  return 'order' in a;
}

function scoreTempo(q: STempoQuestion, answer: STempoAnswer): number {
  let s = 0;
  for (const p of q.patterns) {
    const r = p.rule;
    if (r.kind === 'firstNContains') {
      if (answer.order.slice(0, r.n).includes(r.needle)) s += p.sVector;
    } else if (r.kind === 'firstIs') {
      if (answer.order[0] === r.needle) s += p.sVector;
    } else if (r.kind === 'adjacent') {
      const idxA = answer.order.indexOf(r.a);
      const idxB = answer.order.indexOf(r.b);
      if (idxA < 0 || idxB < 0) continue;
      const gap = Math.abs(idxA - idxB);
      if (gap === 1 + r.allowBetween) s += p.sVector;
    }
  }
  if (answer.dragCount >= q.highHesitationThreshold) {
    s += q.highHesitationBonus;
  }
  return s;
}

function scoreSingleSelect(q: SQuestion, optionKey: string | null): number {
  if (!optionKey) return 0;
  if (q.type === 'tempo') return 0;
  const opt = q.options.find((o) => o.key === optionKey);
  return opt ? opt.sVector : 0;
}

export function scoreSAxis(answers: SAnswer[]): SScoreResult {
  const contributions: SScoreResult['contributions'] = [];
  let timeouts = 0;
  let weightedSum = 0;

  for (const ans of answers) {
    const q = getSQuestionById(ans.questionId);
    if (!q) continue;

    let raw = 0;
    let weight = 1;

    if (isTempoAnswer(ans)) {
      raw = scoreTempo(q as STempoQuestion, ans);
      weight = 1; // 节奏题不参与 latency 权重
    } else {
      const a = ans as SAssociationAnswer | SLatencyAnswer;
      if (a.optionKey == null) timeouts += 1;
      raw = scoreSingleSelect(q, a.optionKey);
      weight = latencyWeight(a.latencyMs);
    }

    const weighted = raw * weight;
    weightedSum += weighted;
    contributions.push({ questionId: ans.questionId, raw, weighted });
  }

  // 12 题 × ±3 × 1.0 = ±36 → 归一化到 [-3, +3]
  const normalized = clamp(weightedSum / 12, -3, 3);
  const axisScore = Math.round(normalized * 100) / 100;
  const shadow = pickShadowBucket(axisScore);

  return {
    axisScore,
    shadow,
    contributions,
    completion: {
      answered: answers.length,
      total: S_AXIS_QUESTIONS.length,
      timeouts,
    },
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
