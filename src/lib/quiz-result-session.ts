import type { ResultDiagnostics } from './result-diagnostics';

const SESSION_PREFIX = 'sbti:quiz-result';
const MAX_AGE_MS = 1000 * 60 * 60 * 12;

export interface StoredQuizResult<TDimensionScore> {
  slug: string;
  storedAt: number;
  dimensionScores: TDimensionScore[];
  diagnostics: ResultDiagnostics;
}

function getSessionKey(namespace: string): string {
  return `${SESSION_PREFIX}:${namespace}`;
}

export function saveStoredQuizResult<TDimensionScore>(
  namespace: string,
  result: StoredQuizResult<TDimensionScore>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(getSessionKey(namespace), JSON.stringify(result));
  } catch {
    // Ignore storage failures in private mode / storage-restricted environments.
  }
}

export function loadStoredQuizResult<TDimensionScore>(
  namespace: string,
): StoredQuizResult<TDimensionScore> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getSessionKey(namespace));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredQuizResult<TDimensionScore>;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.slug !== 'string') {
      return null;
    }

    if (typeof parsed.storedAt !== 'number' || Date.now() - parsed.storedAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(getSessionKey(namespace));
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}