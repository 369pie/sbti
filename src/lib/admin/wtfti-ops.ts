import { CREATOR_APPLICATIONS_TABLE, isCreatorApplicationsTableMissing } from '@/lib/creator/applications';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type WithCreatedAt = { created_at: string };

interface CreatorRow {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  is_verified: boolean;
  created_at: string;
}

interface UniverseRow {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  creator_id: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  is_paid: boolean;
  price_cents: number;
  total_tests: number;
  total_shares: number;
  published_at: string | null;
  submitted_at: string | null;
}

interface CreatorResultRow extends WithCreatedAt {
  universe_id: string;
  personality_slug: string;
  shared: boolean;
  referrer: string | null;
  session_id: string | null;
}

interface IdentifyAssessmentRow extends WithCreatedAt {
  persona_slug: string;
}

interface CptiRelationshipRow extends WithCreatedAt {
  relationship_slug: string;
  relationship_tier: string | null;
}

interface CreatorOrderRow extends WithCreatedAt {
  creator_id: string;
  universe_id: string;
  amount_cents: number;
  creator_earning_cents: number;
  status: 'confirmed' | 'refunded' | 'disputed';
}

interface CreatorSettlementRow {
  creator_id: string;
  amount_cents: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  completed_at: string | null;
}

interface CreatorApplicationRow extends WithCreatedAt {
  status: string;
  wants_free: boolean;
  wants_paid: boolean;
  source_page: string | null;
}

interface AtlasStatsRow {
  user_id: string;
  relationship_type_count: number;
  soul_count: number;
  rare_relationship_count: number;
}

interface UserProfileRow {
  user_id: string;
  nickname: string | null;
}

type QueryError = {
  code?: string;
  message?: string;
};

export interface OpsMetricDelta {
  current: number;
  previous: number;
}

export interface OpsDailyTrend {
  date: string;
  ugc: number;
  identify: number;
  cpti: number;
  total: number;
}

export interface OpsRankedCount {
  label: string;
  count: number;
  share: number;
}

export interface OpsUniverseRank {
  universeId: string;
  slug: string;
  name: string;
  emoji: string;
  creatorName: string;
  tests: number;
  shares: number;
  shareRate: number;
  isPaid: boolean;
  priceCents: number;
}

export interface OpsQueueItem {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  creatorName: string;
  submittedAt: string | null;
}

export interface OpsSettlementItem {
  creatorId: string;
  creatorName: string;
  amountCents: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
}

export interface OpsCollectorItem {
  userId: string;
  nickname: string;
  soulCount: number;
  rareCount: number;
  relationshipTypeCount: number;
}

export interface OpsDataHealthItem {
  module: string;
  status: 'durable' | 'partial' | 'client-only';
  summary: string;
  note: string;
}

export interface WtftiOpsDashboardData {
  generatedAt: string;
  warnings: string[];
  overview: {
    publishedUniverseCount: number;
    creatorsWithPublishedCount: number;
    creatorCount: number;
    verifiedCreatorCount: number;
    creatorTestsAllTime: number;
    creatorSharesAllTime: number;
    creatorTests7Days: OpsMetricDelta;
    creatorShareRate30Days: number;
    identifyAssessmentsAllTime: number;
    identifyAssessments7Days: OpsMetricDelta;
    cptiRelationshipsAllTime: number;
    cptiRelationships7Days: OpsMetricDelta;
    revenueGrossAllTimeCents: number;
    revenueGross30DaysCents: number;
    revenueNet30DaysCents: number;
    pendingSettlementCents: number;
    pendingSettlementCount: number;
    reviewQueueCount: number;
    creatorApplicationsNew7Days: number;
  };
  trends14Days: OpsDailyTrend[];
  creator: {
    tierDistribution: OpsRankedCount[];
    topUniverses30Days: OpsUniverseRank[];
    topReferrers30Days: OpsRankedCount[];
    recentPublications: Array<{
      id: string;
      slug: string;
      name: string;
      emoji: string;
      creatorName: string;
      publishedAt: string | null;
      isPaid: boolean;
      priceCents: number;
      totalTests: number;
    }>;
  };
  identify: {
    topPersonas30Days: OpsRankedCount[];
    assessments30Days: number;
  };
  cpti: {
    topRelationships30Days: OpsRankedCount[];
    relationships30Days: number;
    topCollectors: OpsCollectorItem[];
  };
  operations: {
    reviewQueue: OpsQueueItem[];
    applicationsAvailable: boolean;
    applicationStatusCounts: OpsRankedCount[];
    applicationSourceCounts: OpsRankedCount[];
    applicationDemandMix: {
      freeOnly: number;
      paidOnly: number;
      mixed: number;
    };
    pendingSettlements: OpsSettlementItem[];
  };
  dataHealth: OpsDataHealthItem[];
}

function isMissingTableError(error: unknown): boolean {
  if (isCreatorApplicationsTableMissing(error)) {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

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
): T[] {
  if (result.error) {
    if (isMissingTableError(result.error)) {
      warnings.push(`${label} 数据表未初始化，已跳过该区块。`);
      return [];
    }

    throw new Error(`${label} 查询失败: ${result.error.message ?? 'unknown error'}`);
  }

  return (result.data ?? []) as T[];
}

function readCount(
  result: { count: number | null; error: QueryError | null },
  label: string,
  warnings: string[],
): number {
  if (result.error) {
    if (isMissingTableError(result.error)) {
      warnings.push(`${label} 统计表未初始化，已按 0 处理。`);
      return 0;
    }

    throw new Error(`${label} 统计失败: ${result.error.message ?? 'unknown error'}`);
  }

  return result.count ?? 0;
}

function getStartOfDay(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function countSince<T extends WithCreatedAt>(rows: T[], boundary: Date): number {
  const boundaryMs = boundary.getTime();
  return rows.reduce((total, row) => (timestamp(row.created_at) >= boundaryMs ? total + 1 : total), 0);
}

function countBetween<T extends WithCreatedAt>(rows: T[], start: Date, end: Date): number {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return rows.reduce((total, row) => {
    const createdAt = timestamp(row.created_at);
    return createdAt >= startMs && createdAt < endMs ? total + 1 : total;
  }, 0);
}

function sumBy<T>(rows: T[], picker: (row: T) => number): number {
  return rows.reduce((total, row) => total + picker(row), 0);
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toRankedCounts(map: Map<string, number>, limit: number): OpsRankedCount[] {
  const total = sumBy([...map.values()], (count) => count);
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }));
}

function normalizeReferrerLabel(referrer: string | null): string {
  if (!referrer) {
    return 'direct';
  }

  try {
    if (referrer.startsWith('http')) {
      return new URL(referrer).hostname;
    }
  } catch {
    return referrer;
  }

  return referrer;
}

function buildDaySeries(days: number): string[] {
  return Array.from({ length: days }, (_, index) => toDayKey(new Date(getStartOfDay(days - index - 1))));
}

function buildTrendData(
  creatorResults: CreatorResultRow[],
  identifyAssessments: IdentifyAssessmentRow[],
  cptiRelationships: CptiRelationshipRow[],
): OpsDailyTrend[] {
  const dayKeys = buildDaySeries(14);
  const trendMap = new Map<string, OpsDailyTrend>(
    dayKeys.map((date) => [date, { date, ugc: 0, identify: 0, cpti: 0, total: 0 }]),
  );

  for (const row of creatorResults) {
    const key = row.created_at.slice(0, 10);
    const item = trendMap.get(key);
    if (item) item.ugc += 1;
  }

  for (const row of identifyAssessments) {
    const key = row.created_at.slice(0, 10);
    const item = trendMap.get(key);
    if (item) item.identify += 1;
  }

  for (const row of cptiRelationships) {
    const key = row.created_at.slice(0, 10);
    const item = trendMap.get(key);
    if (item) item.cpti += 1;
  }

  return dayKeys.map((date) => {
    const item = trendMap.get(date) ?? { date, ugc: 0, identify: 0, cpti: 0, total: 0 };
    return {
      ...item,
      total: item.ugc + item.identify + item.cpti,
    };
  });
}

function getDataHealthItems(): OpsDataHealthItem[] {
  return [
    {
      module: 'Creator Universe',
      status: 'durable',
      summary: 'Supabase 已落完成、分享、来源、订单与结算。',
      note: '当前最适合做运营和商业判断。',
    },
    {
      module: 'Identify',
      status: 'durable',
      summary: '画像结果已持久化，可看总量与类型分布。',
      note: '目前缺入口到完成漏斗。',
    },
    {
      module: 'CPTI',
      status: 'durable',
      summary: '关系结果、收藏统计、排行榜都已落库。',
      note: '适合看关系类型热度和收藏深度。',
    },
    {
      module: 'First Look',
      status: 'partial',
      summary: '现阶段只有 Vercel / dataLayer 事件。',
      note: '未进入 Supabase，暂时不能做内部漏斗报表。',
    },
    {
      module: 'Mysti',
      status: 'client-only',
      summary: '抽卡与收藏主要在本地存储。',
      note: '只能看外部事件，不能做可靠留存和收藏看板。',
    },
    {
      module: 'SoulTI',
      status: 'partial',
      summary: '结果未持久化，支付链路仍是 stub。',
      note: '适合下一阶段补深度报告转化漏斗。',
    },
  ];
}

export async function fetchWtftiOpsDashboardData(): Promise<WtftiOpsDashboardData> {
  const admin = createAdminSupabaseClient();
  const warnings: string[] = [];

  const since30Days = getStartOfDay(29);
  const since7Days = getStartOfDay(6);
  const since14Days = getStartOfDay(13);

  const [
    creatorsResult,
    universesResult,
    creatorResults30DaysResult,
    identifyAssessments30DaysResult,
    identifyAssessmentsCountResult,
    cptiRelationships30DaysResult,
    cptiRelationshipsCountResult,
    creatorOrdersResult,
    creatorSettlementsResult,
    creatorApplicationsResult,
    atlasStatsResult,
  ] = await Promise.all([
    admin
      .from('creators')
      .select('id, name, tier, is_verified, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('creator_universes')
      .select('id, slug, name, emoji, creator_id, status, is_paid, price_cents, total_tests, total_shares, published_at, submitted_at')
      .order('created_at', { ascending: false }),
    admin
      .from('creator_test_results')
      .select('universe_id, personality_slug, shared, created_at, referrer, session_id')
      .gte('created_at', since30Days.toISOString())
      .order('created_at', { ascending: true }),
    admin
      .from('identify_assessments')
      .select('persona_slug, created_at')
      .gte('created_at', since30Days.toISOString())
      .order('created_at', { ascending: true }),
    admin
      .from('identify_assessments')
      .select('*', { count: 'exact', head: true }),
    admin
      .from('cpti_relationships')
      .select('relationship_slug, relationship_tier, created_at')
      .gte('created_at', since30Days.toISOString())
      .order('created_at', { ascending: true }),
    admin
      .from('cpti_relationships')
      .select('*', { count: 'exact', head: true }),
    admin
      .from('creator_orders')
      .select('creator_id, universe_id, amount_cents, creator_earning_cents, status, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('creator_settlements')
      .select('creator_id, amount_cents, status, requested_at, completed_at')
      .order('requested_at', { ascending: false }),
    admin
      .from(CREATOR_APPLICATIONS_TABLE)
      .select('status, wants_free, wants_paid, source_page, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('user_atlas_stats')
      .select('user_id, relationship_type_count, soul_count, rare_relationship_count')
      .or('relationship_type_count.gt.0,soul_count.gt.0,rare_relationship_count.gt.0')
      .order('rare_relationship_count', { ascending: false })
      .order('soul_count', { ascending: false })
      .limit(12),
  ]);

  const creators = readRows<CreatorRow>(creatorsResult, '创作者', warnings);
  const universes = readRows<UniverseRow>(universesResult, '创作者宇宙', warnings);
  const creatorResults30Days = readRows<CreatorResultRow>(creatorResults30DaysResult, '创作者测试结果', warnings);
  const identifyAssessments30Days = readRows<IdentifyAssessmentRow>(identifyAssessments30DaysResult, 'Identify 画像结果', warnings);
  const identifyAssessmentsAllTime = readCount(identifyAssessmentsCountResult, 'Identify 画像结果', warnings);
  const cptiRelationships30Days = readRows<CptiRelationshipRow>(cptiRelationships30DaysResult, 'CPTI 关系结果', warnings);
  const cptiRelationshipsAllTime = readCount(cptiRelationshipsCountResult, 'CPTI 关系结果', warnings);
  const creatorOrders = readRows<CreatorOrderRow>(creatorOrdersResult, '创作者订单', warnings);
  const creatorSettlements = readRows<CreatorSettlementRow>(creatorSettlementsResult, '创作者结算', warnings);
  const creatorApplications = readRows<CreatorApplicationRow>(creatorApplicationsResult, '创作者申请', warnings);
  const atlasStats = readRows<AtlasStatsRow>(atlasStatsResult, 'CPTI 排行榜统计', warnings);

  const creatorIds = atlasStats.map((row) => row.user_id);
  const userProfiles = creatorIds.length > 0
    ? readRows<UserProfileRow>(
        await admin
          .from('user_profiles')
          .select('user_id, nickname')
          .in('user_id', creatorIds),
        '用户资料',
        warnings,
      )
    : [];

  const creatorsById = new Map(creators.map((creator) => [creator.id, creator]));
  const universesById = new Map(universes.map((universe) => [universe.id, universe]));
  const nicknamesByUserId = new Map(userProfiles.map((profile) => [profile.user_id, profile.nickname ?? '匿名用户']));

  const publishedUniverses = universes.filter((universe) => universe.status === 'published');
  const reviewUniverses = universes.filter((universe) => universe.status === 'review');
  const creatorsWithPublishedCount = new Set(publishedUniverses.map((universe) => universe.creator_id)).size;

  const creatorTestsAllTime = sumBy(universes, (universe) => universe.total_tests ?? 0);
  const creatorSharesAllTime = sumBy(universes, (universe) => universe.total_shares ?? 0);
  const creatorTests7Current = countSince(creatorResults30Days, since7Days);
  const creatorTests7Previous = countBetween(creatorResults30Days, since14Days, since7Days);
  const creatorShares30Days = creatorResults30Days.filter((row) => row.shared).length;
  const creatorShareRate30Days = creatorResults30Days.length > 0
    ? Number(((creatorShares30Days / creatorResults30Days.length) * 100).toFixed(1))
    : 0;

  const identifyAssessments7Current = countSince(identifyAssessments30Days, since7Days);
  const identifyAssessments7Previous = countBetween(identifyAssessments30Days, since14Days, since7Days);
  const cptiRelationships7Current = countSince(cptiRelationships30Days, since7Days);
  const cptiRelationships7Previous = countBetween(cptiRelationships30Days, since14Days, since7Days);

  const confirmedOrders = creatorOrders.filter((order) => order.status === 'confirmed');
  const confirmedOrders30Days = confirmedOrders.filter((order) => timestamp(order.created_at) >= since30Days.getTime());
  const revenueGrossAllTimeCents = sumBy(confirmedOrders, (order) => order.amount_cents);
  const revenueGross30DaysCents = sumBy(confirmedOrders30Days, (order) => order.amount_cents);
  const revenueNet30DaysCents = sumBy(confirmedOrders30Days, (order) => order.creator_earning_cents);

  const pendingSettlements = creatorSettlements.filter(
    (settlement) => settlement.status === 'pending' || settlement.status === 'processing',
  );
  const pendingSettlementCents = sumBy(pendingSettlements, (settlement) => settlement.amount_cents);

  const creatorTierMap = new Map<string, number>();
  for (const creator of creators) {
    incrementCount(creatorTierMap, creator.tier);
  }

  const referrerMap = new Map<string, number>();
  const universeActivityMap = new Map<string, { tests: number; shares: number }>();
  for (const row of creatorResults30Days) {
    incrementCount(referrerMap, normalizeReferrerLabel(row.referrer));

    const existing = universeActivityMap.get(row.universe_id) ?? { tests: 0, shares: 0 };
    existing.tests += 1;
    if (row.shared) {
      existing.shares += 1;
    }
    universeActivityMap.set(row.universe_id, existing);
  }

  const topUniverses30Days = [...universeActivityMap.entries()]
    .map(([universeId, stats]) => {
      const universe = universesById.get(universeId);
      const creator = universe ? creatorsById.get(universe.creator_id) : null;
      return {
        universeId,
        slug: universe?.slug ?? universeId,
        name: universe?.name ?? '未知宇宙',
        emoji: universe?.emoji ?? '✨',
        creatorName: creator?.name ?? '匿名创作者',
        tests: stats.tests,
        shares: stats.shares,
        shareRate: stats.tests > 0 ? Number(((stats.shares / stats.tests) * 100).toFixed(1)) : 0,
        isPaid: universe?.is_paid ?? false,
        priceCents: universe?.price_cents ?? 0,
      } satisfies OpsUniverseRank;
    })
    .sort((left, right) => right.tests - left.tests)
    .slice(0, 8);

  const identifyPersonaMap = new Map<string, number>();
  for (const row of identifyAssessments30Days) {
    incrementCount(identifyPersonaMap, row.persona_slug);
  }

  const cptiRelationshipMap = new Map<string, number>();
  for (const row of cptiRelationships30Days) {
    incrementCount(cptiRelationshipMap, row.relationship_slug);
  }

  const applicationStatusMap = new Map<string, number>();
  const applicationSourceMap = new Map<string, number>();
  let applicationDemandFreeOnly = 0;
  let applicationDemandPaidOnly = 0;
  let applicationDemandMixed = 0;

  for (const application of creatorApplications) {
    incrementCount(applicationStatusMap, application.status);

    if (application.source_page) {
      incrementCount(applicationSourceMap, application.source_page);
    }

    if (application.wants_free && application.wants_paid) {
      applicationDemandMixed += 1;
    } else if (application.wants_paid) {
      applicationDemandPaidOnly += 1;
    } else if (application.wants_free) {
      applicationDemandFreeOnly += 1;
    }
  }

  const creatorApplicationsNew7Days = countSince(creatorApplications, since7Days);

  const topCollectors = [...atlasStats]
    .sort((left, right) => {
      if (right.rare_relationship_count !== left.rare_relationship_count) {
        return right.rare_relationship_count - left.rare_relationship_count;
      }

      if (right.soul_count !== left.soul_count) {
        return right.soul_count - left.soul_count;
      }

      return right.relationship_type_count - left.relationship_type_count;
    })
    .slice(0, 8)
    .map((row) => ({
      userId: row.user_id,
      nickname: nicknamesByUserId.get(row.user_id) ?? '匿名用户',
      soulCount: row.soul_count,
      rareCount: row.rare_relationship_count,
      relationshipTypeCount: row.relationship_type_count,
    }));

  const trends14Days = buildTrendData(creatorResults30Days, identifyAssessments30Days, cptiRelationships30Days);

  const recentPublications = [...publishedUniverses]
    .sort((left, right) => timestamp(right.published_at) - timestamp(left.published_at))
    .slice(0, 6)
    .map((universe) => ({
      id: universe.id,
      slug: universe.slug,
      name: universe.name,
      emoji: universe.emoji,
      creatorName: creatorsById.get(universe.creator_id)?.name ?? '匿名创作者',
      publishedAt: universe.published_at,
      isPaid: universe.is_paid,
      priceCents: universe.price_cents,
      totalTests: universe.total_tests,
    }));

  const reviewQueue = [...reviewUniverses]
    .sort((left, right) => timestamp(left.submitted_at) - timestamp(right.submitted_at))
    .slice(0, 6)
    .map((universe) => ({
      id: universe.id,
      slug: universe.slug,
      name: universe.name,
      emoji: universe.emoji,
      creatorName: creatorsById.get(universe.creator_id)?.name ?? '匿名创作者',
      submittedAt: universe.submitted_at,
    }));

  const topReferrers30Days = toRankedCounts(referrerMap, 8);
  const topPersonas30Days = toRankedCounts(identifyPersonaMap, 8);
  const topRelationships30Days = toRankedCounts(cptiRelationshipMap, 8);
  const tierDistribution = toRankedCounts(creatorTierMap, 4);
  const applicationStatusCounts = toRankedCounts(applicationStatusMap, 6);
  const applicationSourceCounts = toRankedCounts(applicationSourceMap, 5);

  const pendingSettlementItems = pendingSettlements
    .slice(0, 6)
    .map((settlement) => ({
      creatorId: settlement.creator_id,
      creatorName: creatorsById.get(settlement.creator_id)?.name ?? '匿名创作者',
      amountCents: settlement.amount_cents,
      status: settlement.status,
      requestedAt: settlement.requested_at,
    }));

  return {
    generatedAt: new Date().toISOString(),
    warnings,
    overview: {
      publishedUniverseCount: publishedUniverses.length,
      creatorsWithPublishedCount,
      creatorCount: creators.length,
      verifiedCreatorCount: creators.filter((creator) => creator.is_verified).length,
      creatorTestsAllTime,
      creatorSharesAllTime,
      creatorTests7Days: {
        current: creatorTests7Current,
        previous: creatorTests7Previous,
      },
      creatorShareRate30Days,
      identifyAssessmentsAllTime,
      identifyAssessments7Days: {
        current: identifyAssessments7Current,
        previous: identifyAssessments7Previous,
      },
      cptiRelationshipsAllTime,
      cptiRelationships7Days: {
        current: cptiRelationships7Current,
        previous: cptiRelationships7Previous,
      },
      revenueGrossAllTimeCents,
      revenueGross30DaysCents,
      revenueNet30DaysCents,
      pendingSettlementCents,
      pendingSettlementCount: pendingSettlements.length,
      reviewQueueCount: reviewUniverses.length,
      creatorApplicationsNew7Days,
    },
    trends14Days,
    creator: {
      tierDistribution,
      topUniverses30Days,
      topReferrers30Days,
      recentPublications,
    },
    identify: {
      topPersonas30Days,
      assessments30Days: identifyAssessments30Days.length,
    },
    cpti: {
      topRelationships30Days,
      relationships30Days: cptiRelationships30Days.length,
      topCollectors,
    },
    operations: {
      reviewQueue,
      applicationsAvailable: creatorApplications.length > 0 || !warnings.some((warning) => warning.includes('创作者申请')),
      applicationStatusCounts,
      applicationSourceCounts,
      applicationDemandMix: {
        freeOnly: applicationDemandFreeOnly,
        paidOnly: applicationDemandPaidOnly,
        mixed: applicationDemandMixed,
      },
      pendingSettlements: pendingSettlementItems,
    },
    dataHealth: getDataHealthItems(),
  };
}