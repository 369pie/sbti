# P0 漏斗闸门 · 埋点与查询 · 2026-10

> 依据：[wtfti-her-refocus-2026-10.md](./wtfti-her-refocus-2026-10.md) §7  
> 闸门：**访问 → 测完 → 建档 → 开提醒**

## 四步事件

| 步骤 | event | module | 触发点 |
|---|---|---|---|
| 1 访问 | `home_view` | `home` | `/` `HomeTracker` |
| 2 测完 | `first_look_finish` | `home` | `/start` 三题完成（同时仍发 `onboarding_complete`） |
| 3 建档 | `archive_created` | `auth` | 注册成功（同时仍发 `register_complete`）；服务端 upsert `her_profiles` |
| 4 开提醒 | `push_enabled` | `home` | `DailyReminderToggle` 订阅成功 |

CTA 点击另有 `home_cta_click`（`data-track`），不计入闸门四步，但可用于诊断首页流失。

## 只读 SQL 示例（Supabase `product_events`）

```sql
-- 近 7 日四步漏斗（按独立 session_id）
with window as (
  select *
  from product_events
  where created_at >= now() - interval '7 days'
    and event in ('home_view', 'first_look_finish', 'archive_created', 'push_enabled')
)
select
  count(distinct session_id) filter (where event = 'home_view') as visit,
  count(distinct session_id) filter (where event = 'first_look_finish') as finish_test,
  count(distinct session_id) filter (where event = 'archive_created') as archive,
  count(distinct session_id) filter (where event = 'push_enabled') as reminder
from window;
```

## 运维前置

1. 在目标库执行：
   - `db/migrations/2026-10-17_push_subscriptions.sql`
   - `db/migrations/2026-10-17_her_profiles.sql`
2. Vercel / `.env` 设置 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`。
3. Cron：`GET /api/push/dispatch`（`vercel.json`，每日一次）。
