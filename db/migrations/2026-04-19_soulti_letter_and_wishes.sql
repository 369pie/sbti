-- =============================================================
-- SoulTI · 2026-04-19 · Soul Letter + Wishing Well migration
-- =============================================================
-- Apply once in Supabase. Idempotent: uses CREATE TABLE IF NOT EXISTS
-- and CREATE INDEX IF NOT EXISTS, plus DO blocks for policies.
--
-- Tables introduced:
--   1) soul_letter_subscriptions  · 灵魂来信订阅
--   2) soul_letter_unlocks        · D+3/D+7 付费解锁记录
--   3) soulti_wishes              · 32 型匿名许愿池
--
-- Security model:
--   * All tables have RLS enabled.
--   * No public SELECT/INSERT — service_role only for letters.
--   * soulti_wishes: anon INSERT allowed (with rate-limit at app-layer),
--     anon SELECT allowed only on `is_published = true` rows.
-- =============================================================

-- ---------- 1) soul_letter_subscriptions ----------
create table if not exists public.soul_letter_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  slug            text not null,           -- soulti personality slug
  code            text,                    -- 5-letter personality code
  tear_rate_percent int,                   -- snapshot at subscribe time, 0..100
  opted_extended  boolean not null default false,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,             -- null = active; set on opt-out
  -- Per-letter delivery tracking. Cron updates these on success.
  d1_sent_at      timestamptz,
  d3_sent_at      timestamptz,
  d7_sent_at      timestamptz,
  -- Last error message + count for ops triage
  last_error      text,
  failure_count   int not null default 0,
  unique (email, slug)
);

create index if not exists soul_letter_subscriptions_due_idx
  on public.soul_letter_subscriptions (subscribed_at)
  where unsubscribed_at is null;

alter table public.soul_letter_subscriptions enable row level security;

-- No anon policies — service_role bypasses RLS for cron + intake.
-- (intake POST uses service_role from /api/soulti/soul-letter/subscribe.)

-- ---------- 2) soul_letter_unlocks ----------
-- Created when a user pays for the SoulTI deep report (sku=full-report).
-- The cron checks this table before sending D+3/D+7; if absent, sends a
-- short "preview/unlock" email instead.
create table if not exists public.soul_letter_unlocks (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  slug         text not null,
  order_id     text not null unique,
  sku          text not null,             -- 'full-report' | 'deep-letter'
  unlocked_at  timestamptz not null default now(),
  expires_at   timestamptz                -- null = lifetime
);

create index if not exists soul_letter_unlocks_lookup_idx
  on public.soul_letter_unlocks (email, slug);

alter table public.soul_letter_unlocks enable row level security;
-- service_role only.

-- ---------- 3) soulti_wishes (匿名许愿池) ----------
create table if not exists public.soulti_wishes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,            -- personality slug the wish is filed under
  text          text not null,
  -- Optional ephemeral handle; never tied to an account.
  signature     text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  -- App-side abuse signals (filled by API for ops review)
  client_hash   text,                     -- hashed IP+UA for soft rate limit
  flagged       boolean not null default false,
  -- Length guardrails enforced at app layer; here only a hard cap.
  constraint soulti_wishes_text_len check (char_length(text) between 1 and 240)
);

create index if not exists soulti_wishes_slug_published_idx
  on public.soulti_wishes (slug, created_at desc)
  where is_published = true and flagged = false;

alter table public.soulti_wishes enable row level security;

-- Allow public anon to read only published, non-flagged rows.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'soulti_wishes'
       and policyname = 'soulti_wishes_anon_select'
  ) then
    create policy soulti_wishes_anon_select on public.soulti_wishes
      for select
      to anon
      using (is_published = true and flagged = false);
  end if;
end$$;

-- Anonymous insert allowed; rate limit + content checks are at the API layer.
-- Note: app uses service_role for insert today (so this anon policy is a
-- defensive default for any direct client usage later).
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'soulti_wishes'
       and policyname = 'soulti_wishes_anon_insert'
  ) then
    create policy soulti_wishes_anon_insert on public.soulti_wishes
      for insert
      to anon
      with check (
        char_length(text) between 1 and 240
        and char_length(coalesce(signature, '')) <= 24
      );
  end if;
end$$;

-- =============================================================
-- End of migration
-- =============================================================
