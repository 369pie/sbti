-- =============================================================
-- HERMOSA · 她说·沙龙｜2026-05-08 · Whisper 双盲投递记录
-- =============================================================
-- 项目方点击 talent 卡片上的"发起 Whisper" → POST /api/hermosa/whisper
-- 服务端：
--   1) 校验 talent 仍 published & 在岗
--   2) 校验 Whisper 表单：发起方邮箱 + 一句话需求
--   3) 通过 Resend 把 talent 的 contact_email 当 to，伪装 reply_to=发起方邮箱
--   4) 在本表写入一条记录（不存正文，只存元数据）用于反垃圾 + 数据闭环
-- =============================================================

create table if not exists public.hermosa_whispers (
  id            uuid primary key default gen_random_uuid(),
  talent_id     uuid not null references public.hermosa_talents(id) on delete cascade,

  -- 发起方（项目方）
  sender_email  text not null,
  sender_handle text,                          -- 自报昵称（可空，≤ 24）
  brief_len     int  not null,                 -- 一句话需求字数（不存正文，仅审计）
  budget_band   text,                          -- 'free'|'<1k'|'1k-5k'|'5k-20k'|'20k+'|'flex'

  -- 治理
  client_hash   text,
  delivered     boolean not null default false,
  deliver_error text,
  flagged       boolean not null default false,
  created_at    timestamptz not null default now(),

  constraint hermosa_whisper_email_len  check (char_length(sender_email)  between 5 and 120),
  constraint hermosa_whisper_handle_len check (sender_handle is null or char_length(sender_handle) <= 24),
  constraint hermosa_whisper_brief_len  check (brief_len between 1 and 280)
);

-- 限频：按 client_hash 看最近 1h
create index if not exists hermosa_whispers_client_recent_idx
  on public.hermosa_whispers (client_hash, created_at desc);

-- 按 talent 聚合（"被询问几次"）
create index if not exists hermosa_whispers_talent_idx
  on public.hermosa_whispers (talent_id, created_at desc);

alter table public.hermosa_whispers enable row level security;
-- 默认 anon 无任何策略 = 只能 service_role 读写。

-- =============================================================
-- End of migration
-- =============================================================
