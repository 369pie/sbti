-- CPTI backend schema draft v1
-- Date: 2026-04-15
-- Target: Postgres (recommended on Neon for phase 1)

create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────
-- Enums
-- ───────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cpti_user_auth_state') then
    create type cpti_user_auth_state as enum ('anonymous', 'claimed');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_user_status') then
    create type cpti_user_status as enum ('active', 'blocked', 'merged');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_profile_source') then
    create type cpti_profile_source as enum ('self_test', 'pair_flow', 'stealth');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_pair_code_mode') then
    create type cpti_pair_code_mode as enum ('direct', 'open', 'campaign');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_pair_code_status') then
    create type cpti_pair_code_status as enum ('active', 'expired', 'consumed', 'blocked');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_match_status') then
    create type cpti_match_status as enum ('started', 'completed', 'aborted', 'invalid');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_relationship_visibility') then
    create type cpti_relationship_visibility as enum ('private', 'mutual', 'public_anonymous');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_relationship_tier') then
    create type cpti_relationship_tier as enum ('viral', 'deep', 'rare');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_leaderboard_type') then
    create type cpti_leaderboard_type as enum ('soul_count', 'rare_count', 'collection_progress');
  end if;
  if not exists (select 1 from pg_type where typname = 'cpti_leaderboard_period') then
    create type cpti_leaderboard_period as enum ('all_time', 'weekly', 'monthly');
  end if;
end $$;

-- ───────────────────────────────────────────────────────────
-- Utility trigger
-- ───────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ───────────────────────────────────────────────────────────
-- Users
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_users (
  id uuid primary key default gen_random_uuid(),
  auth_state cpti_user_auth_state not null default 'anonymous',
  anon_token_hash text,
  provider text,
  provider_subject text,
  nickname varchar(32) not null default '',
  avatar_url text,
  status cpti_user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_cpti_users_anon_token_hash
  on cpti_users (anon_token_hash)
  where anon_token_hash is not null;

create unique index if not exists idx_cpti_users_provider_subject
  on cpti_users (provider, provider_subject)
  where provider is not null and provider_subject is not null;

drop trigger if exists trg_cpti_users_updated_at on cpti_users;
create trigger trg_cpti_users_updated_at
before update on cpti_users
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────
-- Profile snapshots
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references cpti_users(id) on delete cascade,
  source cpti_profile_source not null,
  personality_slug varchar(32) not null,
  dim_c1 numeric(5,2) not null check (dim_c1 >= 1 and dim_c1 <= 3),
  dim_c2 numeric(5,2) not null check (dim_c2 >= 1 and dim_c2 <= 3),
  dim_c3 numeric(5,2) not null check (dim_c3 >= 1 and dim_c3 <= 3),
  dim_c4 numeric(5,2) not null check (dim_c4 >= 1 and dim_c4 <= 3),
  dim_c5 numeric(5,2) not null check (dim_c5 >= 1 and dim_c5 <= 3),
  tested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_cpti_profile_snapshots_user_id_tested_at
  on cpti_profile_snapshots (user_id, tested_at desc);

-- ───────────────────────────────────────────────────────────
-- Pair codes
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_pair_codes (
  id uuid primary key default gen_random_uuid(),
  code char(6) not null,
  code_mode cpti_pair_code_mode not null,
  creator_user_id uuid not null references cpti_users(id) on delete cascade,
  creator_profile_snapshot_id uuid not null references cpti_profile_snapshots(id) on delete restrict,
  status cpti_pair_code_status not null default 'active',
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz not null,
  source_channel text,
  share_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_cpti_pair_codes_usage check (used_count <= max_uses)
);

create index if not exists idx_cpti_pair_codes_creator_user_id
  on cpti_pair_codes (creator_user_id, created_at desc);

create index if not exists idx_cpti_pair_codes_status_expires_at
  on cpti_pair_codes (status, expires_at);

create unique index if not exists idx_cpti_pair_codes_share_token
  on cpti_pair_codes (share_token)
  where share_token is not null;

-- allow code reuse after expiration/block if needed, but only one active record per code
create unique index if not exists idx_cpti_pair_codes_active_code
  on cpti_pair_codes (code)
  where status = 'active';

drop trigger if exists trg_cpti_pair_codes_updated_at on cpti_pair_codes;
create trigger trg_cpti_pair_codes_updated_at
before update on cpti_pair_codes
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────
-- Matches
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_matches (
  id uuid primary key default gen_random_uuid(),
  pair_code_id uuid not null references cpti_pair_codes(id) on delete cascade,
  initiator_user_id uuid not null references cpti_users(id) on delete cascade,
  participant_user_id uuid not null references cpti_users(id) on delete cascade,
  participant_profile_snapshot_id uuid references cpti_profile_snapshots(id) on delete restrict,
  submit_source text not null check (submit_source in ('link', 'code_entry')),
  status cpti_match_status not null default 'started',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  client_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cpti_matches_pair_code_id
  on cpti_matches (pair_code_id);

create index if not exists idx_cpti_matches_initiator_participant
  on cpti_matches (initiator_user_id, participant_user_id, created_at desc);

create unique index if not exists idx_cpti_matches_pair_code_participant_dedupe
  on cpti_matches (pair_code_id, participant_user_id)
  where status in ('started', 'completed');

create unique index if not exists idx_cpti_matches_client_event_id
  on cpti_matches (client_event_id)
  where client_event_id is not null;

drop trigger if exists trg_cpti_matches_updated_at on cpti_matches;
create trigger trg_cpti_matches_updated_at
before update on cpti_matches
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────
-- Relationships
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_relationships (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references cpti_matches(id) on delete cascade,
  initiator_user_id uuid not null references cpti_users(id) on delete cascade,
  participant_user_id uuid not null references cpti_users(id) on delete cascade,
  initiator_profile_snapshot_id uuid not null references cpti_profile_snapshots(id) on delete restrict,
  participant_profile_snapshot_id uuid not null references cpti_profile_snapshots(id) on delete restrict,
  relationship_slug varchar(32) not null,
  relationship_tier cpti_relationship_tier not null,
  compatibility integer not null check (compatibility >= 0 and compatibility <= 100),
  visibility cpti_relationship_visibility not null default 'mutual',
  leaderboard_opt_in_initiator boolean not null default false,
  leaderboard_opt_in_participant boolean not null default false,
  public_card_opt_in_initiator boolean not null default false,
  public_card_opt_in_participant boolean not null default false,
  is_valid boolean not null default true,
  invalid_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cpti_relationships_initiator_user_id
  on cpti_relationships (initiator_user_id, created_at desc);

create index if not exists idx_cpti_relationships_participant_user_id
  on cpti_relationships (participant_user_id, created_at desc);

create index if not exists idx_cpti_relationships_slug_valid
  on cpti_relationships (relationship_slug, is_valid);

create index if not exists idx_cpti_relationships_tier_valid
  on cpti_relationships (relationship_tier, is_valid);

create index if not exists idx_cpti_relationships_visibility_valid
  on cpti_relationships (visibility, is_valid);

drop trigger if exists trg_cpti_relationships_updated_at on cpti_relationships;
create trigger trg_cpti_relationships_updated_at
before update on cpti_relationships
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────
-- Relationship events
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_relationship_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references cpti_relationships(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid references cpti_users(id) on delete set null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_cpti_relationship_events_relationship_id
  on cpti_relationship_events (relationship_id, created_at desc);

-- ───────────────────────────────────────────────────────────
-- User collection stats
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_user_collection_stats (
  user_id uuid primary key references cpti_users(id) on delete cascade,
  total_relationship_count integer not null default 0,
  unique_relationship_slug_count integer not null default 0,
  soul_count integer not null default 0,
  rare_count integer not null default 0,
  last_relationship_at timestamptz,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_cpti_user_collection_stats_updated_at on cpti_user_collection_stats;
create trigger trg_cpti_user_collection_stats_updated_at
before update on cpti_user_collection_stats
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────
-- Leaderboard snapshots
-- ───────────────────────────────────────────────────────────

create table if not exists cpti_leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  board_type cpti_leaderboard_type not null,
  period_type cpti_leaderboard_period not null,
  period_key varchar(16) not null,
  rank integer not null check (rank > 0),
  user_id uuid not null references cpti_users(id) on delete cascade,
  score numeric(10,2) not null,
  display_name varchar(32) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cpti_leaderboard_snapshots_board_period_rank
  on cpti_leaderboard_snapshots (board_type, period_type, period_key, rank);

create index if not exists idx_cpti_leaderboard_snapshots_user_id
  on cpti_leaderboard_snapshots (user_id, created_at desc);

-- ───────────────────────────────────────────────────────────
-- Convenience views
-- ───────────────────────────────────────────────────────────

create or replace view cpti_live_relationships as
select *
from cpti_relationships
where is_valid = true;

create or replace view cpti_leaderboard_candidates as
select
  u.id as user_id,
  coalesce(u.nickname, '') as nickname,
  s.total_relationship_count,
  s.unique_relationship_slug_count,
  s.soul_count,
  s.rare_count,
  s.last_relationship_at
from cpti_users u
join cpti_user_collection_stats s on s.user_id = u.id
where u.status = 'active';

