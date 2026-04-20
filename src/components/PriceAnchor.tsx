'use client';

/**
 * PriceAnchor — three-tier price line shown above paywalls / module entries.
 *
 * Renders: 「免费体验 · 单次解锁 ¥X.X · 月度通行证 ¥19/月（7折）」
 *
 * Used by module home cards and the paywall preview to anchor expectations
 * before the user hits the gate.
 */

import Link from 'next/link';
import { SKU_PRICES, type MystiSku } from '@/lib/mysti/unlock';
import { passCoversSingleSku, passDiscountForSku } from '@/lib/mysti/subscription';

interface Props {
  sku: MystiSku;
  /** Optional override for the free-tier label. */
  freeLabel?: string;
  /** Brand slug for analytics/CTA path. */
  from?: string;
  /** Render pass text without anchor (for clickable parent cards). */
  disablePassLink?: boolean;
  className?: string;
}

export function PriceAnchor({
  sku,
  freeLabel = '免费体验',
  from,
  disablePassLink = false,
  className,
}: Props) {
  const meta = SKU_PRICES[sku];
  if (!meta) return null;

  const passCovers = passCoversSingleSku(sku);
  const passDiscount = passDiscountForSku(sku);
  const discounted = +(meta.price * (1 - passDiscount)).toFixed(2);
  const passHref = `/mysti/subscribe/${from ? `?from=${encodeURIComponent(from)}` : ''}`;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-wider ${className ?? ''}`}
      style={{ fontFamily: 'var(--font-display)', color: '#7A6A5A' }}
      data-price-anchor={sku}
    >
      <span className="opacity-80">{freeLabel}</span>
      <span aria-hidden style={{ opacity: 0.4 }}>·</span>
      <span>
        单次解锁{' '}
        <span style={{ color: '#C07A8E' }}>¥{meta.price.toFixed(1)}</span>
      </span>
      <span aria-hidden style={{ opacity: 0.4 }}>·</span>
      {disablePassLink ? (
        <span style={{ color: '#C9A676' }}>
          {passCovers
            ? `通行证 ¥19/月 · 本档免费`
            : passDiscount > 0
              ? `通行证 ¥19/月 · 此档 ¥${discounted.toFixed(1)}`
              : `通行证 ¥19/月`}
        </span>
      ) : (
        <Link
          href={passHref}
          className="underline-offset-2 hover:underline"
          style={{ color: '#C9A676' }}
        >
          {passCovers
            ? `通行证 ¥19/月 · 本档免费`
            : passDiscount > 0
              ? `通行证 ¥19/月 · 此档 ¥${discounted.toFixed(1)}`
              : `通行证 ¥19/月`}
        </Link>
      )}
    </div>
  );
}
