CREATE TABLE IF NOT EXISTS public.ling_bi_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  free_granted INTEGER NOT NULL DEFAULT 0 CHECK (free_granted >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS ling_bi_accounts_user_idx
  ON public.ling_bi_accounts (user_id);

CREATE TABLE IF NOT EXISTS public.ling_bi_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.ling_bi_accounts(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL CHECK (delta <> 0),
  source TEXT NOT NULL CHECK (
    source IN (
      'mirror-single',
      'mirror-archive',
      'mirror-legacy',
      'destiny-once',
      'destiny-monthly',
      'topup',
      'free',
      'gift',
      'refund'
    )
  ),
  resource_id TEXT,
  idempotency_key TEXT,
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

DROP INDEX IF EXISTS ling_bi_ledger_user_idempotency_idx;
CREATE UNIQUE INDEX ling_bi_ledger_user_idempotency_idx
  ON public.ling_bi_ledger (user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS ling_bi_ledger_user_created_at_idx
  ON public.ling_bi_ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ling_bi_ledger_account_created_at_idx
  ON public.ling_bi_ledger (account_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.ling_bi_accounts_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ling_bi_accounts_set_updated_at ON public.ling_bi_accounts;
CREATE TRIGGER ling_bi_accounts_set_updated_at
  BEFORE UPDATE ON public.ling_bi_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.ling_bi_accounts_set_updated_at();

ALTER TABLE public.ling_bi_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ling_bi_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ling_bi_accounts_select_own ON public.ling_bi_accounts;
CREATE POLICY ling_bi_accounts_select_own ON public.ling_bi_accounts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS ling_bi_ledger_select_own ON public.ling_bi_ledger;
CREATE POLICY ling_bi_ledger_select_own ON public.ling_bi_ledger
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.ling_bi_apply_transaction(
  p_user_id UUID,
  p_delta INTEGER,
  p_source TEXT,
  p_idempotency_key TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  account_id UUID,
  ledger_id UUID,
  balance INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  free_granted INTEGER,
  applied BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  account_row public.ling_bi_accounts%ROWTYPE;
  existing_ledger public.ling_bi_ledger%ROWTYPE;
  next_balance INTEGER;
  next_total_earned INTEGER;
  next_total_spent INTEGER;
  next_free_granted INTEGER;
  new_ledger_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing_user_id' USING ERRCODE = '22023';
  END IF;

  IF p_delta IS NULL OR p_delta = 0 THEN
    RAISE EXCEPTION 'invalid_delta' USING ERRCODE = '22023';
  END IF;

  IF p_source NOT IN (
    'mirror-single',
    'mirror-archive',
    'mirror-legacy',
    'destiny-once',
    'destiny-monthly',
    'topup',
    'free',
    'gift',
    'refund'
  ) THEN
    RAISE EXCEPTION 'invalid_source' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.ling_bi_accounts (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT *
    INTO account_row
    FROM public.ling_bi_accounts
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'account_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT *
      INTO existing_ledger
      FROM public.ling_bi_ledger
     WHERE user_id = p_user_id
       AND idempotency_key = p_idempotency_key
     LIMIT 1;

    IF FOUND THEN
      account_id := account_row.id;
      ledger_id := existing_ledger.id;
      balance := account_row.balance;
      total_earned := account_row.total_earned;
      total_spent := account_row.total_spent;
      free_granted := account_row.free_granted;
      applied := FALSE;
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  next_balance := account_row.balance + p_delta;
  IF next_balance < 0 THEN
    RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = '22003';
  END IF;

  next_total_earned := account_row.total_earned + GREATEST(p_delta, 0);
  next_total_spent := account_row.total_spent + GREATEST(-p_delta, 0);
  next_free_granted := account_row.free_granted + CASE WHEN p_source = 'free' AND p_delta > 0 THEN p_delta ELSE 0 END;

  UPDATE public.ling_bi_accounts
     SET balance = next_balance,
         total_earned = next_total_earned,
         total_spent = next_total_spent,
         free_granted = next_free_granted
   WHERE id = account_row.id;

  INSERT INTO public.ling_bi_ledger (
    user_id,
    account_id,
    delta,
    source,
    resource_id,
    idempotency_key,
    note,
    metadata,
    balance_after
  )
  VALUES (
    p_user_id,
    account_row.id,
    p_delta,
    p_source,
    p_resource_id,
    p_idempotency_key,
    p_note,
    COALESCE(p_metadata, '{}'::jsonb),
    next_balance
  )
  RETURNING id INTO new_ledger_id;

  account_id := account_row.id;
  ledger_id := new_ledger_id;
  balance := next_balance;
  total_earned := next_total_earned;
  total_spent := next_total_spent;
  free_granted := next_free_granted;
  applied := TRUE;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.ling_bi_apply_transaction(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ling_bi_apply_transaction(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.ling_bi_apply_transaction(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.ling_bi_apply_transaction(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
