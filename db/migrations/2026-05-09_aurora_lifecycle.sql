-- =============================================================
-- HER AURORA · 极光生命周期｜2026-05-09 · W3 平台级身份层
-- =============================================================
-- 给 hermosa_messages 加 5 态生命周期字段：
--   lit       一束光被点亮（默认值，等同旧 published）
--   caught    被另一位匿名同光者「我也」接住
--   tended    被守光人挂念（admin 标记）
--   inscribed 已收入某号「极光来信」
--   codex     已列入「极光星图」词条
--
-- 配合 aurora 升级方案 § 6.2.1 (E-N4 · DB schema 增量)。
-- 字段全可空 / 有默认值，向后兼容旧数据。
-- =============================================================

alter table public.hermosa_messages
  add column if not exists lifecycle text not null default 'lit'
    check (lifecycle in ('lit','caught','tended','inscribed','codex')),
  add column if not exists tended_at timestamptz,
  add column if not exists inscribed_letter_slug text,   -- 收入哪号来信，如 '2026-05'
  add column if not exists codex_atlas_slug text;        -- 收入哪个星图词条 slug

-- 状态查询索引：按生命周期 + 创建时间倒序（管理后台 / 守光人挂念列表 / 已入卷列表）
create index if not exists hermosa_messages_lifecycle_idx
  on public.hermosa_messages (lifecycle, created_at desc);

-- 反向索引：通过来信号或星图词条找出所有被收录的光
create index if not exists hermosa_messages_inscribed_letter_idx
  on public.hermosa_messages (inscribed_letter_slug)
  where inscribed_letter_slug is not null;

create index if not exists hermosa_messages_codex_atlas_idx
  on public.hermosa_messages (codex_atlas_slug)
  where codex_atlas_slug is not null;

-- 数据迁移：把旧的 echo_count > 0 的光自动升级为 caught
-- （saved 同一束光至少被一束接住才算 caught；is_featured 的另算 tended）
update public.hermosa_messages
   set lifecycle = 'caught'
 where lifecycle = 'lit'
   and echo_count > 0
   and is_featured = false;

update public.hermosa_messages
   set lifecycle = 'tended',
       tended_at = coalesce(tended_at, now())
 where lifecycle in ('lit', 'caught')
   and is_featured = true;
