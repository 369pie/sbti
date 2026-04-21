import type { SinglePurchaseSku } from '@/lib/mysti/unlock';

/**
 * CPTI Seasonal Skins (v2.0 W6)
 *
 * 季节限定皮肤：在分享卡上叠加季节装饰（颜色、印章、点缀图层）。
 *
 * 时间窗口策略：
 *   - 每张皮肤都有 active windows（年份无关，按 MM-DD 范围）
 *   - 在窗口内自动可用；窗口外需要付费解锁（'cpti-seasonal-{slug}'）或
 *     Mysti Pass 覆盖（passCoversSingleSku('cpti-seasonal-pack')）
 *   - 已购的皮肤永久可用（依赖 Mysti unlock 系统）
 *
 * v0：定义 + 客户端"是否当下可用"判断 + 渲染 hook 留位。
 * 实际 canvas 叠加放在 share generator，按 skin.id 走 switch-case，避免本文件膨胀。
 */

export type CptiSeasonalSkinId =
  | 'qixi-2026'        // 七夕：金箔流光 + 鹊桥
  | 'valentines-2026'  // 西方情人节：玫瑰封蜡 + ❤
  | 'lunar-newyear-2026'; // 春节：朱砂红 + 福

export type CptiSeasonalSkinSku =
  | 'cpti-seasonal-qixi-2026'
  | 'cpti-seasonal-valentines-2026'
  | 'cpti-seasonal-lunar-newyear-2026';

export const CPTI_SEASONAL_PACK_SKU: SinglePurchaseSku = 'cpti-seasonal-pack';

const SKIN_SKU_BY_ID: Record<CptiSeasonalSkinId, CptiSeasonalSkinSku> = {
  'qixi-2026': 'cpti-seasonal-qixi-2026',
  'valentines-2026': 'cpti-seasonal-valentines-2026',
  'lunar-newyear-2026': 'cpti-seasonal-lunar-newyear-2026',
};

export interface CptiSeasonalSkin {
  id: CptiSeasonalSkinId;
  label: string;
  tagline: string;
  /** 月-日，闭区间，跨年用 startMmDd > endMmDd 表示。 */
  window: { startMmDd: string; endMmDd: string };
  palette: {
    primary: string;     // 主色（边框 / 印章）
    secondary: string;   // 辅色
    seal: string;        // 印章背景
  };
  /** 印章文案 + 角徽。 */
  badge: { sealText: string; cornerLabel: string };
  /** 不在窗口内时购买价格（人民币元） */
  unlockPrice: number;
}

export const CPTI_SEASONAL_SKINS: CptiSeasonalSkin[] = [
  {
    id: 'qixi-2026',
    label: '七夕限定 · 鹊桥金箔',
    tagline: '一年一次的银河会面，给你们的关系镀一层金。',
    window: { startMmDd: '08-10', endMmDd: '08-25' },
    palette: { primary: '#C9A676', secondary: '#E6D29A', seal: '#1a1530' },
    badge: { sealText: '七夕 · QIXI', cornerLabel: 'STARDUST EDITION' },
    unlockPrice: 9.9,
  },
  {
    id: 'valentines-2026',
    label: '情人节限定 · 玫瑰封蜡',
    tagline: '红色封蜡盖在你们的关系上：已签收，已认领。',
    window: { startMmDd: '02-10', endMmDd: '02-20' },
    palette: { primary: '#C07A8E', secondary: '#F5C7D3', seal: '#5A1F2C' },
    badge: { sealText: '已签收 · SEALED', cornerLabel: 'VALENTINE EDITION' },
    unlockPrice: 9.9,
  },
  {
    id: 'lunar-newyear-2026',
    label: '春节限定 · 朱砂福',
    tagline: '红底金字，给你的关系来个开年福印。',
    window: { startMmDd: '01-25', endMmDd: '02-15' },
    palette: { primary: '#B91C1C', secondary: '#FDE68A', seal: '#3F0A0A' },
    badge: { sealText: '福', cornerLabel: 'LUNAR EDITION' },
    unlockPrice: 9.9,
  },
];

function mmDdNow(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

export function isSkinInWindow(skin: CptiSeasonalSkin, now = new Date()): boolean {
  const today = mmDdNow(now);
  const { startMmDd, endMmDd } = skin.window;
  if (startMmDd <= endMmDd) return today >= startMmDd && today <= endMmDd;
  // 跨年窗口
  return today >= startMmDd || today <= endMmDd;
}

export function getActiveSeasonalSkins(now = new Date()): CptiSeasonalSkin[] {
  return CPTI_SEASONAL_SKINS.filter(s => isSkinInWindow(s, now));
}

export function getSkinById(id: CptiSeasonalSkinId): CptiSeasonalSkin | undefined {
  return CPTI_SEASONAL_SKINS.find(s => s.id === id);
}

export function getSkinSku(id: CptiSeasonalSkinId): CptiSeasonalSkinSku {
  return SKIN_SKU_BY_ID[id];
}

/**
 * 客户端判断皮肤是否对当前用户可用。
 * 优先级：在窗口内 → 已购该皮肤 → Mysti Pass 覆盖季节包。
 */
export async function isSkinAvailable(id: CptiSeasonalSkinId): Promise<boolean> {
  const skin = getSkinById(id);
  if (!skin) return false;
  if (isSkinInWindow(skin)) return true;
  try {
    const [{ isUnlocked }, { passCoversSingleSku }] = await Promise.all([
      import('@/lib/mysti/unlock'),
      import('@/lib/mysti/subscription'),
    ]);
    if (isUnlocked(getSkinSku(id), id)) return true;
    if (passCoversSingleSku(CPTI_SEASONAL_PACK_SKU)) return true;
  } catch { /* noop */ }
  return false;
}
