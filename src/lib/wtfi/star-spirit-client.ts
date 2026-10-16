'use client';

/**
 * Star Spirit · 客户端访问层（匿名会话即可，失败静默——星灵是加分项不是阻断项）
 */

import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import type { StarDustSource, StarSpiritState } from '@/lib/wtfi/star-spirit';

async function post(body: Record<string, unknown>): Promise<unknown | null> {
  try {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) return null;
    const auth = await getOrCreateAnonymousSession(supabase);
    if (!auth.success) return null;
    const res = await fetch('/api/wtfti/star-spirit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStarSpirit(): Promise<StarSpiritState | null> {
  try {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) return null;
    const auth = await getOrCreateAnonymousSession(supabase);
    if (!auth.success) return null;
    const res = await fetch('/api/wtfti/star-spirit');
    if (!res.ok) return null;
    return (await res.json()) as StarSpiritState;
  } catch {
    return null;
  }
}

export async function waterStarSpiritRemote(): Promise<{ watered: boolean; state: StarSpiritState } | null> {
  const result = await post({ action: 'water' });
  if (!result || typeof result !== 'object') return null;
  const r = result as { watered?: boolean; state?: StarSpiritState };
  if (!r.state) return null;
  return { watered: r.watered === true, state: r.state };
}

export async function earnStarDustRemote(
  source: StarDustSource,
  personalitySlug?: string | null,
): Promise<{ granted: number } | null> {
  const result = await post({ action: 'earn', source, personalitySlug: personalitySlug ?? undefined });
  if (!result || typeof result !== 'object') return null;
  const r = result as { granted?: number };
  return { granted: r.granted ?? 0 };
}

/** 仪式点的 fire-and-forget 星尘（绝不阻塞/不打扰主流程） */
export function tryEarnStarDust(source: StarDustSource, personalitySlug?: string | null): void {
  if (typeof window === 'undefined') return;
  void earnStarDustRemote(source, personalitySlug).catch(() => {});
}
