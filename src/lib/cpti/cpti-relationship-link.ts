/**
 * Encode/decode a CPTI relationship result into a URL-safe string.
 * Used for "回传链接" — so the invite sender can also see the result.
 *
 * Format: relSlug.compatibility.slugA.slugB.nicknameA.nicknameB
 * Then base64url-encoded → ?r=xxx on /cpti/relationship/
 */

import { getRelationshipBySlug, type CptiRelationshipType } from './relationships';
import { getCptiPersonalityBySlug } from './personalities';

export interface CptiRelationshipLink {
  relationshipSlug: string;
  compatibility: number;
  personalitySlugA: string;
  personalitySlugB: string;
  nicknameA: string;
  nicknameB: string;
}

function toBase64Url(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof window !== 'undefined') {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export function encodeRelationshipLink(data: CptiRelationshipLink): string {
  const raw = [
    data.relationshipSlug,
    data.compatibility.toString(),
    data.personalitySlugA,
    data.personalitySlugB,
    data.nicknameA || '匿名',
    data.nicknameB || '匿名',
  ].join('.');
  return toBase64Url(raw);
}

export function decodeRelationshipLink(encoded: string): CptiRelationshipLink | null {
  try {
    const raw = fromBase64Url(encoded);
    const parts = raw.split('.');
    if (parts.length < 6) return null;

    const [relationshipSlug, compatStr, personalitySlugA, personalitySlugB, nicknameA, nicknameB] = parts;

    // Validate slugs exist
    if (!getRelationshipBySlug(relationshipSlug)) return null;
    if (!getCptiPersonalityBySlug(personalitySlugA)) return null;
    if (!getCptiPersonalityBySlug(personalitySlugB)) return null;

    return {
      relationshipSlug,
      compatibility: parseInt(compatStr, 10) || 0,
      personalitySlugA,
      personalitySlugB,
      nicknameA,
      nicknameB,
    };
  } catch {
    return null;
  }
}
