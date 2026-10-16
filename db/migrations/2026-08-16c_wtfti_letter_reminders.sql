-- =============================================================
-- WTFTI · 2026-08-16c · Stardust letter email reminders (Phase B)
-- =============================================================
-- D30 信件到期邮件提醒（触达通道第一优先场景，调研文档 §4.3 Phase B）。
-- 用户封缄信件后可选留邮箱 → 到期日由 cron 发送拆信提醒。
--
-- Security model: 与 soul_letter_subscriptions 相同 — 无 anon/authenticated
-- 策略，service_role only。写入走 /api/wtfti/letter-reminder（用户态鉴权后
-- 由服务端以 service role 落库）；发送走 /api/wtfti/letters/remind cron。
-- Idempotent. Safe to re-run.
-- =============================================================

create table if not exists public.wtfti_letter_reminders (
  id            uuid primary key default gen_random_uuid(),
  letter_id     text not null unique,          -- wtfti_letters.id（sealed/retest/future）
  user_id       uuid not null references auth.users(id) on delete cascade,
  email         text not null,
  due_at        timestamptz not null,          -- 信件到期时刻（封信时快照）
  sent_at       timestamptz,                   -- null = 待发送
  cancelled     boolean not null default false,
  last_error    text,
  failure_count int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists wtfti_letter_reminders_due_idx
  on public.wtfti_letter_reminders (due_at)
  where sent_at is null and cancelled = false;

-- =============================================================
-- End of migration
-- =============================================================
