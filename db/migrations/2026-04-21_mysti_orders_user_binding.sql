-- Mysti orders ↔ user binding (Sprint 3).
-- Adds a nullable user_id to mysti_orders so logged-in users can see their unlocks
-- across devices, plus a device_user_bindings backfill table.
-- Safe to re-run.

-- ── 1. Nullable user_id on mysti_orders ──────────────────────────────────
ALTER TABLE public.mysti_orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mysti_orders_user_status
  ON public.mysti_orders(user_id, status, created_at DESC)
  WHERE user_id IS NOT NULL;

-- ── 2. device_user_bindings: associate a device to a logged-in user ─────
CREATE TABLE IF NOT EXISTS public.device_user_bindings (
  device_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bound_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_user_bindings_user
  ON public.device_user_bindings(user_id, bound_at DESC);

ALTER TABLE public.device_user_bindings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS device_user_bindings_service_all ON public.device_user_bindings;
CREATE POLICY device_user_bindings_service_all ON public.device_user_bindings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.device_user_bindings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.device_user_bindings TO service_role;

-- ── 3. Helper: backfill user_id on existing orders for a (device, user) ──
CREATE OR REPLACE FUNCTION public.backfill_mysti_orders_user(
  p_device_id TEXT,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.mysti_orders
  SET user_id = p_user_id
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.backfill_mysti_orders_user(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backfill_mysti_orders_user(TEXT, UUID) TO service_role;

COMMENT ON FUNCTION public.backfill_mysti_orders_user(TEXT, UUID) IS
  'Idempotently associates pre-existing device-keyed orders with a user_id once they bind a device.';

-- ── 4. SKU CHECK update — ensure the xpti-couple-* SKUs are allowed ──────
-- (Some envs may still be on the older constraint set. Re-applies the union
--  used by 2026-04-20_mysti_orders_sku_expansion.sql.)
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
  'wtfti-deep-pantheon',
  'soulti-deep-mirror',
  'cpti-deep-relationship',
  'xpti-deep-xp',
  'xpti-couple-report',
  'xpti-couple-half',
  'xpti-archive-yearly',
  'wtfcard-collector',
  'monthly-pass',
  'quarterly-pass',
  'yearly-pass',
  'creator-pass'
));
