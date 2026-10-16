import { getHistory, type MirrorHistoryRecord } from '@/lib/mirror/credits';
import { getDualArchive, type DualPairRecord } from '@/lib/mysti/dual-archive';
import { listRecentDecisions, type DecisionLogEntry } from '@/lib/mysti/decision-log';
import { loadDestinyArchive, type DestinyArchiveEntry } from '@/lib/mysti/destiny/archive';
import { getBalance, getLedger, type LedgerEntry } from '@/lib/wallet/ling-bi';
import { loadCard, type WtfCardData } from '@/lib/wtf-card';
import { getWtftiPersonality } from '@/lib/wtfti-personalities';

export interface AggregateData {
  wtfCard: WtfCardData | null;
  mirrorHistory: MirrorHistoryRecord[];
  decisionArchive: DecisionLogEntry[];
  destinyArchive: DestinyArchiveEntry[];
  dualArchive: DualPairRecord[];
  lingBiBalance: number;
  ledger: LedgerEntry[];
}

export const EMPTY_DATA: AggregateData = {
  wtfCard: null,
  mirrorHistory: [],
  decisionArchive: [],
  destinyArchive: [],
  dualArchive: [],
  lingBiBalance: 0,
  ledger: [],
};

export type LingjianEntryType =
  | 'wtfti_profile'
  | 'mirror_report'
  | 'mysti_decision'
  | 'mysti_destiny'
  | 'mysti_dual'
  | 'wallet_ledger';

export interface LingjianSyncEntry {
  clientEntryId: string;
  type: LingjianEntryType;
  title: string;
  summary: string;
  sourceCreatedAt?: string;
  payload: Record<string, unknown>;
}

export function loadLingjianAggregateData(): AggregateData {
  return {
    wtfCard: loadCard(),
    mirrorHistory: getHistory(),
    decisionArchive: listRecentDecisions(20),
    destinyArchive: loadDestinyArchive(),
    dualArchive: getDualArchive(),
    lingBiBalance: getBalance(),
    ledger: getLedger(),
  };
}

export function buildLingjianSyncEntries(data: AggregateData): LingjianSyncEntry[] {
  const entries: LingjianSyncEntry[] = [];
  const slug = data.wtfCard?.results?.wtfti?.slug;

  if (slug) {
    const personality = getWtftiPersonality(slug);
    entries.push({
      clientEntryId: `wtfti:${slug}`,
      type: 'wtfti_profile',
      title: personality?.wtftiName ?? 'WTFTI 主神档案',
      summary: compactText(personality?.tagline ?? personality?.copy?.wtfHit ?? '主神档案已生成'),
      payload: toPayload({
        card: data.wtfCard,
        personalitySlug: slug,
      }),
    });
  }

  for (const record of data.mirrorHistory) {
    entries.push({
      clientEntryId: `mirror:${record.id}`,
      type: 'mirror_report',
      title: `灵镜 · ${modeLabel(record.mode)}`,
      summary: compactText(record.summary || '形象档案已生成'),
      sourceCreatedAt: isoFromTimestamp(record.timestamp),
      payload: toPayload({
        ...record,
        imageUrl: undefined,
        hasImagePreview: Boolean(record.imageUrl),
      }),
    });
  }

  for (const entry of data.decisionArchive) {
    entries.push({
      clientEntryId: `mysti-decision:${entry.id}`,
      type: 'mysti_decision',
      title: `问心 · ${entry.stance}`,
      summary: compactText(entry.quote),
      sourceCreatedAt: isoFromDateLike(entry.createdAt),
      payload: toPayload(entry),
    });
  }

  for (const entry of data.destinyArchive) {
    entries.push({
      clientEntryId: `mysti-destiny:${entry.id}`,
      type: 'mysti_destiny',
      title: `命书馆 · ${entry.inputSummary.solarDate}`,
      summary: compactText(entry.report.blindReading?.summary ?? '命书已生成'),
      sourceCreatedAt: isoFromTimestamp(entry.recordedAt),
      payload: toPayload(entry),
    });
  }

  for (const entry of data.dualArchive) {
    entries.push({
      clientEntryId: `mysti-dual:${entry.selfSlug}:${entry.partnerSlug}:${entry.recordedAt}`,
      type: 'mysti_dual',
      title: `合盘 · ${entry.archetypeName ?? '关系原型'}`,
      summary: compactText(`${entry.selfSlug} x ${entry.partnerSlug}`),
      sourceCreatedAt: isoFromTimestamp(entry.recordedAt),
      payload: toPayload(entry),
    });
  }

  for (const entry of data.ledger.slice(0, 40)) {
    entries.push({
      clientEntryId: `wallet:${entry.id}`,
      type: 'wallet_ledger',
      title: entry.delta > 0 ? '灵币入账' : '灵币消费',
      summary: compactText(`${entry.delta > 0 ? '+' : ''}${entry.delta} Ling-Bi · ${entry.source}`),
      sourceCreatedAt: isoFromTimestamp(entry.timestamp),
      payload: toPayload(entry),
    });
  }

  return dedupeByClientId(entries);
}

function modeLabel(mode: string): string {
  switch (mode) {
    case 'beauty':
      return '变美档案';
    case 'color':
      return '色彩档案';
    case 'compare':
      return '对比档案';
    case 'fortune':
      return '旧命纹记录';
    default:
      return '形象档案';
  }
}

function compactText(value: string, max = 180): string {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function isoFromTimestamp(timestamp: number | undefined): string | undefined {
  if (!timestamp || !Number.isFinite(timestamp)) return undefined;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function isoFromDateLike(value: string | number | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toPayload(value: unknown): Record<string, unknown> {
  try {
    const parsed = JSON.parse(JSON.stringify(value)) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function dedupeByClientId(entries: LingjianSyncEntry[]): LingjianSyncEntry[] {
  const map = new Map<string, LingjianSyncEntry>();
  for (const entry of entries) {
    map.set(entry.clientEntryId, entry);
  }
  return Array.from(map.values());
}
