/**
 * Time Assets shared contract · /api/wtfti/assets ↔ cloud-sync
 *
 * 时间资产 = 星尘信（sealed/retest）+ 月相 30 天未来信（future）+ 月相进度 + galaxy 结果。
 * 本文件只放类型与常量，无运行时依赖，服务端与客户端共用。
 */

export type WtftiLetterKind = 'sealed' | 'retest' | 'future';

export interface WtftiGalaxySessionPayload {
  resultId: string;
  createdAt: string;
  personalitySlug: string;
  homePlanetSlug?: string | null;
  result: unknown;
  soulAnswers?: unknown;
}

export interface WtftiLetterPayload {
  id: string;
  kind: WtftiLetterKind;
  text: string;
  title?: string | null;
  sealedAt: string;
  dueAt: string;
  personalitySlug?: string | null;
  planetSlug?: string | null;
  opened: boolean;
}

export interface WtftiMoonPayload {
  done: number[];
  answers: Record<string, number>;
  crownedAt?: string | null;
  title?: string | null;
}

export interface WtftiDuetSessionPayload {
  /** 确定性 id（由双方 slug+soul 派生），upsert 天然幂等 */
  id: string;
  mySlug: string;
  partnerSlug: string;
  pairData: Record<string, unknown>;
  createdAt: string;
}

export interface WtftiAssetsSyncRequest {
  galaxySessions?: WtftiGalaxySessionPayload[];
  letters?: WtftiLetterPayload[];
  moon?: WtftiMoonPayload | null;
  duetSessions?: WtftiDuetSessionPayload[];
  deleteLetterIds?: string[];
}

/** galaxy meta（不含 result/soulAnswers 大 JSON；完整结果用 ?resultId= 单取） */
export interface WtftiGalaxySessionMeta {
  resultId: string;
  createdAt: string;
  personalitySlug: string;
  homePlanetSlug?: string | null;
}

export interface WtftiAssetsState {
  galaxySessions: WtftiGalaxySessionMeta[];
  letters: WtftiLetterPayload[];
  moon: WtftiMoonPayload | null;
  duetSessions: WtftiDuetSessionPayload[];
}

export const WTFTI_ASSETS_LIMITS = {
  lettersPerSync: 200,
  galaxySessionsPerSync: 50,
  letterTextMax: 480,
  letterTitleMax: 120,
  moonChapterMax: 12,
} as const;
