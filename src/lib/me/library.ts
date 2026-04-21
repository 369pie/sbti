/**
 * Cross-module library aggregator for /me/library/.
 * Pulls paid unlocks (mysti_orders) + xpti couple reports for the current user,
 * including anonymous orders bound via device_user_bindings.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { MystiSku } from '@/lib/mysti/unlock';

export interface LibraryUnlock {
  orderId: string;
  sku: MystiSku;
  resourceId: string;
  title: string;
  module: 'xpti' | 'soulti' | 'cpti' | 'wtfti' | 'mysti' | 'other';
  paidAt: string | null;
  redirectPath: string | null;
}

export interface LibraryCoupleEntry {
  id: string;
  shareToken: string;
  pairCode: string;
  status: string;
  pairingId: string | null;
  pairingLabel: string | null;
  inviterNickname: string | null;
  partnerNickname: string | null;
  unlockedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  role: 'inviter' | 'partner';
}

export interface LibraryModuleSummary {
  unlockCount: number;
  coupleCount?: number;
}

export interface LibraryPayload {
  unlocks: LibraryUnlock[];
  xptiCouples: LibraryCoupleEntry[];
  boundDeviceIds: string[];
  summary: {
    xpti: LibraryModuleSummary;
    soulti: LibraryModuleSummary;
    cpti: LibraryModuleSummary;
    wtfti: LibraryModuleSummary;
    mysti: LibraryModuleSummary;
  };
}

function inferModule(resourceId: string, sku: string): LibraryUnlock['module'] {
  const s = `${resourceId} ${sku}`.toLowerCase();
  if (s.includes('xpti') || s.includes('couple')) return 'xpti';
  if (s.includes('soulti')) return 'soulti';
  if (s.includes('cpti')) return 'cpti';
  if (s.includes('wtfti') || s.includes('wtf')) return 'wtfti';
  if (s.includes('mysti') || s.includes('tarot')) return 'mysti';
  return 'other';
}

export async function getMyLibrary(userId: string): Promise<LibraryPayload> {
  const admin = createAdminSupabaseClient();

  // 1 · device bindings for backfill
  const { data: bindings } = await admin
    .from('device_user_bindings')
    .select('device_id')
    .eq('user_id', userId);
  const deviceIds: string[] = (bindings ?? [])
    .map((row) => (row as { device_id: string | null }).device_id)
    .filter((d): d is string => Boolean(d));

  // 2 · paid orders
  // We query user_id = me OR device_id IN bindings; Supabase-js doesn't support
  // OR across two columns cleanly when one is array — do two queries and merge.
  const ordersByUser = admin
    .from('mysti_orders')
    .select('id,sku,resource_id,title,paid_at,redirect_path,status')
    .eq('status', 'paid')
    .eq('user_id', userId);

  const ordersByDevice =
    deviceIds.length > 0
      ? admin
          .from('mysti_orders')
          .select('id,sku,resource_id,title,paid_at,redirect_path,status')
          .eq('status', 'paid')
          .is('user_id', null)
          .in('device_id', deviceIds)
      : null;

  const [byUserResult, byDeviceResult] = await Promise.all([
    ordersByUser,
    ordersByDevice ?? Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null }),
  ]);

  type OrderRow = {
    id: string;
    sku: string;
    resource_id: string;
    title: string | null;
    paid_at: string | null;
    redirect_path: string | null;
    status: string;
  };

  const seen = new Set<string>();
  const unlocks: LibraryUnlock[] = [];
  for (const row of [
    ...((byUserResult.data ?? []) as OrderRow[]),
    ...((byDeviceResult.data ?? []) as OrderRow[]),
  ]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    unlocks.push({
      orderId: row.id,
      sku: row.sku as MystiSku,
      resourceId: row.resource_id,
      title: row.title ?? row.sku,
      module: inferModule(row.resource_id, row.sku),
      paidAt: row.paid_at,
      redirectPath: row.redirect_path,
    });
  }
  unlocks.sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''));

  // 3 · xpti couples (own or partner)
  const { data: coupleRows } = await admin
    .from('xpti_couples')
    .select(
      'id, share_token, pair_code, status, inviter_user_id, partner_user_id, inviter_device_id, partner_device_id, inviter_nickname, partner_nickname, merged_payload, unlocked_at, completed_at, created_at',
    )
    .or(
      [
        `inviter_user_id.eq.${userId}`,
        `partner_user_id.eq.${userId}`,
        ...(deviceIds.length
          ? [
              `inviter_device_id.in.(${deviceIds.join(',')})`,
              `partner_device_id.in.(${deviceIds.join(',')})`,
            ]
          : []),
      ].join(','),
    )
    .order('created_at', { ascending: false });

  type CoupleRow = {
    id: string;
    share_token: string;
    pair_code: string;
    status: string;
    inviter_user_id: string | null;
    partner_user_id: string | null;
    inviter_device_id: string | null;
    partner_device_id: string | null;
    inviter_nickname: string | null;
    partner_nickname: string | null;
    merged_payload: { pairing?: { id?: string; label?: string } } | null;
    unlocked_at: string | null;
    completed_at: string | null;
    created_at: string;
  };

  const xptiCouples: LibraryCoupleEntry[] = ((coupleRows ?? []) as CoupleRow[]).map((row) => {
    const isInviter =
      row.inviter_user_id === userId ||
      (row.inviter_device_id != null && deviceIds.includes(row.inviter_device_id));
    return {
      id: row.id,
      shareToken: row.share_token,
      pairCode: row.pair_code,
      status: row.status,
      pairingId: row.merged_payload?.pairing?.id ?? null,
      pairingLabel: row.merged_payload?.pairing?.label ?? null,
      inviterNickname: row.inviter_nickname,
      partnerNickname: row.partner_nickname,
      unlockedAt: row.unlocked_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      role: isInviter ? 'inviter' : 'partner',
    };
  });

  return {
    unlocks,
    xptiCouples,
    boundDeviceIds: deviceIds,
    summary: {
      xpti: {
        unlockCount: unlocks.filter((u) => u.module === 'xpti').length,
        coupleCount: xptiCouples.length,
      },
      soulti: { unlockCount: unlocks.filter((u) => u.module === 'soulti').length },
      cpti: { unlockCount: unlocks.filter((u) => u.module === 'cpti').length },
      wtfti: { unlockCount: unlocks.filter((u) => u.module === 'wtfti').length },
      mysti: { unlockCount: unlocks.filter((u) => u.module === 'mysti').length },
    },
  };
}
