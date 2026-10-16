import type { SupabaseClient } from '@supabase/supabase-js';

import type { LedgerEntry, LingBiSource, Wallet } from '@/lib/wallet/ling-bi';
import { SKU_COSTS } from '@/lib/wallet/ling-bi';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const INITIAL_FREE_LING_BI = 2;
const INITIAL_FREE_IDEMPOTENCY_PREFIX = 'ling-bi:free-initial';

interface LingBiAccountRow {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  free_granted: number;
  created_at: string;
  updated_at: string;
}

interface LingBiLedgerRow {
  id: string;
  delta: number;
  source: LingBiSource;
  resource_id: string | null;
  note: string | null;
  balance_after: number;
  created_at: string;
}

export interface ServerLingBiSnapshot {
  wallet: Wallet;
  ledger: LedgerEntry[];
  source: 'server';
}

export interface LingBiTransactionResult {
  ok: boolean;
  reason?: 'insufficient' | 'invalid-cost' | 'transaction-failed';
  balance: number;
  ledgerId?: string;
  applied?: boolean;
}

interface LingBiTransactionRow {
  account_id: string;
  ledger_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  free_granted: number;
  applied: boolean;
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function mapAccount(row: LingBiAccountRow): Wallet {
  return {
    balance: row.balance,
    totalEarned: row.total_earned,
    totalSpent: row.total_spent,
    freeGranted: row.free_granted,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  };
}

function mapLedger(row: LingBiLedgerRow): LedgerEntry {
  return {
    id: row.id,
    delta: row.delta,
    source: row.source,
    resourceId: row.resource_id ?? undefined,
    note: row.note ?? undefined,
    balanceAfter: row.balance_after,
    timestamp: toTimestamp(row.created_at),
  };
}

async function selectAccount(
  admin: SupabaseClient,
  userId: string,
): Promise<LingBiAccountRow | null> {
  const { data, error } = await admin
    .from('ling_bi_accounts')
    .select('id, user_id, balance, total_earned, total_spent, free_granted, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as LingBiAccountRow | null;
}

async function createInitialAccount(
  admin: SupabaseClient,
  userId: string,
): Promise<LingBiAccountRow> {
  const now = new Date().toISOString();
  const { data: account, error } = await admin
    .from('ling_bi_accounts')
    .insert({
      user_id: userId,
      balance: 0,
      total_earned: 0,
      free_granted: 0,
      created_at: now,
      updated_at: now,
    })
    .select('id, user_id, balance, total_earned, total_spent, free_granted, created_at, updated_at')
    .single();

  if (error) {
    const existing = await selectAccount(admin, userId);
    if (existing) return existing;
    throw error;
  }

  await applyLingBiTransaction(userId, {
    delta: INITIAL_FREE_LING_BI,
    source: 'free',
    idempotencyKey: `${INITIAL_FREE_IDEMPOTENCY_PREFIX}:${userId}`,
    note: '新用户欢迎灵币',
    metadata: { issuedBy: 'server_wallet_init' },
  });

  return (await selectAccount(admin, userId)) ?? (account as LingBiAccountRow);
}

export async function ensureLingBiAccount(userId: string): Promise<LingBiAccountRow> {
  const admin = createAdminSupabaseClient();
  const existing = await selectAccount(admin, userId);
  if (existing) return existing;
  return createInitialAccount(admin, userId);
}

export async function getServerLingBiSnapshot(
  userId: string,
  limit = 40,
): Promise<ServerLingBiSnapshot> {
  const admin = createAdminSupabaseClient();
  const account = (await selectAccount(admin, userId)) ?? (await createInitialAccount(admin, userId));
  const cappedLimit = Math.min(Math.max(Math.floor(limit), 1), 100);

  const { data, error } = await admin
    .from('ling_bi_ledger')
    .select('id, delta, source, resource_id, note, balance_after, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(cappedLimit);

  if (error) {
    throw error;
  }

  return {
    wallet: mapAccount(account),
    ledger: ((data ?? []) as LingBiLedgerRow[]).map(mapLedger),
    source: 'server',
  };
}

export async function applyLingBiTransaction(
  userId: string,
  input: {
    delta: number;
    source: LingBiSource;
    idempotencyKey?: string;
    resourceId?: string;
    note?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<LingBiTransactionResult> {
  if (!Number.isFinite(input.delta) || input.delta === 0) {
    return { ok: false, reason: 'invalid-cost', balance: 0 };
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.rpc('ling_bi_apply_transaction', {
    p_user_id: userId,
    p_delta: input.delta,
    p_source: input.source,
    p_idempotency_key: input.idempotencyKey ?? null,
    p_resource_id: input.resourceId ?? null,
    p_note: input.note ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
    if (message.includes('insufficient_balance')) {
      const account = await selectAccount(admin, userId);
      return {
        ok: false,
        reason: 'insufficient',
        balance: account?.balance ?? 0,
      };
    }

    throw error;
  }

  const row = Array.isArray(data) ? (data[0] as LingBiTransactionRow | undefined) : undefined;
  if (!row) {
    return { ok: false, reason: 'transaction-failed', balance: 0 };
  }

  return {
    ok: true,
    balance: row.balance,
    ledgerId: row.ledger_id,
    applied: row.applied,
  };
}

export async function consumeServerLingBiBySku(
  userId: string,
  skuKey: keyof typeof SKU_COSTS,
  options: {
    idempotencyKey: string;
    resourceId?: string;
    note?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<LingBiTransactionResult & { required?: number }> {
  const sku = SKU_COSTS[skuKey];
  if (!sku) return { ok: false, reason: 'invalid-cost', balance: 0 };

  const result = await applyLingBiTransaction(userId, {
    delta: -sku.cost,
    source: sku.sku,
    idempotencyKey: options.idempotencyKey,
    resourceId: options.resourceId,
    note: options.note ?? sku.label,
    metadata: {
      skuKey,
      skuLabel: sku.label,
      ...options.metadata,
    },
  });

  return {
    ...result,
    required: sku.cost,
  };
}
