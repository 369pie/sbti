import type { IdentifyDimensionScore } from '@/lib/identify/scoring';
import type { ResultDiagnostics } from '@/lib/result-diagnostics';

const API_BASE = '/api/identify';

let ensureSessionPromise: Promise<void> | null = null;

export interface IdentifyAssessmentEntry {
  id: string;
  shareToken: string;
  personaSlug: string;
  actorDisplayName: string;
  subjectDisplayName: string;
  createdAt: string;
  challengeOpenedAt: string | null;
  subjectViewedAt: string | null;
}

export interface IdentifyHistoryResponse {
  sent: IdentifyAssessmentEntry[];
  received: IdentifyAssessmentEntry[];
  summary: {
    sentCount: number;
    receivedCount: number;
    unreadReceivedCount: number;
    receivedLocked: boolean;
  };
}

export interface IdentifyPreviewResponse {
  id: string;
  shareToken: string;
  personaSlug: string;
  actorDisplayName: string;
  subjectDisplayName: string;
  dimensionScores: IdentifyDimensionScore[];
  createdAt: string;
}

export interface IdentifySaveResponse {
  ok: true;
  assessment: {
    id: string;
    shareToken: string;
    actorDisplayName: string;
    subjectDisplayName: string;
    personaSlug: string;
    createdAt: string;
  };
}

async function ensureSession() {
  if (ensureSessionPromise) return ensureSessionPromise;

  ensureSessionPromise = (async () => {
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          throw error;
        }
      }
    } finally {
      setTimeout(() => {
        ensureSessionPromise = null;
      }, 1000);
    }
  })();

  return ensureSessionPromise;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${response.status}`);
  }

  return response.json();
}

async function authedMutation<T>(path: string, body: unknown, hasRetried = false): Promise<T> {
  await ensureSession();

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    const payload = await response.json().catch(() => ({}));
    if (payload.needsAnonymousSignIn && !hasRetried) {
      await ensureSession();
      return authedMutation<T>(path, body, true);
    }
    throw new Error(payload.error ?? 'Authentication required');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `API error ${response.status}`);
  }

  return response.json();
}

export const identifyApi = {
  saveAssessment: (data: {
    personaSlug: string;
    friendName?: string;
    dimensionScores: IdentifyDimensionScore[];
    diagnostics?: ResultDiagnostics;
    clientMutationId?: string;
  }) => authedMutation<IdentifySaveResponse>('/save', data),

  claimReceived: (shareToken: string, markViewed = false) =>
    authedMutation<{ ok: true; claimed: boolean; markedViewed: boolean }>('/claim-received', {
      shareToken,
      markViewed,
    }),

  getPreview: (shareToken: string) =>
    apiFetch<IdentifyPreviewResponse>(`/preview?shareToken=${encodeURIComponent(shareToken)}`),

  getHistory: async () => {
    const response = await fetch(`${API_BASE}/me/history`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `API error ${response.status}`);
    }

    return response.json() as Promise<IdentifyHistoryResponse>;
  },
};