import type { CptiClaimSource } from './claim';
import { getApiPath } from '@/lib/api';
import { hasBrowserSupabaseSession, tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';

// Base fetch wrapper that includes credentials (cookies for Supabase auth)
const API_BASE = getApiPath('/cpti');

let _signInPromise: Promise<boolean> | null = null;

/**
 * Ensure we have a Supabase session. Signs in anonymously if needed.
 * Deduplicates concurrent calls.
 */
async function ensureSession(): Promise<boolean> {
  if (_signInPromise) return _signInPromise;

  _signInPromise = (async () => {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) {
      return false;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('[cpti-api] signInAnonymously failed:', error.message);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('[cpti-api] ensureSession failed:', err);
      return false;
    } finally {
      // Allow retry on next call
      setTimeout(() => { _signInPromise = null; }, 1000);
    }
  })();

  return _signInPromise;
}

interface PairCodeResponse {
  code: string;
  shareToken: string;
  expiresAt: string | null;
  mode: 'direct' | 'open';
  maxUses: number;
  creatorSnapshotId: string | null;
}

interface ResolvedPairCodeResponse {
  valid: boolean;
  id: string;
  code: string;
  mode: 'direct' | 'open';
  expiresAt: string;
  creatorUserId: string;
  usedCount: number;
  maxUses: number;
  inviterNickname: string | null;
  inviterPersonalitySlug: string | null;
}

interface StartedMatchResponse {
  matchId: string;
  status: string;
  initiatorUserId: string;
  participantUserId: string;
}

interface CompletedMatchResponse {
  matchId: string;
  relationship: {
    id: string;
    slug: string;
    tier: string;
    code: string;
    compatibility: number;
    name: string;
    tagline: string;
    description: string;
    emoji: string;
    color: string;
  };
  initiatorProfile: {
    personality: {
      slug: string;
    };
    dimensions: Array<{ id: string; score: number; level: string }>;
    snapshotId: string;
  };
  participantProfile: {
    personality: {
      slug: string;
    };
    dimensions: Array<{ id: string; score: number; level: string }>;
    snapshotId: string;
  };
  compatibility: number;
  completedAt: string;
  atlasUpdate: Record<string, { newUnlock: boolean; totalUnlocks: number }>;
  collectionProgress: {
    collected: number;
    total: number;
  };
}

interface CollectionResponse {
  stats: {
    totalCollectibleUnlocks: number;
    relationshipTypeCount: number;
    soulCount: number;
    rareRelationshipCount: number;
  };
  unlocks: Array<{
    itemKey: string;
    unlockedAt: string;
    sourceKind: string;
  }>;
  recentRelationships: Array<{
    id: string;
    slug: string;
    tier: string;
    compatibility: number;
    otherPersonality: string;
    createdAt: string;
  }>;
  collectionProgress: {
    collected: number;
    total: number;
    percentage: number;
  };
}

function isAuthenticationError(error: unknown): error is Error {
  return error instanceof Error && /authentication required/i.test(error.message);
}

async function apiFetch<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (res.status === 401 && retry) {
    const body = await res.json().catch(() => ({}));
    if (body.needsAnonymousSignIn) {
      // Auto-authenticate and retry once
      const ready = await ensureSession();
      if (ready) {
        return apiFetch<T>(path, options, false);
      }
    }
    throw new Error(body.error ?? 'Authentication required');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json();
}

async function apiFetchIfSessionExists<T>(path: string): Promise<T | null> {
  const hasSession = await hasBrowserSupabaseSession();
  if (!hasSession) {
    return null;
  }

  try {
    return await apiFetch<T>(path);
  } catch (error) {
    if (isAuthenticationError(error)) {
      return null;
    }
    throw error;
  }
}

export const cptiApi = {
  bootstrap: () =>
    apiFetch<{ userId: string; isAnonymous: boolean; success: boolean }>('/users/bootstrap', {
      method: 'POST',
    }),

  getProfile: () => apiFetch<Record<string, unknown>>('/users/me'),

  saveProfile: (data: {
    personalitySlug: string;
    dimensionScores: Array<{ id: string; score: number; level: string }>;
    source: CptiClaimSource;
  }) =>
    apiFetch<Record<string, unknown>>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createPairCode: (data: {
    mode: 'direct' | 'open';
    maxUses?: number;
    expiresInHours?: number;
    personalitySlug?: string;
    dimensionScores?: Array<{ id: string; score: number; level: string }>;
    source?: CptiClaimSource;
  }) =>
    apiFetch<PairCodeResponse>('/pair-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resolvePairCode: (code: string) => apiFetch<ResolvedPairCodeResponse>(`/pair-codes/${code}`),

  startMatch: (data: { pairCodeId?: string }) =>
    apiFetch<StartedMatchResponse>('/matches/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeMatch: (data: {
    matchId: string;
    initiatorAnswers: Record<number, number>;
    participantAnswers: Record<number, number>;
  }) =>
    apiFetch<CompletedMatchResponse>('/matches/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCollection: () => apiFetchIfSessionExists<CollectionResponse>('/me/collection'),

  getStats: () => apiFetchIfSessionExists<Record<string, unknown>>('/me/stats'),

  getRelationships: () => apiFetchIfSessionExists<Record<string, unknown>>('/me/relationships'),

  getLeaderboard: (type: string, limit?: number) =>
    apiFetch<Record<string, unknown>>(`/leaderboards?type=${type}&limit=${limit ?? 50}`),
};
