# 灵鉴 W1+W4 实施落地记录 — 2026-04-18

> 本文为 `docs/01-strategy/mysti-major-upgrade-2026-04-18.md` 的工程落地清单。
> 用户已批准 7 项决策，要求"一次性完成"。本轮交付以下内容。

---

## ✅ 已完成（本轮可直接体验）

### W1 · 视觉统一
- **`src/lib/mysti/themes-v2.ts`** — 新三主题系统（twilight/nocturne/aurora），全部以主站 rose-clay `#C07A8E` + gold-leaf `#C9A676` 为锚点
- **`src/lib/mysti/types.ts`** — 扩展 `MystiThemeV2`/`MystiThemeV2Id` 类型；保留旧 `MystiTheme` 兼容
- **`src/components/MystiThemeProvider.tsx`** — React Context，自动 22:00–6:00 → nocturne / 6–11 → aurora / 其他 → twilight，手动覆盖优先
- **`src/components/MystiThemeToggle.tsx`** — 全局浮动主题切换按钮（右下角，emoji 三循环）
- **`src/app/mysti/layout.tsx`** — 已挂 Provider + Toggle
- **`src/app/mysti/page.tsx`** — 完整重写为「邀请页 → 洗牌动画 → 三背选牌 → 跳转结果」三步式仪式入口；保留"已知人格直选"折叠通道；卡牌堆视觉 CTA 替代下拉表单

### W4 · 虎皮椒（Xunhupay）支付基础设施
- **`src/lib/payment/xunhupay.ts`** — md5 签名 / 验签 / 下单封装；优先读渠道级 env（`XUNHUPAY_WECHAT_*` / `XUNHUPAY_ALIPAY_*`），兼容旧版共享 `XUNHUPAY_*`
- **`src/lib/mysti/payment-store.ts`** — Mysti 服务端订单仓储（`mysti_orders` / `mysti_gift_cards`），`create -> notify -> verify` 全部围绕服务端事实源
- **`src/lib/mysti/unlock.ts`** — 解锁状态 localStorage 存取，4 个 SKU 价格表
- **`src/app/api/mysti/payment/create/route.ts`** — POST 创建订单（无 env 时回退 stub 模式）
- **`src/app/api/mysti/payment/notify/route.ts`** — 异步回调验签
- **`src/app/api/mysti/payment/verify/route.ts`** — 同步状态查询
- **`src/app/mysti/payment/return/page.tsx`** — 支付完成回跳页面（写入解锁状态）
- **`src/components/MystiPaywall.tsx`** — 模糊预览 + 微信/支付宝二选一 + CTA + 错误提示

### W4 · 灵魂信内容（首批 6 型）
- **`src/lib/mysti/soul-letters/{boss,mum,drama,emo,love-r,nerd}.ts`** — 每封 5 段（开场 / 阴影 / 神经化学 / 修复处方 / 灵魂共振 / 告别句）
- **`src/components/MystiSoulLetterSection.tsx`** — 灵魂信完整 UI（含 Paywall 包裹）
- **集成位置**：`src/components/MystiResultContent.tsx` 在"为什么是这张牌"之后插入，未付费时模糊预览，付费后展开

### W6 · 创作者推荐基础
- **`src/lib/mysti/creator-referral.ts`** — `?ref=xhs_xxx` URL 参数捕获 → localStorage 7 天 → 下单时回传订单 attach 字段

### 文档校正
- **`docs/01-strategy/mysti-major-upgrade-2026-04-18.md`** — 顶部追加 ⚠️ Corrigenda 块，修正 v3 老钱米品牌色

---

## ⏸ 本轮未做（建议下一轮 sprint）

### W2 · 心流戏剧化（结果页内动画）
- 翻牌动画 / Shadow 牌延迟揭晓 / 打字机叙事
- 可基于现有 `MystiResultContent.tsx` 在"主牌名"和"shadow 牌"位置加 `motion` + `framer-motion` `useInView`
- 入口页洗牌+选牌已具备戏剧感，结果页内推迟揭晓尚未做

### W3 · 关系档案沉淀
- `src/app/mysti/archive/page.tsx` — 列出历史合盘对，从 collection.ts 数据派生
- 暂未创建

### W5 · 心情记录 + 月报
- `src/app/mysti/mood/page.tsx` — 每日打卡选 emoji / 关键词
- `src/app/mysti/monthly/page.tsx` — 月报骨架（套 Paywall sku=`monthly-report`）
- 暂未创建

### W6 · 礼品卡 + 创作者后台
- `src/app/mysti/gift/page.tsx` — ¥39.9 礼品卡购买与兑换码生成
- 创作者分润查询页（暂用 `/api/creator/settlement` 复用 SoulTI 现有方案）

### 灵魂信内容扩充
- 当前 6/29 型，剩余 23 型需要内容产出（建议每周 2 型节奏）
- `MystiSoulLetterSection` 已对未写过的型显示"敬请期待"占位，无需阻塞上线

### Supabase orders 表持久化
- 当前 `notify` 路由仅日志，未写库；解锁仅靠 localStorage（用户清理浏览器会丢）
- 建议创建 `mysti_orders` 表 + RLS，在 notify 中 upsert，verify 接口直接查库

---

## 🔧 部署前必做

### 环境变量
```bash
# 推荐：按支付渠道分别配置（微信 / 支付宝通常是两套 appid/appsecret）
XUNHUPAY_WECHAT_APP_ID=xxx
XUNHUPAY_WECHAT_APP_SECRET=xxx
XUNHUPAY_ALIPAY_APP_ID=xxx
XUNHUPAY_ALIPAY_APP_SECRET=xxx

# 可选：渠道级 API base（通常不需要改）
XUNHUPAY_WECHAT_API_BASE=https://api.xunhupay.com
XUNHUPAY_ALIPAY_API_BASE=https://api.xunhupay.com

# 兼容旧版：若仍使用同一商户同时承接两个渠道，可只配共享 env
XUNHUPAY_APP_ID=xxx
XUNHUPAY_APP_SECRET=xxx

# 可选：全局 API base fallback
XUNHUPAY_API_BASE=https://api.xunhupay.com
```

> `notify_url` / `return_url` 不再通过 env 固定配置，而是在创建订单时由具体业务动态生成：
> - `notify_url`：`/api/mysti/payment/notify?channel=wechat|alipay&sku=...`
> - `return_url`：`/mysti/payment/return?channel=...&sku=...&resourceId=...&redirect=...`
>
> 也就是说，同一套支付基础设施可以服务不同业务页面，回跳地址由本次下单上下文决定，而不是写死在环境变量里。

### Supabase 迁移（live 必做）
- 执行：`src/lib/mysti/migrations/2026-04-18-mysti-payments.sql`
- 作用：创建 `public.mysti_orders` 与 `public.mysti_gift_cards`
- 如果未执行迁移：
	- `create` 在 live 模式下无法把 pending order 落库
	- `notify` 无法写 paid 状态
	- `verify` 无法从服务端确认订单
	- `/api/mysti/gift-card` 会报 schema cache 中无表

### 测试路径
1. 访问 `/mysti/` — 应看到新仪式入口
2. 点"为我洗牌" → 洗牌动画 → 三背选牌 → 跳到结果页
3. 滚动到"灵魂信"区域 — 应看到模糊预览 + ¥9.9 解锁 CTA
4. Stub 模式下点解锁 → 立刻展开内容；Live 模式下跳虎皮椒 → 完成后回跳 `/mysti/payment/return`
5. 主题切换按钮（右下角）应轮换三套色板

### 已知风险
- 旧主题 `MystiTheme` 仍在 `MystiResultContent` 主体使用；新 `MystiSoulLetterSection` 用 v2 主题——视觉上会出现"上下半部分用色微差"。计划在下一轮把 `MystiResultContent` 整体迁移到 v2。
- 灵魂信首批仅 6 型，未列入的型回退到"敬请期待"——如果想覆盖全部 29 型，需要内容补齐工作量约 1 周。
- localStorage 解锁不防清理；正式商业化前必须接 Supabase orders 表。
