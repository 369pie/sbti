/**
 * Static try-on freemium: 3 free / Asia/Shanghai month on her_profiles.
 * Under-18 garment block (plan §8): swimsuit / lingerie keywords.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { shanghaiDateISO } from '@/lib/today/date';

export const TRY_ON_FREE_CAP = 3;

const BLOCKED_GARMENT_RE =
  /泳装|比基尼|内衣|内裤|丁字|情趣|transparent\s*lingerie|bikini|swimsuit|lingerie|underwear|nude\s*dress/i;

export function shanghaiMonthKey(now: Date = new Date()): string {
  return shanghaiDateISO(now).slice(0, 7); // YYYY-MM
}

export function isUnder18(birthYear: number | null | undefined, now: Date = new Date()): boolean {
  if (typeof birthYear !== 'number' || birthYear < 1900 || birthYear > 2100) return false;
  const y = Number(shanghaiDateISO(now).slice(0, 4));
  return y - birthYear < 18;
}

export function hasBlockedGarment(text: string): boolean {
  return BLOCKED_GARMENT_RE.test(text);
}

export type TryOnQuota = {
  month: string;
  used: number;
  remaining: number;
  freeApplied: boolean;
};

export async function consumeTryOnFreeIfAvailable(userId: string): Promise<TryOnQuota> {
  const admin = createAdminSupabaseClient();
  const month = shanghaiMonthKey();

  const { data: row } = await admin
    .from('her_profiles')
    .select('user_id, try_on_month, try_on_free_used')
    .eq('user_id', userId)
    .maybeSingle();

  const sameMonth = row?.try_on_month === month;
  const used = sameMonth ? Number(row?.try_on_free_used ?? 0) : 0;

  if (used >= TRY_ON_FREE_CAP) {
    return { month, used, remaining: 0, freeApplied: false };
  }

  const nextUsed = used + 1;

  if (row?.user_id) {
    const { error } = await admin
      .from('her_profiles')
      .update({
        try_on_month: month,
        try_on_free_used: nextUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) {
      console.error('[try-on-quota] update failed', error.message);
      return { month, used, remaining: Math.max(0, TRY_ON_FREE_CAP - used), freeApplied: false };
    }
  } else {
    const { error } = await admin.from('her_profiles').insert({
      user_id: userId,
      try_on_month: month,
      try_on_free_used: nextUsed,
      completeness_pct: 10,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[try-on-quota] insert failed', error.message);
      return { month, used, remaining: Math.max(0, TRY_ON_FREE_CAP - used), freeApplied: false };
    }
  }

  return {
    month,
    used: nextUsed,
    remaining: Math.max(0, TRY_ON_FREE_CAP - nextUsed),
    freeApplied: true,
  };
}

export async function peekTryOnQuota(userId: string): Promise<Omit<TryOnQuota, 'freeApplied'>> {
  const admin = createAdminSupabaseClient();
  const month = shanghaiMonthKey();
  const { data: row } = await admin
    .from('her_profiles')
    .select('try_on_month, try_on_free_used')
    .eq('user_id', userId)
    .maybeSingle();
  const sameMonth = row?.try_on_month === month;
  const used = sameMonth ? Number(row?.try_on_free_used ?? 0) : 0;
  return { month, used, remaining: Math.max(0, TRY_ON_FREE_CAP - used) };
}

export async function loadBirthYearForUser(userId: string): Promise<number | null> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin.from('her_profiles').select('birth_year').eq('user_id', userId).maybeSingle();
  const y = data?.birth_year;
  return typeof y === 'number' ? y : null;
}
