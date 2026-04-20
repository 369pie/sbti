/**
 * WTFTI 多宇宙星图 · 结果 payload 类型
 *
 * 写入数据库字段：results.payload.galaxy
 * 文档：docs/02-modules/wtf-card/galaxy-result-spec-2026-04-19.md
 */

import type { WtfiAxis } from './axes';
import type { ShadowBucket } from './s-axis';

export type UniverseSlug =
  | 'romance'
  | 'work'
  | 'late-night'
  | 'cpti'
  | 'soulti'
  | string;

export interface GalaxyHomePlanet {
  code: string;
  name: string;
  slug: string;
  axesVector: Record<WtfiAxis, number>;
  headline: string;
  body: string;
  cardImageUrl: string;
}

export interface GalaxyMoon {
  universeId: UniverseSlug;
  code: string;
  name: string;
  slug: string;
  headline: string;
  body: string;
  cardImageUrl: string;
}

export interface GalaxyShadow {
  axisScore: number;
  bucket: ShadowBucket;
  slug: string;
  name: string;
  headline: string;
  body: string;
  tooltip: string;
  cardImageUrl: string;
}

export interface GalaxyOrbitEdge {
  from: string;
  to: string;
  reason: string;
}

export interface GalaxyResult {
  homePlanet: GalaxyHomePlanet;
  moons: GalaxyMoon[];
  shadow?: GalaxyShadow;
  orbit: GalaxyOrbitEdge[];
  meta: {
    resultId: string;
    createdAt: string;
    testVersion: string;
  };
}
