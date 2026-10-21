/**
 * SERVER ONLY — imported exclusively via registry.server.ts.
 * CPTI deep (cpti-deep-relationship) paid copy.
 */
import { getRelationshipBySlug } from '@/lib/cpti/relationships';
import { hashString, pickN } from '@/lib/payments/deep-content';
import { RELATIONSHIP_STAGES, getPracticesForStage, LANDMINE_POOL_V2, type RelationshipStage } from '@/lib/cpti/deep-pools';

const MONTH_THEMES = [
  '一月 · 仪式重启',
  '二月 · 重提爱意',
  '三月 · 共修一项新技能',
  '四月 · 互写感谢清单',
  '五月 · 旅行 / 短途出走',
  '六月 · 边界对齐',
  '七月 · 共同财务 check-in',
  '八月 · 各自独处一天',
  '九月 · 复盘上半年',
  '十月 · 朋友圈共建',
  '十一月 · 健康 / 体能合修',
  '十二月 · 写下一年关系清单',
];

export type CptiDeepPayload = {
  practicesByStage: Record<RelationshipStage, string[]>;
  landmines: string[];
  themes: string[];
};

export function buildCptiDeepPayload(slug: string): CptiDeepPayload | null {
  if (!getRelationshipBySlug(slug)) return null;
  const practicesByStage = Object.fromEntries(
    RELATIONSHIP_STAGES.map((s) => [s.id, pickN(getPracticesForStage(s.id), `${slug}::${s.id}`, 24, 'practice-v2')]),
  ) as Record<RelationshipStage, string[]>;
  const landmines = pickN(LANDMINE_POOL_V2, slug, 12, 'landmine-v2');
  const monthOffset = hashString(slug) % 12;
  const themes = MONTH_THEMES.map((_, i) => MONTH_THEMES[(i + monthOffset) % 12]);
  return { practicesByStage, landmines, themes };
}
