import type { CptiClaimSource } from './claim';

// Base fetch wrapper that includes credentials (cookies for Supabase auth)
const API_BASE = '/api/cpti';

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json();
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

  getCollection: () => apiFetch<CollectionResponse>('/me/collection'),

  getStats: () => apiFetch<Record<string, unknown>>('/me/stats'),

  getRelationships: () => apiFetch<Record<string, unknown>>('/me/relationships'),

  getLeaderboard: (type: string, limit?: number) =>
    apiFetch<Record<string, unknown>>(`/leaderboards?type=${type}&limit=${limit ?? 50}`),
};
