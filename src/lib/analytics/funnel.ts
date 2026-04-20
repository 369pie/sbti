/**
 * Unified light-paywall funnel analytics (W4 · 2026-04-20).
 *
 * One call site for the 9 cross-module funnel events introduced in plan C1.
 * Routes to Vercel Analytics + the existing `enqueueProductEvent` queue so
 * `/admin/funnel/` can compute conversion ratios per module / SKU.
 */

import { enqueueProductEvent, type ProductEventModule } from '@/lib/analytics/product-events';

export type FunnelModule = Extract<
  ProductEventModule,
  'wtfti' | 'soulti' | 'cpti' | 'xpti' | 'mysti' | 'wtfcard' | 'galaxy' | 'home'
>;

export type FunnelEvent =
  | 'home_module_card_click'
  | 'module_landing_view'
  | 'quiz_start'
  | 'quiz_complete'
  | 'result_view'
  | 'paywall_view'
  | 'paywall_click_buy'
  | 'paywall_pay_success'
  | 'cross_module_unlock_click'
  // ── XPTI v3.0 · 关系配对 + 复测档案 ───────────────
  | 'couple_invite_create'   // A 生成关系码
  | 'couple_invite_open'     // B 打开邀请页
  | 'couple_completed'       // 双方都完测 → 生成合并报告
  | 'theory_view'            // /xpti/theory/ 访问
  | 'archive_replay';        // 老用户触发复测

export interface FunnelProps {
  module: FunnelModule;
  /** Stable persona / relationship slug. */
  slug?: string;
  /** Light-paywall SKU id. */
  sku?: string;
  /** Numeric value (e.g. price). */
  price?: number;
  /** Order id from xunhupay (for `paywall_pay_success`). */
  orderId?: string;
  /** Used by `home_module_card_click` to flag if a price anchor was visible. */
  hasPriceAnchor?: boolean;
  /** For `cross_module_unlock_click`. */
  fromModule?: FunnelModule;
  toModule?: FunnelModule;
  /** Free-form context (page, source button id, etc.). */
  source?: string;
  /** WTF Card identifier (used by `wtfcard` collector paywall). */
  cardId?: string;
}

export function trackFunnelEvent(event: FunnelEvent, props: FunnelProps): void {
  // Vercel Analytics — fire-and-forget. Never throw.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { track } = require('@vercel/analytics');
    track(event, sanitiseForVercel(props));
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Funnel] ${event}`, props);
    }
  }

  try {
    enqueueProductEvent(props.module, event, {
      slug: props.slug,
      tier: props.sku,
      step: classifyFunnelStep(event),
      value: props.price,
      props: {
        sku: props.sku,
        order_id: props.orderId,
        has_price_anchor: props.hasPriceAnchor ?? null,
        from_module: props.fromModule,
        to_module: props.toModule,
        source: props.source,
      },
    });
  } catch {
    // never propagate
  }
}

function classifyFunnelStep(event: FunnelEvent): string {
  switch (event) {
    case 'home_module_card_click':
      return 'home_click';
    case 'module_landing_view':
      return 'landing';
    case 'quiz_start':
      return 'entry';
    case 'quiz_complete':
      return 'finish';
    case 'result_view':
      return 'result';
    case 'paywall_view':
      return 'paywall_view';
    case 'paywall_click_buy':
      return 'paywall_buy';
    case 'paywall_pay_success':
      return 'paywall_paid';
    case 'cross_module_unlock_click':
      return 'cross_click';
    case 'couple_invite_create':
      return 'couple_invite';
    case 'couple_invite_open':
      return 'couple_open';
    case 'couple_completed':
      return 'couple_done';
    case 'theory_view':
      return 'theory';
    case 'archive_replay':
      return 'replay';
  }
}

function sanitiseForVercel(props: FunnelProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v;
    }
  }
  return out;
}
