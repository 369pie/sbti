-- =============================================================
-- HER SALON · Sigil 事件审计表 ｜ 2026-05-08 · Q3 prep
-- =============================================================
-- 用途：记录 Voice Sigil 的上下文荣誉事件，而不把它退化为公开积分。
-- 设计纪律：
--   * 只存匿名 sigil_hash，不存真实身份。
--   * 事件是 append-only 审计，不在表内做排行榜聚合。
--   * 事件本身不意味着公开展示；是否展示由具体语境决定。
-- =============================================================

create table if not exists public.sigil_events (
  id          uuid primary key default gen_random_uuid(),
  sigil_hash  text not null references public.hermosa_sigils(sigil_hash) on delete cascade,
  event_type  text not null,
  context_key text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  constraint sigil_events_type_valid
    check (event_type in ('atlas_published', 'issue_included', 'resonance_reached', 'curator_granted')),
  constraint sigil_events_context_len
    check (context_key is null or char_length(context_key) <= 80)
);

create index if not exists sigil_events_hash_created_idx
  on public.sigil_events (sigil_hash, created_at desc);

create index if not exists sigil_events_type_created_idx
  on public.sigil_events (event_type, created_at desc);

alter table public.sigil_events enable row level security;

comment on table public.sigil_events is
  'Voice Sigil 上下文荣誉事件审计表。append-only，不用于公开排名。';