-- =============================================================
-- HER SALON · 围炉本周主题表 · 2026-05-08 · W2
-- =============================================================
-- 用途：编辑部周更"围炉主题"。每周一条主题成为 SALON 第一层入口，
-- 也驱动首页 TODAY 模块的「今日围炉」提示。
--
-- 设计：
--  - 主键 week_code（YYYY-Www）天然去重一周一条。
--  - 题目本体 ≤ 80 字（适配卡片）。
--  - eyebrow 为编辑部 mono 小字（如「W19 · 谷雨之后」）。
--  - 备选 prompts 为 italic 引子的备选文案，前端按 client_hash 抽。
--  - 节气/水逆等命理日历联动靠 calendar_tag 字段（v0 string，v1 再做枚举）。
--  - is_published 控制是否公开露出，未发布的草稿允许 admin 提前排进。
-- =============================================================

create table if not exists public.hermosa_topics (
  week_code     text primary key,             -- 'YYYY-Www'，每周一条
  title         text not null,                -- 主题题目，≤80 字
  eyebrow       text,                          -- mono 小字 eyebrow
  prompts       text[] not null default '{}', -- italic 引子备选 ≤ 6 条
  calendar_tag  text,                          -- 'guyu' | 'mercury_retro' | 'full_moon' | …
  pillar_link   text,                          -- 'i_know_her' | 'ii_walk_with_her' | 'iii_write_with_her'
  notes         text,                          -- 编辑部备注
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint hermosa_topic_week_format
    check (week_code ~ '^[0-9]{4}-W[0-9]{2}$'),
  constraint hermosa_topic_title_len check (char_length(title) between 1 and 80),
  constraint hermosa_topic_eyebrow_len check (char_length(coalesce(eyebrow, '')) <= 40)
);

create index if not exists hermosa_topics_published_idx
  on public.hermosa_topics (week_code desc)
  where is_published = true;

alter table public.hermosa_topics enable row level security;

-- anon: 仅可读 published
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_topics'
       and policyname = 'hermosa_topics_anon_select'
  ) then
    create policy hermosa_topics_anon_select on public.hermosa_topics
      for select
      to anon
      using (is_published = true);
  end if;
end$$;

-- 写权限走 service_role（admin API 入口）。不暴露 anon insert/update。

-- updated_at 自动更新
create or replace function public.touch_hermosa_topic_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists hermosa_topics_touch_updated_at on public.hermosa_topics;
create trigger hermosa_topics_touch_updated_at
  before update on public.hermosa_topics
  for each row
  execute function public.touch_hermosa_topic_updated_at();
