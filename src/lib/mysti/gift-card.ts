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

const STORAGE_KEY = 'mysti-gift-cards';

/** 受赠内容 SKU —— 仅允许「可作为礼物送出」的单次内容 */
export type GiftCardGiftSku =
  | 'soul-letter'
  | 'dual-report'
  | 'monthly-report'
  | 'share-atelier';

/** 礼品卡订单 SKU（决定贺卡形态/价位） */
export type GiftOrderSku = 'gift-card' | 'festival-gift-card' | 'besties-bundle';

export interface GiftCard {
  code: string;
  /** 受赠 SKU */
  giftSku: GiftCardGiftSku;
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
  giftSku: GiftCardGiftSku;
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
  {
    giftSku: 'share-atelier',
    label: 'N° 藏品分享卡',
    description: '送一张编号独特的收藏分享卡',
    emoji: '✨',
  },
];

/**
 * 礼品卡套装：决定收赠人收到的「贺卡感」与价位档。
 * 底层都走支付订单 SKU（gift-card / festival-gift-card / besties-bundle）。
 */
export interface GiftBundleOption {
  orderSku: GiftOrderSku;
  defaultGiftSku: GiftCardGiftSku;
  badge: string;
  label: string;
  description: string;
  emoji: string;
  scenes: string[];
}

export const GIFT_BUNDLES: GiftBundleOption[] = [
  {
    orderSku: 'gift-card',
    defaultGiftSku: 'soul-letter',
    badge: '经典礼物',
    label: '灵魂礼品卡 · 三选一',
    description: '灵魂信 / 双人合盘 / 月报 任选一项，附自定义贺卡',
    emoji: '🎁',
    scenes: ['日常送礼', '闺蜜生日', '谢谢你'],
  },
  {
    orderSku: 'festival-gift-card',
    defaultGiftSku: 'soul-letter',
    badge: '节日限定',
    label: '节日限定礼品卡',
    description: '七夕 / 圣诞 / 生日 / 求职 限定主题贺卡 + 藏品卡 N°',
    emoji: '🌸',
    scenes: ['七夕', '圣诞', '生日', '求职加油'],
  },
  {
    orderSku: 'besties-bundle',
    defaultGiftSku: 'dual-report',
    badge: '闺蜜套装',
    label: '闺蜜对箱',
    description: '双人合盘报告 + 双人 Plus 分享卡 + 手写贺卡',
    emoji: '👯',
    scenes: ['闺蜜', '姐妹', '互送'],
  },
];

/**
 * 节日主题预设：用于「节日限定礼品卡」套装上的主题选择，
 * 决定贺卡封面、问候语、配色调性。
 */
export interface FestivalTheme {
  id: string;
  label: string;
  emoji: string;
  defaultGreeting: string;
  /** Tailwind-friendly hex tokens; UI 决定如何用 */
  accentHex: string;
  /** 适用 orderSku（默认仅 festival-gift-card） */
  orderSku?: GiftOrderSku;
}

export const FESTIVAL_THEMES: FestivalTheme[] = [
  {
    id: 'qixi',
    label: '七夕 · 灵魂双星',
    emoji: '🌌',
    defaultGreeting: '愿我们的灵魂在银河两端互相照亮。',
    accentHex: '#E8B4D6',
  },
  {
    id: 'christmas',
    label: '圣诞 · 暖夜之礼',
    emoji: '🎄',
    defaultGreeting: '把这一份灵魂的暖意，寄给岁末的你。',
    accentHex: '#D4A574',
  },
  {
    id: 'birthday',
    label: '生日 · 灵魂年轮',
    emoji: '🕯️',
    defaultGreeting: '又添一圈灵魂年轮，愿你认得自己更深。',
    accentHex: '#F5C6A5',
  },
  {
    id: 'job-luck',
    label: '求职加油 · 灵魂护身符',
    emoji: '🛡️',
    defaultGreeting: '愿这张牌成为你下一程的护身符。',
    accentHex: '#A8C8D4',
  },
  {
    id: 'graduation',
    label: '毕业 · 灵魂启程',
    emoji: '🎓',
    defaultGreeting: '完成一段，启程下一段，灵魂记得这一刻。',
    accentHex: '#B8B0FF',
  },
  {
    id: 'farewell',
    label: '告别 · 灵魂送别',
    emoji: '🍃',
    defaultGreeting: '路途虽分，灵魂同频。',
    accentHex: '#C8C0DC',
  },
];

export function findFestivalTheme(id?: string): FestivalTheme | null {
  if (!id) return null;
  return FESTIVAL_THEMES.find(t => t.id === id) ?? null;
}
