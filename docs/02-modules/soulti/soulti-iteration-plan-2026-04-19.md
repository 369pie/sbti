---
title: SoulTI 爆品迭代 · M0 落地清单
status: m0-shipped
owner: product + eng
last_updated: 2026-04-19
related:
  - docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md
  - docs/05-operations/soulti-xhs-launch.md
---

# SoulTI 爆品迭代方案 · 执行清单

战略输入：`docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md`
冷启动剧本：`docs/05-operations/soulti-xhs-launch.md`

> 本文档把战略文档里的 M0/M1/M2 epic 分解为可逐项验收的工程任务，
> 并标注本轮（2026-04-19）已落地的部分。

---

## M0 · "撕裂度"成为第一品牌符号 ｜ 已交付 ✅

| Epic | 状态 | 产物 |
| --- | --- | --- |
| **E1** 撕裂度首屏 Hero | ✅ | `src/components/SoultiTearRateHero.tsx` 挂载于 `SoultiResultContent.tsx` 头部 |
| **E2** 夜灯模式（22:00–06:00 自动） | ✅ | `src/components/SoultiNightMode.tsx` + 新建 `src/app/soulti/layout.tsx` 全局挂载 |
| **E3** 夜版分享卡 | ⏸️ 待 designer 出图层 | hooks 已就位（`data-soulti-night` + `data-soulti-surface="cream"` 选择器） |
| **E4** 落地页 hero 文案改写 | ✅ | `SoultiLandingContent.tsx`：「深夜的你，需要 8 分钟」+「现在就来」CTA |
| **E5** 小红书 30 天剧本 | ✅ | `docs/05-operations/soulti-xhs-launch.md`（30 标题模版 + 排期 + KOC SOP） |
| **E9** 今晚的小动作（免费收尾） | ✅ | `src/components/SoultiTonightAction.tsx` + `src/lib/soulti/tonight-actions.ts` |

### 工程要点
- 撕裂度首屏：使用 `calculateTearRate()` 已有算法，环形 SVG + 大数字布局可直接被截图。
- 夜灯模式：在 `<html>` 上写 `data-soulti-night="1"`，组件用 `data-soulti-surface="cream"` 自动适配；
  尊重用户选择（localStorage `soulti-night-mode` = `auto|on|off`）；当晚关闭只在 sessionStorage。
- 「今晚的小动作」按 J5 轴（G/K）+ 撕裂度等级派发，按"slug + 当地日期"做日级稳定哈希，
  让用户当天回访看到的是同一条建议，第二天会换。
- 落地页改文案不改信息架构；测试入口、Universe 入口卡片保留。

---

## M1 · 7 天关系闭环 ｜ 部分交付 🟡

| Epic | 状态 | 产物 |
| --- | --- | --- |
| **E6** 灵魂来信 D+1（订阅入口 + 模板 + intake API） | 🟡 落地页 + API + 模板已就绪；**cron 投递未实现** | `SoultiSoulLetterSubscribe.tsx` · `/api/soulti/soul-letter/subscribe/route.ts` · `letter-templates.ts` |
| **E7** ¥19.9 深度报告解锁 | ⏸️ 已有 `/api/soulti/purchase/route.ts` + `verify`；**未与 D+3/D+7 解锁挂钩** | 待新增 `letter_unlocks` 表 + 解锁 endpoint |
| **E8** 双人撕裂度 PK | ✅ | `src/components/SoultiPairTearPK.tsx` 已挂载于 `/soulti/pair/[a]/[b]/` |

### M1 还需要做什么（下个迭代）
1. **数据库**：执行迁移建 `soul_letter_subscriptions` 表（schema 注释见 `subscribe/route.ts`）。
2. **Cron 投递 worker**：新建 Vercel Cron（每天 21:30）扫描表，
   按 `(now - subscribed_at)` 命中 D+1/D+3/D+7，调 `LETTER_RENDERERS[kind]` 渲染并送邮件
   （走 Resend / SES / 飞书邮件，皆可）。
3. **解锁逻辑**：D+3/D+7 投递前查 `letter_unlocks(email, slug)`；未解锁则只发"付费提示信"。
4. **付费回调**：在 `/api/soulti/verify/route.ts` 上加分支：当 sku=`full-report` 命中时
   写入 `letter_unlocks(email, slug, expires_at = +30d)`。
5. **退订**：API 增加 `DELETE /api/soulti/soul-letter/subscribe`；邮件 footer 加链接。

---

## M2 · 防抄护城河 ｜ 待启动 🔵

| Epic | 状态 | 备注 |
| --- | --- | --- |
| **E10** 匿名许愿池（按 personality slug 收 + 随机播放） | ⏸️ | 需要 RLS 设计；可复用 `ugc/*` 现有模式 |
| **E11** 月度复测对照 | ⏸️ | 本地 `localStorage` 30 天提醒 + 历史记录列表 |
| **E12** "她"语料 KOL 共建 | ⏸️ | 运营侧主导，工程提供"原型卡片"模板组件 |
| **E13** 视频化撕裂度短剧 | ⏸️ | 设计 + 视频外包；工程仅出 OG 视频源数据 |

---

## 验证清单（M0 上线前必跑）

```bash
pnpm lint           # 已通过（新增/修改文件零报错）
pnpm typecheck      # 建议在 PR 前再跑一次
pnpm dev            # localhost:3000/soulti/result/spring/  → 确认首屏看到撕裂度
                    # localhost:3000/soulti/                → 确认 hero 改文案
                    # localhost:3000/soulti/pair/spring/wildfire/ → 双人撕裂度卡片
                    # 把电脑时间调到 23:30 → 确认夜灯横幅出现
```

API 烟测：
```bash
curl -X POST http://localhost:3000/api/soulti/soul-letter/subscribe \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","slug":"spring","code":"TROFG","tearRatePercent":73,"optedExtended":true}'
# 期望返回 { ok: true }
```

---

## 时间线建议

- **本周** · M0 全部组件已 ready，做一次端到端走查 → 上线
- **下周** · M1 cron + 解锁逻辑（后端 1 人 3 天）
- **第 3 周起** · 与小红书冷启动剧本同步推进；按周对北极星指标做复盘
- **第 6 周起** · 启动 M2 防御工事
