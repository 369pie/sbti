-- P1 Today Card streak (refocus §6 / §7). Additive; reward-only, no penalty.
alter table public.her_profiles
  add column if not exists last_visit_date date,
  add column if not exists streak_count integer not null default 0
    check (streak_count >= 0);
