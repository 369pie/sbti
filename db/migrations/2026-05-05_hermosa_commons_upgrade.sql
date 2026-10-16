-- =============================================================
-- HERMOSA · Her Voice Commons Upgrade｜2026-05-05
-- =============================================================
-- Sprint 1 additive schema: structured contribution kinds, metadata,
-- weekly topics, consent, attribution, curation, and safety state.
-- =============================================================

alter table public.hermosa_messages
  add column if not exists kind text not null default 'voice',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists topic_week text,
  add column if not exists curation_status text not null default 'new',
  add column if not exists consent_to_feature boolean not null default false,
  add column if not exists attribution_mode text not null default 'anonymous',
  add column if not exists safety_level text not null default 'safe';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'hermosa_kind_valid'
       and conrelid = 'public.hermosa_messages'::regclass
  ) then
    alter table public.hermosa_messages
      add constraint hermosa_kind_valid
      check (kind in ('voice', 'book', 'ai_question', 'concept', 'feedback'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'hermosa_curation_status_valid'
       and conrelid = 'public.hermosa_messages'::regclass
  ) then
    alter table public.hermosa_messages
      add constraint hermosa_curation_status_valid
      check (curation_status in ('new', 'shortlisted', 'selected', 'published', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'hermosa_attribution_mode_valid'
       and conrelid = 'public.hermosa_messages'::regclass
  ) then
    alter table public.hermosa_messages
      add constraint hermosa_attribution_mode_valid
      check (attribution_mode in ('anonymous', 'signature', 'profile'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'hermosa_safety_level_valid'
       and conrelid = 'public.hermosa_messages'::regclass
  ) then
    alter table public.hermosa_messages
      add constraint hermosa_safety_level_valid
      check (safety_level in ('safe', 'review', 'blocked'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'hermosa_topic_week_format'
       and conrelid = 'public.hermosa_messages'::regclass
  ) then
    alter table public.hermosa_messages
      add constraint hermosa_topic_week_format
      check (topic_week is null or topic_week ~ '^[0-9]{4}-W[0-9]{2}$');
  end if;
end$$;

create index if not exists hermosa_kind_pub_idx
  on public.hermosa_messages (kind, created_at desc)
  where is_published = true and flagged = false and safety_level <> 'blocked';

create index if not exists hermosa_topic_kind_pub_idx
  on public.hermosa_messages (topic_week, kind, created_at desc)
  where is_published = true and flagged = false and safety_level <> 'blocked';

create index if not exists hermosa_curation_idx
  on public.hermosa_messages (curation_status, created_at desc);

do $$
begin
  if exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_messages'
       and policyname = 'hermosa_anon_select'
  ) then
    alter policy hermosa_anon_select on public.hermosa_messages
      using (is_published = true and flagged = false and safety_level <> 'blocked');
  else
    create policy hermosa_anon_select on public.hermosa_messages
      for select
      to anon
      using (is_published = true and flagged = false and safety_level <> 'blocked');
  end if;
end$$;

do $$
begin
  if exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_messages'
       and policyname = 'hermosa_anon_insert'
  ) then
    alter policy hermosa_anon_insert on public.hermosa_messages
      with check (
        char_length(text) between 1 and 180
        and char_length(coalesce(signature, '')) <= 24
        and kind in ('voice', 'book', 'ai_question', 'concept', 'feedback')
        and curation_status in ('new', 'shortlisted', 'selected', 'published', 'rejected')
        and attribution_mode in ('anonymous', 'signature', 'profile')
        and safety_level in ('safe', 'review', 'blocked')
      );
  else
    create policy hermosa_anon_insert on public.hermosa_messages
      for insert
      to anon
      with check (
        char_length(text) between 1 and 180
        and char_length(coalesce(signature, '')) <= 24
        and kind in ('voice', 'book', 'ai_question', 'concept', 'feedback')
        and curation_status in ('new', 'shortlisted', 'selected', 'published', 'rejected')
        and attribution_mode in ('anonymous', 'signature', 'profile')
        and safety_level in ('safe', 'review', 'blocked')
      );
  end if;
end$$;

create or replace function public.increment_hermosa_echo(message_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update public.hermosa_messages
     set echo_count = echo_count + 1
   where id = message_id
     and is_published = true
     and flagged = false
     and safety_level <> 'blocked'
  returning echo_count;
$$;

revoke all on function public.increment_hermosa_echo(uuid) from public;
grant execute on function public.increment_hermosa_echo(uuid) to anon, authenticated;

-- =============================================================
-- End of migration
-- =============================================================
