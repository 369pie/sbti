-- Product events bucket — durable telemetry shared by all modules.
-- Anonymous insert (browser → /api/events/ingest), service-role read only.
-- Re-runnable: every statement uses IF NOT EXISTS / DROP POLICY IF EXISTS.

create table if not exists public.product_events (
  id bigserial primary key,
  ts timestamptz not null default timezone('utc', now()),
  module text not null,
  event text not null,
  slug text,
  code text,
  tier text,
  step text,
  value double precision,
  ok boolean,
  session_id text,
  device_id text,
  pathname text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  ua text,
  props jsonb
);

create index if not exists product_events_module_ts_idx
  on public.product_events (module, ts desc);
create index if not exists product_events_event_ts_idx
  on public.product_events (event, ts desc);
create index if not exists product_events_session_idx
  on public.product_events (session_id, ts);
create index if not exists product_events_pathname_idx
  on public.product_events (pathname, ts desc);
create index if not exists product_events_slug_idx
  on public.product_events (slug, ts desc) where slug is not null;

alter table public.product_events enable row level security;

drop policy if exists "product_events insert anon" on public.product_events;
create policy "product_events insert anon"
  on public.product_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "product_events select admin" on public.product_events;
create policy "product_events select admin"
  on public.product_events
  for select
  to service_role
  using (true);
