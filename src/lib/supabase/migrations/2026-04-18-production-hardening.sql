-- Production hardening for Supabase-backed runtime tables.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Shared updated_at helper (only create when missing)
-- ---------------------------------------------------------------------------

DO $outer$
BEGIN
  IF to_regprocedure('public.set_updated_at()') IS NULL THEN
    EXECUTE $fn$
      CREATE FUNCTION public.set_updated_at()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $body$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $body$;
    $fn$;
  END IF;
END;
$outer$;

-- ---------------------------------------------------------------------------
-- Identify assessments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.identify_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token TEXT NOT NULL UNIQUE,
  actor_display_name TEXT NOT NULL DEFAULT '',
  subject_display_name TEXT NOT NULL DEFAULT '',
  persona_slug VARCHAR(32) NOT NULL,
  dimension_scores JSONB NOT NULL,
  result_diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_mutation_id TEXT,
  challenge_opened_at TIMESTAMPTZ,
  subject_claimed_at TIMESTAMPTZ,
  subject_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.identify_assessments
  ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS subject_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS share_token TEXT,
  ADD COLUMN IF NOT EXISTS actor_display_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject_display_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS persona_slug VARCHAR(32),
  ADD COLUMN IF NOT EXISTS dimension_scores JSONB,
  ADD COLUMN IF NOT EXISTS result_diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS client_mutation_id TEXT,
  ADD COLUMN IF NOT EXISTS challenge_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subject_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subject_viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());

DO $outer$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'identify_assessments_users_check'
      AND conrelid = 'public.identify_assessments'::regclass
  ) THEN
    ALTER TABLE public.identify_assessments
      ADD CONSTRAINT identify_assessments_users_check CHECK (
        subject_user_id IS NULL OR actor_user_id <> subject_user_id
      );
  END IF;
END;
$outer$;

CREATE UNIQUE INDEX IF NOT EXISTS identify_assessments_actor_client_mutation_idx
  ON public.identify_assessments (actor_user_id, client_mutation_id)
  WHERE client_mutation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS identify_assessments_actor_created_idx
  ON public.identify_assessments (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS identify_assessments_subject_created_idx
  ON public.identify_assessments (subject_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS identify_assessments_subject_unread_idx
  ON public.identify_assessments (subject_user_id, subject_viewed_at, created_at DESC);

ALTER TABLE public.identify_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "identify_assessments_select_involved" ON public.identify_assessments;
CREATE POLICY "identify_assessments_select_involved"
ON public.identify_assessments
FOR SELECT
TO authenticated
USING (auth.uid() = actor_user_id OR auth.uid() = subject_user_id);

DROP POLICY IF EXISTS "identify_assessments_update_involved" ON public.identify_assessments;
CREATE POLICY "identify_assessments_update_involved"
ON public.identify_assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = actor_user_id OR auth.uid() = subject_user_id)
WITH CHECK (auth.uid() = actor_user_id OR auth.uid() = subject_user_id);

REVOKE ALL ON TABLE public.identify_assessments FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.identify_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.identify_assessments TO service_role;

DROP TRIGGER IF EXISTS identify_assessments_updated_at ON public.identify_assessments;
CREATE TRIGGER identify_assessments_updated_at
  BEFORE UPDATE ON public.identify_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- UGC hardening: remove public writes and public RPC access
-- ---------------------------------------------------------------------------

ALTER TABLE public.creator_orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP FUNCTION IF EXISTS public.increment_universe_tests(UUID);

CREATE FUNCTION public.increment_universe_tests(universe_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
BEGIN
  UPDATE public.creator_universes
  SET total_tests = COALESCE(total_tests, 0) + 1
  WHERE id = universe_id;
END;
$body$;

DROP FUNCTION IF EXISTS public.increment_universe_shares(UUID);

CREATE FUNCTION public.increment_universe_shares(universe_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
BEGIN
  UPDATE public.creator_universes
  SET total_shares = COALESCE(total_shares, 0) + 1
  WHERE id = universe_id;
END;
$body$;

REVOKE EXECUTE ON FUNCTION public.increment_universe_tests(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_universe_shares(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_universe_tests(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_universe_shares(UUID) TO service_role;

DROP POLICY IF EXISTS results_insert ON public.creator_test_results;
DROP POLICY IF EXISTS results_service_insert ON public.creator_test_results;
CREATE POLICY results_service_insert ON public.creator_test_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS orders_insert ON public.creator_orders;
DROP POLICY IF EXISTS orders_service_insert ON public.creator_orders;
CREATE POLICY orders_service_insert ON public.creator_orders
  FOR INSERT
  TO service_role
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.creator_test_results FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.creator_orders FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.creator_test_results TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.creator_orders TO service_role;

-- ---------------------------------------------------------------------------
-- Mysti hardening: orders device binding + subscription store
-- ---------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.mysti_orders DROP CONSTRAINT IF EXISTS mysti_orders_sku_check;
ALTER TABLE IF EXISTS public.mysti_orders ADD CONSTRAINT mysti_orders_sku_check CHECK (sku IN (
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

ALTER TABLE IF EXISTS public.mysti_gift_cards DROP CONSTRAINT IF EXISTS mysti_gift_cards_gift_sku_check;
ALTER TABLE IF EXISTS public.mysti_gift_cards ADD CONSTRAINT mysti_gift_cards_gift_sku_check CHECK (gift_sku IN (
  'soul-letter',
  'dual-report',
  'monthly-report',
  'share-atelier'
));

ALTER TABLE public.mysti_orders
  ADD COLUMN IF NOT EXISTS device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_mysti_orders_device_status
  ON public.mysti_orders(device_id, status, created_at DESC);

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

DROP POLICY IF EXISTS mysti_subscriptions_service_all ON public.mysti_subscriptions;
DROP POLICY IF EXISTS mysti_subscriptions_service_role_all ON public.mysti_subscriptions;
CREATE POLICY mysti_subscriptions_service_role_all ON public.mysti_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE public.mysti_subscriptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mysti_subscriptions TO service_role;

DROP TRIGGER IF EXISTS mysti_subscriptions_updated_at ON public.mysti_subscriptions;
CREATE TRIGGER mysti_subscriptions_updated_at
  BEFORE UPDATE ON public.mysti_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();