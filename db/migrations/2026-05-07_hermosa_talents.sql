-- =============================================================
-- HERMOSA · 她说·沙龙｜2026-05-07 · Talent 档案（W1: Talent Toggle）
-- =============================================================
-- 主墙保持博物馆纯净度（不评论 / 不私信 / 不热度榜），
-- 把"我接单"能力沉到第二层 Talent 档案表里。
--
-- 设计原则：
-- - 无账号 / 浏览器本地驱动：用 talent_id（uuid）+ edit_token 做编辑权限。
-- - 写入走 service_role（API 层负责 client_hash 限频 + 字段清洗）。
-- - anon 只读 published。
-- - 与 hermosa_messages 解耦（不 join）；通过 client_hash 软关联以备后续解锁阈值。
-- =============================================================

create table if not exists public.hermosa_talents (
  id              uuid primary key default gen_random_uuid(),

  -- 公开身份
  handle          text not null,             -- 显示昵称（≤ 24）
  pitch           text not null,             -- 一句话介绍（≤ 140）
  skills          text[] not null default '{}', -- ≤ 3 个标签 / 每个 ≤ 12 字
  universe        text,                       -- 可空：来自哪个测试宇宙
  slug            text,                       -- 可空：人格 slug

  -- 联系方式（永远不公开 / 仅服务端持有；前端只暴露"曾经"和"是否可联系"布尔值）
  contact_email   text,                       -- 双盲 Whisper 投递目标
  contact_note    text,                       -- 项目方看到的接活时段/语言偏好等（可空）

  -- 状态
  is_open_to_collab boolean not null default true,  -- "营业中" toggle
  is_published      boolean not null default true,  -- 站点可见
  flagged           boolean not null default false, -- 后台下线
  curation_status   text not null default 'pending', -- 'pending'|'reviewed'|'spotlighted'|'rejected'

  -- 治理与归属
  edit_token      text not null,                -- 浏览器持有；编辑/删除凭证（≥ 32 字符随机串）
  client_hash     text,                          -- 限频 + 反垃圾
  source_msg_id   uuid references public.hermosa_messages(id) on delete set null,

  -- 时间
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint hermosa_talent_handle_len check (char_length(handle) between 1 and 24),
  constraint hermosa_talent_pitch_len  check (char_length(pitch)  between 1 and 140),
  constraint hermosa_talent_skills_len check (array_length(skills, 1) is null or array_length(skills, 1) <= 3),
  constraint hermosa_talent_email_len  check (contact_email is null or char_length(contact_email) <= 120),
  constraint hermosa_talent_note_len   check (contact_note  is null or char_length(contact_note) <= 80)
);

-- 公开名录索引：按 collab 状态 + 创建时间倒序
create index if not exists hermosa_talents_open_idx
  on public.hermosa_talents (is_open_to_collab, created_at desc)
  where is_published = true and flagged = false;

-- 限流与去重
create index if not exists hermosa_talents_client_recent_idx
  on public.hermosa_talents (client_hash, created_at desc);

-- 技能标签搜索
create index if not exists hermosa_talents_skills_gin
  on public.hermosa_talents using gin (skills);

-- updated_at 自动维护
create or replace function public.touch_hermosa_talents_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists hermosa_talents_touch_updated_at on public.hermosa_talents;
create trigger hermosa_talents_touch_updated_at
  before update on public.hermosa_talents
  for each row execute function public.touch_hermosa_talents_updated_at();

alter table public.hermosa_talents enable row level security;

-- anon: 只读 published & 非 flagged & 在岗
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_talents'
       and policyname = 'hermosa_talents_anon_select'
  ) then
    create policy hermosa_talents_anon_select on public.hermosa_talents
      for select
      to anon
      using (is_published = true and flagged = false);
  end if;
end$$;

-- =============================================================
-- End of migration
-- =============================================================
