# 全站视觉统一审计 × 分层分享卡变现策略 · 2026-04-18

> Owner: Design + PM
> Status: Active Strategy (Audit + Proposal)
> Priority: P1
> Last Updated: 2026-04-18
> Review Cadence: Weekly until W2 ship
> Next Decision: 是否在 W1 内同步推进 Creator 后台改造与 Mysti 分享卡 v2

> 一句话目标：把"主站 = 老钱米 Editorial Atelier、风格宇宙 = 自有皮肤、分享卡 = 三档变现资产"这三件事一次定清。

---

## 0 · 背景：当前品牌的三层视觉系统

走查 `src/app/globals.css` + `brand/logo/DESIGN-v3-notes.md` + 现有 ShareImageGenerator 之后，确认目前**已锁定的视觉规范**是：

| 层级 | 系统 | 关键 token | 适用范围 |
|------|------|------------|----------|
| **L1 主站基调** | Editorial Atelier v4 / 老钱米 | `--color-bg-primary #FAF8F5` · 文字 `#1F1A16` · 强调 `#C07A8E` clay rose · 金 `#B8905A` · 衬线 Cormorant + Fraunces | 所有非"风格宇宙"路由：首页、`/test`、`/types`、`/card`、`/me`、`/about`、`/creator/*`、`/c/*` 等 |
| **L2 风格宇宙皮肤** | 各宇宙自有调性 | XPTI `xpti-dark-theme`（暗紫玫瑰）· Mysti `MystiThemeProvider`（夜空 + 苍白）· WTFTI/Feng（赛博黑）· SoulTI（米白衬线）· Banti/Kings/Delta（全出血 IP） | `/xpti/*` `/mysti/*` `/wtfti/feng/*` `/soulti/*` `/work/*` `/love/*` `/banti/*` `/kings/*` `/delta/*` 等 |
| **L3 分享物料** | 分享卡（Canvas 输出 1080+ px） | 多数：奶油 `#FFF9F2` · `#2D2236`；Banti/Kings/Delta：全出血；Feng/Symptoms：纯黑 | 每个测试结果页 + UGC 模板 |

**核心规则（写到本文件，方便 future agent 理解）：**

1. **L1 必须统一**：使用 `bg-bg-primary` token，**禁止**写死 `bg-[#0a0a0a]` 等魔术色。
2. **L2 必须自洽**：每个宇宙必须有一段 `*-theme` CSS class（或 ThemeProvider）写在 `globals.css`，并在该宇宙根 layout 上 wrap。**不要求和首页同色调**。但所有宇宙必须共用 L1 的字号、间距、Glyph、QR 规范，做到"骨架统一、皮肤独立"。
3. **L3 必须分档**：见第三节"分层分享卡"。

---

## 1 · 走查结果：哪些页面没和 L1/L2 统一

下表只列「应该是 L1 但还在用旧暗黑 / 旧调色」的页面，已按修改优先级排序。

### P0 · Creator 后台（必须立刻改）—— 8 处文件还卡在 `bg-[#0a0a0a]`

| 文件 | 现状 | 应改为 |
|------|------|--------|
| [src/app/creator/earnings/page.tsx](src/app/creator/earnings/page.tsx#L109-L134) | `min-h-screen bg-[#0a0a0a] text-white` ×3 (空态 + 错误态 + 主态) | `min-h-screen bg-bg-primary text-text-primary` |
| [src/app/creator/profile/[id]/page.tsx](src/app/creator/profile/[id]/page.tsx#L203) | 同上 + 内部 `bg-black/20 ring-white/10` 数据卡片 ×4 | 改为 `bg-bg-elevated border-rule` 卡片 |
| [src/app/creator/leaderboard/LeaderboardContent.tsx](src/app/creator/leaderboard/LeaderboardContent.tsx#L50) | `bg-[#0a0a0a] text-white` | `bg-bg-primary` + Editorial 排名表（金牌/银牌用 `--color-gold`/`--color-stone`） |
| [src/app/creator/studio/page.tsx](src/app/creator/studio/page.tsx#L85) | 同上 | 同上 |
| [src/app/creator/studio/[id]/page.tsx](src/app/creator/studio/[id]/page.tsx#L74-L130) | 三处 `bg-[#0a0a0a]` | 同上 |
| [src/app/creator/studio/[id]/stats/page.tsx](src/app/creator/studio/[id]/stats/page.tsx#L59-L80) | 三处 `bg-[#0a0a0a]` | 同上 |
| [src/app/creator/studio/[id]/QuestionsEditor.tsx](src/app/creator/studio/[id]/QuestionsEditor.tsx#L281) | `bg-black/10` 题目卡 | `bg-paper-deep` |
| [src/app/creator/studio/[id]/ComplianceGate.tsx](src/app/creator/studio/[id]/ComplianceGate.tsx#L122) | `bg-black/20` | `bg-paper-warm` |

> Creator 现在已经是创作者通往变现的核心入口（参见 [docs/01-strategy/wtfti-deep-product-strategy-2026-04-16.md](docs/01-strategy/wtfti-deep-product-strategy-2026-04-16.md)），后台还停在去年的旧暗色，会让创作者觉得"和官网不是一个产品"，直接影响信任。**这是本批最高优先级。**

### P1 · 单点散漏（一次性清理）

| 文件 | 现状 | 处置 |
|------|------|------|
| [src/app/mysti/collection/page.tsx](src/app/mysti/collection/page.tsx#L31) | Suspense fallback `bg-[#0a0a0f]` | 改为 Mysti 主题 token（`bg-mysti-night`），不要写死 |
| [src/app/mysti/payment/return/page.tsx](src/app/mysti/payment/return/page.tsx#L89) | `bg-[#1a1530]` 写死 | 同上 |
| [src/app/creator/admin/ops/page.tsx](src/app/creator/admin/ops/page.tsx#L71-L747) | 用了 `bg-slate-100 text-slate-600`、`bg-amber-50` 等 Tailwind 默认色 | 改为 `bg-paper-deep text-ink-soft`、`bg-rose-dust` 等 Editorial token |
| [src/app/cpti/result/[type]/CptiResultContent.tsx](src/app/cpti/result/[type]/CptiResultContent.tsx#L550-L563) | "暂无更多人格" CTA 用 `bg-amber-500` 橙色 | 改为 `bg-rose` / `bg-gold` |
| [src/app/drunk/result/[type]/DrunkResultContent.tsx](src/app/drunk/result/[type]/DrunkResultContent.tsx#L158) | `border-amber-500/20 bg-amber-500/5 text-amber-400` 旧橙系 | Drunk 是 L2 宇宙，建议沉淀一个 `drunk-theme`（暖琥珀），停用裸 amber |
| [src/app/wtfti/symptoms/WtftiSymptomsHub.tsx](src/app/wtfti/symptoms/WtftiSymptomsHub.tsx#L105) | `from-red-600 to-orange-500` 渐变 | 改为 `from-rose to-ember`（保留毒舌锋利感但归到 token） |

### P2 · 风格宇宙：要求"自洽"而非"统一"

走查后这些宇宙**已经各自有皮肤**且和首页是不同色调，**这是设计正解，不要改色调**：

- ✅ XPTI（`.xpti-dark-theme` in `globals.css:526`）— 暗紫暧昧夜
- ✅ Mysti（`MystiThemeProvider`）— 夜空 / 苍白双主题
- ✅ WTFTI Feng（`bg-[#050505]` cyberpunk，已在 [memories/repo/editorial-atelier-v4.md](memories/repo/editorial-atelier-v4.md) 标注"故意为之，不动"）
- ✅ Hogti（`bg-amber-50/20` 配 `text-amber-100` warmthcore）
- ✅ Banti / Kings / Delta — 全出血 IP 卡

**但要做以下三件事让"自洽"可治理：**
1. 把每个宇宙的色板也写进 `globals.css` 的 `.xxx-theme { --color-xxx: ... !important; }` 块，禁止散落 `bg-[#xxxxxx]`。
2. 在该宇宙根 `layout.tsx` 上 wrap `<div className="xxx-theme">`，参考 [src/app/xpti/layout.tsx](src/app/xpti/layout.tsx#L7) 的写法。
3. **必须复用 L1 的**：Glyph 图标系统、字号尺度、QR 规范、空间 token、动效 token（`--dur-whisper/breath/ritual`）—— 见第二节《风格宇宙开发守则》。

---

## 2 · 风格宇宙开发守则（新增到设计指引）

> 这一节会同步落地到 `docs/04-design-growth/design/universe-style-charter.md`。

### 2.1 三件事「必须自定义」（视觉差异化）

| 维度 | 自定义自由度 | 实现方式 |
|------|--------------|----------|
| 调色板 | 完全自由（暗黑/米白/赛博/水彩皆可） | 在 `globals.css` 写 `.{universe}-theme` block 覆盖 6 个 `--color-bg-*` / `--color-text-*` / `--color-accent` 即可 |
| 主插画风格 | 完全自由（low-poly / 水彩 / 像素 / 漫画） | RunningHub / 手绘均可，存到 `public/images/{universe}/` |
| 宇宙独有 chrome | 鼓励有"一个标志性视觉签名" | 例：Mysti 月相、WTFTI 闪电、SoulTI 烫金、Banti 工位灯 |

### 2.2 五件事「必须统一」（骨架不能歪）

| 维度 | 共用规范 | 来源 |
|------|----------|------|
| 字体 | `--font-display / --font-serif / --font-sans` | `globals.css:4-22` |
| 间距 | `--space-xs / s / m / l / xl / xxl` | `globals.css:78-84` |
| 圆角 | `--radius-sharp / soft / card / pill`（不要再写 `rounded-2xl/3xl` 之外的杂值） | `globals.css:73-77` |
| 动效 | `--ease-editorial / --ease-quiet` + `--dur-whisper/breath/ritual` | `globals.css:86-91` |
| Chrome 图标 | `<Glyph name="..." />`（**不要在 UI chrome 用 emoji**） | [src/components/Glyph.tsx](src/components/Glyph.tsx) |

### 2.3 新宇宙落地 Checklist（5 步）

1. `src/app/{universe}/layout.tsx` wrap 一个 `{universe}-theme` class。
2. `globals.css` 追加 `.{universe}-theme { --color-... !important; }` block。
3. `src/lib/{universe}/personalities.ts` 走 token 化稀有度（参考 [src/lib/flower/personalities.ts](src/lib/flower/personalities.ts#L4-L22)）。
4. `src/components/{Universe}ShareImageGenerator.tsx` 必须遵守第三节"分层分享卡"协议。
5. PR 前自检：`grep -n "bg-\[#" src/app/{universe}` 必须为空。

---

## 3 · 分层分享卡：从「成本中心」到「变现资产」

### 3.1 现状盘点（18 个 ShareImageGenerator）

| 分类 | 模块 | 背景色 | 备注 |
|------|------|--------|------|
| 奶油标准卡 (10) | Wtfti / Wtf Card / Combo / Squad / CP / Drunk / Daily / Love / Work / SBTI 主 | `#FFF9F2` | 已统一，质量稳定 |
| 暖米细分 (3) | Soulti `#FDFAF6` · Cpti `#FFF5F7` · Identify `#FFF5F7` · Flower `#FFFAF5` · Kings `#FFF8F0` | 暖色微调 | 已统一审美 |
| 蓝白特例 (1) | Bird `#F5F8FF` | 鸟类宇宙刻意冷 | 保留 |
| 全出血 IP (3) | Banti / Kings / Delta | full-bleed | 已统一打法 |
| 暗黑/赛博 (2) | Feng `#0a0a0a` · Symptoms `#1a1118` | 故意为之 | 保留 |
| **缺失或薄弱** | Mysti（理论上是变现旗舰但还没有"高级版"分享卡）· Xpti（夜色已有但没有付费层）· FirstLook · Delta | — | **本次重点** |

### 3.2 分层模型：Free / Plus / Atelier 三档

> 命名贴合 v4 Editorial Atelier，**不要**叫"VIP/SVIP"这种俗气词。

| 档位 | 价格锚定 | 视觉差 | 解锁路径 |
|------|----------|--------|----------|
| **Free 版**（基础卡） | 免费 | 现有奶油卡，QR + 链接 + 站点水印 | 任何用户测完即可下载 |
| **Plus 版**（精修卡） | ¥3-5 单次 / ¥18-28 月通 | + 烫金描边（`--color-gold`）+ 衬线主标题（Cormorant/Fraunces）+ 个性化金句 + **去站点水印** + 1080×1920 高分辨率竖屏适配 | 完成账号绑定 + 一次性付费 / 订阅 |
| **Atelier 版**（藏品卡） | ¥9.9-19.9 单卡 / ¥58-88 季度 | + 编号 N° + 藏书票印戳（动效 `--dur-ritual` + `nocturne-halation`）+ AI 二次绘制专属插画（RunningHub img2img）+ 烫银/烫金双面 + 长边 1500px PNG + 可印刷 PDF | 单卡付费 / 创作者会员 / 完成 N 个宇宙后赠送 |

### 3.3 视觉差异化清单（设计师可直接执行）

```
                              Free       Plus            Atelier
 ─────────────────────────────────────────────────────────────────
 主标字体                     Sans       Cormorant       Fraunces + 金箔渐变
 主标尺寸                     42-48      48-56           56-64 + 字距撑开
 边框                         单线 1px   双线 + 内描边    四角藏书票 + 金属箔层
 角饰                         ✦         ✦ + N°编号       N° + 印戳 + 火漆封 ↟
 IP 插画                      官方 png   官方 png + 描金   AI 重绘 (img2img) 限定版
 维度展示                     圆点矩阵   极简光谱         手绘式星盘/雷达
 金句卡                       无        引文 + 引号       引文 + 烫金分隔 + 拉丁副标
 底部水印                     站点 logo  无 logo          无 logo + 收藏者署名
 分辨率                       1080×1620  1080×1920        1500×2250 (印刷级)
 文件类型                     PNG        PNG              PNG + PDF (可印)
 附加文件                     —         —               1 张壁纸 + 1 张 IG/小红书 9:16 长图
```

### 3.4 优先实施宇宙（按 ICE 排序）

| 宇宙 | Impact | Confidence | Effort | ICE | 备注 |
|------|--------|------------|--------|-----|------|
| **Mysti** | 9 | 9 | 4 | **20.25** | 已有 paywall + SKU_PRICES（[src/components/MystiPaywall.tsx](src/components/MystiPaywall.tsx#L9-L183)），最快闭环 |
| **SoulTI** | 8 | 8 | 4 | 16.0 | 用户已经在自发夸"高级"，加 Atelier 版可顺势收费 |
| **WTFTI 主版** | 9 | 7 | 5 | 12.6 | 流量最大，但毒舌人群付费意愿次于灵性人群 |
| Xpti | 7 | 7 | 4 | 12.25 | 暧昧夜场景，付费人群偏私密分享 |
| Cpti / CP | 7 | 6 | 5 | 8.4 | 双人卡，需配对成功率，先不做付费 |
| Banti / Kings / Delta | 6 | 6 | 6 | 6.0 | 已经全出血，付费提升空间小 |

### 3.5 渐进式上线（4 周）

- **W1** · 设计 token 落地：在 `globals.css` 加 `.share-card-plus` / `.share-card-atelier` mixin（描金、双线、印戳），同步把 `BG`/`#FFF9F2` 等魔术色统一收到 `--color-share-cream` 等共享 token。
- **W2** · Mysti Atelier 卡上线：复用现有 [MystiPaywall](src/components/MystiPaywall.tsx) 加一个 `sku=mysti_share_atelier`，渲染时把 `MystiShareImageGenerator` 加 `tier: 'free' | 'plus' | 'atelier'` 参数。
- **W3** · SoulTI Plus 卡上线：复用上一周的 mixin，**不**新增支付页，先做"完成 3 个宇宙免费解锁 1 张 Plus"作为冷启动。
- **W4** · 指标复盘：付费转化率、Plus 解锁率、分享 CTR 三件套。

---

## 4 · Press Release（Working Backwards · 给团队对齐用）

> **WTFTI 推出"Atelier 藏品分享卡"——把人格测试结果做成可裱、可印、可送的限定藏品**
>
> 上海 · 2026-04-25
>
> 今天，WTFTI 上线了 Atelier 分享卡：每张卡片都有独立编号 N°、藏书票印戳、可下载印刷级 PDF，让"测完一张就发朋友圈"升级成"测完一张能裱在墙上"。
>
> 过去一年，越来越多用户在小红书发我们的分享图，但她们总在问"能不能有更精致的版本？""能不能去掉水印自己印一张？"。我们听见了。Atelier 卡不是给所有人的，它是给那些把测试当成自我对话仪式的人——花一杯咖啡的钱，把"看见自己"这件事变成可收藏的物件。
>
> "我们不做更多的人格类型，我们做更深的一次相遇。"——WTFTI 设计负责人
>
> 数据：内测期间，付费转化率 4.2%，单次客单 ¥12.5，72% 购买者在 7 天内复购第二张其他宇宙的卡。
>
> 现在就去 wtfti.com 的灵鉴宇宙试试。

---

## 5 · 反模式（不要做）

- ❌ **不要**为追求"全站统一"把 XPTI / Mysti 改成米白 —— 那会失去宇宙的灵魂；本文反复强调骨架统一、皮肤独立。
- ❌ **不要**在分享卡 Plus / Atelier 上塞更多数据条 —— 付费用户买的是"少而精"，不是"多而全"。
- ❌ **不要**把付费按钮做成"立省 50%"的拼多多式弹窗 —— 走 Editorial Atelier 的低声吆喝，按钮文案统一用 `✦ 解锁 N° 藏品`。
- ❌ **不要**给免费版"故意降级"（如打丑水印）—— 免费版仍要好看，付费版是"另一种好看"，不是"少了一点丑"。

---

## 6 · 落地 owner 与下一步

| 工作项 | Owner | Due |
|--------|-------|-----|
| `creator/*` 8 个文件 `bg-[#0a0a0a]` → `bg-bg-primary` | Frontend | W1 |
| `globals.css` 新增 `.share-card-plus` / `.share-card-atelier` mixin | Design | W1 |
| `docs/04-design-growth/design/universe-style-charter.md` 落盘第二节 | PM + Design | W1（本 PR 一并提交） |
| Mysti Atelier 分享卡（含 SKU + 渲染） | Frontend | W2 |
| SoulTI Plus 分享卡（无支付，做解锁） | Frontend | W3 |
| 复盘指标埋点：`share_card_tier_view / unlock / download` | Analytics | W3 |

> 本文件落地后，下一份「W1 执行计划」请挂在 `docs/01-strategy/visual-unification-w1-execution-2026-04-19.md`，不要在本文件继续 append。
