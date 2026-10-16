-- =============================================================
-- WTFTI · 2026-08-16d · Star Spirit V0（星灵养成 · docs/01-strategy/star-spirit-nurture-strategy-2026-08.md）
-- =============================================================
-- 两张表：状态表（每用户一行）+ 星尘流水（append-only ledger）。
-- 护栏（提案 §2.1 修订版）：不设死亡/饥饿；成长不与付费挂钩。
-- Idempotent. Safe to re-run.
-- =============================================================

-- ---------- 1) wtfti_star_spirits ----------
create table if not exists public.wtfti_star_spirits (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  name            text,                          -- 用户命名（null = 未命名，显示「星灵」）
  personality_slug text,                         -- 出生人格（首次 earn 时随请求落档）
  growth          int not null default 0,        -- 成长值（浇灌累积；决定阶段）
  stardust        int not null default 0,        -- 当前星尘余额（光点罐）
  streak_nights   int not null default 0,        -- 连续浇灌夜数（断签自然归零，无惩罚文案）
  last_watered_date date,                        -- 最近浇灌日期（每日 1 次）
  earned_date     date,                          -- 星尘获取所属日（每日上限 10 判定）
  earned_today    int not null default 0,        -- 当日已获取
  born_at         timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.wtfti_star_spirits enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_star_spirits'
       and policyname = 'wtfti_star_spirits_owner_all'
  ) then
    create policy wtfti_star_spirits_owner_all on public.wtfti_star_spirits
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- ---------- 2) wtfti_star_dust_events ----------
create table if not exists public.wtfti_star_dust_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null check (source in ('today','card','mood','letter','moon','duet','bonus')),
  amount      int not null,                      -- 正=获取；浇灌消耗记 amount=1, source='bonus'? 否——消耗不入流水，余额以状态表为准
  created_at  timestamptz not null default now()
);

create index if not exists wtfti_star_dust_events_user_idx
  on public.wtfti_star_dust_events (user_id, created_at desc);

alter table public.wtfti_star_dust_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'wtfti_star_dust_events'
       and policyname = 'wtfti_star_dust_events_owner_all'
  ) then
    create policy wtfti_star_dust_events_owner_all on public.wtfti_star_dust_events
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- =============================================================
-- End of migration
-- =============================================================
