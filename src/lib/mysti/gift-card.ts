/**
 * 灵魂信礼品卡（W6 MVP）
 *
 * 流程：
 * 1. 购买者通过 `/mysti/gift/` 选择礼品卡型号 + 自定义贺卡 → 触发 `/api/mysti/payment/create`
 *    （sku=`gift-card`，resourceId=`gift-<uuid>`）。
 * 2. 支付完成后，服务端在 `mysti_gift_cards` 表签发兑换码；前端仅把卡片摘要缓存到
 *    `mysti-gift-cards` localStorage（购买者侧，便于「我购买的」页签显示）。
 * 3. 接收者打开 `/mysti/gift/?code=XXX` → 通过 API 查卡 / 兑卡。
 *
 * 注：localStorage 现在只是 UI cache，不再是礼品卡事实来源。
 */

import type { MystiSku } from './unlock';

const STORAGE_KEY = 'mysti-gift-cards';

export interface GiftCard {
  code: string;
  /** 受赠 SKU — 当前 MVP 仅 soul-letter / dual-report / monthly-report */
  giftSku: Exclude<MystiSku, 'gift-card'>;
  resourceId?: string; // soul-letter 时为人格 slug，可在赠送时由收赠人选择
  fromName?: string;
  toName?: string;
  message?: string;
  createdAt: number;
  /** 是否已被兑换 */
  redeemed: boolean;
  redeemedAt?: number;
  redeemedResourceId?: string;
}

export type GiftCardGiftSku = GiftCard['giftSku'];

function load(): GiftCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as GiftCard[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(cards: GiftCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    /* swallow */
  }
}

export function generateGiftCode(): string {
  const seg = () =>
    Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, 'M');
  return `MYSTI-${seg()}-${seg()}-${seg()}`;
}

export function normalizeGiftCardCode(code: string): string {
  return code.trim().toUpperCase().slice(0, 32);
}

export function upsertGiftCard(card: GiftCard): GiftCard {
  const normalized: GiftCard = {
    ...card,
    code: normalizeGiftCardCode(card.code),
  };
  const list = load();
  const idx = list.findIndex(item => item.code === normalized.code);
  if (idx === -1) {
    list.unshift(normalized);
  } else {
    list[idx] = {
      ...list[idx],
      ...normalized,
    };
  }
  save(list);
  return normalized;
}

export function createGiftCard(
  init: Omit<GiftCard, 'code' | 'createdAt' | 'redeemed'>,
): GiftCard {
  const card = upsertGiftCard({
    ...init,
    code: generateGiftCode(),
    createdAt: Date.now(),
    redeemed: false,
  });
  return card;
}

export function getGiftCards(): GiftCard[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function getGiftCardByCode(code: string): GiftCard | null {
  const normalized = normalizeGiftCardCode(code);
  return load().find(c => c.code === normalized) ?? null;
}

export function redeemGiftCard(
  code: string,
  resourceId: string,
): GiftCard | null {
  const list = load();
  const normalized = normalizeGiftCardCode(code);
  const idx = list.findIndex(c => c.code === normalized);
  if (idx === -1) return null;
  if (list[idx].redeemed) return list[idx];
  list[idx] = {
    ...list[idx],
    redeemed: true,
    redeemedAt: Date.now(),
    redeemedResourceId: resourceId,
  };
  save(list);
  return list[idx];
}

export const GIFT_CARD_OPTIONS: Array<{
  giftSku: Exclude<MystiSku, 'gift-card'>;
  label: string;
  description: string;
  emoji: string;
}> = [
  {
    giftSku: 'soul-letter',
    label: '灵魂信',
    description: '为 TA 解锁专属人格深度信件',
    emoji: '💌',
  },
  {
    giftSku: 'dual-report',
    label: '双人合盘报告',
    description: '送一份关系深读',
    emoji: '🪞',
  },
  {
    giftSku: 'monthly-report',
    label: '灵魂月报',
    description: '一整月的灵魂轨迹',
    emoji: '🌙',
  },
];
