-- P2 美我 / 掌纹：季型标签、掌纹摘要、脸型 flag、换装免费额度（additive）
alter table public.her_profiles
  add column if not exists color_season text,
  add column if not exists palm_summary jsonb,
  add column if not exists has_face boolean not null default false,
  add column if not exists try_on_month text,
  add column if not exists try_on_free_used integer not null default 0
    check (try_on_free_used >= 0);

comment on column public.her_profiles.color_season is 'e.g. 冷夏 / 暖春 — drives Today lucky color';
comment on column public.her_profiles.palm_summary is 'Last palm reading JSON (no photo); includes fingerprint for same-hand replay';
comment on column public.her_profiles.has_face is 'Face-shape / makeup advice completed';
comment on column public.her_profiles.try_on_month is 'Asia/Shanghai YYYY-MM for freemium try-on window';
comment on column public.her_profiles.try_on_free_used is 'Free static try-on uses in try_on_month (cap 3)';
