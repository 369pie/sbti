/**
 * CPTI 2.0 — Relationship Codex Archive (local-first cache)
 *
 * We keep a browser copy so the Codex stays fast and resilient offline, then
 * mirror the same shape to Supabase via `cpti_relationship_records` when a
 * CPTI session exists. Local remains the fallback, not the source of truth.
 *
 * Hard rule (per `/memories/repo/cpti-viral-sprint-2-2026-04-19.md`):
 * never block UX for analytics or storage. All ops swallow errors.
 */

const STORAGE_KEY = 'cpti-codex-records-v1';
const STORAGE_VERSION = 1;

export type CodexScenarioBucket =
  | 'lover'      // 对象 / 暧昧
  | 'bestie'    // 闺蜜 / 死党
  | 'family'    // 家人
  | 'work'      // 同事 / 队友
  | 'enemy'     // 死对头
  | 'other';

export interface CodexRecord {
  /** Stable id — derived from `${createdAt}-${relationshipSlug}` so dedup is cheap. */
  id: string;
  /** Relationship type slug, e.g. 'soul', 'plastic', 'lovers'. */
  relationshipSlug: string;
  /** Personality slugs for both parties (B may be unknown if pair flow not completed). */
  personalitySlugA: string;
  personalitySlugB?: string;
  /** Free-form nickname the user assigns to the other party. */
  partnerNickname?: string;
  /** Free-form note about the relationship. */
  note?: string;
  /** Bucket used by the Codex tabs. */
  scenario: CodexScenarioBucket;
  /** Compatibility 0-100 (if available). */
  compatibility?: number;
  /** Created / updated timestamps. */
  createdAt: number;
  updatedAt: number;
  /** Number of re-tests performed against this same partner-relationship pair. */
  reTestCount: number;
}

interface CodexBlob {
  v: number;
  records: CodexRecord[];
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readBlob(): CodexBlob {
  if (!isBrowser()) return { v: STORAGE_VERSION, records: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { v: STORAGE_VERSION, records: [] };
    const parsed = JSON.parse(raw) as CodexBlob;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.records)) {
      return { v: STORAGE_VERSION, records: [] };
    }
    return { v: STORAGE_VERSION, records: parsed.records };
  } catch {
    return { v: STORAGE_VERSION, records: [] };
  }
}

function writeBlob(blob: CodexBlob): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    /* swallow */
  }
}

export function listCodexRecords(): CodexRecord[] {
  return readBlob().records.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listCodexRecordsByScenario(scenario: CodexScenarioBucket): CodexRecord[] {
  return listCodexRecords().filter(r => r.scenario === scenario);
}

export function getCodexCount(): number {
  return readBlob().records.length;
}

/**
 * Idempotently archive a relationship outcome. If a record with the same
 * (relationshipSlug + personalitySlugA + personalitySlugB) tuple already
 * exists within the last 24h we treat it as a re-test and bump `reTestCount`.
 */
export function archiveCodexRecord(input: {
  relationshipSlug: string;
  personalitySlugA: string;
  personalitySlugB?: string;
  scenario?: CodexScenarioBucket;
  partnerNickname?: string;
  compatibility?: number;
}): CodexRecord {
  const blob = readBlob();
  const now = Date.now();
  const scenario = input.scenario ?? 'other';

  const dedupWindowMs = 24 * 60 * 60 * 1000;
  const existing = blob.records.find(
    r =>
      r.relationshipSlug === input.relationshipSlug &&
      r.personalitySlugA === input.personalitySlugA &&
      r.personalitySlugB === input.personalitySlugB &&
      now - r.createdAt < dedupWindowMs,
  );
  if (existing) {
    existing.updatedAt = now;
    existing.reTestCount += 1;
    if (input.compatibility !== undefined) existing.compatibility = input.compatibility;
    if (input.partnerNickname && !existing.partnerNickname) existing.partnerNickname = input.partnerNickname;
    writeBlob(blob);
    return existing;
  }

  const record: CodexRecord = {
    id: `${now}-${input.relationshipSlug}`,
    relationshipSlug: input.relationshipSlug,
    personalitySlugA: input.personalitySlugA,
    personalitySlugB: input.personalitySlugB,
    partnerNickname: input.partnerNickname,
    scenario,
    compatibility: input.compatibility,
    createdAt: now,
    updatedAt: now,
    reTestCount: 0,
  };
  blob.records.unshift(record);
  // Cap to 200 records to keep localStorage bounded.
  if (blob.records.length > 200) blob.records.length = 200;
  writeBlob(blob);
  return record;
}

export function updateCodexRecord(
  id: string,
  patch: Partial<Pick<CodexRecord, 'partnerNickname' | 'note' | 'scenario'>>,
): CodexRecord | null {
  const blob = readBlob();
  const record = blob.records.find(r => r.id === id);
  if (!record) return null;
  if (patch.partnerNickname !== undefined) record.partnerNickname = patch.partnerNickname;
  if (patch.note !== undefined) record.note = patch.note;
  if (patch.scenario !== undefined) record.scenario = patch.scenario;
  record.updatedAt = Date.now();
  writeBlob(blob);
  return record;
}

export function deleteCodexRecord(id: string): boolean {
  const blob = readBlob();
  const next = blob.records.filter(r => r.id !== id);
  if (next.length === blob.records.length) return false;
  writeBlob({ v: STORAGE_VERSION, records: next });
  return true;
}

export function replaceCodexRecords(records: CodexRecord[]): void {
  writeBlob({
    v: STORAGE_VERSION,
    records: records.slice(0, 200).map((record) => ({ ...record })),
  });
}

export const CODEX_SCENARIO_LABELS: Record<CodexScenarioBucket, { label: string; emoji: string; tagline: string }> = {
  lover:  { label: '对象 / 暧昧', emoji: '💕', tagline: '正在发生的或将要发生的' },
  bestie: { label: '闺蜜 / 死党', emoji: '👯', tagline: '陪你走最远的人' },
  family: { label: '家人',       emoji: '🌿', tagline: '没法选但需要被命名' },
  work:   { label: '同事 / 队友', emoji: '💼', tagline: '工位邻居和队友' },
  enemy:  { label: '死对头',     emoji: '🗡️', tagline: '让你恨得有 idea' },
  other:  { label: '其他',       emoji: '✦',  tagline: '一时分不进上面任何一类' },
};

export const CODEX_SCENARIO_ORDER: CodexScenarioBucket[] = [
  'lover',
  'bestie',
  'family',
  'work',
  'enemy',
  'other',
];

/** Milestone thresholds we celebrate (matches gallery milestone language). */
export const CODEX_MILESTONES = [5, 12, 25] as const;
