-- =============================================================
-- HERMOSA · 她的话｜2026-04-20 · 女性涂鸦黑板留言墙 + 共建提案
-- =============================================================
-- 模仿 soulti_wishes 的成熟 RLS 模式：anon 只读 published & 非 flagged。
-- 写入仍走 service_role（API 层做 rate limit + 关键词过滤）。
-- =============================================================

create table if not exists public.hermosa_messages (
  id            uuid primary key default gen_random_uuid(),
  -- 归属
  universe      text not null,            -- 'wtfti' | 'soulti' | 'cpti' | 'xpti' | 'hogti' | 'fanrenti' | 'mysti' | 'wtfcard' | 'meta'
  slug          text,                     -- 可空：可不绑定具体人格
  code          text,                     -- 可空：5-letter 或类似编码
  -- 内容
  text          text not null,
  signature     text,                     -- 可空匿名昵称 ≤24
  -- 结构化标签（共建信号），app 层校验枚举
  -- 当前 enum：'want' | 'feedback' | 'voice' | 'declare' | 'feature' | 'thanks'
  tags          text[] not null default '{}',
  -- 渲染版本（用于未来视觉模板演进）
  card_variant  text not null default 'blackboard-v1',
  -- 共鸣（无评论，仅计数）
  echo_count    int  not null default 0,
  -- 编辑甄选
  is_featured   boolean not null default false,
  featured_week text,                     -- 'YYYY-Www'
  -- 产品改进闭环
  status        text,                     -- null | 'heard' | 'planned' | 'shipped'
  status_note   text,
  -- 治理
  is_published  boolean not null default true,
  flagged       boolean not null default false,
  client_hash   text,
  created_at    timestamptz not null default now(),
  constraint hermosa_text_len      check (char_length(text) between 1 and 180),
  constraint hermosa_signature_len check (char_length(coalesce(signature, '')) <= 24)
);

-- 主墙读取索引：按宇宙 + 时间倒序
create index if not exists hermosa_universe_pub_idx
  on public.hermosa_messages (universe, created_at desc)
  where is_published = true and flagged = false;

-- 按人格读取
create index if not exists hermosa_slug_pub_idx
  on public.hermosa_messages (universe, slug, created_at desc)
  where is_published = true and flagged = false and slug is not null;

-- 编辑甄选墙
create index if not exists hermosa_featured_idx
  on public.hermosa_messages (featured_week desc, created_at desc)
  where is_featured = true and is_published = true and flagged = false;

-- 限流 + 后台审计（按 client_hash 查最近 1h）
create index if not exists hermosa_client_recent_idx
  on public.hermosa_messages (client_hash, created_at desc);

-- 后台标签聚合
create index if not exists hermosa_tags_gin
  on public.hermosa_messages using gin (tags);

alter table public.hermosa_messages enable row level security;

-- anon: 仅可读 published & 非 flagged
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_messages'
       and policyname = 'hermosa_anon_select'
  ) then
    create policy hermosa_anon_select on public.hermosa_messages
      for select
      to anon
      using (is_published = true and flagged = false);
  end if;
end$$;

-- anon: 兜底 insert（生产路径走 service_role；此策略仅作为"未来直连"的安全默认）
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_messages'
       and policyname = 'hermosa_anon_insert'
  ) then
    create policy hermosa_anon_insert on public.hermosa_messages
      for insert
      to anon
      with check (
        char_length(text) between 1 and 180
        and char_length(coalesce(signature, '')) <= 24
      );
  end if;
end$$;

-- 共鸣 +1 RPC：只允许 echo_count 自增 1，不暴露其它字段写权限
create or replace function public.increment_hermosa_echo(message_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update public.hermosa_messages
     set echo_count = echo_count + 1
   where id = message_id and is_published = true and flagged = false
  returning echo_count;
$$;

revoke all on function public.increment_hermosa_echo(uuid) from public;
grant execute on function public.increment_hermosa_echo(uuid) to anon, authenticated;

-- =============================================================
-- End of migration
-- =============================================================
