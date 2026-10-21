# P0 漏斗闸门 · 埋点与查询 · 2026-10

> 依据：[wtfti-her-refocus-2026-10.md](./wtfti-her-refocus-2026-10.md) §7  
> 闸门（2026-10-20 审计 Phase 1 起）：**访问 → 开测 → 测完 → 建档 → 开提醒**
> 依据：[wtfti-global-audit-2026-10-20.md](./wtfti-global-audit-2026-10-20.md) §4.4 阶段 1。旧口径 `first_look_finish`（/start 三题分流）已作废：/start 改为测试大厅，不再有分流题。

## 五步事件

| 步骤 | event | module | 触发点 |
|---|---|---|---|
| 1 访问 | `home_view` | `home` | `/` `HomeTracker`（首页「90 秒测」直达 `/test/`；点击另发 `home_cta_click`） |
| 2 开测 | `test_start` | `test` | 任一测试的第 1 题出现：首测 `/test/`、SoulTI、XPTI 单人、XPTI 情侣（受邀方）、CPTI、经典 SBTI、WTFTI、塔罗（Quiz mysti 模式 / `/mysti/` 洗牌）。注意：`/mysti/daily/` 每日一牌不是测试，不发 test_start/test_finish（仅保留其自有 mysti_daily_* 事件） |
| 3 测完 | `test_finish` | `test` | 结果算出、跳结果页前。`props.test_id`、`props.result_key`（同时写入 `slug`），`value`=耗时 ms（首测） |
| 4 建档 | `archive_created` | `home` | 结果页一键建档（可匿名，`props.mode`=anonymous/claimed，`props.test_id`/`result_key`=存进档案的测试）或未建档设备注册成功 |
| 5 开提醒 | `push_enabled` | `home` | `DailyReminderToggle` 订阅成功 |

`test_id` 取值：`first_look` · `soulti` · `xpti` · `xpti_couple` · `cpti` · `cpti_peer` · `cpti_stealth` · `classic` · `wtfti` · `mysti` · `mysti_reading` · `mysti_daily`。
旧的模块事件（`first_look_finish`、`soulti_finish`、`couple_completed`、`mysti_test_complete`…）照常上报，仅作诊断。

### 疑似 bot

`/api/events/ingest` 现在会：客户端没带 `ua` 时用请求头 `User-Agent` 推断浏览器族；请求头为空写 `ua='empty'`、命中爬虫特征写 `ua='bot'`，两者都在 `props.likely_bot=true`。统计真实用户时排除：`coalesce((props->>'likely_bot')::boolean, false) = false`。

## 只读 SQL 示例（Supabase `product_events`，时间列是 `ts`，没有 `created_at`）

```sql
-- 近 7 日五步漏斗（按设备，排除疑似 bot）
with w as (  -- 注意：window 是 Postgres 保留字，不能做 CTE 名
  select *, coalesce(device_id, session_id) as dev
  from product_events
  where ts >= now() - interval '7 days'
    and event in ('home_view', 'test_start', 'test_finish', 'archive_created', 'push_enabled')
    and coalesce((props->>'likely_bot')::boolean, false) = false
)
select
  count(distinct dev) filter (where event = 'home_view')       as visit,
  count(distinct dev) filter (where event = 'test_start')      as start_test,
  count(distinct dev) filter (where event = 'test_finish')     as finish_test,
  count(distinct dev) filter (where event = 'archive_created') as archive,
  count(distinct dev) filter (where event = 'push_enabled')    as reminder
from w;

-- 哪个测试被做完
select props->>'test_id' as test_id,
       count(distinct coalesce(device_id, session_id)) filter (where event = 'test_start')  as starts,
       count(distinct coalesce(device_id, session_id)) filter (where event = 'test_finish') as finishes
from product_events
where ts >= now() - interval '7 days' and event in ('test_start', 'test_finish')
group by 1 order by finishes desc;
```

## 运维前置

1. 在目标库执行：
   - `db/migrations/2026-10-17_push_subscriptions.sql`
   - `db/migrations/2026-10-17_her_profiles.sql`
2. Vercel / `.env` 设置 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`。
3. Cron：`GET /api/push/dispatch`（`vercel.json`，每日一次）。

## 次日留存 SQL（2026-10-21 新增，B12）

口径：`product_events`，按 Asia/Shanghai 自然日计算，排除 `ua='bot'`，用 `device_id` 去重。D0 = 设备首次出现的日期。

```sql
-- 按首访日 cohort 统计 D1（次日）和 D7（第 7 天）回访率
with first_seen as (
  select device_id, min((ts at time zone 'Asia/Shanghai')::date) as d0
  from product_events
  where ua <> 'bot' and device_id is not null
  group by 1
),
active as (
  select distinct device_id, (ts at time zone 'Asia/Shanghai')::date as d
  from product_events
  where ua <> 'bot' and device_id is not null
)
select f.d0,
       count(*) as cohort,
       count(*) filter (where exists (select 1 from active a where a.device_id = f.device_id and a.d = f.d0 + 1)) as d1,
       round(100.0 * count(*) filter (where exists (select 1 from active a where a.device_id = f.device_id and a.d = f.d0 + 1)) / nullif(count(*), 0), 1) as d1_pct,
       count(*) filter (where exists (select 1 from active a where a.device_id = f.device_id and a.d = f.d0 + 7)) as d7
from first_seen f
where f.d0 >= current_date - 30 and f.d0 < current_date - 1
group by 1
order by 1;

-- 建档用户的次日留存（今日卡钩子是否生效）：首个 archive_created 的设备，次日是否有 today_view
with arch as (
  select device_id, min((ts at time zone 'Asia/Shanghai')::date) as d0
  from product_events where event = 'archive_created' and device_id is not null group by 1
)
select count(*) as archived,
       count(*) filter (where exists (
         select 1 from product_events e
         where e.device_id = arch.device_id and e.module = 'today' and e.event = 'today_view'
           and (e.ts at time zone 'Asia/Shanghai')::date = arch.d0 + 1)) as d1_today_view
from arch where d0 >= current_date - 30;
```

新增事件（B12）：
| module | event | 触发时机 | props |
|---|---|---|---|
| today | today_view | 打开 /today | has_archive |
| mirror | mirror_view | 打开美我首页 / 掌纹 / 色彩 / 面部 / 换装页 | feature |
| mirror | mirror_analyze_submit | 提交掌纹 / 色彩 / 面部分析 | feature |
| mirror | mirror_tryon_submit | 提交换装生成 | feature=try_on |
| mirror | mirror_pack_checkout_start | 发起换装包支付 | — |
| treehole | treehole_view | 打开 /bottle | — |
| treehole | treehole_write_submit | 写树洞并提交 | — |
| home | archive_hero_click | 点击结果页首屏的存档按钮 | source, result_key |
