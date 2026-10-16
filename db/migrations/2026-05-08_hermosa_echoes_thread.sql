-- =============================================================
-- HER SALON · 第二层「接力」｜2026-05-08 · W4 · E4.2
-- =============================================================
-- 给每条 hermosa_messages 留言挂一条"我也"接龙。
-- 设计纪律：
--   * 不是评论。每条 reply 也只是一句话（≤120 字）。
--   * 没有点赞、没有 @、没有线程化树。只有一根金箔细线。
--   * 写入用 service_role；anon 只读。
--   * 通过 sigil_hash 复用 W3 VoiceSigil（持续印记），不暴露真实身份。
-- =============================================================

create table if not exists public.hermosa_echoes_thread (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references public.hermosa_messages(id) on delete cascade,
  -- 接龙内容
  text          text not null,
  signature     text,                 -- 可空匿名昵称
  sigil_hash    text not null,        -- 用于 <VoiceSigil />；服务端用 client_hash + salt 生成
  -- 治理
  is_published  boolean not null default true,
  flagged       boolean not null default false,
  client_hash   text,
  created_at    timestamptz not null default now(),
  constraint echoes_thread_text_len      check (char_length(text) between 1 and 120),
  constraint echoes_thread_signature_len check (char_length(coalesce(signature, '')) <= 24)
);

-- 主读取：按 parent_id + 时间正序（先来先排）
create index if not exists echoes_thread_parent_idx
  on public.hermosa_echoes_thread (parent_id, created_at asc)
  where is_published = true and flagged = false;

-- 限流 + 审计
create index if not exists echoes_thread_client_idx
  on public.hermosa_echoes_thread (client_hash, created_at desc);

alter table public.hermosa_echoes_thread enable row level security;

-- anon: 仅可读 published & 非 flagged
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_echoes_thread'
       and policyname = 'echoes_thread_anon_select'
  ) then
    create policy echoes_thread_anon_select on public.hermosa_echoes_thread
      for select
      to anon
      using (is_published = true and flagged = false);
  end if;
end$$;

-- anon insert 兜底：要求字数和签名长度合规；同样不开放编辑/删除
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'hermosa_echoes_thread'
       and policyname = 'echoes_thread_anon_insert'
  ) then
    create policy echoes_thread_anon_insert on public.hermosa_echoes_thread
      for insert
      to anon
      with check (
        char_length(text) between 1 and 120
        and char_length(coalesce(signature, '')) <= 24
        and char_length(sigil_hash) between 4 and 64
      );
  end if;
end$$;

comment on table  public.hermosa_echoes_thread is 'HER SALON · 第二层接力链。每条留言下一根细线，最多前端折叠 5-7 条。';
comment on column public.hermosa_echoes_thread.sigil_hash is '稳定哈希（client_hash + salt），用于 <VoiceSigil /> 演化；服务端写入时生成。';
