-- Treehole v1 (懂我) — evolve drift_bottles for private-by-default + AI reply + review-before-publish.
-- Additive. Safe to re-run.

alter table public.drift_bottles
  add column if not exists visibility text not null default 'private',
  add column if not exists ai_reply text,
  add column if not exists risk_level text not null default 'ok',
  add column if not exists also_me_count int not null default 0;

-- Visibility / risk check constraints (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'drift_bottles_visibility_check'
  ) then
    alter table public.drift_bottles
      add constraint drift_bottles_visibility_check
      check (visibility in ('private', 'public_pending', 'public'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'drift_bottles_risk_level_check'
  ) then
    alter table public.drift_bottles
      add constraint drift_bottles_risk_level_check
      check (risk_level in ('ok', 'self_harm', 'blocked'));
  end if;
end $$;

-- Widen content to 500 chars (drop prior length check if present).
do $$
declare
  cname text;
begin
  for cname in
    select conname from pg_constraint
    where conrelid = 'public.drift_bottles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%char_length(content)%'
  loop
    execute format('alter table public.drift_bottles drop constraint %I', cname);
  end loop;
  if not exists (
    select 1 from pg_constraint where conname = 'drift_bottles_content_len_check'
  ) then
    alter table public.drift_bottles
      add constraint drift_bottles_content_len_check
      check (char_length(content) between 1 and 500);
  end if;
end $$;

alter table public.drift_bottle_pickups
  add column if not exists also_me boolean not null default false;

create index if not exists drift_bottles_public_feed_idx
  on public.drift_bottles (created_at desc)
  where status = 'approved' and visibility = 'public';

create index if not exists drift_bottles_owner_vis_idx
  on public.drift_bottles (user_id, created_at desc);
