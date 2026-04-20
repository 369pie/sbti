/**
 * Aggregations on top of `public.product_events` and `public.perf_metrics`,
 * used by `/creator/admin/ops/`.
 *
 * Everything is read-only and runs server-side under the service role. Any
 * missing-table / no-data scenario must degrade to empty arrays + a warning so
 * the dashboard never crashes during early rollout.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type WithTs = { ts: string };

interface ProductEventRow extends WithTs {
  module: string;
  event: string;
  step: string | null;
  slug: string | null;
  session_id: string | null;
  pathname: string | null;
  ok: boolean | null;
  value: number | null;
  props: Record<string, unknown> | null;
}

interface PerfRow {
  metric: string;
  value: number;
  pathname: string | null;
  rating: string | null;
}

type QueryError = { code?: string; message?: string };

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as QueryError;
  return (
    candidate.code === 'PGRST205' ||
    candidate.code === '42P01' ||
    candidate.code === '42703'
  );
}

function readRows<T>(
  result: { data: T[] | null; error: QueryError | null },
  label: string,
  warnings: string[],
  missingMessage?: string,
): T[] {
  if (result.error) {
    if (isMissingTableError(result.error)) {
      warnings.push(missingMessage ?? `${label} 数据表未初始化，已跳过该区块。`);
      return [];
    }
    throw new Error(`${label} 查询失败: ${result.error.message ?? 'unknown error'}`);
  }
  return (result.data ?? []) as T[];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return Math.round(sorted[idx] * 100) / 100;
}

export interface OpsFunnelStep {
  step: string;
  label: string;
  sessions: number;
  events: number;
  /** Percent of the funnel's first step. 100 means "every session reached this step". */
  conversion: number;
}

export interface OpsModuleFunnel {
  module: string;
  label: string;
  totalSessions7Days: number;
  totalEvents7Days: number;
  totalSessions7DaysPrev: number;
  steps: OpsFunnelStep[];
}

export interface OpsDropOffPoint {
  step: string;
  label: string;
  sessions: number;
  /** % of sessions that reached the previous step but did NOT reach this one. */
  drop: number;
}

export interface OpsTopEventDelta {
  module: string;
  event: string;
  current: number;
  previous: number;
  /** Percent change vs previous 7 days. May be Infinity for new spikes. */
  change: number;
}

export interface OpsPathPerf {
  pathname: string;
  samples: number;
  lcpP75: number;
  inpP75: number;
  clsP75: number;
  /** Share of LCP samples rated "poor". */
  lcpPoorShare: number;
}

export interface OpsModuleEngagement {
  module: string;
  label: string;
  sessions: number;
  finishRate: number;
  shareRate: number;
  medianTimeToFinishMs: number | null;
}

export interface ProductEventsInsights {
  generatedAt: string;
  warnings: string[];
  hasProductEvents: boolean;
  hasPerfMetrics: boolean;
  funnels: OpsModuleFunnel[];
  dropOffs: { module: string; label: string; points: OpsDropOffPoint[] }[];
  engagement: OpsModuleEngagement[];
  topDeltas: OpsTopEventDelta[];
  perfTopPaths: OpsPathPerf[];
}

const MODULE_LABELS: Record<string, string> = {
  first_look: 'First Look',
  mysti: 'Mysti',
  cpti: 'CPTI',
  soulti: 'SoulTI',
  museum: 'Museum',
  creator: 'Creator',
  identify: 'Identify',
  home: 'Home',
  auth: 'Auth',
};

function moduleLabel(module: string): string {
  return MODULE_LABELS[module] ?? module;
}

interface FunnelDefinition {
  module: string;
  steps: { step: string; label: string }[];
}

const FUNNEL_DEFINITIONS: FunnelDefinition[] = [
  {
    module: 'first_look',
    steps: [
      { step: 'entry', label: '进入仪式' },
      { step: 'q_advance', label: '至少答 1 题' },
      { step: 'finish', label: '看到结果' },
      { step: 'share', label: '点击分享' },
      { step: 'deep_click', label: '深度跳转' },
    ],
  },
  {
    module: 'soulti',
    steps: [
      { step: 'entry', label: '进入仪式' },
      { step: 'q_advance', label: '至少答 1 题' },
      { step: 'finish', label: '看到结果' },
      { step: 'share', label: '点击分享' },
      { step: 'deep_report_view', label: '点击深度报告' },
    ],
  },
  {
    module: 'mysti',
    steps: [
      { step: 'entry', label: '开始测试' },
      { step: 'finish', label: '完成测试' },
      { step: 'share', label: '点击分享' },
      { step: 'paywall', label: '看到付费墙' },
      { step: 'subscribe', label: '触发订阅 / 支付' },
    ],
  },
  {
    module: 'cpti',
    steps: [
      { step: 'pair_view', label: '查看配对面板' },
      { step: 'pair_generate', label: '生成配对码' },
      { step: 'pair_share', label: '复制 / 下载海报' },
      { step: 'match_finish', label: '完成匹配' },
      { step: 'gallery_explore', label: '探索图鉴' },
    ],
  },
];

function buildFunnel(
  rows: ProductEventRow[],
  definition: FunnelDefinition,
  windowStartMs: number,
  prevWindowStartMs: number,
): OpsModuleFunnel {
  const moduleRows = rows.filter((row) => row.module === definition.module);
  const inWindow = moduleRows.filter((row) => Date.parse(row.ts) >= windowStartMs);
  const inPrev = moduleRows.filter(
    (row) => Date.parse(row.ts) >= prevWindowStartMs && Date.parse(row.ts) < windowStartMs,
  );

  const sessionsBySession = new Set<string>();
  for (const row of inWindow) {
    if (row.session_id) sessionsBySession.add(row.session_id);
  }
  const sessionsPrev = new Set<string>();
  for (const row of inPrev) {
    if (row.session_id) sessionsPrev.add(row.session_id);
  }

  const stepResults: OpsFunnelStep[] = definition.steps.map((stepDef) => {
    const matching = inWindow.filter(
      (row) => row.step === stepDef.step || row.event.endsWith(stepDef.step),
    );
    const stepSessions = new Set<string>();
    for (const row of matching) {
      if (row.session_id) stepSessions.add(row.session_id);
    }
    return {
      step: stepDef.step,
      label: stepDef.label,
      sessions: stepSessions.size,
      events: matching.length,
      conversion: 0,
    };
  });

  const baseline = stepResults[0]?.sessions ?? 0;
  for (const item of stepResults) {
    item.conversion =
      baseline > 0 ? Number(((item.sessions / baseline) * 100).toFixed(1)) : 0;
  }

  return {
    module: definition.module,
    label: moduleLabel(definition.module),
    totalSessions7Days: sessionsBySession.size,
    totalEvents7Days: inWindow.length,
    totalSessions7DaysPrev: sessionsPrev.size,
    steps: stepResults,
  };
}

function buildDropOff(funnel: OpsModuleFunnel): OpsDropOffPoint[] {
  const points: OpsDropOffPoint[] = [];
  for (let i = 1; i < funnel.steps.length; i += 1) {
    const prev = funnel.steps[i - 1];
    const cur = funnel.steps[i];
    const drop =
      prev.sessions > 0
        ? Number((((prev.sessions - cur.sessions) / prev.sessions) * 100).toFixed(1))
        : 0;
    points.push({
      step: cur.step,
      label: cur.label,
      sessions: cur.sessions,
      drop,
    });
  }
  return points;
}

function buildEngagement(
  rows: ProductEventRow[],
  windowStartMs: number,
): OpsModuleEngagement[] {
  const groups = new Map<string, ProductEventRow[]>();
  for (const row of rows) {
    if (Date.parse(row.ts) < windowStartMs) continue;
    const list = groups.get(row.module) ?? [];
    list.push(row);
    groups.set(row.module, list);
  }

  const result: OpsModuleEngagement[] = [];
  for (const [moduleName, moduleRows] of groups.entries()) {
    const sessionEntries = new Map<string, { entry?: number; finish?: number; share?: number }>();
    for (const row of moduleRows) {
      if (!row.session_id) continue;
      const session = sessionEntries.get(row.session_id) ?? {};
      const tsMs = Date.parse(row.ts);
      if (row.step === 'entry' || row.step === 'test_start') {
        session.entry = session.entry === undefined ? tsMs : Math.min(session.entry, tsMs);
      }
      if (row.step === 'finish' || row.step === 'match_finish') {
        session.finish = session.finish === undefined ? tsMs : Math.min(session.finish, tsMs);
      }
      if (row.step === 'share' || row.step === 'pair_share') {
        session.share = tsMs;
      }
      sessionEntries.set(row.session_id, session);
    }

    const totalSessions = sessionEntries.size;
    let finished = 0;
    let shared = 0;
    const durations: number[] = [];
    for (const session of sessionEntries.values()) {
      if (session.finish !== undefined) {
        finished += 1;
        if (session.entry !== undefined && session.finish > session.entry) {
          durations.push(session.finish - session.entry);
        }
      }
      if (session.share !== undefined) shared += 1;
    }

    durations.sort((a, b) => a - b);
    const median = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : null;

    result.push({
      module: moduleName,
      label: moduleLabel(moduleName),
      sessions: totalSessions,
      finishRate:
        totalSessions > 0 ? Number(((finished / totalSessions) * 100).toFixed(1)) : 0,
      shareRate:
        totalSessions > 0 ? Number(((shared / totalSessions) * 100).toFixed(1)) : 0,
      medianTimeToFinishMs: median,
    });
  }

  return result.sort((a, b) => b.sessions - a.sessions);
}

function buildTopDeltas(
  rows: ProductEventRow[],
  windowStartMs: number,
  prevWindowStartMs: number,
  limit = 8,
): OpsTopEventDelta[] {
  const currentMap = new Map<string, number>();
  const prevMap = new Map<string, number>();

  for (const row of rows) {
    const tsMs = Date.parse(row.ts);
    const key = `${row.module}::${row.event}`;
    if (tsMs >= windowStartMs) {
      currentMap.set(key, (currentMap.get(key) ?? 0) + 1);
    } else if (tsMs >= prevWindowStartMs) {
      prevMap.set(key, (prevMap.get(key) ?? 0) + 1);
    }
  }

  const allKeys = new Set<string>([...currentMap.keys(), ...prevMap.keys()]);
  const deltas: OpsTopEventDelta[] = [];
  for (const key of allKeys) {
    const current = currentMap.get(key) ?? 0;
    const previous = prevMap.get(key) ?? 0;
    if (current + previous < 5) continue; // skip noise
    const change =
      previous > 0
        ? Number((((current - previous) / previous) * 100).toFixed(1))
        : current > 0
        ? Number.POSITIVE_INFINITY
        : 0;
    const [module, event] = key.split('::');
    deltas.push({ module, event, current, previous, change });
  }

  return deltas
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit);
}

function buildPerfTopPaths(rows: PerfRow[], limit = 6): OpsPathPerf[] {
  const groups = new Map<
    string,
    { lcp: number[]; inp: number[]; cls: number[]; lcpPoor: number; lcpTotal: number }
  >();
  for (const row of rows) {
    if (!row.pathname) continue;
    const bucket = groups.get(row.pathname) ?? {
      lcp: [],
      inp: [],
      cls: [],
      lcpPoor: 0,
      lcpTotal: 0,
    };
    if (row.metric === 'LCP') {
      bucket.lcp.push(row.value);
      bucket.lcpTotal += 1;
      if (row.rating === 'poor') bucket.lcpPoor += 1;
    } else if (row.metric === 'INP') {
      bucket.inp.push(row.value);
    } else if (row.metric === 'CLS') {
      bucket.cls.push(row.value);
    }
    groups.set(row.pathname, bucket);
  }

  const items: OpsPathPerf[] = [];
  for (const [pathname, bucket] of groups.entries()) {
    const samples = bucket.lcp.length + bucket.inp.length + bucket.cls.length;
    if (samples < 5) continue; // require minimum sample size
    items.push({
      pathname,
      samples,
      lcpP75: percentile(bucket.lcp, 0.75),
      inpP75: percentile(bucket.inp, 0.75),
      clsP75: percentile(bucket.cls, 0.75),
      lcpPoorShare:
        bucket.lcpTotal > 0
          ? Number(((bucket.lcpPoor / bucket.lcpTotal) * 100).toFixed(1))
          : 0,
    });
  }

  return items
    .sort((a, b) => b.samples - a.samples)
    .slice(0, limit);
}

export async function fetchProductEventsInsights(): Promise<ProductEventsInsights> {
  const admin = createAdminSupabaseClient();
  const warnings: string[] = [];
  const now = Date.now();
  const windowStartMs = now - 7 * MS_PER_DAY;
  const prevWindowStartMs = now - 14 * MS_PER_DAY;
  const since14Iso = new Date(prevWindowStartMs).toISOString();
  const since7Iso = new Date(windowStartMs).toISOString();

  const [eventsResult, perfResult] = await Promise.all([
    admin
      .from('product_events')
      .select('module, event, step, slug, session_id, pathname, ok, value, ts, props')
      .gte('ts', since14Iso)
      .order('ts', { ascending: true })
      .limit(50_000),
    admin
      .from('perf_metrics')
      .select('metric, value, pathname, rating')
      .gte('created_at', since7Iso)
      .in('metric', ['LCP', 'INP', 'CLS'])
      .limit(20_000),
  ]);

  const events = readRows<ProductEventRow>(
    eventsResult,
    'product_events',
    warnings,
    'product_events 表尚未初始化，请先执行 db/migrations/2026-04-19_product_events.sql。',
  );
  const perfRows = readRows<PerfRow>(
    perfResult,
    'perf_metrics',
    warnings,
    'perf_metrics 表尚未初始化，请先执行 perf 监控迁移。',
  );

  const funnels = FUNNEL_DEFINITIONS.map((def) =>
    buildFunnel(events, def, windowStartMs, prevWindowStartMs),
  );

  const dropOffs = funnels.map((funnel) => ({
    module: funnel.module,
    label: funnel.label,
    points: buildDropOff(funnel),
  }));

  const engagement = buildEngagement(events, windowStartMs);
  const topDeltas = buildTopDeltas(events, windowStartMs, prevWindowStartMs);
  const perfTopPaths = buildPerfTopPaths(perfRows);

  return {
    generatedAt: new Date().toISOString(),
    warnings,
    hasProductEvents: events.length > 0,
    hasPerfMetrics: perfRows.length > 0,
    funnels,
    dropOffs,
    engagement,
    topDeltas,
    perfTopPaths,
  };
}
