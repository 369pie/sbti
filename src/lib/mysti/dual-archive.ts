/**
 * 关系档案（W3）— 本地缓存合盘历史
 *
 * 每次进入 `/mysti/result/<self>?partner=<other>` 时调用 `recordDualPair`，
 * 形成"我所有的合盘历史"列表，供 `/mysti/archive/` 页面渲染。
 *
 * 注：当前完全 localStorage 化；后续可与 Supabase `mysti_dual_pairs` 同步。
 */

const STORAGE_KEY = 'mysti-dual-archive';
const MAX_RECORDS = 100;

export interface DualPairRecord {
  /** 我自己的人格 slug */
  selfSlug: string;
  /** 对方人格 slug */
  partnerSlug: string;
  /** 关系原型 id（来自 dual-interpretation.ts） */
  archetypeId?: string;
  /** 关系原型名称（如「天作之合」） */
  archetypeName?: string;
  /** 关系原型 emoji */
  archetypeEmoji?: string;
  /** 写入时间（ms） */
  recordedAt: number;
}

function load(): DualPairRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DualPairRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(records: DualPairRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.slice(0, MAX_RECORDS)),
    );
  } catch {
    /* swallow */
  }
}

function pairKey(a: string, b: string): string {
  return `${a}::${b}`;
}

/** 记录一次合盘（同 pair 24h 内不重复写入） */
export function recordDualPair(record: Omit<DualPairRecord, 'recordedAt'>): void {
  if (!record.selfSlug || !record.partnerSlug) return;
  const list = load();
  const key = pairKey(record.selfSlug, record.partnerSlug);
  const now = Date.now();
  const recent = list.find(
    r => pairKey(r.selfSlug, r.partnerSlug) === key && now - r.recordedAt < 24 * 60 * 60 * 1000,
  );
  if (recent) return;
  list.unshift({ ...record, recordedAt: now });
  save(list);
}

export function getDualArchive(): DualPairRecord[] {
  return load().sort((a, b) => b.recordedAt - a.recordedAt);
}

export function clearDualArchive(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* swallow */
  }
}

/** 删除指定一条 */
export function removeDualPair(selfSlug: string, partnerSlug: string, recordedAt: number): void {
  const list = load();
  const next = list.filter(
    r => !(r.selfSlug === selfSlug && r.partnerSlug === partnerSlug && r.recordedAt === recordedAt),
  );
  save(next);
}
