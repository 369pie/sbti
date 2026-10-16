-- =============================================================
-- Drift Bottles · 漂流瓶 MVP（P1 · wtfti-mass-market-repositioning-2026-08.md §4）
-- =============================================================
-- 匿名扔瓶 + 每日捞 3 个 + 回一句/抱抱。捞瓶需完成过测试（Soul 逻辑）。
-- 内容安全（生死线）：状态机 pending→approved/rejected，MVP 用服务端
-- 关键词过滤机器审，人工抽审走 admin（后续）。深夜限流在 API 层。
-- Idempotent. Safe to re-run.
-- =============================================================

create table if not exists public.drift_bottles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,   -- 扔瓶人（匿名身份即可）
  content      text not null check (char_length(content) between 1 and 100),
  persona_tag  text,                          -- 附带的梗人格标签（如「疯TI · 死者」）
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  hug_count    int not null default 0,
  reply_count  int not null default 0,
  pickup_count int not null default 0,
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);

create index if not exists drift_bottles_pickup_pool_idx
  on public.drift_bottles (created_at desc)
  where status = 'approved' and pickup_count < 20;

create index if not exists drift_bottles_owner_idx
  on public.drift_bottles (user_id, created_at desc);

alter table public.drift_bottles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'drift_bottles'
       and policyname = 'drift_bottles_owner_all'
  ) then
    create policy drift_bottles_owner_all on public.drift_bottles
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- 捞瓶记录（同一瓶同一人只捞一次；liked 即「抱抱」）
create table if not exists public.drift_bottle_pickups (
  id         uuid primary key default gen_random_uuid(),
  bottle_id  uuid not null references public.drift_bottles(id) on delete cascade,
  picker_id  uuid not null references auth.users(id) on delete cascade,
  liked      boolean not null default false,
  created_at timestamptz not null default now(),
  unique (bottle_id, picker_id)
);

create index if not exists drift_bottle_pickups_picker_idx
  on public.drift_bottle_pickups (picker_id, created_at desc);

alter table public.drift_bottle_pickups enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'drift_bottle_pickups'
       and policyname = 'drift_bottle_pickups_owner_all'
  ) then
    create policy drift_bottle_pickups_owner_all on public.drift_bottle_pickups
      for all to authenticated
      using (auth.uid() = picker_id)
      with check (auth.uid() = picker_id);
  end if;
end$$;

-- 回复（同样过审）
create table if not exists public.drift_bottle_replies (
  id         uuid primary key default gen_random_uuid(),
  bottle_id  uuid not null references public.drift_bottles(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 100),
  status     text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists drift_bottle_replies_bottle_idx
  on public.drift_bottle_replies (bottle_id, created_at desc)
  where status = 'approved';

alter table public.drift_bottle_replies enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'drift_bottle_replies'
       and policyname = 'drift_bottle_replies_owner_all'
  ) then
    create policy drift_bottle_replies_owner_all on public.drift_bottle_replies
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- =============================================================
-- End of migration
-- =============================================================

-- 追加（2026-08-16 E2E 修复）：replies 补 reviewed_at（与 bottles 审核语义对齐）
alter table public.drift_bottle_replies add column if not exists reviewed_at timestamptz;
