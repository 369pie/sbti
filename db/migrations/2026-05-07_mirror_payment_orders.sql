CREATE TABLE IF NOT EXISTS public.mirror_payment_orders (
  trade_order_id TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('wechat', 'alipay')),
  pack TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  amount_yuan NUMERIC(10, 2) NOT NULL CHECK (amount_yuan >= 0),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  paid_at TIMESTAMPTZ,
  wallet_ledger_id UUID REFERENCES public.ling_bi_ledger(id) ON DELETE SET NULL,
  wallet_balance INTEGER CHECK (wallet_balance IS NULL OR wallet_balance >= 0),
  wallet_applied BOOLEAN,
  wallet_credited_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS mirror_payment_orders_user_created_at_idx
  ON public.mirror_payment_orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS mirror_payment_orders_status_created_at_idx
  ON public.mirror_payment_orders (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.mirror_payment_orders_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mirror_payment_orders_set_updated_at ON public.mirror_payment_orders;
CREATE TRIGGER mirror_payment_orders_set_updated_at
  BEFORE UPDATE ON public.mirror_payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.mirror_payment_orders_set_updated_at();

ALTER TABLE public.mirror_payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mirror_payment_orders_select_own ON public.mirror_payment_orders;
CREATE POLICY mirror_payment_orders_select_own ON public.mirror_payment_orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS mirror_payment_orders_service_role_all ON public.mirror_payment_orders;
CREATE POLICY mirror_payment_orders_service_role_all ON public.mirror_payment_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON TABLE public.mirror_payment_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mirror_payment_orders TO service_role;
