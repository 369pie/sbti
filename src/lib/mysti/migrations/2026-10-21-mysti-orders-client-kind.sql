-- 2026-10-21 · additive only: coarse client type on new orders (wechat-inapp / ios / android / desktop …).
-- Raw UA is NOT stored. Existing rows stay NULL.
ALTER TABLE public.mysti_orders ADD COLUMN IF NOT EXISTS client_kind TEXT;
