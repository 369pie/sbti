-- CPTI + WTF CARD Atlas schema for Supabase
-- Date: 2026-04-15
-- Notes:
-- 1) Identity is anchored on auth.users, not a custom users table.
-- 2) This schema assumes server-first writes via Route Handlers / Server Actions.
-- 3) Client-side direct access is intentionally limited to "read my data" and public registry reads.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'identity_stage') then
    create type public.identity_stage as enum ('anonymous', 'claimed', 'merged');
  end if;

  if not exists (select 1 from pg_type where typname = 'merge_strategy') then
    create type public.merge_strategy as enum ('prefer_target', 'prefer_source', 'merge');
  end if;

  if not exists (select 1 from pg_type where typname = 'merge_status') then
    create type public.merge_status as enum ('planned', 'completed', 'aborted');
  end if;

  if not exists (select 1 from pg_type where typname = 'module_kind') then
    create type public.module_kind as enum (
      'shared_universe',
      'independent_module',
      'relationship_module',
      'temporal_module',
      'achievement_module'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_profile_source') then
    create type public.cpti_profile_source as enum ('self_test', 'pair_flow', 'stealth');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_pair_code_mode') then
    create type public.cpti_pair_code_mode as enum ('direct', 'open', 'campaign');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_pair_code_status') then
    create type public.cpti_pair_code_status as enum ('active', 'expired', 'consumed', 'blocked');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_submit_source') then
    create type public.cpti_submit_source as enum ('link', 'code_entry', 'stealth');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_match_status') then
    create type public.cpti_match_status as enum ('started', 'completed', 'aborted', 'invalid');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_relationship_visibility') then
    create type public.cpti_relationship_visibility as enum ('private', 'mutual', 'public_anonymous');
  end if;

  if not exists (select 1 from pg_type where typname = 'cpti_relationship_tier') then
    create type public.cpti_relationship_tier as enum ('viral', 'deep', 'rare');
  end if;

  if not exists (select 1 from pg_type where typname = 'atlas_shelf') then
    create type public.atlas_shelf as enum ('shelf_a', 'shelf_b', 'shelf_c', 'shelf_d', 'overlay');
  end if;

  if not exists (select 1 from pg_type where typname = 'atlas_item_kind') then
    create type public.atlas_item_kind as enum ('result', 'relationship', 'state', 'achievement');
  end if;

  if not exists (select 1 from pg_type where typname = 'atlas_unlock_status') then
    create type public.atlas_unlock_status as enum ('unlocked', 'archived', 'expired');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.touch_updated_at(tablename regclass)
returns void
language plpgsql
as $$
begin
  execute format(
    'drop trigger if exists set_updated_at on %s;
     create trigger set_updated_at before update on %s
     for each row execute function public.set_updated_at();',
    tablename,
    tablename
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Identity layer
-- -----------------------------------------------------------------------------

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  identity_stage public.identity_stage not null default 'anonymous',
  merged_into_user_id uuid references auth.users (id),
  nickname varchar(32) not null default '',
  avatar_url text,
  headline text,
  claimed_at timestamptz,
  last_seen_at timestamptz,
  onboarding_state jsonb not null default '{}'::jsonb,
  private_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_merged_target_check
    check ((identity_stage <> 'merged') or (merged_into_user_id is not null))
);

create table if not exists public.user_identity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  from_stage public.identity_stage,
  to_stage public.identity_stage,
  source text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_identity_events_user_created_idx
  on public.user_identity_events (user_id, created_at desc);

create table if not exists public.user_merge_events (
  id uuid primary key default gen_random_uuid(),
  source_user_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  strategy public.merge_strategy not null,
  status public.merge_status not null default 'planned',
  merge_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create unique index if not exists user_merge_events_source_target_idx
  on public.user_merge_events (source_user_id, target_user_id, created_at);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_stage public.identity_stage;
begin
  next_stage := case
    when coalesce(new.is_anonymous, false) then 'anonymous'
    else 'claimed'
  end;

  insert into public.user_profiles (
    user_id,
    identity_stage,
    nickname,
    claimed_at
  )
  values (
    new.id,
    next_stage,
    coalesce(new.raw_user_meta_data ->> 'nickname', ''),
    case when next_stage = 'claimed' then timezone('utc', now()) else null end
  )
  on conflict (user_id) do nothing;

  insert into public.user_identity_events (
    user_id,
    event_type,
    to_stage,
    source,
    event_payload
  )
  values (
    new.id,
    case when next_stage = 'anonymous' then 'anonymous_created' else 'claimed_created' end,
    next_stage,
    coalesce(new.raw_app_meta_data ->> 'provider', 'unknown'),
    jsonb_build_object(
      'is_anonymous', coalesce(new.is_anonymous, false)
    )
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(old.is_anonymous, false) = true and coalesce(new.is_anonymous, false) = false then
    update public.user_profiles
    set
      identity_stage = 'claimed',
      claimed_at = coalesce(claimed_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    where user_id = new.id and identity_stage <> 'merged';

    insert into public.user_identity_events (
      user_id,
      event_type,
      from_stage,
      to_stage,
      source,
      event_payload
    )
    values (
      new.id,
      'identity_claimed',
      'anonymous',
      'claimed',
      coalesce(new.raw_app_meta_data ->> 'provider', 'unknown'),
      '{}'::jsonb
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row execute function public.handle_auth_user_updated();

select public.touch_updated_at('public.user_profiles');

-- -----------------------------------------------------------------------------
-- Solo / module result layer
-- -----------------------------------------------------------------------------

create table if not exists public.user_module_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_kind public.module_kind not null,
  module_id text not null,
  result_slug text not null,
  comparability_group text,
  is_current boolean not null default true,
  is_ephemeral boolean not null default false,
  observed_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  source_version text,
  source_payload jsonb not null default '{}'::jsonb,
  client_mutation_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_module_results_client_mutation_idx
  on public.user_module_results (user_id, client_mutation_id)
  where client_mutation_id is not null;

create index if not exists user_module_results_user_module_idx
  on public.user_module_results (user_id, module_id, observed_at desc);

create unique index if not exists user_module_results_current_unique_idx
  on public.user_module_results (user_id, module_id)
  where is_current = true and expires_at is null;

select public.touch_updated_at('public.user_module_results');

-- -----------------------------------------------------------------------------
-- CPTI relationship core
-- -----------------------------------------------------------------------------

create table if not exists public.cpti_profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source public.cpti_profile_source not null,
  personality_slug varchar(32) not null,
  dimension_scores jsonb not null,
  raw_answers jsonb,
  tested_at timestamptz not null default timezone('utc', now()),
  client_mutation_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cpti_profile_snapshots_client_mutation_idx
  on public.cpti_profile_snapshots (user_id, client_mutation_id)
  where client_mutation_id is not null;

create index if not exists cpti_profile_snapshots_user_tested_idx
  on public.cpti_profile_snapshots (user_id, tested_at desc);

create table if not exists public.cpti_pair_codes (
  id uuid primary key default gen_random_uuid(),
  code char(6) not null,
  code_mode public.cpti_pair_code_mode not null default 'direct',
  creator_user_id uuid not null references auth.users (id) on delete cascade,
  creator_snapshot_id uuid references public.cpti_profile_snapshots (id) on delete set null,
  share_token text unique,
  status public.cpti_pair_code_status not null default 'active',
  max_uses int not null default 1,
  used_count int not null default 0,
  expires_at timestamptz,
  source_channel text,
  metadata_json jsonb not null default '{}'::jsonb,
  client_mutation_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cpti_pair_codes_use_count_check check (used_count >= 0 and used_count <= max_uses)
);

create unique index if not exists cpti_pair_codes_active_code_idx
  on public.cpti_pair_codes (code)
  where status = 'active';

create unique index if not exists cpti_pair_codes_client_mutation_idx
  on public.cpti_pair_codes (creator_user_id, client_mutation_id)
  where client_mutation_id is not null;

create index if not exists cpti_pair_codes_creator_created_idx
  on public.cpti_pair_codes (creator_user_id, created_at desc);

select public.touch_updated_at('public.cpti_pair_codes');

create table if not exists public.cpti_matches (
  id uuid primary key default gen_random_uuid(),
  pair_code_id uuid references public.cpti_pair_codes (id) on delete set null,
  initiator_user_id uuid not null references auth.users (id) on delete cascade,
  participant_user_id uuid not null references auth.users (id) on delete cascade,
  initiator_snapshot_id uuid references public.cpti_profile_snapshots (id) on delete set null,
  participant_snapshot_id uuid references public.cpti_profile_snapshots (id) on delete set null,
  submit_source public.cpti_submit_source not null,
  status public.cpti_match_status not null default 'started',
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  client_mutation_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cpti_matches_participants_check check (initiator_user_id <> participant_user_id)
);

create unique index if not exists cpti_matches_client_mutation_idx
  on public.cpti_matches (participant_user_id, client_mutation_id)
  where client_mutation_id is not null;

create index if not exists cpti_matches_initiator_idx
  on public.cpti_matches (initiator_user_id, created_at desc);

create index if not exists cpti_matches_participant_idx
  on public.cpti_matches (participant_user_id, created_at desc);

select public.touch_updated_at('public.cpti_matches');

create table if not exists public.cpti_relationships (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.cpti_matches (id) on delete cascade,
  initiator_user_id uuid not null references auth.users (id) on delete cascade,
  participant_user_id uuid not null references auth.users (id) on delete cascade,
  initiator_snapshot_id uuid references public.cpti_profile_snapshots (id) on delete set null,
  participant_snapshot_id uuid references public.cpti_profile_snapshots (id) on delete set null,
  relationship_slug varchar(32) not null,
  relationship_tier public.cpti_relationship_tier not null,
  compatibility int not null check (compatibility between 0 and 100),
  visibility public.cpti_relationship_visibility not null default 'mutual',
  leaderboard_opt_in_initiator boolean not null default false,
  leaderboard_opt_in_participant boolean not null default false,
  public_card_opt_in_initiator boolean not null default false,
  public_card_opt_in_participant boolean not null default false,
  is_valid boolean not null default true,
  invalid_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cpti_relationships_users_check check (initiator_user_id <> participant_user_id)
);

create index if not exists cpti_relationships_initiator_idx
  on public.cpti_relationships (initiator_user_id, created_at desc);

create index if not exists cpti_relationships_participant_idx
  on public.cpti_relationships (participant_user_id, created_at desc);

create index if not exists cpti_relationships_public_idx
  on public.cpti_relationships (visibility, relationship_slug, created_at desc)
  where is_valid = true;

select public.touch_updated_at('public.cpti_relationships');

create table if not exists public.cpti_relationship_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.cpti_relationships (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cpti_relationship_events_relationship_idx
  on public.cpti_relationship_events (relationship_id, created_at desc);

-- -----------------------------------------------------------------------------
-- WTF Atlas registry + unlock layer
-- -----------------------------------------------------------------------------

create table if not exists public.wtf_atlas_series (
  id text primary key,
  shelf public.atlas_shelf not null,
  module_kind public.module_kind not null,
  display_name text not null,
  short_name text,
  comparability_group text,
  is_live boolean not null default true,
  is_collectible boolean not null default true,
  is_rankable boolean not null default false,
  total_collectible_items int not null default 0,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wtf_atlas_items (
  id uuid primary key default gen_random_uuid(),
  series_id text not null references public.wtf_atlas_series (id) on delete cascade,
  item_key text not null,
  item_kind public.atlas_item_kind not null,
  item_slug text,
  rarity text,
  display_order int not null default 0,
  is_collectible boolean not null default true,
  is_rankable boolean not null default false,
  is_ephemeral boolean not null default false,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (series_id, item_key)
);

select public.touch_updated_at('public.wtf_atlas_series');
select public.touch_updated_at('public.wtf_atlas_items');

create table if not exists public.user_atlas_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  series_id text not null,
  item_key text not null,
  dedupe_key text not null,
  status public.atlas_unlock_status not null default 'unlocked',
  source_kind text not null,
  source_ref_table text,
  source_ref_id uuid,
  source_payload jsonb not null default '{}'::jsonb,
  unlocked_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, series_id, dedupe_key),
  foreign key (series_id, item_key)
    references public.wtf_atlas_items (series_id, item_key)
    on delete cascade
);

create index if not exists user_atlas_unlocks_user_shelf_idx
  on public.user_atlas_unlocks (user_id, series_id, unlocked_at desc);

select public.touch_updated_at('public.user_atlas_unlocks');

create table if not exists public.user_atlas_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_collectible_unlocks int not null default 0,
  shared_universe_count int not null default 0,
  independent_module_count int not null default 0,
  relationship_type_count int not null default 0,
  temporal_unlock_count int not null default 0,
  achievement_count int not null default 0,
  soul_count int not null default 0,
  rare_relationship_count int not null default 0,
  last_relationship_at timestamptz,
  last_unlock_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

select public.touch_updated_at('public.user_atlas_stats');

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.user_profiles enable row level security;
alter table public.user_identity_events enable row level security;
alter table public.user_merge_events enable row level security;
alter table public.user_module_results enable row level security;
alter table public.cpti_profile_snapshots enable row level security;
alter table public.cpti_pair_codes enable row level security;
alter table public.cpti_matches enable row level security;
alter table public.cpti_relationships enable row level security;
alter table public.cpti_relationship_events enable row level security;
alter table public.wtf_atlas_series enable row level security;
alter table public.wtf_atlas_items enable row level security;
alter table public.user_atlas_unlocks enable row level security;
alter table public.user_atlas_stats enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "identity_events_select_own" on public.user_identity_events;
create policy "identity_events_select_own"
on public.user_identity_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "merge_events_select_involved" on public.user_merge_events;
create policy "merge_events_select_involved"
on public.user_merge_events
for select
to authenticated
using (auth.uid() = source_user_id or auth.uid() = target_user_id);

drop policy if exists "module_results_select_own" on public.user_module_results;
create policy "module_results_select_own"
on public.user_module_results
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cpti_profile_snapshots_select_own" on public.cpti_profile_snapshots;
create policy "cpti_profile_snapshots_select_own"
on public.cpti_profile_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cpti_pair_codes_select_creator" on public.cpti_pair_codes;
create policy "cpti_pair_codes_select_creator"
on public.cpti_pair_codes
for select
to authenticated
using (auth.uid() = creator_user_id);

drop policy if exists "cpti_matches_select_involved" on public.cpti_matches;
create policy "cpti_matches_select_involved"
on public.cpti_matches
for select
to authenticated
using (auth.uid() = initiator_user_id or auth.uid() = participant_user_id);

drop policy if exists "cpti_relationships_select_visible" on public.cpti_relationships;
create policy "cpti_relationships_select_visible"
on public.cpti_relationships
for select
to authenticated
using (
  auth.uid() = initiator_user_id
  or auth.uid() = participant_user_id
  or (visibility = 'public_anonymous' and is_valid = true)
);

drop policy if exists "cpti_relationships_update_party" on public.cpti_relationships;
create policy "cpti_relationships_update_party"
on public.cpti_relationships
for update
to authenticated
using (auth.uid() = initiator_user_id or auth.uid() = participant_user_id)
with check (auth.uid() = initiator_user_id or auth.uid() = participant_user_id);

drop policy if exists "cpti_relationship_events_select_involved" on public.cpti_relationship_events;
create policy "cpti_relationship_events_select_involved"
on public.cpti_relationship_events
for select
to authenticated
using (
  exists (
    select 1
    from public.cpti_relationships r
    where r.id = relationship_id
      and (
        auth.uid() = r.initiator_user_id
        or auth.uid() = r.participant_user_id
      )
  )
);

drop policy if exists "wtf_atlas_series_public_read" on public.wtf_atlas_series;
create policy "wtf_atlas_series_public_read"
on public.wtf_atlas_series
for select
to anon, authenticated
using (true);

drop policy if exists "wtf_atlas_items_public_read" on public.wtf_atlas_items;
create policy "wtf_atlas_items_public_read"
on public.wtf_atlas_items
for select
to anon, authenticated
using (true);

drop policy if exists "user_atlas_unlocks_select_own" on public.user_atlas_unlocks;
create policy "user_atlas_unlocks_select_own"
on public.user_atlas_unlocks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_atlas_stats_select_own" on public.user_atlas_stats;
create policy "user_atlas_stats_select_own"
on public.user_atlas_stats
for select
to authenticated
using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Seed guidance
-- -----------------------------------------------------------------------------
-- Seed these registries from your code registry:
-- 1) public.wtf_atlas_series
--    - shelf_a: standard, xiuxian, wtfti, bird, banti, kings, delta
--    - shelf_b: flower, soulti, xpti, cpti-role, love, work
--    - shelf_c: cpti-relationship
--    - shelf_d: daily, drunk
--    - overlay: achievements, leaderboard badges
-- 2) public.wtf_atlas_items
--    - one row per collectible result / relationship type / achievement type
