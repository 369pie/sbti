/**
 * Group Personality Rank — URL-encoded group ranking system.
 *
 * Users create a group link, friends join by adding their type.
 * Shows personality distribution + most common type.
 * Pure client-side, URL-param encoded (no backend).
 */

import { getPersonalityBySlug, PERSONALITY_TYPES } from './personalities';
import type { PersonalityType } from './personalities';

// ─── Types ───────────────────────────────────────────────

export interface RankMember {
  name: string;
  slug: string;
}

export interface RankedType {
  personality: PersonalityType;
  count: number;
  members: string[];
  pct: number;
}

export interface RankResult {
  groupName: string;
  members: (RankMember & { personality: PersonalityType })[];
  ranked: RankedType[];
  topType: RankedType;
  totalMembers: number;
  uniqueTypes: number;
  diversityScore: number; // 0-100
}

// ─── URL encoding ────────────────────────────────────────

export function encodeRankParams(groupName: string, members: RankMember[]): string {
  const g = encodeURIComponent(groupName);
  const m = members.map(mem => `${encodeURIComponent(mem.name)}:${mem.slug}`).join(',');
  return `g=${g}&m=${m}`;
}

export function decodeRankParams(searchParams: URLSearchParams): { groupName: string; members: RankMember[] } | null {
  const g = searchParams.get('g');
  const m = searchParams.get('m');
  if (!g || !m) return null;

  const members: RankMember[] = [];
  for (const part of m.split(',')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx < 0) continue;
    const name = decodeURIComponent(part.slice(0, colonIdx));
    const slug = part.slice(colonIdx + 1);
    if (name && slug && getPersonalityBySlug(slug)) {
      members.push({ name, slug });
    }
  }

  return members.length >= 1 ? { groupName: decodeURIComponent(g), members } : null;
}

// ─── Analysis ────────────────────────────────────────────

export function analyzeRank(groupName: string, members: RankMember[]): RankResult | null {
  if (members.length === 0) return null;

  const resolved = members
    .map(m => {
      const p = getPersonalityBySlug(m.slug);
      return p ? { ...m, personality: p } : null;
    })
    .filter((m): m is RankMember & { personality: PersonalityType } => m !== null);

  if (resolved.length === 0) return null;

  // Count by slug
  const countMap = new Map<string, { personality: PersonalityType; members: string[] }>();
  for (const m of resolved) {
    const existing = countMap.get(m.slug);
    if (existing) {
      existing.members.push(m.name);
    } else {
      countMap.set(m.slug, { personality: m.personality, members: [m.name] });
    }
  }

  // Build ranked list sorted by count desc
  const ranked: RankedType[] = Array.from(countMap.entries())
    .map(([, v]) => ({
      personality: v.personality,
      count: v.members.length,
      members: v.members,
      pct: Math.round((v.members.length / resolved.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const uniqueTypes = ranked.length;
  // Shannon diversity index normalized to 0-100
  const total = resolved.length;
  let entropy = 0;
  for (const r of ranked) {
    const p = r.count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  const maxEntropy = Math.log2(Math.min(total, PERSONALITY_TYPES.length));
  const diversityScore = maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;

  return {
    groupName,
    members: resolved,
    ranked,
    topType: ranked[0],
    totalMembers: resolved.length,
    uniqueTypes,
    diversityScore,
  };
}

// ─── Copy text generators ────────────────────────────────

export function generateRankShareText(result: RankResult, url: string): string {
  const top3 = result.ranked.slice(0, 3);
  const lines = [
    `${result.groupName} 人格排行榜 🏆`,
    '',
    ...top3.map((r, i) => {
      const medal = ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`;
      return `${medal} ${r.personality.name}（${r.pct}%）${r.members.join('、')}`;
    }),
    '',
    `共 ${result.totalMembers} 人 · ${result.uniqueTypes} 种人格`,
    `人格多样性 ${result.diversityScore}%`,
    '',
    `来加入排行榜 👉 ${url}`,
  ];
  return lines.join('\n');
}
