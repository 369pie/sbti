-- XPTI Couple pair-code persistence (Sprint 3).
-- Replaces zero-backend `?inv=` URL-only design with a stable share_token + pair_code so
-- inviters can see the merged report on a separate device once the partner finishes.
-- Safe to re-run.

-- ── Enums ─────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'xpti_couple_status') THEN
    CREATE TYPE public.xpti_couple_status AS ENUM ('active', 'completed', 'expired');
  END IF;
END $$;

-- ── Couples table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xpti_couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_code CHAR(6) NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  status public.xpti_couple_status NOT NULL DEFAULT 'active',

  -- inviter side (always present when row is created)
  inviter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inviter_device_id TEXT,
  inviter_slug TEXT NOT NULL,
  inviter_dims JSONB NOT NULL,
  inviter_nickname TEXT,

  -- partner side (filled when partner completes the 12-q quiz)
  partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_device_id TEXT,
  partner_slug TEXT,
  partner_dims JSONB,
  partner_nickname TEXT,

  -- merged report payload (built server-side via buildCoupleMerge)
  merged_payload JSONB,

  -- unlock state (any party paying flips this open, share_token holders all benefit)
  unlocked_sku TEXT,
  unlocked_at TIMESTAMPTZ,
  unlocked_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unlocked_by_device_id TEXT,

  -- repeated remeasurement history (Phase 2: relationship monthly check-in)
  history JSONB NOT NULL DEFAULT '[]'::jsonb,

  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_xpti_couples_active_pair_code
  ON public.xpti_couples(pair_code)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_xpti_couples_inviter_user
  ON public.xpti_couples(inviter_user_id, created_at DESC)
  WHERE inviter_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_xpti_couples_partner_user
  ON public.xpti_couples(partner_user_id, created_at DESC)
  WHERE partner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_xpti_couples_status_created
  ON public.xpti_couples(status, created_at DESC);

-- ── updated_at trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.xpti_couples_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS xpti_couples_updated_at ON public.xpti_couples;
CREATE TRIGGER xpti_couples_updated_at
  BEFORE UPDATE ON public.xpti_couples
  FOR EACH ROW EXECUTE FUNCTION public.xpti_couples_set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────
-- Note: client never touches this table directly. All reads go through API
-- routes that validate share_token (held by both inviter & partner).
ALTER TABLE public.xpti_couples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS xpti_couples_service_all ON public.xpti_couples;
CREATE POLICY xpti_couples_service_all ON public.xpti_couples
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.xpti_couples FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.xpti_couples TO service_role;

COMMENT ON TABLE public.xpti_couples IS
  'XPTI couple pair-code records. share_token is the canonical identity (held by both parties). pair_code is the human-shareable 6-char alias.';
