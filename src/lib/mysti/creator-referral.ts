/**
 * 创作者推荐链接埋点（W6 — 30 个创作者灰度试点）
 *
 * URL: /mysti/?ref=xhs_jiejie01
 * 写入 localStorage 7 天有效，付费时附带到订单元数据
 */

const STORAGE_KEY = 'mysti-creator-ref';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface ReferralPayload {
  code: string;
  capturedAt: number;
}

export function captureCreatorReferral(code: string): void {
  if (typeof window === 'undefined') return;
  if (!code || !/^[a-z0-9_-]{2,32}$/i.test(code)) return;
  try {
    const payload: ReferralPayload = { code, capturedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* swallow */
  }
}

export function getActiveReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as ReferralPayload;
    if (!payload?.code) return null;
    if (Date.now() - payload.capturedAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return payload.code;
  } catch {
    return null;
  }
}

export function clearReferral(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* swallow */
  }
}
