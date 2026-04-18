-- Mysti payments v2 — expanded SKU enum + subscription server truth.
-- Run AFTER 2026-04-18-mysti-payments.sql. Safe to re-run.

-- ── Expand SKU CHECK on mysti_orders to cover Sprint 1 SKUs ──────────────
ALTER TABLE public.mysti_orders DROP CONSTRAINT IF EXISTS mysti_orders_sku_check;
ALTER TABLE public.mysti_orders ADD CONSTRAINT mysti_orders_sku_check CHECK (sku IN (
  'soul-letter',
  'dual-report',
  'monthly-report',
  'gift-card',
  'festival-gift-card',
  'besties-bundle',
  'share-plus',
  'share-atelier',
  'monthly-pass',
  'quarterly-pass',
  'yearly-pass',
  'creator-pass'
));

-- Allow share-atelier to be gifted, plus future-proofed list
ALTER TABLE public.mysti_gift_cards DROP CONSTRAINT IF EXISTS mysti_gift_cards_gift_sku_check;
ALTER TABLE public.mysti_gift_cards ADD CONSTRAINT mysti_gift_cards_gift_sku_check CHECK (gift_sku IN (
  'soul-letter',
  'dual-report',
  'monthly-report',
  'share-atelier'
));

-- ── New: device_id on orders for cross-device entitlement lookup ────────
ALTER TABLE public.mysti_orders
  ADD COLUMN IF NOT EXISTS device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_mysti_orders_device_status
  ON public.mysti_orders(device_id, status, created_at DESC);

-- ── New: mysti_subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mysti_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  sku TEXT NOT NULL CHECK (sku IN (
    'monthly-pass', 'quarterly-pass', 'yearly-pass', 'creator-pass'
  )),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  source_order_id UUID REFERENCES public.mysti_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mysti_subscriptions_device_active
  ON public.mysti_subscriptions(device_id, status, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_mysti_subscriptions_expires
  ON public.mysti_subscriptions(expires_at)
  WHERE status = 'active';

ALTER TABLE public.mysti_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service-role only by default; client reads via API.
DROP POLICY IF EXISTS mysti_subscriptions_service_all ON public.mysti_subscriptions;
DROP POLICY IF EXISTS mysti_subscriptions_service_role_all ON public.mysti_subscriptions;
CREATE POLICY mysti_subscriptions_service_role_all ON public.mysti_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.mysti_subscriptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mysti_subscriptions TO service_role;

COMMENT ON TABLE public.mysti_subscriptions IS
  'Subscription windows. expires_at is authoritative; renewals stack via separate row or extension.';
