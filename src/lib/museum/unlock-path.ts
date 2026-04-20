/**
 * Unlock Path (W2)
 *
 * Translates a (tabId, slug) into 1–3 concrete steps the user can take to
 * unlock that card. Goal: replace the generic "🔒 做测试解锁" with a real
 * micro-roadmap so the lock becomes a *signpost*, not a wall.
 *
 * Sources of truth:
 *  - tab.testHref → "完成 [tab.label] 测试"
 *  - getPersonalityBySlug(slug).profile → 1–2 most extreme dimensions, written
 *    as a soft hint ("在 [dim.name] 上更倾向 [hi/lo]")
 *  - tab.id === 'cpti-relationship' → derived from CPTI; needs a CPTI result
 *
 * Pure / safe to import on server + client. No localStorage reads.
 */

import { getPersonalityBySlug } from '@/lib/personalities';
import { DIMENSIONS } from '@/lib/dimensions';

export interface UnlockStep {
  /** UI tag — "test" pri filled CTA, "trait" hint, "info" descriptive */
  kind: 'test' | 'trait' | 'info';
  text: string;
  /** Optional href for "test" kind */
  href?: string;
}

export interface UnlockPath {
  /** Headline shown at top of locked drawer */
  headline: string;
  steps: UnlockStep[];
  /** A neutral, never-pressuring tail line */
  tail: string;
}

const DIM_BY_ID = new Map(DIMENSIONS.map((d) => [d.id, d]));

const HI_HINTS: Record<string, string> = {
  S1:  '更高的自信',
  S2:  '更清晰的自我',
  S3:  '更强的核心价值感',
  E1:  '更安全的依恋',
  E2:  '更高的情感投入',
  E3:  '更松的边界',
  A1:  '更乐观的世界观',
  A2:  '更强的规则感',
  A3:  '更明确的人生意义',
  Ac1: '更强的内在动机',
  Ac2: '更果断的决策',
  Ac3: '更稳的执行力',
  So1: '更主动的社交',
  So2: '更厚的人际边界',
  So3: '更高的真实表达',
};

const LO_HINTS: Record<string, string> = {
  S1:  '低自尊的自我审视',
  S2:  '尚在探索的自我',
  S3:  '尚未定型的价值观',
  E1:  '更敏感的依恋',
  E2:  '更克制的情感',
  E3:  '更紧的情感边界',
  A1:  '冷静甚至悲观的世界观',
  A2:  '反规则的灵活',
  A3:  '正在追问意义',
  Ac1: '随性的动机',
  Ac2: '更慢热的决策',
  Ac3: '更跳跃的执行',
  So1: '安静观察的社交',
  So2: '柔软的人际边界',
  So3: '善于隐藏的表达',
};

function profileExtremes(profile: Record<string, string>): Array<{ id: string; level: 'H' | 'L' }> {
  const out: Array<{ id: string; level: 'H' | 'L' }> = [];
  for (const [id, level] of Object.entries(profile)) {
    if (level === 'H' || level === 'L') out.push({ id, level: level as 'H' | 'L' });
  }
  return out;
}

function pickExtremeHints(profile: Record<string, string>, max = 2): UnlockStep[] {
  const extremes = profileExtremes(profile);
  if (!extremes.length) return [];
  // Stable order: by dim id (S1, S2, ... So3) — produces consistent output
  const ordered = extremes.slice().sort((a, b) => {
    const ia = DIMENSIONS.findIndex((d) => d.id === a.id);
    const ib = DIMENSIONS.findIndex((d) => d.id === b.id);
    return ia - ib;
  });
  // Prefer a mix: take first H, first L if both present, else first 2
  const hi = ordered.find((e) => e.level === 'H');
  const lo = ordered.find((e) => e.level === 'L');
  const picks: typeof ordered = [];
  if (hi) picks.push(hi);
  if (lo && lo.id !== hi?.id) picks.push(lo);
  while (picks.length < Math.min(max, ordered.length)) {
    const next = ordered.find((e) => !picks.includes(e));
    if (!next) break;
    picks.push(next);
  }
  return picks.slice(0, max).map<UnlockStep>(({ id, level }) => {
    const dim = DIM_BY_ID.get(id);
    const hint = level === 'H' ? HI_HINTS[id] : LO_HINTS[id];
    const txt = dim ? `在「${dim.name}」上倾向${hint ?? (level === 'H' ? '更高' : '更低')}` : `${id} 倾向 ${level}`;
    return { kind: 'trait', text: txt };
  });
}

export interface UnlockPathInput {
  tabId: string;
  tabLabel: string;
  testHref: string;
  slug: string;
  /** Whether the user has any result in this tab (changes wording slightly) */
  tabStarted?: boolean;
}

/**
 * Build the unlock path. Always returns at least 1 step (the test CTA).
 */
export function buildUnlockPath(input: UnlockPathInput): UnlockPath {
  const { tabId, tabLabel, testHref, slug, tabStarted } = input;
  const steps: UnlockStep[] = [];

  // Step 1 — always: test CTA
  steps.push({
    kind: 'test',
    text: tabStarted ? `重做 ${tabLabel} 测试` : `完成 ${tabLabel} 测试`,
    href: testHref,
  });

  // Step 2-3 — only if we have profile data (standard SBTI slugs)
  const personality = getPersonalityBySlug(slug);
  if (personality?.profile) {
    const hints = pickExtremeHints(personality.profile, 2);
    steps.push(...hints);
  }

  // Special handling: cpti-relationship is a derived universe
  if (tabId === 'cpti-relationship') {
    return {
      headline: '这张关系卡来自 CPTI',
      steps: [
        { kind: 'test', text: '完成 CPTI 测试', href: testHref },
        { kind: 'info', text: '关系卡会根据您和搭档的组合自动生成' },
      ],
      tail: '不是抽到，是配出来的。',
    };
  }

  const headline = personality?.profile
    ? `解锁「${tabLabel}」此卡的指南`
    : `解锁「${tabLabel}」此卡`;

  const tail = personality?.profile
    ? '没有保底也没有保号 — 真实测出来才作数。'
    : '走完测试就能看到落点，可能是这张，也可能是别的惊喜。';

  return { headline, steps, tail };
}
