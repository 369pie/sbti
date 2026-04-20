import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { XunhupayPaymentChannel } from '@/lib/payment/xunhupay';
import { ALL_SKUS, type MystiSku } from '@/lib/mysti/unlock';
import {
  GIFT_CARD_OPTIONS,
  generateGiftCode,
  normalizeGiftCardCode,
  type GiftCard,
  type GiftCardGiftSku,
} from '@/lib/mysti/gift-card';

type JsonScalar = string | number | boolean | null;
type JsonValue = JsonScalar | JsonValue[] | { [key: string]: JsonValue };

export type MystiOrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';

export interface MystiOrderAttach {
  sku?: MystiSku;
  resourceId?: string;
  ref?: string;
  redirect?: string;
  deviceId?: string;
  metadata?: {
    giftSku?: GiftCardGiftSku;
    fromName?: string;
    toName?: string;
    message?: string;
  };
}

export interface MystiOrderRow {
  id: string;
  trade_order_id: string;
  provider: string;
  provider_order_id: string | null;
  channel: XunhupayPaymentChannel;
  sku: MystiSku;
  resource_id: string;
  title: string;
  amount_cents: number;
  status: MystiOrderStatus;
  redirect_path: string | null;
  referral_code: string | null;
  attach_json: JsonValue | null;
  notify_payload: JsonValue | null;
  paid_at: string | null;
  verified_at: string | null;
  device_id: string | null;
  created_at: string;
  updated_at: string;
}

interface MystiGiftCardRow {
  id: string;
  order_id: string;
  code: string;
  gift_sku: GiftCardGiftSku;
  from_name: string | null;
  to_name: string | null;
  message: string | null;
  status: 'issued' | 'redeemed';
  redeemed_resource_id: string | null;
  redeemed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMystiOrderInput {
  tradeOrderId: string;
  channel: XunhupayPaymentChannel;
  sku: MystiSku;
  resourceId: string;
  title: string;
  amountCents: number;
  redirectPath?: string;
  referralCode?: string;
  deviceId?: string;
  attachJson?: MystiOrderAttach;
}

const VALID_GIFT_SKUS = new Set(GIFT_CARD_OPTIONS.map(option => option.giftSku));
const VALID_ORDER_SKUS = new Set<MystiSku>(ALL_SKUS);

// Preserve the business SKU in attach_json when the database constraint lags
// behind the app's live SKU catalog.
const LEGACY_ORDER_SKU_FALLBACK: Partial<Record<MystiSku, MystiSku>> = {
  'festival-gift-card': 'gift-card',
  'besties-bundle': 'gift-card',
  'wtfti-deep-pantheon': 'monthly-report',
  'soulti-deep-mirror': 'monthly-report',
  'cpti-deep-relationship': 'monthly-report',
  'xpti-deep-xp': 'monthly-report',
  'xpti-couple-report': 'monthly-report',
  'xpti-couple-half': 'monthly-report',
  'xpti-archive-yearly': 'monthly-report',
  'wtfcard-collector': 'monthly-report',
  'monthly-pass': 'monthly-report',
  'quarterly-pass': 'monthly-report',
  'yearly-pass': 'monthly-report',
  'creator-pass': 'monthly-report',
};

interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function admin() {
  return createAdminSupabaseClient();
}

function asObject(value: JsonValue | null | undefined): Record<string, JsonValue> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, JsonValue>;
}

function sanitizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function sanitizeSku(value: unknown): MystiSku | null {
  if (typeof value !== 'string') return null;
  return VALID_ORDER_SKUS.has(value as MystiSku) ? (value as MystiSku) : null;
}

function sanitizeGiftSku(value: unknown): GiftCardGiftSku {
  if (typeof value === 'string' && VALID_GIFT_SKUS.has(value as GiftCardGiftSku)) {
    return value as GiftCardGiftSku;
  }
  return 'soul-letter';
}

function sanitizeAttach(input: MystiOrderAttach | null | undefined): MystiOrderAttach | null {
  if (!input) return null;
  const sku = sanitizeSku(input.sku);
  const resourceId = sanitizeText(input.resourceId, 64);
  const ref = sanitizeText(input.ref, 32);
  const redirect = sanitizeText(input.redirect, 200);
  const deviceId = sanitizeText(input.deviceId, 64);

  const metadata = input.metadata
    ? {
        giftSku: sanitizeGiftSku(input.metadata.giftSku),
        fromName: sanitizeText(input.metadata.fromName, 24) ?? undefined,
        toName: sanitizeText(input.metadata.toName, 24) ?? undefined,
        message: sanitizeText(input.metadata.message, 100) ?? undefined,
      }
    : undefined;

  return {
    ...(sku ? { sku } : {}),
    ...(resourceId ? { resourceId } : {}),
    ...(ref ? { ref } : {}),
    ...(redirect ? { redirect } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function isSupabaseErrorLike(error: unknown): error is SupabaseErrorLike {
  return !!error && typeof error === 'object';
}

function isMissingColumnError(error: unknown, column: string): boolean {
  if (!isSupabaseErrorLike(error)) return false;
  const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  return error.code === '42703' && message.includes(column);
}

function isMissingTableError(error: unknown, table: string): boolean {
  if (!isSupabaseErrorLike(error)) return false;
  const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  return error.code === '42P01' && message.includes(table);
}

function isLegacySkuConstraintError(error: unknown): boolean {
  if (!isSupabaseErrorLike(error)) return false;
  const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  return error.code === '23514' && message.includes('mysti_orders_sku_check');
}

function getLegacyStoredSku(sku: MystiSku): MystiSku | null {
  return LEGACY_ORDER_SKU_FALLBACK[sku] ?? null;
}

function getAttachObject(
  value: JsonValue | null | undefined,
): MystiOrderAttach | null {
  return sanitizeAttach(asObject(value) as MystiOrderAttach | null | undefined);
}

export function getMystiOrderSku(order: Pick<MystiOrderRow, 'sku' | 'attach_json'>): MystiSku {
  return getAttachObject(order.attach_json)?.sku ?? order.sku;
}

export function getMystiOrderRedirectPath(
  order: Pick<MystiOrderRow, 'redirect_path' | 'attach_json'>,
): string | null {
  return getAttachObject(order.attach_json)?.redirect ?? order.redirect_path ?? null;
}

function getMystiOrderDeviceId(
  order: Pick<MystiOrderRow, 'device_id' | 'attach_json'>,
): string | null {
  return getAttachObject(order.attach_json)?.deviceId ?? order.device_id ?? null;
}

function buildFallbackSubscription(order: MystiOrderRow): ServerSubscription | null {
  const sku = getMystiOrderSku(order);
  const days = SUBSCRIPTION_DAYS[sku];
  if (!days) return null;

  const startsAt = Date.parse(order.paid_at ?? order.created_at);
  const expiresAt = startsAt + days * 86400_000;

  return {
    sku,
    startsAt,
    expiresAt,
    status: expiresAt > Date.now() ? 'active' : 'expired',
  };
}

function mergeAttach(
  existing: JsonValue | null,
  incoming: MystiOrderAttach | null | undefined,
): MystiOrderAttach | null {
  const left = asObject(existing) ?? {};
  const right = sanitizeAttach(incoming) ?? {};
  const merged = {
    ...left,
    ...right,
    metadata: {
      ...(asObject(left.metadata ?? null) ?? {}),
      ...(right.metadata ?? {}),
    },
  } satisfies Record<string, JsonValue>;

  const finalAttach = sanitizeAttach(merged as MystiOrderAttach);
  return finalAttach;
}

function toClientGiftCard(row: MystiGiftCardRow): GiftCard {
  return {
    code: row.code,
    giftSku: row.gift_sku,
    fromName: row.from_name ?? undefined,
    toName: row.to_name ?? undefined,
    message: row.message ?? undefined,
    createdAt: Date.parse(row.created_at),
    redeemed: row.status === 'redeemed',
    redeemedAt: row.redeemed_at ? Date.parse(row.redeemed_at) : undefined,
    redeemedResourceId: row.redeemed_resource_id ?? undefined,
  };
}

export async function createPendingMystiOrder(
  input: CreateMystiOrderInput,
): Promise<MystiOrderRow> {
  const attachJson = sanitizeAttach(input.attachJson);
  const legacySku = getLegacyStoredSku(input.sku);
  const candidates: Array<{ sku: MystiSku; includeDeviceId: boolean }> = [
    { sku: input.sku, includeDeviceId: true },
    ...(input.deviceId ? [{ sku: input.sku, includeDeviceId: false }] : []),
    ...(legacySku ? [{ sku: legacySku, includeDeviceId: true }] : []),
    ...(legacySku && input.deviceId ? [{ sku: legacySku, includeDeviceId: false }] : []),
  ];

  let lastError: unknown = null;

  for (const candidate of candidates) {
    const payload = {
      trade_order_id: input.tradeOrderId,
      provider: 'xunhupay',
      channel: input.channel,
      sku: candidate.sku,
      resource_id: input.resourceId,
      title: input.title,
      amount_cents: input.amountCents,
      status: 'pending',
      redirect_path: input.redirectPath ?? null,
      referral_code: input.referralCode ?? null,
      attach_json: attachJson,
      ...(candidate.includeDeviceId && input.deviceId
        ? { device_id: input.deviceId }
        : {}),
    };

    const { data, error } = await admin()
      .from('mysti_orders')
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return data as MystiOrderRow;
    }

    lastError = error;
    if (
      !isMissingColumnError(error, 'device_id') &&
      !isLegacySkuConstraintError(error)
    ) {
      break;
    }
  }

  const message = isSupabaseErrorLike(lastError)
    ? lastError.message ?? 'unknown'
    : 'unknown';
  throw new Error(`mysti_order_insert_failed:${message}`);
}

export async function updateMystiOrderStatus(
  tradeOrderId: string,
  status: MystiOrderStatus,
): Promise<void> {
  const { error } = await admin()
    .from('mysti_orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('trade_order_id', tradeOrderId);

  if (error) {
    throw new Error(`mysti_order_update_failed:${error.message}`);
  }
}

export async function findMystiOrder(orderId: string): Promise<MystiOrderRow | null> {
  const client = admin();

  const { data: byTrade, error: tradeError } = await client
    .from('mysti_orders')
    .select('*')
    .eq('trade_order_id', orderId)
    .maybeSingle();
  if (tradeError) {
    throw new Error(`mysti_order_lookup_failed:${tradeError.message}`);
  }
  if (byTrade) return byTrade as MystiOrderRow;

  const { data: byProvider, error: providerError } = await client
    .from('mysti_orders')
    .select('*')
    .eq('provider_order_id', orderId)
    .maybeSingle();
  if (providerError) {
    throw new Error(`mysti_order_lookup_failed:${providerError.message}`);
  }
  return (byProvider as MystiOrderRow | null) ?? null;
}

export async function markMystiOrderPaid(args: {
  tradeOrderId: string;
  providerOrderId?: string | null;
  channel: XunhupayPaymentChannel;
  totalFee: number;
  orderTitle?: string | null;
  attach?: MystiOrderAttach | null;
  notifyPayload: Record<string, string>;
}): Promise<MystiOrderRow> {
  const client = admin();
  const existing = await findMystiOrder(args.tradeOrderId);
  const attach = mergeAttach(existing?.attach_json ?? null, args.attach);
  const requestedSku = sanitizeSku(attach?.sku);
  const sku = requestedSku ?? (existing ? getMystiOrderSku(existing) : null);
  const resourceId = existing?.resource_id ?? sanitizeText(attach?.resourceId, 64);
  const redirectPath = existing
    ? getMystiOrderRedirectPath(existing)
    : sanitizeText(attach?.redirect, 200);

  if (!sku || !resourceId) {
    throw new Error('mysti_order_payload_incomplete');
  }

  const storedSkuCandidates = [sku, getLegacyStoredSku(sku)].filter(
    (value, index, array): value is MystiSku => !!value && array.indexOf(value) === index,
  );

  let lastError: unknown = null;

  for (const storedSku of storedSkuCandidates) {
    const { data, error } = await client
      .from('mysti_orders')
      .upsert(
        {
          trade_order_id: args.tradeOrderId,
          provider: 'xunhupay',
          provider_order_id: args.providerOrderId ?? existing?.provider_order_id ?? null,
          channel: existing?.channel ?? args.channel,
          sku: storedSku,
          resource_id: resourceId,
          title:
            existing?.title ??
            sanitizeText(args.orderTitle, 128) ??
            'Mysti 订单',
          amount_cents: existing?.amount_cents ?? Math.round(args.totalFee * 100),
          status: 'paid',
          redirect_path: redirectPath,
          referral_code: existing?.referral_code ?? sanitizeText(attach?.ref, 32),
          attach_json: attach,
          notify_payload: args.notifyPayload,
          paid_at: existing?.paid_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'trade_order_id',
        },
      )
      .select('*')
      .single();

    if (!error && data) {
      return data as MystiOrderRow;
    }

    lastError = error;
    if (!isLegacySkuConstraintError(error)) {
      break;
    }
  }

  const message = isSupabaseErrorLike(lastError)
    ? lastError.message ?? 'unknown'
    : 'unknown';
  throw new Error(`mysti_order_mark_paid_failed:${message}`);
}

export async function markMystiOrderVerified(orderId: string): Promise<void> {
  const order = await findMystiOrder(orderId);
  if (!order) return;

  const { error } = await admin()
    .from('mysti_orders')
    .update({
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (error) {
    throw new Error(`mysti_order_verify_mark_failed:${error.message}`);
  }
}

export async function ensureGiftCardIssued(
  order: MystiOrderRow,
): Promise<GiftCard | null> {
  const businessSku = getMystiOrderSku(order);
  if (
    businessSku !== 'gift-card' &&
    businessSku !== 'festival-gift-card' &&
    businessSku !== 'besties-bundle'
  ) {
    return null;
  }

  const client = admin();
  const { data: existing, error: existingError } = await client
    .from('mysti_gift_cards')
    .select('*')
    .eq('order_id', order.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`mysti_gift_lookup_failed:${existingError.message}`);
  }
  if (existing) {
    return toClientGiftCard(existing as MystiGiftCardRow);
  }

  const attach = asObject(order.attach_json);
  const metadata = asObject((attach?.metadata as JsonValue | undefined) ?? null);
  const giftSku = sanitizeGiftSku(metadata?.giftSku);
  const fromName = sanitizeText(metadata?.fromName, 24);
  const toName = sanitizeText(metadata?.toName, 24);
  const message = sanitizeText(metadata?.message, 100);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await client
      .from('mysti_gift_cards')
      .insert({
        order_id: order.id,
        code: generateGiftCode(),
        gift_sku: giftSku,
        from_name: fromName,
        to_name: toName,
        message,
      })
      .select('*')
      .single();

    if (!error && data) {
      return toClientGiftCard(data as MystiGiftCardRow);
    }

    if (error?.code !== '23505') {
      throw new Error(`mysti_gift_issue_failed:${error?.message ?? 'unknown'}`);
    }
  }

  throw new Error('mysti_gift_issue_failed:too_many_collisions');
}

export async function getGiftCardByCode(code: string): Promise<GiftCard | null> {
  const normalized = normalizeGiftCardCode(code);
  if (!normalized) return null;

  const { data, error } = await admin()
    .from('mysti_gift_cards')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    throw new Error(`mysti_gift_lookup_failed:${error.message}`);
  }

  return data ? toClientGiftCard(data as MystiGiftCardRow) : null;
}

export async function redeemGiftCard(args: {
  code: string;
  resourceId: string;
}): Promise<GiftCard | null> {
  const normalized = normalizeGiftCardCode(args.code);
  const resourceId = sanitizeText(args.resourceId, 64);
  if (!normalized || !resourceId) return null;

  const client = admin();
  const { data: existing, error: lookupError } = await client
    .from('mysti_gift_cards')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`mysti_gift_lookup_failed:${lookupError.message}`);
  }

  if (!existing) return null;
  if ((existing as MystiGiftCardRow).status === 'redeemed') {
    return toClientGiftCard(existing as MystiGiftCardRow);
  }

  const { data, error } = await client
    .from('mysti_gift_cards')
    .update({
      status: 'redeemed',
      redeemed_resource_id: resourceId,
      redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', (existing as MystiGiftCardRow).id)
    .eq('status', 'issued')
    .select('*')
    .single();

  if (error || !data) {
    const { data: fallback } = await client
      .from('mysti_gift_cards')
      .select('*')
      .eq('id', (existing as MystiGiftCardRow).id)
      .maybeSingle();
    return fallback ? toClientGiftCard(fallback as MystiGiftCardRow) : null;
  }

  return toClientGiftCard(data as MystiGiftCardRow);
}
// ─────────────────────────── Subscriptions ───────────────────────────

export interface MystiSubscriptionRow {
  id: string;
  device_id: string;
  sku: MystiSku;
  starts_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
  source_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerSubscription {
  sku: MystiSku;
  startsAt: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'cancelled';
}

const SUBSCRIPTION_DAYS: Record<string, number> = {
  'monthly-pass': 30,
  'quarterly-pass': 92,
  'yearly-pass': 365,
  'creator-pass': 30,
};

function toServerSubscription(row: MystiSubscriptionRow): ServerSubscription {
  return {
    sku: row.sku,
    startsAt: Date.parse(row.starts_at),
    expiresAt: Date.parse(row.expires_at),
    status: row.status,
  };
}

/**
 * Find the latest active subscription window for a device.
 * Returns null when none exists or when expires_at is in the past.
 */
export async function findActiveSubscriptionByDevice(
  deviceId: string,
): Promise<ServerSubscription | null> {
  if (!deviceId) return null;
  const nowIso = new Date().toISOString();
  const { data, error } = await admin()
    .from('mysti_subscriptions')
    .select('*')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .gt('expires_at', nowIso)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error, 'mysti_subscriptions')) {
      return null;
    }
    throw new Error(`mysti_subscription_lookup_failed:${error.message}`);
  }
  return data ? toServerSubscription(data as MystiSubscriptionRow) : null;
}

/**
 * Issue / extend a subscription for a paid order.
 * - If an active row exists for the same device, extend its expires_at by SUBSCRIPTION_DAYS[sku].
 * - Otherwise insert a new row starting now.
 * Idempotent on source_order_id.
 */
export async function ensureSubscriptionFromOrder(
  order: MystiOrderRow,
): Promise<ServerSubscription | null> {
  const businessSku = getMystiOrderSku(order);
  const deviceId = getMystiOrderDeviceId(order);
  if (!SUBSCRIPTION_DAYS[businessSku]) return null;
  if (!deviceId) return buildFallbackSubscription(order);

  const client = admin();

  // Idempotency: look for an existing row issued from this order.
  const { data: existing, error: existingError } = await client
    .from('mysti_subscriptions')
    .select('*')
    .eq('source_order_id', order.id)
    .maybeSingle();
  if (existingError) {
    if (isMissingTableError(existingError, 'mysti_subscriptions')) {
      return buildFallbackSubscription(order);
    }
    throw new Error(`mysti_subscription_lookup_failed:${existingError.message}`);
  }
  if (existing) return toServerSubscription(existing as MystiSubscriptionRow);

  const days = SUBSCRIPTION_DAYS[businessSku];
  const now = new Date();

  // If an active sub already exists for this device, extend it.
  const { data: active, error: activeError } = await client
    .from('mysti_subscriptions')
    .select('*')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .gt('expires_at', now.toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) {
    if (isMissingTableError(activeError, 'mysti_subscriptions')) {
      return buildFallbackSubscription(order);
    }
    throw new Error(`mysti_subscription_lookup_failed:${activeError.message}`);
  }

  if (active) {
    const base = new Date((active as MystiSubscriptionRow).expires_at);
    const newExpiry = new Date(base.getTime() + days * 86400_000);
    const { data: updated, error: updateError } = await client
      .from('mysti_subscriptions')
      .update({
        expires_at: newExpiry.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', (active as MystiSubscriptionRow).id)
      .select('*')
      .single();
    if (updateError || !updated) {
      throw new Error(
        `mysti_subscription_extend_failed:${updateError?.message ?? 'unknown'}`,
      );
    }
    return toServerSubscription(updated as MystiSubscriptionRow);
  }

  const expiresAt = new Date(now.getTime() + days * 86400_000);
  const { data, error } = await client
    .from('mysti_subscriptions')
    .insert({
      device_id: deviceId,
      sku: businessSku,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      source_order_id: order.id,
      status: 'active',
    })
    .select('*')
    .single();
  if (error || !data) {
    if (isMissingTableError(error, 'mysti_subscriptions')) {
      return buildFallbackSubscription(order);
    }
    throw new Error(
      `mysti_subscription_insert_failed:${error?.message ?? 'unknown'}`,
    );
  }
  return toServerSubscription(data as MystiSubscriptionRow);
}
