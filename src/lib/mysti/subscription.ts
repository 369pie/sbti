/**
 * Mysti 订阅 / 通行证（W5+）
 *
 * 与单次解锁 (`unlock.ts`) 共用支付链路，但权益按"到期时间"管理：
 * - monthly-pass    ¥19  → 30 天
 * - quarterly-pass  ¥99  → 92 天
 * - yearly-pass     ¥299 → 365 天
 * - creator-pass    ¥39  → 30 天（创作者）
 *
 * 通行证权益（C 端，不含 creator-pass）：
 *   1. 灵魂月报 monthly-report 自动解锁
 *   2. 全部分享卡 share-plus 自动解锁（资源级）
 *   3. 单次 SKU（灵魂信 / 合盘 / 藏品卡）享 7 折
 *   4. 每日翻牌额外仪式（前端区分）
 *
 * 注意：
 * - 本地缓存只是"显示门禁"，不能防御。所有付费内容必须配合服务端校验。
 * - 不开自动续费——到期前 3 天前端显示提醒，需用户主动续。
 */

import {
  isSubscriptionSku,
  recordUnlock,
  SUBSCRIPTION_DURATION_DAYS,
  type SubscriptionSku,
} from './unlock';

const STORAGE_KEY = 'mysti-subscription-v1';

export interface SubscriptionRecord {
  sku: SubscriptionSku;
  /** 服务端订单号 */
  orderId: string;
  /** 开始时间（unix ms） */
  startAt: number;
  /** 到期时间（unix ms） */
  expiresAt: number;
  /** 服务端签发的 token（未来可加签验证） */
  token?: string;
}

interface StoredEnvelope {
  /** 当前激活的订阅（C 端权益最高的那一份） */
  active: SubscriptionRecord | null;
  /** 历史订阅（含已过期，用于 UI / 客服） */
  history: SubscriptionRecord[];
}

const EMPTY: StoredEnvelope = { active: null, history: [] };

function load(): StoredEnvelope {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope>;
    return {
      active: parsed.active ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return EMPTY;
  }
}

function save(env: StoredEnvelope): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(env));
  } catch {
    /* swallow */
  }
}

/** 记录一次新订阅；自动覆盖到期时间更晚的为 active */
export function recordSubscription(input: Omit<SubscriptionRecord, 'expiresAt'> & {
  /** 显式覆盖到期时间；不传则按 SKU 默认时长计算 */
  expiresAt?: number;
}): SubscriptionRecord {
  const days = SUBSCRIPTION_DURATION_DAYS[input.sku];
  const start = input.startAt || Date.now();
  // 续期：如果当前还有 active 且未过期，从原到期点叠加，而不是从今天叠加
  const env = load();
  let basis = start;
  if (env.active && env.active.expiresAt > start) {
    basis = env.active.expiresAt;
  }
  const expiresAt = input.expiresAt ?? basis + days * 24 * 60 * 60 * 1000;

  const record: SubscriptionRecord = {
    sku: input.sku,
    orderId: input.orderId,
    startAt: start,
    expiresAt,
    token: input.token,
  };

  const next: StoredEnvelope = {
    active: record,
    history: [record, ...env.history].slice(0, 30),
  };
  save(next);

  // 同步写入 unlock.ts 的"按 SKU+resource"门禁，方便其他组件直接 isUnlocked 判断
  // 注意：单条订阅仅写一次"subscription"资源；权益判断走 isSubscriber()。
  recordUnlock({
    sku: input.sku,
    resourceId: 'subscription',
    orderId: input.orderId,
    unlockedAt: start,
    token: input.token,
  });

  return record;
}

/** 当前是否有有效订阅（不区分 sku） */
export function isSubscriber(now: number = Date.now()): boolean {
  const env = load();
  return !!(env.active && env.active.expiresAt > now);
}

/** 当前激活的订阅（如果已过期，返回 null） */
export function getActiveSubscription(now: number = Date.now()): SubscriptionRecord | null {
  const env = load();
  if (env.active && env.active.expiresAt > now) return env.active;
  return null;
}

/** 距到期还剩多少天（向上取整；过期返回 0） */
export function daysUntilExpiry(now: number = Date.now()): number {
  const sub = getActiveSubscription(now);
  if (!sub) return 0;
  const ms = sub.expiresAt - now;
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/** 通行证 C 端是否覆盖某个 SKU 的"内容解锁" */
export function passCoversSingleSku(sku: string): boolean {
  // creator-pass 不解锁 C 端内容
  switch (sku) {
    case 'monthly-report':
    case 'share-plus':
      return true;
    default:
      return false;
  }
}

/** 通行证 C 端权益是否覆盖某个 SKU（含 7 折） */
export function passDiscountForSku(sku: string): number {
  // 折扣 0~1。0 表示不打折。
  switch (sku) {
    case 'soul-letter':
    case 'dual-report':
    case 'share-atelier':
      return 0.3; // 7 折 = 折扣 0.3
    default:
      return 0;
  }
}

/** 重新导出：是否是订阅 SKU */
export { isSubscriptionSku };

// ───────────────────────── Server sync ─────────────────────────

import { getOrCreateDeviceId } from './device';

const LAST_SYNC_KEY = 'mysti-subscription-last-sync';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1h

function readLastSync(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LAST_SYNC_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeLastSync(ts: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_SYNC_KEY, String(ts));
  } catch {
    /* swallow */
  }
}

/**
 * Pull authoritative subscription state from the server and reconcile with the
 * local envelope. Server wins (it's the truth) but we never *delete* a still-
 * unexpired local record on transient network errors.
 *
 * Safe to call on every app boot. Throttled to once / hour by default.
 */
export async function syncSubscriptionFromServer(opts?: {
  force?: boolean;
}): Promise<SubscriptionRecord | null> {
  if (typeof window === 'undefined') return null;
  const now = Date.now();
  if (!opts?.force && now - readLastSync() < SYNC_INTERVAL_MS) {
    return getActiveSubscription();
  }

  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return getActiveSubscription();

  try {
    const res = await fetch(
      `/api/mysti/subscription?deviceId=${encodeURIComponent(deviceId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return getActiveSubscription();
    const data = (await res.json()) as {
      active?: boolean;
      sku?: SubscriptionSku;
      startsAt?: number;
      expiresAt?: number;
    };
    writeLastSync(now);

    if (data.active && data.sku && data.expiresAt && data.startsAt) {
      // Trust the server expiry. Only overwrite if it's later than what we have.
      const env = load();
      const localExpiry = env.active?.expiresAt ?? 0;
      if (data.expiresAt >= localExpiry) {
        const record: SubscriptionRecord = {
          sku: data.sku,
          orderId: env.active?.orderId ?? `server_${deviceId}`,
          startAt: data.startsAt,
          expiresAt: data.expiresAt,
          token: env.active?.token,
        };
        save({
          active: record,
          history: env.active && env.active.orderId !== record.orderId
            ? [env.active, ...env.history].slice(0, 30)
            : env.history,
        });
        return record;
      }
      return env.active;
    }

    // Server says no active subscription. Clear local active only if local
    // is also already expired — otherwise keep showing benefits until it expires.
    const env = load();
    if (env.active && env.active.expiresAt <= now) {
      save({ active: null, history: env.history });
    }
    return getActiveSubscription();
  } catch {
    return getActiveSubscription();
  }
}
