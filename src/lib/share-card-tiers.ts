/**
 * Share Card Tiers — L3 三档分享卡 token & gating helpers
 *
 * 详见 docs/01-strategy/visual-unification-and-tiered-share-cards-2026-04-18.md
 *
 *   free    — 现有奶油标准卡，QR + 链接 + 站点水印
 *   plus    — 烫金描边 + 衬线主标 + 个性化金句 + 去水印 + 1080×1920
 *   atelier — N° 编号 + 藏书票印戳 + AI 重绘 + 印刷级 PDF
 *
 * 这是 ShareImageGenerator 共用的 token；不同 universe 可以传入自己的 base
 * (BG / 主题色) 然后 mergeShareTier(base, tier) 拿到分档后的最终参数。
 */

export type ShareCardTier = 'free' | 'plus' | 'atelier';

export interface ShareCardTierTokens {
  /** Canvas 像素：长边像素值（cap），用于决定输出分辨率 */
  width: number;
  height: number;
  /** Retina 倍率，atelier 走印刷级 3x，plus 2.5x，free 2x */
  scale: number;
  /** 是否绘制站点底部水印（"wtfti.com / sbtinb.com"） */
  showWatermark: boolean;
  /** 是否绘制 N° 编号 */
  showNumeroBadge: boolean;
  /** 是否绘制金属箔双线描边 */
  goldFrame: boolean;
  /** 主标字体偏好 */
  titleFontFamily: string;
  /** 是否输出额外资产（壁纸 / 印刷 PDF）—— 仅 atelier */
  extraAssets: ('wallpaper' | 'print-pdf' | 'social-9-16')[];
  /** 文案副标，例如 "PLUS · 精修版" / "N° ATELIER · 藏品版" */
  ribbonLabel: string | null;
  /** 解锁所需最低权限（消费层级） */
  requires: 'free' | 'paid' | 'atelier';
  /** UI 容器 className（搭配 globals.css 的 .share-card-plus / .share-card-atelier） */
  containerClass: string;
}

const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_EDITORIAL = '"Cormorant Garamond", "Songti SC", Georgia, serif';
const FONT_ATELIER = 'Fraunces, "Cormorant Garamond", "Songti SC", Georgia, serif';

export const SHARE_CARD_TIERS: Record<ShareCardTier, ShareCardTierTokens> = {
  free: {
    width: 540,
    height: 1060,
    scale: 2,
    showWatermark: true,
    showNumeroBadge: false,
    goldFrame: false,
    titleFontFamily: FONT_SANS,
    extraAssets: [],
    ribbonLabel: null,
    requires: 'free',
    containerClass: '',
  },
  plus: {
    width: 540,
    height: 1080,
    scale: 2.5,
    showWatermark: false,
    showNumeroBadge: false,
    goldFrame: true,
    titleFontFamily: FONT_EDITORIAL,
    extraAssets: [],
    ribbonLabel: 'PLUS · 精修版',
    requires: 'paid',
    containerClass: 'share-card-plus',
  },
  atelier: {
    width: 600,
    height: 1200,
    scale: 3,
    showWatermark: false,
    showNumeroBadge: true,
    goldFrame: true,
    titleFontFamily: FONT_ATELIER,
    extraAssets: ['print-pdf', 'wallpaper'],
    ribbonLabel: 'N° ATELIER · 藏品版',
    requires: 'atelier',
    containerClass: 'share-card-atelier',
  },
};

/** UI 文案：tier 选择器 */
export const SHARE_CARD_TIER_LABEL: Record<ShareCardTier, { name: string; tagline: string; cta: string }> = {
  free: {
    name: '基础卡',
    tagline: '免费 · 标准奶油卡',
    cta: '直接下载',
  },
  plus: {
    name: 'Plus 精修',
    tagline: '烫金衬线 · 去水印',
    cta: '✦ 解锁 Plus',
  },
  atelier: {
    name: 'Atelier 藏品',
    tagline: 'N° 编号 · 印刷级 · 限定 IP',
    cta: '✦ 解锁 N° 藏品',
  },
};

/** 给定卡片像素尺寸，计算 atelier/plus 适配（保持比例） */
export function resolveCardSize(tier: ShareCardTier, baseWidth = 540, baseHeight = 1060) {
  const t = SHARE_CARD_TIERS[tier];
  const ratio = t.width / 540;
  return {
    width: Math.round(baseWidth * ratio),
    height: Math.round(baseHeight * ratio),
    scale: t.scale,
  };
}
