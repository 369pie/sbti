-- Her archive (「她的档案」) — refocus P0 §7. Minimal stub for birth_year + completeness.
create table if not exists public.her_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_year integer,
  nickname text,
  completeness_pct integer not null default 10 check (completeness_pct >= 0 and completeness_pct <= 100),
  has_persona boolean not null default false,
  has_color_season boolean not null default false,
  has_palm boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists her_profiles_birth_year_idx on public.her_profiles(birth_year);

alter table public.her_profiles enable row level security;

-- Owner can read own row; writes go through service-role API routes.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'her_profiles' and policyname = 'her_profiles_select_own'
  ) then
    create policy her_profiles_select_own on public.her_profiles
      for select using (auth.uid() = user_id);
  end if;
end $$;
