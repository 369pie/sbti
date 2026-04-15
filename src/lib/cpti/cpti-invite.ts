/**
 * CPTI Invite link — encode/decode dimension scores into a URL-safe string.
 *
 * Format: nickname.C1score.C2score.C3score.C4score.C5score.personalitySlug
 * Then base64url-encoded and used as the [code] param in /cpti/invite/[code]/.
 *
 * Scores stored as 2-decimal fixed (e.g. 2.34 → "234").
 */

import type { CptiDimensionScore } from './scoring';

export interface CptiInviteData {
  nickname: string;
  dimensions: CptiDimensionScore[];
  personalitySlug: string;
}

// ─── Encode ──────────────────────────────────────────────────────────────────

export function encodeCptiInvite(data: CptiInviteData): string {
  const scores = data.dimensions
    .map(d => Math.round(d.score * 100).toString())
    .join('.');

  const raw = `${data.nickname || '匿名'}.${scores}.${data.personalitySlug}`;

  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(raw, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ─── Decode ──────────────────────────────────────────────────────────────────

function scoreToLevel(score: number): 'H' | 'M' | 'L' {
  if (score >= 2.34) return 'H';
  if (score >= 1.67) return 'M';
  return 'L';
}

export function decodeCptiInvite(encoded: string): CptiInviteData | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    let raw: string;
    if (typeof window !== 'undefined') {
      raw = decodeURIComponent(escape(atob(b64)));
    } else {
      raw = Buffer.from(b64, 'base64').toString('utf-8');
    }

    const parts = raw.split('.');
    // nickname + 5 scores + slug = 7 parts
    if (parts.length < 7) return null;

    const nickname = parts[0];
    const dimIds = ['C1', 'C2', 'C3', 'C4', 'C5'];
    const dimensions: CptiDimensionScore[] = dimIds.map((id, i) => {
      const score = parseInt(parts[1 + i], 10) / 100;
      return { id, score, level: scoreToLevel(score) };
    });
    const personalitySlug = parts[6];

    return { nickname, dimensions, personalitySlug };
  } catch {
    return null;
  }
}
