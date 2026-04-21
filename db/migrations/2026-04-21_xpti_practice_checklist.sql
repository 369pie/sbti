-- XPTI Couple 30-day practice checklist (co-completion)
-- Adds practice_checklist JSONB to xpti_couples for syncing completion state
-- between inviter and partner across devices.
-- Safe to re-run.

ALTER TABLE public.xpti_couples
  ADD COLUMN IF NOT EXISTS practice_checklist JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.xpti_couples.practice_checklist IS
  '30-day practice co-completion state: { "day": { inviter?: boolean, partner?: boolean, updatedAt: ISO } }';

-- Index for fast lookup on active couples with practice data
CREATE INDEX IF NOT EXISTS idx_xpti_couples_practice
  ON public.xpti_couples USING gin(practice_checklist)
  WHERE practice_checklist != '{}'::jsonb;
