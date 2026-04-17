-- ============================================================================
-- WTFTI UGC Creator Platform — Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================================

-- ─── 1. Creators ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  social_link TEXT,
  bio TEXT,
  tier TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'pro', 'business', 'enterprise')),
  invite_code TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creators_user_id ON public.creators(user_id);

-- ─── 2. Creator Universes ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  emoji TEXT DEFAULT '🌟',
  description TEXT,

  -- Theme
  primary_color TEXT DEFAULT '#ff4d6d',
  card_style TEXT NOT NULL DEFAULT 'default'
    CHECK (card_style IN ('default', 'dark', 'neon', 'pastel')),

  -- Scoring
  scoring_mode TEXT NOT NULL DEFAULT 'dimension'
    CHECK (scoring_mode IN ('dimension', 'direct')),
  questions_per_test INTEGER,  -- NULL = use all questions

  -- Section labels (for result page)
  hit_label TEXT DEFAULT '💥 一击',
  os_label TEXT DEFAULT '🧠 OS 解读',
  symptoms_label TEXT DEFAULT '📋 症状清单',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  price_cents INTEGER DEFAULT 0,

  -- Analytics cache (updated periodically)
  total_tests INTEGER NOT NULL DEFAULT 0,
  total_shares INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_universes_creator ON public.creator_universes(creator_id);
CREATE INDEX IF NOT EXISTS idx_universes_status ON public.creator_universes(status);

ALTER TABLE public.creator_universes
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE public.creator_universes
  ADD COLUMN IF NOT EXISTS review_note TEXT;

-- ─── 3. Scoring Axes ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_axes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  axis_key TEXT NOT NULL,
  name TEXT NOT NULL,
  low_label TEXT NOT NULL DEFAULT '低',
  high_label TEXT NOT NULL DEFAULT '高',
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(universe_id, axis_key)
);

-- ─── 4. Questions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  pool_tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_universe ON public.creator_questions(universe_id);

-- ─── 5. Options ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.creator_questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Dimension mode: JSON object { axis_key: score_delta }
  scores JSONB DEFAULT '{}',
  -- Direct mode: target personality slug
  target_personality TEXT
);

CREATE INDEX IF NOT EXISTS idx_options_question ON public.creator_options(question_id);

-- ─── 6. Personalities ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  number TEXT,
  name TEXT NOT NULL,
  code TEXT,
  emoji TEXT DEFAULT '✨',
  tagline TEXT,
  color TEXT DEFAULT '#ff4d6d',
  quote TEXT,
  image_url TEXT,
  thumbnail_url TEXT,

  -- Four-part copy
  copy_hit TEXT,
  copy_os TEXT,
  copy_symptoms TEXT[] DEFAULT '{}',
  copy_closer TEXT,

  -- Dimension mode: profile { axis_key: 'H' | 'L' }
  profile JSONB DEFAULT '{}',

  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(universe_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_personalities_universe ON public.creator_personalities(universe_id);

-- ─── 7. Test Results (analytics) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  personality_slug TEXT NOT NULL,
  session_id TEXT,
  user_id UUID,
  scores JSONB,
  shared BOOLEAN NOT NULL DEFAULT false,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_universe ON public.creator_test_results(universe_id);
CREATE INDEX IF NOT EXISTS idx_results_created ON public.creator_test_results(created_at);

-- ─── 8. Creator Applications (beta funnel) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wechat_id TEXT,
  xiaohongshu_handle TEXT,
  content_vertical TEXT,
  wants_free BOOLEAN NOT NULL DEFAULT true,
  wants_paid BOOLEAN NOT NULL DEFAULT false,
  intro TEXT,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'approved', 'rejected', 'archived')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_applications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_creator_applications_created_at ON public.creator_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON public.creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_email ON public.creator_applications(email);
CREATE INDEX IF NOT EXISTS idx_creator_applications_wechat_id ON public.creator_applications(wechat_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_creator_applications_user_id
  ON public.creator_applications(user_id)
  WHERE user_id IS NOT NULL;

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

-- Creators can manage their own profile
DROP POLICY IF EXISTS creators_own ON public.creators;
CREATE POLICY creators_own ON public.creators
  FOR ALL USING (user_id = auth.uid());

-- Anyone can read published creators
DROP POLICY IF EXISTS creators_public_read ON public.creators;
CREATE POLICY creators_public_read ON public.creators
  FOR SELECT USING (true);

-- Creators can manage their own universes
DROP POLICY IF EXISTS universes_own ON public.creator_universes;
CREATE POLICY universes_own ON public.creator_universes
  FOR ALL USING (
    creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid())
  );

-- Anyone can read published universes
DROP POLICY IF EXISTS universes_public_read ON public.creator_universes;
CREATE POLICY universes_public_read ON public.creator_universes
  FOR SELECT USING (status = 'published');

-- Axes: same as universe ownership
DROP POLICY IF EXISTS axes_own ON public.creator_axes;
CREATE POLICY axes_own ON public.creator_axes
  FOR ALL USING (
    universe_id IN (
      SELECT cu.id FROM public.creator_universes cu
      JOIN public.creators c ON cu.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS axes_public_read ON public.creator_axes;
CREATE POLICY axes_public_read ON public.creator_axes
  FOR SELECT USING (
    universe_id IN (SELECT id FROM public.creator_universes WHERE status = 'published')
  );

-- Questions: same pattern
DROP POLICY IF EXISTS questions_own ON public.creator_questions;
CREATE POLICY questions_own ON public.creator_questions
  FOR ALL USING (
    universe_id IN (
      SELECT cu.id FROM public.creator_universes cu
      JOIN public.creators c ON cu.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS questions_public_read ON public.creator_questions;
CREATE POLICY questions_public_read ON public.creator_questions
  FOR SELECT USING (
    universe_id IN (SELECT id FROM public.creator_universes WHERE status = 'published')
  );

-- Options: via question ownership
DROP POLICY IF EXISTS options_own ON public.creator_options;
CREATE POLICY options_own ON public.creator_options
  FOR ALL USING (
    question_id IN (
      SELECT cq.id FROM public.creator_questions cq
      JOIN public.creator_universes cu ON cq.universe_id = cu.id
      JOIN public.creators c ON cu.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS options_public_read ON public.creator_options;
CREATE POLICY options_public_read ON public.creator_options
  FOR SELECT USING (
    question_id IN (
      SELECT cq.id FROM public.creator_questions cq
      JOIN public.creator_universes cu ON cq.universe_id = cu.id
      WHERE cu.status = 'published'
    )
  );

-- Personalities: same as universe
DROP POLICY IF EXISTS personalities_own ON public.creator_personalities;
CREATE POLICY personalities_own ON public.creator_personalities
  FOR ALL USING (
    universe_id IN (
      SELECT cu.id FROM public.creator_universes cu
      JOIN public.creators c ON cu.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS personalities_public_read ON public.creator_personalities;
CREATE POLICY personalities_public_read ON public.creator_personalities
  FOR SELECT USING (
    universe_id IN (SELECT id FROM public.creator_universes WHERE status = 'published')
  );

-- Test results: anyone can insert, creators can read their own universe's results
DROP POLICY IF EXISTS results_insert ON public.creator_test_results;
CREATE POLICY results_insert ON public.creator_test_results
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS results_read_own ON public.creator_test_results;
CREATE POLICY results_read_own ON public.creator_test_results
  FOR SELECT USING (
    universe_id IN (
      SELECT cu.id FROM public.creator_universes cu
      JOIN public.creators c ON cu.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- ─── Updated-at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS creators_updated_at ON public.creators;
CREATE TRIGGER creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS universes_updated_at ON public.creator_universes;
CREATE TRIGGER universes_updated_at
  BEFORE UPDATE ON public.creator_universes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS creator_applications_updated_at ON public.creator_applications;
CREATE TRIGGER creator_applications_updated_at
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_universe_tests(universe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.creator_universes
  SET total_tests = COALESCE(total_tests, 0) + 1
  WHERE id = universe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_universe_shares(universe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.creator_universes
  SET total_shares = COALESCE(total_shares, 0) + 1
  WHERE id = universe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 9. Orders (simulated purchases) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  user_id UUID,                           -- buyer (nullable for anonymous)
  session_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0, -- gross amount
  channel_fee_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  creator_earning_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'refunded', 'disputed')),
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_universe ON public.creator_orders(universe_id);
CREATE INDEX IF NOT EXISTS idx_orders_creator ON public.creator_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.creator_orders(created_at);

-- ─── 10. Earnings Ledger (per-period summaries) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  universe_id UUID NOT NULL REFERENCES public.creator_universes(id) ON DELETE CASCADE,
  period TEXT NOT NULL,                   -- e.g. '2026-04'
  gross_cents INTEGER NOT NULL DEFAULT 0,
  refund_cents INTEGER NOT NULL DEFAULT 0,
  channel_fee_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  net_earning_cents INTEGER NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  refund_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, universe_id, period)
);

CREATE INDEX IF NOT EXISTS idx_earnings_creator ON public.creator_earnings(creator_id);

-- ─── 11. Settlements (payout requests) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creator_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,          -- requested payout amount
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payout_method TEXT DEFAULT 'bank_transfer',
  payout_account TEXT,                    -- masked account info
  admin_note TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_settlements_creator ON public.creator_settlements(creator_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.creator_settlements(status);

-- RLS for new tables
ALTER TABLE public.creator_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_settlements ENABLE ROW LEVEL SECURITY;

-- Orders: anyone can insert (simulated purchase), creators read own
DROP POLICY IF EXISTS orders_insert ON public.creator_orders;
CREATE POLICY orders_insert ON public.creator_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS orders_read_own ON public.creator_orders;
CREATE POLICY orders_read_own ON public.creator_orders
  FOR SELECT USING (
    creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid())
  );

-- Earnings: creators read own
DROP POLICY IF EXISTS earnings_read_own ON public.creator_earnings;
CREATE POLICY earnings_read_own ON public.creator_earnings
  FOR SELECT USING (
    creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid())
  );

-- Settlements: creators manage own
DROP POLICY IF EXISTS settlements_own ON public.creator_settlements;
CREATE POLICY settlements_own ON public.creator_settlements
  FOR ALL USING (
    creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid())
  );

-- Trigger
DROP TRIGGER IF EXISTS orders_updated_at ON public.creator_orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.creator_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
