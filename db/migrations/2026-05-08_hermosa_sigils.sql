-- =============================================================
-- HER SALON · Voice Sigil 持久化 ｜ 2026-05-08 · W3 closure / W4 prep
-- =============================================================
-- 把每个匿名「她」的印记演化轨迹存下来。
-- 设计纪律：
--   * 永远只用 sigil_hash 作主键（服务端从 client_hash 派生），
--     绝不存可反推身份的字段。
--   * level 0..4：第 1 / 7 / 27 / 81 / 243 句点亮一层。
--   * palette / orbit_layers 由生成器产出后回写，避免每次重新计算。
--   * 不写"积分""成就""排行榜"——这是被陪伴的痕迹，不是 KPI。
-- =============================================================

create table if not exists public.hermosa_sigils (
  sigil_hash    text primary key,
  level         smallint not null default 0,
  -- 印记基本元数据
  palette       smallint not null default 0,    -- 调色板索引 0..4
  orbit_layers  smallint not null default 1,    -- 当前轨道层数 = level + 1
  -- 生命周期
  message_count int  not null default 0,        -- 累计留言条数（含主帖 + 接力）
  first_seen_at timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint sigils_level_range check (level between 0 and 4),
  constraint sigils_palette_range check (palette between 0 and 4),
  constraint sigils_orbit_range check (orbit_layers between 1 and 5)
);

create index if not exists hermosa_sigils_updated_idx
  on public.hermosa_sigils (updated_at desc);

create index if not exists hermosa_sigils_level_idx
  on public.hermosa_sigils (level desc, updated_at desc);

alter table public.hermosa_sigils enable row level security;

-- 不开放 public select/list；需要展示时走服务端按 sigil_hash 精确读取。

-- updated_at 自动维护
create or replace function public.touch_hermosa_sigil_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_touch_hermosa_sigil on public.hermosa_sigils;
create trigger trg_touch_hermosa_sigil
  before update on public.hermosa_sigils
  for each row execute procedure public.touch_hermosa_sigil_updated_at();

comment on table public.hermosa_sigils is
  'Voice Sigil 持久化：每个匿名 sigil_hash 一行。仅服务端写入和按 hash 查询。';
