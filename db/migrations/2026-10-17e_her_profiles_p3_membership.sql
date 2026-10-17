-- P3 会员：¥19/月 → her_profiles 权威字段（不做暗黑自动续费）
alter table public.her_profiles
  add column if not exists is_member boolean not null default false,
  add column if not exists member_expires_at timestamptz;

comment on column public.her_profiles.is_member is 'P3 membership flag; true only while member_expires_at > now() (app also re-checks expiry)';
comment on column public.her_profiles.member_expires_at is 'Membership end (timestamptz). Renewals stack by extending this timestamp. No auto-renew.';

create index if not exists her_profiles_member_expires_idx
  on public.her_profiles (member_expires_at)
  where is_member = true;
