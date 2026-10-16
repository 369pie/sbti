-- =============================================================
-- WTFTI · 2026-08-16 · Time Assets cloud migration (Phase A)
-- =============================================================
-- Strategy: docs/01-strategy/wtfti-emotion-value-research-and-redesign-2026-08.md §4.3
--           「时间资产云端化」——星尘信 / 月相进度 / galaxy 结果从 localStorage
--           迁到 Supabase，localStorage 降级为缓存。
--
-- Apply once in Supabase. Idempotent: CREATE TABLE IF NOT EXISTS
-- and DO blocks for policies. Safe to re-run.
--
-- Tables introduced:
--   1) wtfti_galaxy_results  · 仪式结果档案（result_id 归档 + latest 指针由 created_at 推导）
--   2) wtfti_letters         · 星尘信（sealed/retest）+ 月相 30 天未来信（future），统一 D30 引擎
--   3) wtfti_moon_progress   · 月相 12 期进度（每用户一行）
--   4) wtfti_duet_sessions   · 召唤合奏结果（表先行，写入点后续接入）
--
-- Security model:
--   * All tables RLS enabled, owner-only (auth.uid() = user_id) for
--     authenticated (anonymous sign-in included — base identity of the site).
--   * No service_role policies needed; API routes run user-scoped.
-- =============================================================

-- ---------- 1) wtfti_galaxy_results ----------
create table if not exists public.wtfti_galaxy_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  result_id       text not null,            -- client-generated (crypto UUID)
  personality_slug text not null,           -- wtfti personality slug
  home_planet_slug text,                    -- denormalized for /today aggregation
  result          jsonb not null,           -- full GalaxyResult (incl. shadow if present)
  soul_answers    jsonb,                    -- optional SoulAnswers (radar / perfume)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, result_id)
);

create index if not exists wtfti_galaxy_results_user_latest_idx
  on public.wtfti_galaxy_results (user_id, created_at desc);

alter table public.wtfti_galaxy_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_galaxy_results'
       and policyname = 'wtfti_galaxy_results_owner_all'
  ) then
    create policy wtfti_galaxy_results_owner_all on public.wtfti_galaxy_results
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- ---------- 2) wtfti_letters ----------
create table if not exists public.wtfti_letters (
  id          text primary key,             -- client-generated id; future letters use 'future:<sealedAt>'
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null default 'sealed'
              check (kind in ('sealed', 'retest', 'future')),
  text        text not null check (char_length(text) between 1 and 480),
  title       text,                         -- future letters only
  sealed_at   timestamptz not null,
  due_at      timestamptz not null,         -- revealAt for future letters
  personality_slug text,
  planet_slug text,
  opened      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists wtfti_letters_user_due_idx
  on public.wtfti_letters (user_id, due_at)
  where opened = false;

alter table public.wtfti_letters enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_letters'
       and policyname = 'wtfti_letters_owner_all'
  ) then
    create policy wtfti_letters_owner_all on public.wtfti_letters
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- ---------- 3) wtfti_moon_progress ----------
create table if not exists public.wtfti_moon_progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  done        integer[] not null default '{}',   -- answered chapter indexes (1..12)
  answers     jsonb not null default '{}',       -- { chapterIndex: optionIdx }
  crowned_at  timestamptz,
  title       text,                              -- crowning title (大祭司尊号)
  updated_at  timestamptz not null default now()
);

alter table public.wtfti_moon_progress enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_moon_progress'
       and policyname = 'wtfti_moon_progress_owner_all'
  ) then
    create policy wtfti_moon_progress_owner_all on public.wtfti_moon_progress
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- ---------- 4) wtfti_duet_sessions ----------
create table if not exists public.wtfti_duet_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  my_slug       text not null,              -- creator's personality slug
  partner_slug  text not null,
  pair_data     jsonb not null,             -- gravity / resonance / pair sigil seed
  created_at    timestamptz not null default now()
);

create index if not exists wtfti_duet_sessions_user_idx
  on public.wtfti_duet_sessions (user_id, created_at desc);

alter table public.wtfti_duet_sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_duet_sessions'
       and policyname = 'wtfti_duet_sessions_owner_all'
  ) then
    create policy wtfti_duet_sessions_owner_all on public.wtfti_duet_sessions
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- =============================================================
-- End of migration
-- =============================================================
