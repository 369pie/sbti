CREATE TABLE IF NOT EXISTS public.lingjian_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_entry_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (
    entry_type IN (
      'wtfti_profile',
      'mirror_report',
      'mysti_decision',
      'mysti_destiny',
      'mysti_dual',
      'wallet_ledger'
    )
  ),
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS lingjian_entries_user_client_entry_idx
  ON public.lingjian_entries (user_id, client_entry_id);

CREATE INDEX IF NOT EXISTS lingjian_entries_user_updated_at_idx
  ON public.lingjian_entries (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS lingjian_entries_user_type_idx
  ON public.lingjian_entries (user_id, entry_type);

CREATE OR REPLACE FUNCTION public.lingjian_entries_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lingjian_entries_set_updated_at ON public.lingjian_entries;
CREATE TRIGGER lingjian_entries_set_updated_at
  BEFORE UPDATE ON public.lingjian_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.lingjian_entries_set_updated_at();

ALTER TABLE public.lingjian_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lingjian_entries_select_own ON public.lingjian_entries;
CREATE POLICY lingjian_entries_select_own ON public.lingjian_entries
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS lingjian_entries_insert_own ON public.lingjian_entries;
CREATE POLICY lingjian_entries_insert_own ON public.lingjian_entries
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS lingjian_entries_update_own ON public.lingjian_entries;
CREATE POLICY lingjian_entries_update_own ON public.lingjian_entries
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS lingjian_entries_delete_own ON public.lingjian_entries;
CREATE POLICY lingjian_entries_delete_own ON public.lingjian_entries
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);
