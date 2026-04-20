---
title: Admin Ops Dashboard · Product UX Telemetry
status: active
owner: ops
last_updated: 2026-04-19
---

# WTFTI 经营总看板 · 产品 UX 埋点规范

`/creator/admin/ops/` 现在能看到所有核心模块的使用质量。本文档说明数据链路、
事件词汇、如何接入新模块，以及发布前的检查项。

## 1. 数据链路

```
 client module trackers
    └─► enqueueProductEvent(module, event, props)        (src/lib/analytics/product-events.ts)
          │  requestIdleCallback → batched buffer (≤32, 2s flush)
          ▼
 POST /api/events/ingest    (sendBeacon / fetch keepalive)
          │  validate + rate limit (60/min/device·ip)
          ▼
 Supabase public.product_events   (service-role insert, anon RLS insert)
          ▼
 fetchProductEventsInsights()  → 14d rollup
          ▼
 ProductInsightsSection  (server component in /creator/admin/ops)
```

- 存储：`db/migrations/2026-04-19_product_events.sql` — **部署前必须在 Supabase 执行**。
- Web Vitals 仍沿用既有 `public.perf_metrics`，看板直接聚合 p75。

## 2. 性能 / 隐私护栏

- 仅上报模块名、事件名、slug / code / tier / step / value / ok、匿名 `device_id`、
  `session_id`、pathname、UTM、粗粒度 UA。**不收集 PII。**
- 客户端用 `requestIdleCallback` 收集，`pagehide / visibilitychange` 时 sendBeacon
  刷新，正常状态最多每 2 秒发一次 `fetch keepalive`；缓冲池上限 32 条。
- 服务端对字段长度、props JSON 大小（≤2KB）、时间戳有效范围做 clamp，
  超出直接丢弃该条。
- 速率限制复用 `src/lib/perf/rate-limit.ts`（60 次/分钟/来源）。
- 所有既有 `track*Event` 保持对外签名不变，失败被 try/catch 吞掉，不会阻塞 UX。

## 3. 事件词汇（Funnel 依赖这些命名，请保持稳定）

| 模块 | 事件 | 语义 | step |
|------|------|------|------|
| first_look | `first_look_entry` | 入口曝光 | entry |
| first_look | `first_look_test_start` | 答题开始 | start |
| first_look | `first_look_q_advance` | 每题推进 | q |
| first_look | `first_look_result_view` | 结果页 | finish |
| first_look | `first_look_share_click` | 分享 CTA | share |
| first_look | `first_look_deep_click` | 深度解读 | deep_click |
| soulti | `soulti_entry` / `soulti_test_start` / `soulti_q_advance` | 进入/开始/答题 | entry/start/q |
| soulti | `soulti_finish` | 结果展示 | finish |
| soulti | `soulti_share_click` | 分享（channel 区分 native/copy/poster） | share |
| soulti | `soulti_deep_report_view` | 深度报告入口点击 | deep_report_view |
| mysti | `mysti_entry` / `mysti_draw_*` / `mysti_share_*` / `mysti_paywall_*` | 抽卡/分享/付费 | entry/finish/share/paywall/subscribe |
| cpti | `cpti_pair_panel_viewed` → `_pair_link_generated` → `_pair_code_copied` → `_match_completed` → `_gallery_missing_clicked` | 约玩漏斗 | pair_view / pair_generate / pair_share / match_finish / gallery_explore |

完整映射见：

- `src/lib/{first-look,mysti,cpti,soulti,museum}/analytics.ts`（`classify*Step` 函数）
- `src/lib/admin/wtfti-ops-insights.ts`（`FUNNEL_DEFINITIONS`）

## 4. 看板阅读方式

`ProductInsightsSection` 渲染 5 块：

1. **近 7 天模块漏斗** — 按 `session_id` 去重的阶段留存 + 前 7 天环比。
2. **模块互动质量** — 完成率、分享率、中位完成时长（`ts` 差值）。
3. **流失热点** — 阶段间流失 > 30% 高亮，直接指向下一步优化的位置。
4. **性能健康** — 近 7 天 pathname 粒度 p75 LCP / INP / CLS，LCP poor 比例 > 30% 变红。
5. **周环比信号 TOP** — 按增幅排序的事件；"新事件" 代表前 7 天为 0。

看板数据降级策略：

- 没有 product_events 权限或表不存在 → 显示空态 + warnings 文案，不报错。
- 只有 perf_metrics → 仅展示性能健康。
- 所有 warnings 会以黄色 banner 显示在底部。

## 5. 如何接入新模块

1. 在 `ALLOWED_MODULES`（`src/app/api/events/ingest/route.ts`）里加模块名。
2. 在 `FUNNEL_DEFINITIONS` 里定义 step 序列。
3. 在 `src/lib/<module>/analytics.ts` 里调用 `enqueueProductEvent(moduleName, event, ...)`
   —— 既可在已有 `track*Event` 中 forward，也可新增模块 tracker。
4. 在 `wtfti-ops.ts` 的 `DATA_HEALTH` 里更新状态说明。
5. （可选）在 `buildEngagement` / `buildDropOff` 给新模块补 label。

## 6. 运行手册

- **迁移**：
  ```sh
  # 在 Supabase SQL 控制台粘贴执行
  db/migrations/2026-04-19_product_events.sql
  ```
- **本地调试**：`/creator/admin/ops/`，无数据时会显示 warnings 的降级态。
- **埋点自测**：浏览器 DevTools → Network → 搜 `events/ingest`，应看到 `204`。
- **查询示例**：
  ```sql
  -- 近 24h 各模块事件量
  select module, count(*) from public.product_events
  where ts > now() - interval '24 hours'
  group by 1 order by 2 desc;
  ```

## 7. 已知待办

- SoulTI landing / quiz 尚未 wire `soulti_entry` + `soulti_q_advance`，仅
  `soulti_finish / share / deep_report_view` 已上线。
- Mysti 付费入口 `mysti_paywall` 的触发点仍需补 UI 调用。
- `product_events` 目前 14 天窗口取 5 万条上限，若流量上升可在
  `wtfti-ops-insights.ts` 切换为窗口物化视图。
