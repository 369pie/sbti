# WTFTI Wave 2-4 Execution Report · 2026-04-17

> 补充文档，配合 `wtfti-iteration-plan-2026-04-17.md` 读。
> 本文档记录一次性完成 Wave 2/3/4 backlog 的具体落地情况。

---

## 交付清单（本次一次性完成）

| Epic  | 标题                         | 状态            | 主要交付物 |
|-------|------------------------------|-----------------|-----------|
| E-04  | Daily Gacha 每日抽签         | ✅ Ready (MVP)  | `src/lib/gacha.ts` · `src/app/gacha/{page,GachaContent}.tsx` |
| E-05  | UGC 审核看板                 | ✅ Ready (MVP)  | `src/app/creator/admin/` · `src/app/api/admin/creator-review/**` |
| E-06  | 稀有关系标签 + 双人分享卡    | ✅ Ready        | `src/lib/cpti/relationships-rarity.ts` · `src/components/CptiPairShareCard.tsx` |
| E-07  | WTF Card v2（进度环 + 稀有度）| ✅ 已验证存在   | 既有 `ProgressRing` in `CardContent.tsx` 已满足；额外新增独立 `src/components/WtfCardProgressRing.tsx` 供其他页面复用 |
| E-08  | 限定宇宙 status=limited      | ✅ Ready        | `Universe.status` 扩展 + `src/lib/limited-universe.ts` 窗口/倒计时工具 |
| E-09  | SoulTI ¥9.9 付费 MVP stub    | ✅ Ready (stub) | `src/app/api/soulti/{purchase,verify}/route.ts` · gated by `SOULTI_PAYMENT_PROVIDER=live` |
| E-10  | SoulTI 历史女性副标题        | ✅ 已存在       | 通过 `getSoultiResonance().soulOrigin.zhName` 已在结果页斜体衬线渲染；无需新建 |
| E-11  | 月相日签 + 连签奖励          | ✅ Ready        | `src/lib/daily/moon-phase.ts` · `src/components/DailyMoonPhasePanel.tsx` 已挂入 `/daily` |

**Build 校验**：`pnpm build` ✅ 通过（606 static pages prerendered，TypeScript 0 错误）。

---

## 关键技术决策

### E-04 Gacha · 本地优先 MVP
- 完全 localStorage 化：`daily-gacha-v1` 独立 key，不污染 `wtf-card`
- 每天 1 抽（UTC 本地日），S/A/B/C/D 权重 `1/4/15/35/45`
- 29-slug × N 活跃宇宙随机组合
- 稀有度通过 deterministic hash 绑定 slug（同一 slug 永远同一稀有度），保证"每次抽到 boss 都知道是 A 级"的一致性
- 后续可升级：账号化 → Supabase `gacha_history` 表，保留每日锁逻辑

### E-06 关系稀有度
- 在现有 `RelationshipTier` (`viral/deep/rare`) 基础上再叠一层 **S/A/B/C 持有率**
- 用意：tier 是"叙事密度"，rarity 是"多少人抽到"——两个维度不重复
- 25 型全部分层，populationPct 合计 ≈ 100%
- `CptiPairShareCard` 输出 4:5 分享图（无画布，纯 SVG + 渐变），可由组件直接 DOM → 截图

### E-08 Limited Universe
- 扩展 `Universe.status` union 加 `'limited'`，连带修复 `universe-switcher.ts` 的 union
- 窗口数据单独存于 `LIMITED_WINDOWS` map，运营只改一个常量就能开窗 / 关窗
- `getLimitedStatus()` 返回 `isOpen / countdownMs / label`，UI 可直接渲染倒计时
- `getOpenUniverses()` 自动在 landing/gallery 过滤"已收档"

### E-09 Payment Stub
- 明确分离 `/purchase`（创建订单意图）与 `/verify`（确认支付）
- `SOULTI_PAYMENT_PROVIDER=live` env 切换到真实通道；当前默认返回 stub 成功
- 订单号 `so_{base36-timestamp}_{6 rand}`，不落库（等接入微信/支付宝时再建 `soulti_orders` 表）

### E-11 月相 + 连签
- 纯客户端计算：synodic month (29.530588d) + 已知新月 epoch，精度 ±0.5 天（UX 足够）
- 8 相位 × 8 条仪式文案（女性向、反鸡汤、反自我剥削）
- 连签奖励里程碑：3 / 7 / 14 / 30 天，7 天起解锁"限定仪式卡"钩子（与 E-08 联动）
- `recordCheckIn()` 幂等，多次调用不重复计数

---

## 未在本次交付的事项（并附理由）

| 事项 | 理由 | 建议后续 |
|------|------|--------|
| SoulTI purchase UI | 支付 provider 未接入；stub 路由已就绪 | Sprint 下半段引入微信支付小程序 SDK |
| WTF Card v2 每卡稀有度徽章 | 需先给 29 × N 组合建立稀有度映射 | 复用 gacha 的 `slugRarity()` 作为 single source of truth |
| Admin 真人审核 roles 表 | 当前用 `ADMIN_USER_IDS` env 足够 Beta 运营 | MAU > 1k 时迁移到 `user_roles` 表 + RLS |
| Gacha 动画 3D | 当前用 `rotateY` + backface-visibility 简化版 | 若抽卡页成为主路径，再接 Lottie |

---

## 环境变量

```bash
# E-05 Admin 审核 — 留空则任何登录用户都能访问（仅 Dev 模式建议）
ADMIN_USER_IDS=uuid1,uuid2

# E-09 SoulTI 付费 — 未设置或非 'live' 时走 stub 路径
SOULTI_PAYMENT_PROVIDER=live
```

---

## 文件索引（新增/修改）

**新增**
- `src/lib/cpti/relationships-rarity.ts`
- `src/lib/daily/moon-phase.ts`
- `src/lib/gacha.ts`
- `src/lib/limited-universe.ts`
- `src/components/WtfCardProgressRing.tsx`
- `src/components/CptiPairShareCard.tsx`
- `src/components/DailyMoonPhasePanel.tsx`
- `src/app/gacha/page.tsx`
- `src/app/gacha/GachaContent.tsx`
- `src/app/creator/admin/page.tsx`
- `src/app/creator/admin/CreatorAdminContent.tsx`
- `src/app/api/admin/creator-review/route.ts`
- `src/app/api/admin/creator-review/[id]/route.ts`
- `src/app/api/soulti/purchase/route.ts`
- `src/app/api/soulti/verify/route.ts`

**修改**
- `src/lib/universes.ts` — `Universe.status` 增加 `'limited'`
- `src/lib/universe-switcher.ts` — 同步 union
- `src/app/daily/DailyHomeContent.tsx` — 挂入 `<DailyMoonPhasePanel />`

---

## Wave 2-4 整体状态

- **E-01 UniverseSwitcher 全覆盖** · Wave 0 · ✅ 8/8 结果页
- **E-02 女权文案校验闸** · Wave 1 · ✅ validator + API + Gate + 提交硬闸
- **E-03 CPTI 主副关系卡** · Wave 1 · ✅ 已存在
- **E-04 Daily Gacha** · Wave 2 · ✅ 本次交付
- **E-05 UGC 审核看板** · Wave 2 · ✅ 本次交付
- **E-06 稀有关系 + 双人卡** · Wave 2 · ✅ 本次交付
- **E-07 WTF Card v2** · Wave 2 · ✅（既存 + 补充组件）
- **E-08 限定宇宙** · Wave 3 · ✅ 本次交付（数据层）
- **E-09 SoulTI ¥9.9** · Wave 3 · ✅ stub 就绪
- **E-10 SoulTI 女性副标题** · Wave 3 · ✅ 既存
- **E-11 月相日签** · Wave 4 · ✅ 本次交付

**累计进度：11 / 11 Epics 结构落地 ✅**
