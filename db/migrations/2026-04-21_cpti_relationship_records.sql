CREATE TABLE IF NOT EXISTS public.cpti_relationship_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_record_id TEXT,
  relationship_slug TEXT NOT NULL,
  personality_slug_a TEXT NOT NULL,
  personality_slug_b TEXT,
  partner_nickname TEXT,
  note TEXT,
  scenario TEXT NOT NULL DEFAULT 'other' CHECK (scenario IN ('lover', 'bestie', 'family', 'work', 'enemy', 'other')),
  compatibility INTEGER CHECK (compatibility BETWEEN 0 AND 100),
  re_test_count INTEGER NOT NULL DEFAULT 0 CHECK (re_test_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cpti_relationship_records_user_created_at_idx
  ON public.cpti_relationship_records (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS cpti_relationship_records_user_scenario_idx
  ON public.cpti_relationship_records (user_id, scenario);

CREATE UNIQUE INDEX IF NOT EXISTS cpti_relationship_records_user_client_record_idx
  ON public.cpti_relationship_records (user_id, client_record_id)
  WHERE client_record_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.cpti_relationship_records_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cpti_relationship_records_set_updated_at ON public.cpti_relationship_records;
CREATE TRIGGER cpti_relationship_records_set_updated_at
  BEFORE UPDATE ON public.cpti_relationship_records
  FOR EACH ROW
  EXECUTE FUNCTION public.cpti_relationship_records_set_updated_at();

ALTER TABLE public.cpti_relationship_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cpti_relationship_records_select_own ON public.cpti_relationship_records;
CREATE POLICY cpti_relationship_records_select_own ON public.cpti_relationship_records
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS cpti_relationship_records_insert_own ON public.cpti_relationship_records;
CREATE POLICY cpti_relationship_records_insert_own ON public.cpti_relationship_records
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS cpti_relationship_records_update_own ON public.cpti_relationship_records;
CREATE POLICY cpti_relationship_records_update_own ON public.cpti_relationship_records
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS cpti_relationship_records_delete_own ON public.cpti_relationship_records;
CREATE POLICY cpti_relationship_records_delete_own ON public.cpti_relationship_records
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);