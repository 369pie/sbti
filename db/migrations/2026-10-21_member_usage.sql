-- 全站会员 · per-feature monthly usage for AI (per-call cost) features.
-- Keyed by user_id + feature + month (Asia/Shanghai YYYY-MM). Written only by the
-- server (service_role) through consume_feature_quota(); idempotent; NOT run on prod
-- by the PR author. Until applied, the app fails open (no caps enforced) — see
-- src/lib/entitlements-server.ts.

create table if not exists public.member_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, feature, month)
);

alter table public.member_usage enable row level security;
drop policy if exists member_usage_service_all on public.member_usage;
create policy member_usage_service_all on public.member_usage
  for all to service_role using (true) with check (true);
revoke all on table public.member_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.member_usage to service_role;

-- Atomic check-and-increment. p_cap null = unlimited (still counted).
create or replace function public.consume_feature_quota(
  p_user_id uuid, p_feature text, p_month text, p_cap integer
) returns table (allowed boolean, used integer) as $$
declare v_used integer;
begin
  insert into public.member_usage (user_id, feature, month, used)
  values (p_user_id, p_feature, p_month, 0)
  on conflict (user_id, feature, month) do nothing;

  update public.member_usage m
     set used = m.used + 1, updated_at = now()
   where m.user_id = p_user_id and m.feature = p_feature and m.month = p_month
     and (p_cap is null or m.used < p_cap)
  returning m.used into v_used;

  if found then
    return query select true, v_used;
  else
    return query select false, (select m.used from public.member_usage m
      where m.user_id = p_user_id and m.feature = p_feature and m.month = p_month);
  end if;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.consume_feature_quota(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.consume_feature_quota(uuid, text, text, integer) to service_role;
