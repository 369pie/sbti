-- CPTI invite loopback notifications (v2.0 S5.4 backendization).
--
-- Flow:
-- 1) inviter copies a result link → create row with share_token
-- 2) receiver opens the link on any device → opened_at / opened_by_user_id filled
-- 3) inviter visits Codex on another device → server returns unread opened rows

CREATE TABLE IF NOT EXISTS public.cpti_invite_loopbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token TEXT NOT NULL UNIQUE,
  inviter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_slug TEXT NOT NULL,
  opened_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpti_invite_loopbacks_inviter_opened
  ON public.cpti_invite_loopbacks(inviter_user_id, opened_at DESC)
  WHERE opened_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cpti_invite_loopbacks_share_token
  ON public.cpti_invite_loopbacks(share_token);

CREATE OR REPLACE FUNCTION public.cpti_invite_loopbacks_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS cpti_invite_loopbacks_updated_at ON public.cpti_invite_loopbacks;
CREATE TRIGGER cpti_invite_loopbacks_updated_at
  BEFORE UPDATE ON public.cpti_invite_loopbacks
  FOR EACH ROW EXECUTE FUNCTION public.cpti_invite_loopbacks_set_updated_at();

ALTER TABLE public.cpti_invite_loopbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cpti_invite_loopbacks_service_all ON public.cpti_invite_loopbacks;
CREATE POLICY cpti_invite_loopbacks_service_all ON public.cpti_invite_loopbacks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.cpti_invite_loopbacks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cpti_invite_loopbacks TO service_role;

COMMENT ON TABLE public.cpti_invite_loopbacks IS
  'CPTI result-share open notifications. share_token is the credential carried by the copied result link.';