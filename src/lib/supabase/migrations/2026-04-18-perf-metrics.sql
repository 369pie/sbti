-- Real-User Monitoring (RUM) bucket for Web Vitals + custom interaction
-- timings. Insert-only from the public anon key; reads are admin-only via
-- service role. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.perf_metrics (
  id BIGSERIAL PRIMARY KEY,
  -- Anonymous device fingerprint (cookie/uuid). NEVER a real user id.
  device_id TEXT,
  -- Core Web Vital name: LCP / CLS / INP / FCP / TTFB / NAV.
  metric TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  rating TEXT, -- good / needs-improvement / poor / null
  -- Pathname (no querystring, no hash) at the moment of measurement.
  pathname TEXT NOT NULL,
  -- Optional finer-grained label (e.g. "click:share", "supabase:getUser").
  label TEXT,
  -- Effective connection type from navigator.connection.
  connection TEXT,
  -- Approximate region inferred from request edge headers.
  country TEXT,
  -- Coarse UA family (chrome / safari / firefox / wechat / unknown).
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS perf_metrics_metric_created_idx
  ON public.perf_metrics (metric, created_at DESC);
CREATE INDEX IF NOT EXISTS perf_metrics_pathname_idx
  ON public.perf_metrics (pathname, created_at DESC);

ALTER TABLE public.perf_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perf_metrics insert anon" ON public.perf_metrics;
CREATE POLICY "perf_metrics insert anon"
  ON public.perf_metrics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "perf_metrics select admin" ON public.perf_metrics;
CREATE POLICY "perf_metrics select admin"
  ON public.perf_metrics
  FOR SELECT
  TO service_role
  USING (true);
