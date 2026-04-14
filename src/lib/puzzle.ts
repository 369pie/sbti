/**
 * Bestie Personality Puzzle — 4-person collaborative personality card.
 *
 * 4 friends each contribute one corner of a puzzle card.
 * When complete → generates a group personality composite.
 * Pure client-side, URL-param encoded.
 */

import { getPersonalityBySlug } from './personalities';
import type { PersonalityType } from './personalities';

// ─── Types ───────────────────────────────────────────────

export interface PuzzlePiece {
  name: string;
  slug: string;
}

export interface PuzzleData {
  title: string;
  pieces: (PuzzlePiece | null)[]; // always length 4
}

export interface PuzzleResult {
  title: string;
  pieces: (PuzzlePiece & { personality: PersonalityType })[];
  filledCount: number;
  isComplete: boolean;
  chemistryType: string;
  chemistryEmoji: string;
  chemistryDesc: string;
}

// ─── URL encoding ────────────────────────────────────────
// Format: ?t=title&p0=name:slug&p1=name:slug&p2=&p3=

export function encodePuzzleParams(data: PuzzleData): string {
  const parts = [`t=${encodeURIComponent(data.title)}`];
  for (let i = 0; i < 4; i++) {
    const p = data.pieces[i];
    parts.push(`p${i}=${p ? `${encodeURIComponent(p.name)}:${p.slug}` : ''}`);
  }
  return parts.join('&');
}

export function decodePuzzleParams(searchParams: URLSearchParams): PuzzleData | null {
  const title = searchParams.get('t');
  if (!title) return null;

  const pieces: (PuzzlePiece | null)[] = [];
  for (let i = 0; i < 4; i++) {
    const raw = searchParams.get(`p${i}`);
    if (!raw) {
      pieces.push(null);
      continue;
    }
    const colonIdx = raw.indexOf(':');
    if (colonIdx < 0) {
      pieces.push(null);
      continue;
    }
    const name = decodeURIComponent(raw.slice(0, colonIdx));
    const slug = raw.slice(colonIdx + 1);
    if (name && slug && getPersonalityBySlug(slug)) {
      pieces.push({ name, slug });
    } else {
      pieces.push(null);
    }
  }

  return { title: decodeURIComponent(title), pieces };
}

// ─── Chemistry analysis ──────────────────────────────────

const CHEMISTRY_TYPES: { test: (slugs: string[]) => boolean; type: string; emoji: string; desc: string }[] = [
  {
    test: slugs => new Set(slugs).size === 1,
    type: '灵魂四胞胎',
    emoji: '🪞',
    desc: '四个人居然是同一种人格，不是一家人不进一家门',
  },
  {
    test: slugs => new Set(slugs).size === 4,
    type: '人格万花筒',
    emoji: '🎆',
    desc: '四个完全不同的灵魂，凑在一起反而什么话题都能聊',
  },
  {
    test: slugs => new Set(slugs).size === 2,
    type: '双子对决',
    emoji: '⚡',
    desc: '两两成对的阵营，适合打团战',
  },
  {
    test: () => true,
    type: '混搭闺蜜团',
    emoji: '🧩',
    desc: '没有最标准的搭配，有缘就是最好的化学反应',
  },
];

export function analyzePuzzle(data: PuzzleData): PuzzleResult | null {
  const filled = data.pieces.filter((p): p is PuzzlePiece => p !== null);
  const resolved = filled.map(p => {
    const personality = getPersonalityBySlug(p.slug);
    return personality ? { ...p, personality } : null;
  }).filter((p): p is PuzzlePiece & { personality: PersonalityType } => p !== null);

  if (resolved.length === 0) return null;

  const isComplete = resolved.length === 4;
  const slugs = resolved.map(r => r.slug);
  const chem = CHEMISTRY_TYPES.find(c => c.test(slugs)) ?? CHEMISTRY_TYPES[CHEMISTRY_TYPES.length - 1];

  return {
    title: data.title,
    pieces: resolved,
    filledCount: resolved.length,
    isComplete,
    chemistryType: chem.type,
    chemistryEmoji: chem.emoji,
    chemistryDesc: chem.desc,
  };
}

export function generatePuzzleShareText(result: PuzzleResult, url: string): string {
  const lines = [
    `${result.chemistryEmoji} ${result.title}`,
    '',
    ...result.pieces.map(p => `${p.personality.emoji} ${p.name} — ${p.personality.name}`),
    '',
    `闺蜜化学反应: ${result.chemistryType}`,
    result.chemistryDesc,
    '',
    result.isComplete
      ? `我们的拼图完成了！来看看 👉 ${url}`
      : `还差 ${4 - result.filledCount} 人，快来填坑 👉 ${url}`,
  ];
  return lines.join('\n');
}
