-- =============================================================
-- HER SALON · 她词条投稿池 ｜ 2026-05-08 · Q3 prep
-- =============================================================
-- 用途：为 Q3「她词条」开放共写预留投稿池。
-- 设计纪律：
--   * 投稿是编辑部 review 的入站口，不是公开信息流。
--   * published 可公开读；draft/review/rejected 一律不公开。
--   * contributor_hash / sigil_hash 只存匿名稳定标识，不存真实身份。
--   * 允许 anon/authenticated 直接投稿，但不能自行改状态。
-- =============================================================

create table if not exists public.atlas_submissions (
  id                uuid primary key default gen_random_uuid(),
  contributor_hash  text not null,
  sigil_hash        text,
  title             text not null,
  body_md           text not null,
  excerpt           text,
  cover_note        text,
  slug              text,
  source_topic_week text,
  status            text not null default 'review',
  ai_suspected      boolean not null default false,
  curator_note      text,
  publish_issue     text,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint atlas_submission_title_len
    check (char_length(title) between 1 and 80),
  constraint atlas_submission_body_len
    check (char_length(body_md) between 200 and 4000),
  constraint atlas_submission_excerpt_len
    check (excerpt is null or char_length(excerpt) <= 220),
  constraint atlas_submission_cover_note_len
    check (cover_note is null or char_length(cover_note) <= 120),
  constraint atlas_submission_status_valid
    check (status in ('draft', 'review', 'published', 'rejected')),
  constraint atlas_submission_slug_format
    check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint atlas_submission_topic_week_format
    check (source_topic_week is null or source_topic_week ~ '^[0-9]{4}-W[0-9]{2}$')
);

create unique index if not exists atlas_submissions_slug_idx
  on public.atlas_submissions (slug)
  where slug is not null;

create index if not exists atlas_submissions_status_idx
  on public.atlas_submissions (status, created_at desc);

create index if not exists atlas_submissions_issue_idx
  on public.atlas_submissions (publish_issue, published_at desc)
  where status = 'published';

create index if not exists atlas_submissions_contributor_idx
  on public.atlas_submissions (contributor_hash, created_at desc);

alter table public.atlas_submissions enable row level security;

-- 公共 atlas 页未来可直接读已发布条目；草稿永不公开。
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'atlas_submissions'
       and policyname = 'atlas_submissions_public_select_published'
  ) then
    create policy atlas_submissions_public_select_published on public.atlas_submissions
      for select
      to anon, authenticated
      using (status = 'published');
  end if;
end$$;

-- 投稿入口允许匿名写入，但不能自行声明已发布或写编辑字段。
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'atlas_submissions'
       and policyname = 'atlas_submissions_public_insert'
  ) then
    create policy atlas_submissions_public_insert on public.atlas_submissions
      for insert
      to anon, authenticated
      with check (
        status in ('draft', 'review')
        and curator_note is null
        and publish_issue is null
        and published_at is null
        and slug is null
        and char_length(title) between 1 and 80
        and char_length(body_md) between 200 and 4000
        and (excerpt is null or char_length(excerpt) <= 220)
        and (cover_note is null or char_length(cover_note) <= 120)
      );
  end if;
end$$;

create or replace function public.touch_atlas_submission_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists atlas_submissions_touch_updated_at on public.atlas_submissions;
create trigger atlas_submissions_touch_updated_at
  before update on public.atlas_submissions
  for each row
  execute function public.touch_atlas_submission_updated_at();

comment on table public.atlas_submissions is
  'HER SALON · 她词条投稿池。投稿进 review，published 才进入公开 atlas。';

comment on column public.atlas_submissions.contributor_hash is
  '匿名稳定投稿者标识；可由 client_hash 或 user_id 派生，不存真实身份。';

comment on column public.atlas_submissions.sigil_hash is
  '可选：投稿时绑定 Voice Sigil，用于后续编辑部发放上下文 motif。';