/**
 * UGC Creator Earnings — revenue tracking, simulated orders, and settlement helpers.
 *
 * Phase 0.5: Simulated payments (no real payment gateway).
 * Phase 1+: Integrate with real payment provider (WeChat Pay / Alipay).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Row types ───────────────────────────────────────────────────────────────

export interface OrderRow {
  id: string;
  universe_id: string;
  creator_id: string;
  user_id: string | null;
  session_id: string | null;
  amount_cents: number;
  channel_fee_cents: number;
  platform_fee_cents: number;
  creator_earning_cents: number;
  status: 'confirmed' | 'refunded' | 'disputed';
  refund_reason: string | null;
  created_at: string;
}

export interface EarningsRow {
  id: string;
  creator_id: string;
  universe_id: string;
  period: string;
  gross_cents: number;
  refund_cents: number;
  channel_fee_cents: number;
  platform_fee_cents: number;
  net_earning_cents: number;
  order_count: number;
  refund_count: number;
  created_at: string;
}

export interface SettlementRow {
  id: string;
  creator_id: string;
  amount_cents: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  payout_method: string;
  payout_account: string | null;
  admin_note: string | null;
  requested_at: string;
  completed_at: string | null;
}

// ─── Revenue split calculation ───────────────────────────────────────────────

/**
 * Revenue split tiers (creator share % based on creator tier).
 *
 * Channel cost is a fixed 6% of gross (simulated WeChat Pay / Alipay rate).
 */
const CHANNEL_FEE_RATE = 0.06;

const CREATOR_SHARE_BY_TIER: Record<string, number> = {
  free: 0.60,
  pro: 0.65,
  business: 0.70,
  enterprise: 0.75,
};

export interface RevenueSplit {
  grossCents: number;
  channelFeeCents: number;
  platformFeeCents: number;
  creatorEarningCents: number;
}

export function calculateRevenueSplit(
  grossCents: number,
  creatorTier: string,
): RevenueSplit {
  const channelFeeCents = Math.round(grossCents * CHANNEL_FEE_RATE);
  const afterChannel = grossCents - channelFeeCents;
  const creatorShare = CREATOR_SHARE_BY_TIER[creatorTier] ?? 0.60;
  const creatorEarningCents = Math.round(afterChannel * creatorShare);
  const platformFeeCents = afterChannel - creatorEarningCents;

  return { grossCents, channelFeeCents, platformFeeCents, creatorEarningCents };
}

// ─── Simulated purchase ──────────────────────────────────────────────────────

/**
 * Record a simulated purchase. Creates an order row with revenue split.
 *
 * In Phase 0.5 this is called directly without payment verification.
 * In Phase 1+ this will be called by the payment webhook handler.
 */
export async function recordSimulatedPurchase(
  supabase: SupabaseClient,
  data: {
    universeId: string;
    creatorId: string;
    creatorTier: string;
    priceCents: number;
    userId?: string;
    sessionId?: string;
  },
): Promise<OrderRow | null> {
  const split = calculateRevenueSplit(data.priceCents, data.creatorTier);

  const { data: row, error } = await supabase
    .from('creator_orders')
    .insert({
      universe_id: data.universeId,
      creator_id: data.creatorId,
      user_id: data.userId ?? null,
      session_id: data.sessionId ?? null,
      amount_cents: split.grossCents,
      channel_fee_cents: split.channelFeeCents,
      platform_fee_cents: split.platformFeeCents,
      creator_earning_cents: split.creatorEarningCents,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    console.error('recordSimulatedPurchase error:', error);
    return null;
  }
  return row as OrderRow;
}

// ─── Earnings queries ────────────────────────────────────────────────────────

export interface CreatorEarningsSummary {
  totalGrossCents: number;
  totalNetCents: number;
  totalOrders: number;
  totalRefunds: number;
  availableBalanceCents: number;   // net - already settled
  pendingSettlementCents: number;
  byUniverse: {
    universeId: string;
    universeName: string;
    grossCents: number;
    netCents: number;
    orderCount: number;
  }[];
  recentOrders: OrderRow[];
}

/**
 * Fetch earnings summary for the authenticated creator.
 */
export async function fetchCreatorEarnings(
  supabase: SupabaseClient,
  creatorId: string,
): Promise<CreatorEarningsSummary> {
  // Orders
  const { data: orders } = await supabase
    .from('creator_orders')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  const allOrders = (orders ?? []) as OrderRow[];
  const confirmed = allOrders.filter(o => o.status === 'confirmed');
  const refunded = allOrders.filter(o => o.status === 'refunded');

  const totalGrossCents = confirmed.reduce((s, o) => s + o.amount_cents, 0);
  const totalNetCents = confirmed.reduce((s, o) => s + o.creator_earning_cents, 0);

  // Settlements
  const { data: settlements } = await supabase
    .from('creator_settlements')
    .select('amount_cents, status')
    .eq('creator_id', creatorId);

  const allSettlements = (settlements ?? []) as { amount_cents: number; status: string }[];
  const settledCents = allSettlements
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.amount_cents, 0);
  const pendingSettlementCents = allSettlements
    .filter(s => s.status === 'pending' || s.status === 'processing')
    .reduce((sum, s) => sum + s.amount_cents, 0);

  // By universe
  const universeMap = new Map<string, { grossCents: number; netCents: number; orderCount: number }>();
  for (const o of confirmed) {
    const existing = universeMap.get(o.universe_id) ?? { grossCents: 0, netCents: 0, orderCount: 0 };
    existing.grossCents += o.amount_cents;
    existing.netCents += o.creator_earning_cents;
    existing.orderCount += 1;
    universeMap.set(o.universe_id, existing);
  }

  // Fetch universe names
  const universeIds = [...universeMap.keys()];
  let universeNames = new Map<string, string>();
  if (universeIds.length > 0) {
    const { data: universes } = await supabase
      .from('creator_universes')
      .select('id, name')
      .in('id', universeIds);
    for (const u of (universes ?? [])) {
      universeNames.set(u.id as string, u.name as string);
    }
  }

  const byUniverse = [...universeMap.entries()].map(([universeId, stats]) => ({
    universeId,
    universeName: universeNames.get(universeId) ?? '未知宇宙',
    ...stats,
  }));

  return {
    totalGrossCents,
    totalNetCents,
    totalOrders: confirmed.length,
    totalRefunds: refunded.length,
    availableBalanceCents: totalNetCents - settledCents - pendingSettlementCents,
    pendingSettlementCents,
    byUniverse,
    recentOrders: allOrders.slice(0, 20),
  };
}

// ─── Settlement helpers ──────────────────────────────────────────────────────

const MIN_PAYOUT_CENTS = 10000; // ¥100

export async function requestSettlement(
  supabase: SupabaseClient,
  creatorId: string,
  data: {
    amountCents: number;
    payoutMethod?: string;
    payoutAccount?: string;
  },
): Promise<SettlementRow | null> {
  if (data.amountCents < MIN_PAYOUT_CENTS) {
    return null;
  }

  const { data: row, error } = await supabase
    .from('creator_settlements')
    .insert({
      creator_id: creatorId,
      amount_cents: data.amountCents,
      payout_method: data.payoutMethod ?? 'bank_transfer',
      payout_account: data.payoutAccount ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('requestSettlement error:', error);
    return null;
  }
  return row as SettlementRow;
}

export async function fetchSettlements(
  supabase: SupabaseClient,
  creatorId: string,
): Promise<SettlementRow[]> {
  const { data } = await supabase
    .from('creator_settlements')
    .select('*')
    .eq('creator_id', creatorId)
    .order('requested_at', { ascending: false });

  return (data ?? []) as SettlementRow[];
}

// ─── Leaderboard query (public) ─────────────────────────────────────────────

export interface LeaderboardEntry {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;
  isVerified: boolean;
  totalTests: number;
  totalShares: number;
  universeCount: number;
  topUniverse: {
    id: string;
    name: string;
    emoji: string;
    slug: string;
    tests: number;
  } | null;
}

/**
 * Fetch creator leaderboard — ranked by total test completions across all universes.
 * Only includes creators with at least one published universe.
 */
export async function fetchLeaderboard(
  supabase: SupabaseClient,
  limit: number = 50,
): Promise<LeaderboardEntry[]> {
  // Fetch published universes with their creators
  const { data: universes } = await supabase
    .from('creator_universes')
    .select('id, slug, name, emoji, creator_id, total_tests, total_shares')
    .eq('status', 'published')
    .order('total_tests', { ascending: false });

  if (!universes || universes.length === 0) return [];

  // Group by creator
  const creatorMap = new Map<string, {
    totalTests: number;
    totalShares: number;
    universeCount: number;
    topUniverse: { id: string; name: string; emoji: string; slug: string; tests: number } | null;
  }>();

  for (const u of universes) {
    const cid = u.creator_id as string;
    const existing = creatorMap.get(cid) ?? {
      totalTests: 0, totalShares: 0, universeCount: 0, topUniverse: null,
    };
    existing.totalTests += u.total_tests as number;
    existing.totalShares += u.total_shares as number;
    existing.universeCount += 1;
    if (!existing.topUniverse || (u.total_tests as number) > existing.topUniverse.tests) {
      existing.topUniverse = {
        id: u.id as string,
        name: u.name as string,
        emoji: u.emoji as string,
        slug: u.slug as string,
        tests: u.total_tests as number,
      };
    }
    creatorMap.set(cid, existing);
  }

  // Fetch creator profiles
  const creatorIds = [...creatorMap.keys()];
  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, avatar_url, is_verified')
    .in('id', creatorIds);

  const creatorProfiles = new Map<string, { name: string; avatar: string | null; verified: boolean }>();
  for (const c of (creators ?? [])) {
    creatorProfiles.set(c.id as string, {
      name: c.name as string,
      avatar: c.avatar_url as string | null,
      verified: c.is_verified as boolean,
    });
  }

  // Build leaderboard
  const entries: LeaderboardEntry[] = [];
  for (const [creatorId, stats] of creatorMap) {
    const profile = creatorProfiles.get(creatorId);
    if (!profile) continue;
    entries.push({
      creatorId,
      creatorName: profile.name,
      creatorAvatar: profile.avatar,
      isVerified: profile.verified,
      ...stats,
    });
  }

  entries.sort((a, b) => b.totalTests - a.totalTests);
  return entries.slice(0, limit);
}
