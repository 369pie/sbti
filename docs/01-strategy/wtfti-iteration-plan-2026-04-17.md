# WTFTI 野蛮生长阶段 · 迭代开发计划 (Iteration Plan)

> Owner: Engineering + Product
> Status: Active Execution Plan
> Priority: P0
> Last Updated: 2026-04-17
> Review Cadence: Daily standup 5min / Weekly demo Fri
> Next Decision: Sprint 1 DoD 检查（Day 14）

**依据：** [`wtfti-wild-growth-strategy-2026-04-17.md`](./wtfti-wild-growth-strategy-2026-04-17.md)
**方法：** 12 个 Epic × RICE 排序 → 5 个 Wave × 13 周 → Sprint（2 周）× Story 粒度 → Task（≤ 1 日）
**原则：** 每 7 天 ship 一次可被博主/用户感知的增量；永不并行超过 2 个 P0 Epic。

---

## 总览：12 Epic × 5 Wave × 90 Day

```
Wave 0 (Day 0-3)   阻塞解除 + 规范对齐
Wave 1 (Day 4-14)  E-01 E-02                留存断裂修复 + UGC 地基
Wave 2 (Day 15-35) E-03 E-04 E-05 start      账号化 + 日活钩子 + UGC 启动
Wave 3 (Day 36-56) E-06 E-07 E-10 UGC-ship   裂变升级 + 收集瘾 + 文案散文化
Wave 4 (Day 57-77) E-08 E-09 E-11 付费MVP    限定 FOMO + 付费验证 + 仪式深化
Wave 5 (Day 78-90) 复盘 + 规模化决策
```

| # | Epic | RICE | Wave | 负责 | 代码入口 |
|---|------|-----:|:----:|:----:|----------|
| E-01 | 结果页宇宙切换器全覆盖 | 190 | 1 | Eng | `src/components/UniverseSwitcher.tsx` |
| E-02 | 新宇宙 4h 上线模板 | 189 | 1 | Eng | `src/lib/ugc/universe-template.ts`（新建） |
| E-03 | CPTI 账号化 + Supabase | 108 | 2 | Eng | `src/app/api/cpti/` + `src/lib/supabase/` |
| E-04 | 每日抽卡 Gacha | 102 | 2 | Eng | `src/app/gacha/`（新建）+ `src/lib/wtf-card.ts` |
| E-05 | UGC 平台 MVP Level 1 | 96 | 2-3 | Eng+Growth | `src/app/creator/studio/` |
| E-06 | 稀有关系 + 双人分享卡 | 96 | 3 | Eng | `src/lib/cpti/relationships.ts` + `src/components/CptiPairShare*` |
| E-07 | WTF Card v2（空卡位+进度环） | 80 | 3 | Eng | `src/app/card/CardContent.tsx` |
| E-08 | 限定卡池（72h 限时宇宙） | 72 | 4 | Eng | `src/lib/universes.ts` + `src/lib/wtf-card.ts` |
| E-09 | SoulTI ¥9.9 灵魂长信付费 | 65 | 4 | Eng | `src/app/api/soulti/purchase/`（新建） |
| E-10 | SoulTI 散文化 + 历史女性副标题 | 60 | 3 | Content | `src/lib/soulti/personalities.ts` |
| E-11 | 月相/日签仪式深化 | 55 | 4 | Eng+Design | `src/app/daily/` + `src/lib/mysti/` |
| E-12 | 成长时间轴 | 50 | 5+ | Eng | `src/app/me/`（新建） |

---

## Wave 0 · Day 0-3 · 阻塞解除

### W0.1 Build 阻塞排查
- [x] ✅ `pnpm build` 通过（2026-04-17 已验证，原 CPTI API 阻塞已修复）

### W0.2 女性向视觉规范 v1.0
- [ ] **Task**: 创建 `docs/04-design-growth/women-first-visual-guide.md`
- DoD：包含 ① 可爱化禁用清单 ② 女权叙事调色板 ③ 神秘学仪式纹样库 ④ 博主宇宙视觉合规 checklist
- 责任人：Design
- 估时：0.5 日

### W0.3 文案女权体检 checklist
- [ ] **Task**: 创建 `docs/04-design-growth/feminist-copy-checklist.md`
- 10 条清单示例：
  - 是否避免"被规训式赞美"（如"乖、懂事、稳重"）？
  - 是否提供"拒绝被优化"的出口？
  - 是否有主体性而非服务性？
  - 是否对情绪劳动去名化？
  - 是否对身体/外貌描写去物化？
- 责任人：Content
- 估时：0.5 日

### W0.4 埋点基线快照
- [ ] **Task**: 当前 baseline 数据（分享率/次日留存/宇宙覆盖）截图存档
- DoD：`docs/05-operations/metrics-baseline-2026-04-17.md`
- 估时：0.5 日

---

## Wave 1 · Day 4-14 · 留存断裂修复 + UGC 地基

### Sprint 1 (Day 4-14, 10 个工作日)

#### Epic E-01 — 结果页宇宙切换器全覆盖（RICE 190）

**现状：** UniverseSwitcher 已实现，但仅在 3 处挂载（wtfti, feng, mysti）；11 个结果页缺失。

**目标：** 所有共用 29-type slug 的结果页都挂上 UniverseSwitcher；独立 slug 体系（SoulTI/XPTI/Flower/Love/Drunk/Daily/Identify/CP/CPTI）挂 UniversePreviewCards 作为互补。

- **Story S-01.1**：扩展到 Banti / Delta / Kings / Bird 四个 29-type 宇宙
  - Task: 在各 `*ResultContent.tsx` 结果页底部（收藏卡 CTA 之前）插入 `<UniverseSwitcher slug={p.slug} currentUniverseId="{id}" />`
  - DoD: 4 页可见，点击跳转正确，build 通过
  - 估时：0.5 日
- **Story S-01.2**：为非共享 slug 宇宙补 UniversePreviewCards（已多数完成，检查并补）
  - 文件清单：XPTI（`variant="xpti"` 已有支持，需调用）、SoulTI（需新增）、Kings（需新增）
  - 估时：0.5 日
- **Story S-01.3**：埋点 — 宇宙切换器点击事件
  - Task: 在 `UniverseSwitcher` onClick 加 `trackEvent('universe_switcher_click', {from, to})`
  - 估时：0.5 日

**Sprint 1 里程碑：** Day 10 demo 所有结果页可见宇宙切换入口

#### Epic E-02 — 新宇宙 4h 上线模板（RICE 189，为 UGC 铺路）

**目标：** 把"新建宇宙"从"写 10 个文件"降到"填一个 config + 29 张图"。

- **Story S-02.1**：抽象宇宙模板引擎
  - Task: 新建 `src/lib/ugc/universe-template.ts`，定义 `UniverseTemplate` 接口 { id, name, personalities: Array<{slug, displayName, tagline, fourParagraphs, imagePath}>, theme, share }
  - Task: 新建 `src/app/ugc/[universe]/` 动态路由，复用现有 scoring + QuestionPool
  - DoD: 用 config.json demo 生成一个占位宇宙
  - 估时：2 日
- **Story S-02.2**：SSG 构建适配
  - Task: `next.config.ts` 中加入 UGC 宇宙的 `generateStaticParams`（初期白名单）
  - 估时：0.5 日
- **Story S-02.3**：UGC 示例宇宙 — "甄嬛 12 嫔妃" placeholder
  - Task: 不上线，仅用于验证 template 流水线
  - 估时：1 日

**Sprint 1 里程碑：** Day 14 demo 一个 JSON 驱动的宇宙跑通 SSG

---

## Wave 2 · Day 15-35 · 账号化 + 日活钩子 + UGC 启动

### Sprint 2 (Day 15-28)

#### Epic E-03 — CPTI 账号化 + Supabase (RICE 108, P0)

现状：Supabase client/server/auth/proxy 都已存在；CPTI API 目录有骨架；schema 文档完成。

- **Story S-03.1**：部署 Supabase schema v1
  - Task: 执行 `docs/02-modules/cpti/cpti-supabase-schema-v1.sql`
  - DoD: 生产 Supabase 有 users / cpti_profiles / cpti_pair_codes / cpti_matches / relationships 5 张表
  - 估时：1 日
- **Story S-03.2**：匿名身份 → OAuth/邮箱登录
  - Task: `/api/auth/*` 接 Supabase Auth；CPTI 配对完成后弹"保存关系图鉴"登录提示
  - DoD: 游客可做配对；完成后 15s 出现登录提示；登录成功后本地数据合并到账号
  - 估时：3 日
- **Story S-03.3**：关系图鉴墙 `/me/relationships`
  - 估时：1 日

#### Epic E-04 — 每日抽卡 Gacha (RICE 102)

- **Story S-04.1**：抽卡数据层
  - Task: `src/lib/gacha/` — 定义卡池、稀有度（S/A/B/C/D = 1%/4%/15%/35%/45%）、日限 1 次
  - 估时：1 日
- **Story S-04.2**：`/gacha` 页面 + 翻牌动效
  - Task: 洗牌 → 选牌 → 翻转揭晓 → 持有率"仅 3% 的人是这张"
  - 估时：2 日
- **Story S-04.3**：抽卡入图鉴墙
  - Task: 抽中卡写入 `wtf-card.ts` 的 `gachaHistory`；在 `/card` 可见
  - 估时：0.5 日

### Sprint 3 (Day 29-35)

#### Epic E-05 — UGC 平台 MVP Level 1 启动 (RICE 96)

- **Story S-05.1**：博主审核后台
  - Task: `/creator/applications` 管理员视图；审核通过后给博主开启 `/creator/studio` 入口
  - 估时：1.5 日
- **Story S-05.2**：4 步向导（主题 / 29 型改名 / 图鉴 / 文案）
  - Task: `/creator/studio/[universeId]/new` → 4 步表单 → 落到 `/api/ugc/universes/*`
  - 估时：3 日
- **Story S-05.3**：博主数据看板
  - Task: `/creator/studio/[universeId]/dashboard` — UV / 完成率 / 分享率 / 收入（Wave 4 前收入归 0）
  - 估时：1.5 日

**Wave 2 里程碑（Day 35）：** 10 位博主候选签约完成；≥3 位进入 studio 并开工

---

## Wave 3 · Day 36-56 · 裂变升级 + 收集瘾 + 文案散文化

### Sprint 4 (Day 36-49)

#### Epic E-06 — 稀有关系 + 双人分享卡 (RICE 96)
- **S-06.1** 在 `src/lib/cpti/relationships.ts` 为 25 种原型打上 S/A/B/C 稀有度（S = 3% 出现率如"灵魂共振"）
- **S-06.2** 双人分享卡模板 `src/components/CptiPairShareImageGenerator.tsx` — 左右双头像 + 关系原型徽章 + 稀有度光效
- **S-06.3** 二度邀请链路：关系结果页 → "拉闺蜜来鉴定我俩" → 生成带 `pairCode` 的 `/identify` 链接
- 估时：合计 5 日

#### Epic E-07 — WTF Card v2 (RICE 80)
- **S-07.1** 空卡位可视化：在 `CardContent.tsx` 渲染 15 宇宙 × 29 型 的全量矩阵，未解锁灰色剪影 + 问号
- **S-07.2** 进度环：顶部显示"你已解锁 X / 435"
- **S-07.3** 稀有度徽章：每张卡按全站持有率显示 S/A/B/C
- 估时：合计 3 日

### Sprint 5 (Day 50-56)

#### Epic E-10 — SoulTI 散文化 + 历史女性副标题 (RICE 60)
- **S-10.1** 外部女性写作者池：签约 2-3 位，供稿 32 型 × "写给你"段落重写
- **S-10.2** 数据层：在 `src/lib/soulti/personalities.ts` 给每型加 `historicalFemaleSubtitle`（如"涌泉·林徽因"、"琥珀·萧红"）
- **S-10.3** 结果页呈现：副标题置于主标题下方，斜体衬线体
- 估时：5 日（写作等外部 3 日 + 工程 2 日）

#### UGC 首批博主宇宙上线
- 目标：10 个博主宇宙 ship
- 过程中 bug 修复预留 2 日缓冲

**Wave 3 里程碑（Day 56）：** 10 UGC 宇宙上线 + WTF Card v2 可见全量 435 卡位

---

## Wave 4 · Day 57-77 · 付费验证 + 限定 FOMO + 仪式深化

### Sprint 6 (Day 57-70)

#### Epic E-08 — 限定卡池（72h 限时宇宙）(RICE 72)
- 每周限定 1 个宇宙，72 h 开启窗口；过期后只有本期参与者能看到结果
- `src/lib/universes.ts` 扩展 `status: 'live' | 'coming-soon' | 'limited'` + `endDate`
- 估时：3 日

#### Epic E-09 — SoulTI ¥9.9 灵魂长信付费 (RICE 65)
- **S-09.1** 接入支付（微信 JSAPI / 支付宝 / Stripe Link）
- **S-09.2** `/api/soulti/purchase` + `/api/soulti/verify`
- **S-09.3** 购买后解锁"灵魂长信"深度页（`/soulti/result/[type]/letter`）
- 估时：5 日

#### Epic E-11 — 月相/日签仪式深化 (RICE 55)
- 引入月相 API（或本地计算）× 29 型 × 塔罗 = 当日"神谕"
- 连续打卡奖励：7 日签到解锁限定卡
- 估时：3 日

### Sprint 7 (Day 71-77)
- UGC 付费商城 MVP（用户购买博主宇宙 + 分成结算）
- Bug 清理 + 性能验证

---

## Wave 5 · Day 78-90 · 复盘 + 规模化决策

- [ ] WGI 北极星复盘报告
- [ ] 首次 50 博主目标检查（实际 vs 目标）
- [ ] 决定：进入 Phase II（品牌化收敛 + 微信小程序）or 继续 Phase I.2（野蛮生长深化）
- [ ] 实地访谈：5 用户 + 3 博主（按战略附录 A）

---

## 执行纪律（铁律）

1. **每 7 天 ship 一次用户/博主可感知的变化** — 宁可砍范围，不能延期
2. **任何新宇宙必须过"女权体检"** — 未过检的不准上线
3. **Wave 1-2 期间不碰 Wave 3+ 的 Epic** — 防止战线拉长
4. **零付费投流** — 全期 90 天不投一分钱
5. **CPTI 账号化必须在 Day 35 前 ship** — 是裂变飞轮的钥匙
6. **每周五 demo 日** — 当周 ship 的功能必须在 demo 日真机演示
7. **回归脚本** — 每 Epic 完成必须跑 `pnpm build` + `pnpm lint`

---

## Sprint 1 立即动作（本次对话已启动）

- [x] E-01 扩展：Banti / Delta / Kings / Bird 四页挂 UniverseSwitcher
- [x] E-01 收尾：UGC 结果页挂 UniverseSwitcher
- [x] W0.2 女性向视觉规范 doc
- [x] W0.3 文案女权 checklist
- [x] E-02 女权 validator lib + /api/creator/universes/[id]/compliance 接口
- [x] E-02 Studio 合规面板 ComplianceGate + 接入 submit 硬拦截
- [x] E-03 CPTI 账号化 UX：确认 ClaimAssetCard 已接入 CptiResult + CptiRelationshipResult（无需重复建设）
- [x] 构建回归验证（pnpm build 通过）

其余 Story 按本文节奏依次推进。每完成一个 Story 更新本文 `[ ]` → `[x]`。
