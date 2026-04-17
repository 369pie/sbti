/**
 * S-01 · 历史女性索引
 *
 * 把 SOULTI_RESONANCE 中的 soulOrigin 数据反向索引为按「人物」组织的结构，
 * 每位女性对应一个 slug（英文名转 kebab-case），关联多个自然力类型（可能 1 对多）。
 */

import { SOULTI_RESONANCE } from './personalities';
import type { SoultiResonanceData } from './personalities';

export interface OriginEntry {
  slug: string;
  name: string;       // English / Pinyin
  zhName: string;     // 中文名
  era: string;
  description: string;
  quote: string;
  quoteSource: string;
  types: Array<{
    typeSlug: string;
    tags: string[];
  }>;
}

function toOriginSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

let cache: OriginEntry[] | null = null;

export function getAllOrigins(): OriginEntry[] {
  if (cache) return cache;
  const map = new Map<string, OriginEntry>();
  for (const [typeSlug, r] of Object.entries(SOULTI_RESONANCE) as Array<[string, SoultiResonanceData]>) {
    const slug = toOriginSlug(r.soulOrigin.name);
    const existing = map.get(slug);
    if (existing) {
      existing.types.push({ typeSlug, tags: r.tags });
    } else {
      map.set(slug, {
        slug,
        name: r.soulOrigin.name,
        zhName: r.soulOrigin.zhName,
        era: r.soulOrigin.era,
        description: r.soulOrigin.description,
        quote: r.quote,
        quoteSource: r.quoteSource,
        types: [{ typeSlug, tags: r.tags }],
      });
    }
  }
  cache = Array.from(map.values()).sort((a, b) => a.zhName.localeCompare(b.zhName, 'zh-CN'));
  return cache;
}

export function getOriginBySlug(slug: string): OriginEntry | undefined {
  return getAllOrigins().find(o => o.slug === slug);
}

export function getAllOriginSlugs(): string[] {
  return getAllOrigins().map(o => o.slug);
}
