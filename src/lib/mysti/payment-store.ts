import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { XunhupayPaymentChannel } from '@/lib/payment/xunhupay';
import type { MystiSku } from '@/lib/mysti/unlock';
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
  attachJson?: MystiOrderAttach;
}

const VALID_GIFT_SKUS = new Set(GIFT_CARD_OPTIONS.map(option => option.giftSku));
const VALID_ORDER_SKUS = new Set<MystiSku>([
  'soul-letter',
  'dual-report',
  'monthly-report',
  'gift-card',
  'share-plus',
  'share-atelier',
]);

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
    ...(metadata ? { metadata } : {}),
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
  const { data, error } = await admin()
    .from('mysti_orders')
    .insert({
      trade_order_id: input.tradeOrderId,
      provider: 'xunhupay',
      channel: input.channel,
      sku: input.sku,
      resource_id: input.resourceId,
      title: input.title,
      amount_cents: input.amountCents,
      status: 'pending',
      redirect_path: input.redirectPath ?? null,
      referral_code: input.referralCode ?? null,
      attach_json: sanitizeAttach(input.attachJson),
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`mysti_order_insert_failed:${error?.message ?? 'unknown'}`);
  }

  return data as MystiOrderRow;
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
  const sku = existing?.sku ?? sanitizeSku(attach?.sku);
  const resourceId = existing?.resource_id ?? sanitizeText(attach?.resourceId, 64);

  if (!sku || !resourceId) {
    throw new Error('mysti_order_payload_incomplete');
  }

  const { data, error } = await client
    .from('mysti_orders')
    .upsert(
      {
        trade_order_id: args.tradeOrderId,
        provider: 'xunhupay',
        provider_order_id: args.providerOrderId ?? existing?.provider_order_id ?? null,
        channel: existing?.channel ?? args.channel,
        sku,
        resource_id: resourceId,
        title:
          existing?.title ??
          sanitizeText(args.orderTitle, 128) ??
          'Mysti 订单',
        amount_cents: existing?.amount_cents ?? Math.round(args.totalFee * 100),
        status: 'paid',
        redirect_path: existing?.redirect_path ?? sanitizeText(attach?.redirect, 200),
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

  if (error || !data) {
    throw new Error(`mysti_order_mark_paid_failed:${error?.message ?? 'unknown'}`);
  }

  return data as MystiOrderRow;
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
  if (order.sku !== 'gift-card') return null;

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