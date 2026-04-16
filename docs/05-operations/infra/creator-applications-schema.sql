-- Creator applications table for WTFTI creator beta funnel.
-- Run this in Supabase SQL editor before using /api/creator-applications.

create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  wechat_id text,
  xiaohongshu_handle text,
  content_vertical text,
  wants_free boolean not null default true,
  wants_paid boolean not null default false,
  intro text,
  source_page text,
  status text not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_applications_status_check check (
    status in ('new', 'contacted', 'qualified', 'approved', 'rejected', 'archived')
  )
);

create index if not exists creator_applications_created_at_idx
  on public.creator_applications (created_at desc);

create index if not exists creator_applications_status_idx
  on public.creator_applications (status);

create index if not exists creator_applications_email_idx
  on public.creator_applications (email);

create index if not exists creator_applications_wechat_idx
  on public.creator_applications (wechat_id);

-- Optional: lock down direct client access and force server-side API usage.
alter table public.creator_applications enable row level security;

-- Deny anonymous direct reads/writes by default (safe baseline).
-- Insert/update/select should be performed through server route with service role key.
