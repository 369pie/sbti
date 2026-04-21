/**
 * Browser-side helpers for the XPTI couple pair-code flow.
 *
 * Mirrors the cpti-api ensureSession() pattern: silently signs in
 * anonymously so server-side routes can record inviter_user_id /
 * partner_user_id when possible.
 */

import { getApiPath } from '@/lib/api';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import type { CoupleMergeResult } from '@/lib/xpti/couple';

let _signInPromise: Promise<boolean> | null = null;

async function ensureSession(): Promise<boolean> {
  if (_signInPromise) return _signInPromise;

  _signInPromise = (async () => {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) return false;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn('[xpti-couple-api] signInAnonymously failed:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('[xpti-couple-api] ensureSession failed:', err);
      return false;
    }
  })();

  return _signInPromise;
}

export interface PublicCoupleView {
  shareToken: string;
  pairCode: string;
  status: 'active' | 'completed' | 'expired';
  inviter: { slug: string; dims: number[]; nickname: string | null };
  partner: { slug: string; dims: number[]; nickname: string | null } | null;
  merged: CoupleMergeResult | null;
  unlocked: boolean;
  unlockedSku: string | null;
  unlockedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
  history?: Array<{
    side: 'inviter' | 'partner';
    slug: string;
    dims: number[];
    nickname: string | null;
    takenAt: string;
  }>;
  practiceChecklist?: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>;
}

export interface CouplePollView {
  status: 'active' | 'completed' | 'expired';
  completedAt: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
  unlockedSku: string | null;
  partnerNickname: string | null;
  practiceChecklist?: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>;
}

export async function createCoupleInvite(input: {
  inviterSlug: string;
  inviterDims: number[];
  inviterNickname?: string | null;
  deviceId?: string | null;
}): Promise<{ shareToken: string; pairCode: string; expiresAt: string }> {
  await ensureSession();
  const res = await fetch(getApiPath('/xpti/couples'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`createCoupleInvite_failed:${res.status}:${text}`);
  }
  return res.json();
}

export async function getCouple(shareToken: string): Promise<PublicCoupleView | null> {
  const res = await fetch(getApiPath(`/xpti/couples/${encodeURIComponent(shareToken)}`), {
    credentials: 'include',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getCouple_failed:${res.status}`);
  const data = (await res.json()) as { couple: PublicCoupleView };
  return data.couple;
}

export async function pollCouple(shareToken: string): Promise<CouplePollView | null> {
  const res = await fetch(getApiPath(`/xpti/couples/${encodeURIComponent(shareToken)}/poll`), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function completeCouple(
  shareToken: string,
  input: {
    partnerSlug: string;
    partnerDims: number[];
    partnerNickname?: string | null;
    deviceId?: string | null;
  }
): Promise<PublicCoupleView> {
  await ensureSession();
  const res = await fetch(
    getApiPath(`/xpti/couples/${encodeURIComponent(shareToken)}/complete`),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`completeCouple_failed:${res.status}:${text}`);
  }
  const data = (await res.json()) as { couple: PublicCoupleView };
  return data.couple;
}

export async function togglePractice(
  shareToken: string,
  input: { side: 'inviter' | 'partner'; day: number; done: boolean },
): Promise<Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>> {
  const res = await fetch(
    getApiPath(`/xpti/couples/${encodeURIComponent(shareToken)}/practice`),
    {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`togglePractice_failed:${res.status}:${text}`);
  }
  const data = (await res.json()) as {
    practiceChecklist: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>;
  };
  return data.practiceChecklist;
}
