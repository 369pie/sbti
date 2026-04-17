/**
 * Feminist Copy & Visual Compliance Validator
 *
 * Enforces the two mandatory governance docs before a UGC universe can be
 * submitted for review:
 *   - docs/04-design-growth/feminist-copy-checklist.md
 *   - docs/04-design-growth/women-first-visual-guide.md
 *
 * Strategy rule (wtfti-wild-growth-strategy-2026-04-17.md bedrock #1 & #7):
 *   Every shipped universe must pass the feminist checklist.
 *
 * This module is intentionally a heuristic keyword scanner — it cannot replace
 * editorial review, but it blocks the lowest-hanging regressions (乖巧, 善解人意,
 * 白月光, 比心, etc.) automatically so reviewers focus on subtler issues.
 */

// ─── Rule definitions ────────────────────────────────────────────────────────

export type RuleSeverity = 'error' | 'warn';

export interface CopyRule {
  id: string;
  /** Which of the 10 feminist-copy-checklist clauses this rule enforces */
  clause: number;
  /** Human-readable failure reason shown in Studio */
  reason: string;
  /** Replacement suggestion — shown inline next to the trigger text */
  suggestion: string;
  /** Keyword / regex that triggers the rule */
  pattern: RegExp;
  severity: RuleSeverity;
}

/** Clause-level rules. Errors block submit; warns surface as yellow chips. */
export const COPY_RULES: CopyRule[] = [
  // Clause 1 — 被规训式赞美
  { id: 'docile-praise-guai',     clause: 1, reason: '"乖 / 乖巧 / 懂事" 属被规训式赞美', suggestion: '改为"不伪装 / 有主见 / 知道自己要什么"', pattern: /乖巧|乖乖|懂事|听话/g,                      severity: 'error' },
  { id: 'docile-praise-shanjie', clause: 1, reason: '"善解人意" 强化情绪劳动义务', suggestion: '改为"知道什么时候该说不"',                       pattern: /善解人意|通情达理/g,                            severity: 'error' },
  { id: 'docile-praise-wenrou',  clause: 1, reason: '"温柔"若单独出现易被读作规训',  suggestion: '改为"温度 / 柔韧"，或用具体行动展示',             pattern: /(^|[^有])温柔[以之的]?人?(待|女)?/g,             severity: 'warn'  },
  // Clause 2 — 可被优化暗示
  { id: 'self-optimize',         clause: 2, reason: '暗示"可以变得更好"，剥夺此刻完整性',   suggestion: '改为"你此刻即完整"类主体句',                       pattern: /变得更好|更勇敢一点|学会[^，。；]{1,6}[吧了]?/g, severity: 'error' },
  // Clause 3 — 服务性叙事
  { id: 'service-narrative',     clause: 3, reason: '把女性定位为情绪/家庭港湾',       suggestion: '让她成为行动主体，而非他人的温暖来源',                 pattern: /情绪港湾|温暖港湾|定海神针|让[^，。]{0,8}变温暖/g, severity: 'error' },
  // Clause 4 — 情绪劳动去名化
  { id: 'emotional-labor',       clause: 4, reason: '歌颂共情为义务属无偿情绪劳动',     suggestion: '改为"共情是能力，不是义务"',                        pattern: /共情力\s?MAX|共情力爆棚|总能读懂[^，。]{1,10}/g,  severity: 'warn'  },
  // Clause 5 — 身体物化
  { id: 'body-objectify-moon',   clause: 5, reason: '"白月光 / 朱砂痣" 属被凝视化外貌叙事', suggestion: '用动作/气场代替外貌描写',                           pattern: /白月光|朱砂痣|像早春|笑起来像/g,                  severity: 'error' },
  { id: 'body-fragment',         clause: 5, reason: '身体碎片化（唇/腰/腿/胸单独出镜）',   suggestion: '避免身体局部特写文案',                             pattern: /嘴唇.*性感|腰肢|细腿|事业线/g,                   severity: 'error' },
  // Clause 6 — 女女比较叙事
  { id: 'woman-compare',         clause: 6, reason: '制造女性之间的"她不一样"比较',    suggestion: '改为致敬而非区分',                                pattern: /跟别的(女孩|女生)不一样|一群乖乖女里/g,          severity: 'error' },
  // Clause 7 — 男性凝视反向内化
  { id: 'male-gaze-wait',        clause: 7, reason: '"终会有人读懂你"型等待叙事',        suggestion: '改为"值得被你自己看见"',                          pattern: /总有一天.*懂你|值得被爱|终会有人/g,               severity: 'error' },
  // Clause 8 — 规训/收编结尾
  { id: 'patriarchy-return',     clause: 8, reason: '"回归家庭 / 乖乖女"式收编',        suggestion: '保持主体性，不向父权结构妥协',                       pattern: /回归家庭|终究会回归|最终成为贤妻|相夫教子/g,      severity: 'error' },
  // Meta — 感叹号滥用（节奏铁律）
  { id: 'excessive-exclaim',     clause: 0, reason: '单段感叹号 > 1 个违反"少用感叹号"节奏', suggestion: '改用句号或破折号',                               pattern: /！.*！|!.*!/g,                                      severity: 'warn'  },
];

export interface CopyIssue {
  ruleId: string;
  clause: number;
  severity: RuleSeverity;
  reason: string;
  suggestion: string;
  match: string;
  field: string;
}

/** Scan a single string against all rules. */
export function scanCopy(field: string, text: string | null | undefined): CopyIssue[] {
  if (!text) return [];
  const issues: CopyIssue[] = [];
  for (const rule of COPY_RULES) {
    rule.pattern.lastIndex = 0;
    const matches = text.match(rule.pattern);
    if (!matches) continue;
    for (const m of matches) {
      issues.push({
        ruleId: rule.id,
        clause: rule.clause,
        severity: rule.severity,
        reason: rule.reason,
        suggestion: rule.suggestion,
        match: m,
        field,
      });
    }
  }
  return issues;
}

// ─── Universe-level aggregate ────────────────────────────────────────────────

export interface ValidatorPersonalityInput {
  slug: string;
  name?: string | null;
  tagline?: string | null;
  quote?: string | null;
  hit?: string | null;
  os?: string | null;
  closer?: string | null;
  symptoms?: string[] | null;
}

export interface ValidatorUniverseInput {
  id?: string;
  name?: string | null;
  description?: string | null;
  personalities: ValidatorPersonalityInput[];
}

export interface ValidationReport {
  ok: boolean;
  errorCount: number;
  warnCount: number;
  issues: CopyIssue[];
  /** Short summary suitable for toast/error message */
  summary: string;
  /** Stats per clause for Studio dashboard */
  byClause: Record<number, number>;
}

/** Validate a whole universe's copy body. Returns { ok: false } if any error-severity issue exists. */
export function validateUniverse(input: ValidatorUniverseInput): ValidationReport {
  const all: CopyIssue[] = [];

  all.push(...scanCopy('universe.name', input.name));
  all.push(...scanCopy('universe.description', input.description));

  for (const p of input.personalities ?? []) {
    all.push(...scanCopy(`${p.slug}.name`, p.name));
    all.push(...scanCopy(`${p.slug}.tagline`, p.tagline));
    all.push(...scanCopy(`${p.slug}.quote`, p.quote));
    all.push(...scanCopy(`${p.slug}.hit`, p.hit));
    all.push(...scanCopy(`${p.slug}.os`, p.os));
    all.push(...scanCopy(`${p.slug}.closer`, p.closer));
    for (const [i, s] of (p.symptoms ?? []).entries()) {
      all.push(...scanCopy(`${p.slug}.symptoms[${i}]`, s));
    }
  }

  const errorCount = all.filter(i => i.severity === 'error').length;
  const warnCount = all.filter(i => i.severity === 'warn').length;

  const byClause: Record<number, number> = {};
  for (const issue of all) {
    byClause[issue.clause] = (byClause[issue.clause] ?? 0) + 1;
  }

  const summary = errorCount === 0
    ? warnCount === 0
      ? '✅ 文案女权体检通过'
      : `⚠️ 通过，但有 ${warnCount} 处建议优化`
    : `❌ 未通过：${errorCount} 处违反女权文案 checklist（见详情）`;

  return { ok: errorCount === 0, errorCount, warnCount, issues: all, summary, byClause };
}
