-- Daily 今日卡 email opt-in (refocus P0 §6.1). Additive.
alter table public.her_profiles add column if not exists email_daily boolean not null default false;
alter table public.her_profiles add column if not exists email_daily_last_sent_at timestamptz;
alter table public.her_profiles add column if not exists email_unsub_token uuid not null default gen_random_uuid();
create unique index if not exists her_profiles_email_unsub_token_idx on public.her_profiles(email_unsub_token);
