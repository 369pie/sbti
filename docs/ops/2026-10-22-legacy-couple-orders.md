# 旧格式「我和他」订单（需人工解锁）

2026-10-22 expire-pending cron 经虎皮椒 OD 确认补标 paid 的 3 单，resource_id 为旧格式 `xpti:couple-report`（不含 share token），无法自动关联配对：

| 单号后6位 | SKU | 下单日期 |
|---|---|---|
| izkv1c | xpti-couple-half | 2026-04-21 |
| hhfmzs | xpti-couple-report | 2026-04-21 |
| h8colo | xpti-couple-half | 2026-04-21 |

均为仅设备（无 user_id）。用户联系客服时：
1. 让用户提供配对分享链接（`/xpti/couple/?t=<token>` 或 `/xpti/couple/cp/...`）及付款截图/时间；
2. 在 mysti_orders 中按后 6 位核对订单为 paid；
3. 调用 `markCoupleUnlocked(token, { sku, deviceId })`（src/lib/xpti/couple-server.ts），或将该订单 resource_id 更新为 `couple:<token>` 后运行 `fulfillPaidOrder`（幂等）。
如无法确认，可退款。
