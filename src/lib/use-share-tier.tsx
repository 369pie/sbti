'use client';

/**
 * useShareTier — 给任何 ShareImageGenerator 复用的 L3 三档分享卡逻辑。
 *
 * 用法：
 *   const tierCtl = useShareTier({ resourceId: code, universe: 'wtfti' });
 *   <ShareTierPicker {...tierCtl} />
 *   const dataUrl = await renderImage(...);
 *   const final = await tierCtl.applyOverlay(dataUrl, bgColor, brandLabel);
 *
 * 复用 mysti 的 share-plus / share-atelier SKU；resourceId 由调用方决定，
 * 通常带上 universe 前缀避免跨宇宙串号，例如 `wtfti:sage-cat`。
 */

import { useCallback, useEffect, useState } from 'react';
import {
  SHARE_CARD_TIERS,
  SHARE_CARD_TIER_LABEL,
  type ShareCardTier,
} from '@/lib/share-card-tiers';
import { isUnlocked, SKU_PRICES, type MystiSku } from '@/lib/mysti/unlock';
import { readApiJson } from '@/lib/api';
import { getPaymentAvailabilityStatus } from '@/lib/payment/availability';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { restoreMystiEntitlement } from '@/lib/mysti/entitlement-restore';
import {
  isSubscriber,
  passCoversSingleSku,
  syncSubscriptionFromServer,
} from '@/lib/mysti/subscription';

const TIER_TO_SKU: Record<Exclude<ShareCardTier, 'free'>, MystiSku> = {
  plus: 'share-plus',
  atelier: 'share-atelier',
};

const FONT_SANS = '"PingFang SC", "Noto Sans SC", system-ui, sans-serif';
const FONT_SERIF = 'Georgia, "Songti SC", serif';

export interface UseShareTierOptions {
  resourceId: string;
  /** 用于事件埋点 + 文件名前缀 */
  universe: string;
  defaultTier?: ShareCardTier;
}

export interface UseShareTierResult {
  tier: ShareCardTier;
  setTier: (t: ShareCardTier) => void;
  tierTokens: ReturnType<typeof getTierTokens>;
  tierUnlocked: (t: ShareCardTier) => boolean;
  /** 检查当前 tier 是否需要支付，true=需要支付（已发起跳转） */
  ensurePaid: () => Promise<boolean>;
  applyOverlay: (
    dataUrl: string,
    bgColor: string,
    brandLabel: string,
  ) => Promise<string>;
  /** 文件名后缀，例如 -plus / -atelier；free=空 */
  fileSuffix: string;
}

function getTierTokens(tier: ShareCardTier) {
  return SHARE_CARD_TIERS[tier];
}

export function useShareTier({
  resourceId,
  universe,
  defaultTier = 'free',
}: UseShareTierOptions): UseShareTierResult {
  const [tier, setTier] = useState<ShareCardTier>(defaultTier);
  const [entitlementVersion, setEntitlementVersion] = useState(0);

  const tierUnlocked = useCallback(
    (t: ShareCardTier) => {
      void entitlementVersion;
      if (t === 'free') return true;
      const sku = TIER_TO_SKU[t as 'plus' | 'atelier'];
      return (
        isUnlocked(sku, resourceId) ||
        (isSubscriber() && passCoversSingleSku(sku))
      );
    },
    [resourceId, entitlementVersion],
  );

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      for (const sku of Object.values(TIER_TO_SKU)) {
        if (cancelled || isUnlocked(sku, resourceId)) continue;
        try {
          const result = await restoreMystiEntitlement({ sku, resourceId });
          if (!cancelled && result.restored) {
            setEntitlementVersion(v => v + 1);
          }
        } catch {
          // Share-card restore is best-effort; explicit purchase stays available.
        }
      }
    };

    void restore();
    syncSubscriptionFromServer({ force: true })
      .then((sub) => {
        if (!cancelled && sub) setEntitlementVersion(v => v + 1);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  const ensurePaid = useCallback(async (): Promise<boolean> => {
    if (tier === 'free' || tierUnlocked(tier)) return false;

    const paymentAvailability = getPaymentAvailabilityStatus();
    if (paymentAvailability.blocked) {
      if (typeof window !== 'undefined' && paymentAvailability.message) {
        window.alert(paymentAvailability.message);
      }
      return true;
    }

    const sku = TIER_TO_SKU[tier as 'plus' | 'atelier'];
    try {
      const deviceId = getOrCreateDeviceId() || undefined;
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          resourceId,
          paymentType: 'wechat',
          deviceId,
          redirect: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      const data = await readApiJson<{
        url?: string;
        error?: string;
        message?: string;
      }>(res);
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      } else if (typeof window !== 'undefined') {
        window.alert(data.message || data.error || '支付下单失败，请稍后再试。');
      }
    } catch (e) {
      console.error('[useShareTier] payment create failed:', e);
      if (typeof window !== 'undefined') {
        window.alert(e instanceof Error ? e.message : '支付下单失败，请稍后再试。');
      }
    }
    return true;
  }, [tier, tierUnlocked, resourceId]);

  const applyOverlay = useCallback(
    async (dataUrl: string, bgColor: string, brandLabel: string) => {
      if (tier === 'free') return dataUrl;
      return paintTierOverlay(dataUrl, tier, bgColor, brandLabel);
    },
    [tier],
  );

  return {
    tier,
    setTier,
    tierTokens: getTierTokens(tier),
    tierUnlocked,
    ensurePaid,
    applyOverlay,
    fileSuffix: tier === 'free' ? '' : `-${tier}`,
  };
}

/**
 * Canvas 后期叠加：金箔双线 + 顶部题头 + 替代水印。
 * brandLabel 例如 "WTFTI" / "SOULTI" — 会拼成 "PLUS · {brand}" 或 "N° ATELIER · {brand}"。
 */
async function paintTierOverlay(
  baseDataUrl: string,
  tier: 'plus' | 'atelier',
  bgColor: string,
  brandLabel: string,
): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('overlay base load failed'));
    img.src = baseDataUrl;
  });
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('overlay ctx unavailable');
  ctx.drawImage(img, 0, 0);

  const watermarkH = Math.round(img.height * 0.05);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, img.height - watermarkH, img.width, watermarkH);

  const isAtelier = tier === 'atelier';
  const inset = isAtelier ? 22 : 14;
  const goldOuter = '#C9A86C';
  const goldInner = '#E5C98A';
  ctx.strokeStyle = goldOuter;
  ctx.lineWidth = isAtelier ? 4 : 2.5;
  ctx.strokeRect(inset, inset, img.width - inset * 2, img.height - inset * 2);
  if (isAtelier) {
    ctx.strokeStyle = goldInner;
    ctx.lineWidth = 1;
    const inset2 = inset + 6;
    ctx.strokeRect(inset2, inset2, img.width - inset2 * 2, img.height - inset2 * 2);
  }

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  if (isAtelier) {
    ctx.font = `italic 600 ${Math.round(img.width * 0.034)}px Fraunces, "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = goldInner;
    ctx.fillText(`— N° ATELIER · ${brandLabel} —`, img.width / 2, inset + 30);
  } else {
    ctx.font = `600 ${Math.round(img.width * 0.026)}px ${FONT_SANS}`;
    ctx.fillStyle = goldOuter;
    ctx.fillText(`PLUS · ${brandLabel}`, img.width / 2, inset + 22);
  }

  ctx.font = `${Math.round(img.width * 0.022)}px ${FONT_SERIF}`;
  ctx.fillStyle = isAtelier ? goldInner : goldOuter;
  const footY = img.height - inset - 18;
  if (isAtelier) {
    const numero = `N° ${(Math.floor(Math.random() * 8888) + 1)
      .toString()
      .padStart(4, '0')} · ${brandLabel} ATELIER`;
    ctx.fillText(numero, img.width / 2, footY);
  } else {
    ctx.fillText(`${brandLabel} · PLUS EDITION`, img.width / 2, footY);
  }

  return c.toDataURL('image/png');
}

// ───────────────────────── Picker UI ─────────────────────────

export interface ShareTierPickerProps {
  tier: ShareCardTier;
  setTier: (t: ShareCardTier) => void;
  tierUnlocked: (t: ShareCardTier) => boolean;
  /** 'dark' = 深底面板（XPTI/Mysti 用）; 'light' = 米色面板（SoulTI/创作者结果页） */
  variant?: 'dark' | 'light';
  className?: string;
}

export function ShareTierPicker({
  tier,
  setTier,
  tierUnlocked,
  variant = 'dark',
  className = '',
}: ShareTierPickerProps) {
  const isDark = variant === 'dark';
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {(['free', 'plus', 'atelier'] as const).map(t => {
        const active = tier === t;
        const unlocked = tierUnlocked(t);
        const label = SHARE_CARD_TIER_LABEL[t];
        const sku = t === 'free' ? null : TIER_TO_SKU[t];
        const price = sku ? SKU_PRICES[sku].price : 0;
        const baseClass = isDark
          ? active
            ? 'border-white/60 bg-white/15 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)]'
            : 'border-white/15 bg-white/5 hover:border-white/35 hover:bg-white/10'
          : active
          ? 'border-gold/70 bg-gold/10 shadow-[0_4px_18px_-6px_rgba(184,144,90,0.35)]'
          : 'border-border-subtle bg-bg-secondary hover:border-gold/40';
        const textColor = isDark ? 'text-bg-primary' : 'text-text-primary';
        const subColor = isDark ? 'text-bg-primary/55' : 'text-text-muted';
        const lockColor = unlocked
          ? isDark
            ? 'text-emerald-300'
            : 'text-sage'
          : isDark
          ? 'text-amber-300'
          : 'text-gold';
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`rounded-xl border px-2 py-2 text-left transition-all cursor-pointer ${baseClass}`}
          >
            <div className={`flex items-center gap-1 text-[11px] font-medium ${textColor}`}>
              {t !== 'free' && !unlocked && <span aria-hidden>🔒</span>}
              {label.name}
            </div>
            <div className={`mt-0.5 text-[10px] leading-tight ${subColor} line-clamp-1`}>
              {label.tagline}
            </div>
            {t !== 'free' && (
              <div className={`mt-1 text-[10px] font-semibold ${lockColor}`}>
                {unlocked ? '已解锁' : `¥${price.toFixed(1)}`}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
