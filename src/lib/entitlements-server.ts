/**
 * Server side of lib/entitlements.ts: membership + monthly AI quotas.
 * Fails OPEN when the member_usage migration is not applied yet (no caps,
 * usage reported as unknown) so shipping the code never blocks a feature.
 */

import { capFor, featureConfig, AI_FEATURES } from '@/lib/entitlements';
import { resolveMembership } from '@/lib/her/membership';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { shanghaiDateISO } from '@/lib/today/date';

export function usageMonth(now: Date = new Date()): string {
  return shanghaiDateISO(now).slice(0, 7);
}

function isMissingObject(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(err.code ?? '') || /does not exist|Could not find/i.test(err.message ?? '');
}

export interface QuotaResult {
  allowed: boolean;
  used: number | null;
  cap: number | null;
  remaining: number | null;
  isMember: boolean;
  /** true when the usage table is missing and we let the call through. */
  failOpen?: boolean;
}

export async function consumeFeatureQuota(
  userId: string,
  feature: string,
  opts: { deviceId?: string | null } = {},
): Promise<QuotaResult> {
  const mem = await resolveMembership({ userId, deviceId: opts.deviceId ?? null });
  const cap = capFor(feature, mem.isMember);
  if (!featureConfig(feature)) return { allowed: true, used: null, cap: null, remaining: null, isMember: mem.isMember };
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.rpc('consume_feature_quota', {
    p_user_id: userId,
    p_feature: feature,
    p_month: usageMonth(),
    p_cap: cap,
  });
  if (error) {
    if (!isMissingObject(error)) console.error('[entitlements] consume failed', error.message);
    return { allowed: true, used: null, cap, remaining: null, isMember: mem.isMember, failOpen: true };
  }
  const row = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; used?: number } | null;
  const used = Number(row?.used ?? 0);
  const allowed = !!row?.allowed;
  return { allowed, used, cap, remaining: cap == null ? null : Math.max(0, cap - used), isMember: mem.isMember };
}

export interface FeatureUsage {
  key: string;
  label: string;
  used: number | null;
  cap: number | null;
  remaining: number | null;
}

export async function loadFeatureUsage(userId: string | null, isMember: boolean): Promise<FeatureUsage[]> {
  const month = usageMonth();
  const used = new Map<string, number>();
  let known = false;
  if (userId) {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from('member_usage')
      .select('feature, used')
      .eq('user_id', userId)
      .eq('month', month);
    if (!error) {
      known = true;
      for (const r of (data ?? []) as Array<{ feature: string; used: number }>) used.set(r.feature, r.used);
    }
    // try-on is still counted on her_profiles (try-on-quota.ts).
    const { data: hp } = await admin
      .from('her_profiles')
      .select('try_on_month, try_on_free_used')
      .eq('user_id', userId)
      .maybeSingle();
    if (hp) used.set('try_on', hp.try_on_month === month ? Number(hp.try_on_free_used ?? 0) : 0);
  }
  return AI_FEATURES.map((f) => {
    const cap = capFor(f.key, isMember);
    const u = used.has(f.key) ? used.get(f.key)! : known ? 0 : null;
    return { key: f.key, label: f.label, used: u, cap, remaining: cap == null || u == null ? cap : Math.max(0, cap - u) };
  });
}
