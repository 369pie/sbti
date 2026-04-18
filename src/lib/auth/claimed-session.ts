import { getApiPath } from '@/lib/api';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';

export const PENDING_SOURCE_USER_ID_KEY = 'cpti-pending-merge-source-user-id';

interface UpgradeResponse {
  userId?: string;
  error?: string;
}

interface MergeResponse {
  error?: string;
}

export interface FinalizeClaimedSessionResult {
  ok: boolean;
  userId: string | null;
  merged: boolean;
  sourceUserId: string | null;
}

let finalizePromise: Promise<FinalizeClaimedSessionResult> | null = null;

export async function stageAnonymousSourceForMerge(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const supabase = tryCreateBrowserSupabaseClient();
  if (!supabase) {
    window.localStorage.removeItem(PENDING_SOURCE_USER_ID_KEY);
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous && user.id) {
    window.localStorage.setItem(PENDING_SOURCE_USER_ID_KEY, user.id);
    return user.id;
  }

  window.localStorage.removeItem(PENDING_SOURCE_USER_ID_KEY);
  return null;
}

export function readPendingMergeSourceUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PENDING_SOURCE_USER_ID_KEY);
}

export function clearPendingMergeSourceUserId(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_SOURCE_USER_ID_KEY);
}

export async function finalizeClaimedSession(): Promise<FinalizeClaimedSessionResult> {
  if (typeof window === 'undefined') {
    return { ok: false, userId: null, merged: false, sourceUserId: null };
  }

  if (finalizePromise) {
    return finalizePromise;
  }

  finalizePromise = (async () => {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) {
      return {
        ok: false,
        userId: null,
        merged: false,
        sourceUserId: readPendingMergeSourceUserId(),
      };
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.is_anonymous) {
      return {
        ok: false,
        userId: user?.id ?? null,
        merged: false,
        sourceUserId: readPendingMergeSourceUserId(),
      };
    }

    const upgradeRes = await fetch(getApiPath('/cpti/upgrade'), {
      method: 'POST',
      credentials: 'include',
    });
    const upgradeData = (await upgradeRes.json().catch(() => ({}))) as UpgradeResponse;

    if (!upgradeRes.ok) {
      throw new Error(upgradeData.error ?? '认领状态同步失败');
    }

    const sourceUserId = readPendingMergeSourceUserId();
    let merged = false;

    if (sourceUserId && sourceUserId !== (upgradeData.userId ?? user.id)) {
      const mergeRes = await fetch(getApiPath('/cpti/merge-existing'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceUserId }),
      });
      const mergeData = (await mergeRes.json().catch(() => ({}))) as MergeResponse;

      if (!mergeRes.ok) {
        throw new Error(mergeData.error ?? '资产合并失败');
      }

      merged = true;
    }

    clearPendingMergeSourceUserId();

    return {
      ok: true,
      userId: upgradeData.userId ?? user.id,
      merged,
      sourceUserId,
    };
  })();

  try {
    return await finalizePromise;
  } finally {
    finalizePromise = null;
  }
}