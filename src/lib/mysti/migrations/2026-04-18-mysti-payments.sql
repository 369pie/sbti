-- Mysti payments + gift cards server-side persistence.
-- Run in Supabase SQL editor before enabling live Xunhupay callbacks.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS public.mysti_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_order_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'xunhupay',
  provider_order_id TEXT UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('wechat', 'alipay')),
  sku TEXT NOT NULL CHECK (sku IN (
    'soul-letter',
    'dual-report',
    'monthly-report',
    'gift-card',
    'share-plus',
    'share-atelier'
  )),
  resource_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'expired')),
  redirect_path TEXT,
  referral_code TEXT,
  attach_json JSONB,
  notify_payload JSONB,
  paid_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mysti_orders_status_created
  ON public.mysti_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mysti_orders_sku_resource
  ON public.mysti_orders(sku, resource_id);

CREATE TABLE IF NOT EXISTS public.mysti_gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.mysti_orders(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  gift_sku TEXT NOT NULL CHECK (gift_sku IN ('soul-letter', 'dual-report', 'monthly-report')),
  from_name TEXT,
  to_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed')),
  redeemed_resource_id TEXT,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mysti_gift_cards_status_created
  ON public.mysti_gift_cards(status, created_at DESC);

ALTER TABLE public.mysti_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mysti_gift_cards ENABLE ROW LEVEL SECURITY;