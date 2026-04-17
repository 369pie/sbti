-- Align older UGC databases with the runtime contract verified in the April 2026 smoke tests.
-- Safe to re-run.

ALTER TABLE public.creator_universes
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE public.creator_universes
  ADD COLUMN IF NOT EXISTS review_note TEXT;

DROP FUNCTION IF EXISTS public.increment_universe_tests(UUID);

CREATE FUNCTION public.increment_universe_tests(universe_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.creator_universes
  SET total_tests = COALESCE(total_tests, 0) + 1
  WHERE id = universe_id;
END;
$$;

DROP FUNCTION IF EXISTS public.increment_universe_shares(UUID);

CREATE FUNCTION public.increment_universe_shares(universe_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.creator_universes
  SET total_shares = COALESCE(total_shares, 0) + 1
  WHERE id = universe_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_universe_tests(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_universe_shares(UUID) TO anon, authenticated, service_role;