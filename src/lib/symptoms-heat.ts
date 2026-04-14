/**
 * Simulated heat / popularity data for symptoms pages.
 *
 * Deterministic per slug — same slug always returns the same numbers.
 * Numbers are designed to feel realistic and create social proof.
 */

/** Simple string hash → [0, 1) */
function hashToFloat(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** Seeded pseudo-random from slug + key */
function seeded(slug: string, key: string): number {
  return hashToFloat(`${slug}::${key}`);
}

export interface SymptomsHeat {
  /** 参与打勾人数，如 "3.2万" */
  participantsText: string;
  /** 原始参与人数 */
  participants: number;
  /** 平均中枪数，如 3.4 */
  avgHits: number;
  /** "XX% 的人全中" */
  fullHitPct: number;
  /** 🔥 热度等级 1-5 */
  fireLevel: number;
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

/** 热门 slug — 给予更高基础参与人数 */
const HOT_SLUGS = new Set([
  'boss', 'nerd', 'solo', 'emo', 'drama', 'chill', 'sleep',
  'thin-k', 'rebel', 'party', 'shy', 'food-ie',
]);

export function getSymptomsHeat(slug: string): SymptomsHeat {
  const isHot = HOT_SLUGS.has(slug);

  // 参与人数：热门 2.8万~5.6万，普通 0.8万~2.4万
  const baseMin = isHot ? 28000 : 8000;
  const baseRange = isHot ? 28000 : 16000;
  const participants = Math.round(baseMin + seeded(slug, 'participants') * baseRange);

  // 平均中枪数：2.8 ~ 4.2（偏高更有趣）
  const avgHits = +(2.8 + seeded(slug, 'avgHits') * 1.4).toFixed(1);

  // 全中比例：12% ~ 28%
  const fullHitPct = Math.round(12 + seeded(slug, 'fullHit') * 16);

  // 🔥 热度等级
  const fireLevel = participants > 40000 ? 5 : participants > 30000 ? 4 : participants > 20000 ? 3 : participants > 12000 ? 2 : 1;

  return {
    participantsText: formatCount(participants),
    participants,
    avgHits,
    fullHitPct,
    fireLevel,
  };
}

/** 全站症状总参与人数 */
export function getTotalSymptomsParticipants(slugs: string[]): string {
  const total = slugs.reduce((sum, slug) => sum + getSymptomsHeat(slug).participants, 0);
  return formatCount(total);
}
