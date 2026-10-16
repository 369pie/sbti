---
title: WTFTI 平台战略整合 · 总执行计划（2026-05-08 → 2026-Q3）
date: 2026-05-08
status: master execution plan · approved · 命名层 amendment 见 her-aurora-rebrand-and-upgrade-2026-05-09.md
owner: founder + product
naming_amendment:
  date: 2026-05-09
  doc: her-aurora-rebrand-and-upgrade-2026-05-09.md
  rule: |
    本文出现的 "HER SALON / 她的沙龙 / 围炉 / 接力 / 沉淀 / Voice Sigil / 编辑部 / 她的月报 / 她词条"
    在执行层已统一替换为：
    HER AURORA / 她的极光 / 极光时刻 / 接光 / 入卷 / Halo · 光环印 / 守光人 / AURORA LETTER · 极光来信 / AURORA ATLAS · 极光星图。
    URL `/her-voice/*` 与 analytics 事件名 `her_voice_*` 保持不变，不重写本文以保留决策档案。
consolidates:
  - wtfti-platform-repositioning-2026-05-08.md     # 平台定位 + 首页 IA
  - mysti-tianfu-integration-2026-05-08.md         # Mysti 玄学引擎自研
  - her-salon-upgrade-2026-05-08.md                # HER-VOICE → HER SALON（命名层已被 HER AURORA 取代）
related_runtime:
  - src/app/HomeContent.tsx
  - src/app/her-voice/
  - src/app/mysti/
  - src/app/admin/hermosa/salon/
  - src/components/galaxy/GalaxyPreview.tsx        # Voice Sigil 复用源（已重命名为 Halo）
---

# 总执行计划 · WTFTI 战略整合升级

## 0. 一页纸总图

```
平台定位（不变）
  WTFTI = 为「她」打造的多宇宙人格社区
  ├─ 支柱 Ⅰ · KNOW HER     · 测试矩阵（已有，重组叙事）
  ├─ 支柱 Ⅱ · WALK WITH HER · Mysti × 自研命理引擎  ★本季新护城河
  └─ 支柱 Ⅲ · WRITE WITH HER · HER SALON × 她词条     ★本季新护城河

3 件大事，1 个节奏：
  1. 首页 + IA 重构（让"她"60 秒看懂平台）
  2. Mysti 升级为「她的私人占星编辑部」（自研命理引擎）
  3. HER-VOICE 升级为「HER SALON · 她的沙龙」（Voice Sigil + 接力 + 月报）

节奏：W1 认知 → W2 围炉&今日 → W3 引导&印记 → W4 档案&价值 → W5+ 沉淀&共建
```

---

## 1. 战略一致性检查（三份文档之间不打架）

| 维度 | 平台定位 | Mysti × 引擎 | HER SALON | 一致性 |
|---|---|---|---|---|
| 用户主体 | "她"（中文女性 18-32） | 同上 | 同上 | ✅ |
| 核心承诺 | 认识 / 陪伴 / 共写 | 陪伴（支柱 Ⅱ） | 共写（支柱 Ⅲ） | ✅ |
| 反什么 | 反 MBTI / 反塔罗 App / 反信息流 | 反"AI 算命师"标签 | 反 LinkedIn-female 圈层 | ✅ |
| 视觉语言 | Editorial Atelier × 暮光博物笔记 × Cosmic Romance | 同上（无新 token） | 同上（沿用 Galaxy SVG） | ✅ |
| 商业化 | 不在首页卖订阅 | 一次性档案 ¥39 + 通行证 ¥19/月 | 不直接变现，是支柱 Ⅲ 的活水 | ✅ |
| 数据基建 | admin/funnel + admin/hermosa | 复用 + 接命理后端 | 复用 + 加 sigil 表 | ✅ |
| 协同点 | 三支柱导航 | "她词条"靠引擎产命格坐标 | "她词条"靠 SALON 产女性经验 | **★引擎 + SALON 共同喂养「她词条」** |

**关键协同**：自研命理引擎是"AI 给坐标"，HER SALON 是"女性写经验"。两者在「她词条」交汇。这是平台未来 12 个月最重要的护城河双轮。

---

## 2. 5 周路线图（合并版 · 含验收）

> 前 4 周和首页改版同步推进；W5+ 进入沉淀期，Q3 收口为战略级 epic。

### W1 · 认知周（重新定义首页是给谁的）

**Epic E1.1 · Hero 重写 + 女性主张签名**
- 改 [src/app/HomeContent.tsx](src/app/HomeContent.tsx) Hero
- eyebrow `A FIELD GUIDE TO HER · 写给「她」的现代神话档案馆`
- H1 三行 italic 主张
- 双 CTA：90 秒看见我自己 + 今日抽一张牌
- Hero 下方一行对比段（不是 MBTI / 不是塔罗 App / 是会被她保存的档案）

**Epic E1.2 · IA 重组 · 6 卷书 → 3 支柱 panel**
- 三 panel：Ⅰ KNOW HER · Ⅱ WALK WITH HER · Ⅲ WRITE WITH HER
- 三色 accent 复用现有 token（玫瑰 / 鼠尾草 / 金箔）
- 顶部 nav 同步改成三支柱导航 + Mysti 今日 + 档案 + 登录

**Epic E1.3 · Social proof 一行 + 适合/不适合段**
- "3.7 万女生写下了她们的现代神话" + 一句真实留言
- 信任与边界段（适合 18-32 / 不适合诊断 / 不适合操控）

**Epic E1.4 · FAQ 增 2 题**
- "为什么是为女性？" / "「她词条」是什么？"

**Epic E1.5（并行）· 命理引擎 W1 调研**
- 跑 MingLi-Bench 评测脚本基线
- 自研对标方案技术选型（排盘库 / LLM / 工具调用框架）
- 输出 `mingli-engine-research-2026-05-XX.md`

**Epic E1.6（并行）· HER SALON 文案与重命名准备**
- 全站 "HER-VOICE" → "HER SALON · 她的沙龙" 文案表落地（不动 URL，URL 保持 `/her-voice/`，避免 SEO 损失）
- 后台 `admin/hermosa/salon/` 完成"主题排期"工具雏形

**W1 验收**
- ✅ 5 位首次访客 60 秒能复述"这平台是给谁的、能做什么"
- ✅ 命理引擎研究文档评审通过
- ✅ 沙龙文案表团队 review 通过

---

### W2 · 围炉&今日周（让明天还会回来）

**Epic E2.1 · 首页 S4「今日 · TODAY」模块**
- 未登录：Mysti 抽 1 张免费牌 inline 展示
- 已登录：今日抽牌 + Daily 签卡 + 上次未完成测试
- 右侧 micro card：本周 N 万女生抽到了 ___

**Epic E2.2 · 首页 S5「HER SALON」围炉窗口**
- 当周编辑部问题 1 个（来自 admin/hermosa/salon 排期）
- 3 条最新留言滚动
- CTA："走进沙龙 →"
- 6 标签 chip 保留

**Epic E2.3 · HER SALON 第一层「围炉」上线**
- `/her-voice/` 首页 hero 改为当周问题 + 编辑部主持卡
- DB：`hermosa_topics` 表（topic_id / week / question / cover_eyebrow / opens_at / closes_at / curator_note）
- API：`GET /api/hermosa/topics/current`
- 后台：`admin/hermosa/salon/` 完成主题创建 + 排期 + 当周激活
- 留言入口：当周问题相关的留言自动打 `topic_id` 标签

**Epic E2.4 · 命理引擎 v0 私测**
- 用 ezhipy / pyluach 等开源库做紫微 + 八字排盘
- 通用 LLM + 编辑部 prompt 做翻译层
- 内部 10 人 dogfood「她的星图档案」端到端 pipeline
- 不上线、不收费、内部反馈

**W2 验收**
- ✅ 首页有"今日有事可看 + 沙龙有话可接"两个回访钩子
- ✅ HER SALON 当周问题留言数 ≥ 50
- ✅ 命理引擎 v0 跑通 ≥ 10 份完整档案

---

### W3 · 引导&印记周（让她从哪开始 + 让她有归属）

**Epic E3.1 · 新生 90 秒引导测 `/start/`**
- 3 题：心境 / 关系状态 / 想被陪还是想被认领
- 推荐起点宇宙（Ⅰ-Ⅲ 之一）
- 首屏首页 primary CTA 直接打到这里
- DB：`onboarding_sessions` 轻表，仅留转化漏斗

**Epic E3.2 · 子页面 breadcrumb 统一**
- 所有 `/wtfti/` `/soulti/` `/xpti/` `/cpti/` `/mysti/` `/types/` `/her-voice/` `/card/` 顶部加"你正在 ‖ 支柱 X · ___"
- 提取共用组件 `<PillarBreadcrumb pillar="I" label="..." />`

**Epic E3.3 · Voice Sigil 印记 v0**
- 复用 [src/components/galaxy/GalaxyPreview.tsx](src/components/galaxy/GalaxyPreview.tsx) 的 SVG 印记生成器
- 新文件 `src/lib/sigil/generate.ts` —— 输入 (命格 / 主星 / 累计度数) → SVG
- DB：`hermosa_sigils` (user_hash / level / palette / orbit_layers / updated_at)
- 演化触发：第 1 / 7 / 27 / 81 / 243 句话点亮新轨道，**不显示进度条、不显示总数倒计时**
- 沙龙留言展示头处用 `<VoiceSigil hash={...} />` 替代头像
- 用户档案页 `/her-voice/my/` 看自己的印记

**Epic E3.4 · 命理引擎 v1 工具化**
- 抽出第一批确定性原子工具（约 30-50 个）：排盘 / 飞宫 / 取用神 / 流年 / 流月
- 工具调用框架（参考 Tianfu 论文 architecture，但全部自研）
- 内部 30 人 dogfood

**W3 验收**
- ✅ `/start/` 转化率：新访客 → 完成 1 次测试 +30%
- ✅ Sigil 已为所有沙龙留言用户生成
- ✅ 命理引擎 v1 跑通 50+ 档案，编辑部翻译质量主观评分 ≥ 4/5

---

### W4 · 档案&价值周（老用户回来值得 + Mysti 上线）

**Epic E4.1 · 已登录"档案首页"分支**
- 登录后首页改为：最近的我（最近测试结果卡）+ 今日运势 + 还没测的宇宙 + 沙龙未读
- 文件：`src/app/HomeContent.tsx` 加 `<AuthedHomeContent>` 分支
- 未登录保持原 hero

**Epic E4.2 · HER SALON 第二层「接力」上线**
- 回声链：留言下方 "我也" 按钮 + 一句话输入
- DB：`hermosa_echoes_thread` (parent_id / child_id / text / sigil_hash)
- UI：原帖下面金箔细线串接 5-7 条接力，超过折叠
- 编辑部周清理工具：admin/hermosa/salon/ 加"长篇折叠 / 阴阳标注"

**Epic E4.3 · 同声者匹配 v0**
- 后台周任务：按命格 + 标签 + 语言风格指纹聚类
- 用户在 `/her-voice/my/` 看到"和你最像的 5 位匿名同声者印记"
- 永远只显示 sigil + 一句节选，**永远不可主动搜索某人**

**Epic E4.4 · 「她的星图档案」上线 ¥39 / 通行证赠送**
- 路径：`/mysti/star-chart/`
- pipeline：用户填 → 命理引擎 → 编辑部翻译层 → Shrine 长卡
- 支付接入既有 paywall 流（复用 `wtfcard-collector` 同款 SKU pattern）
- 通行证 ¥19/月：自动赠送 1 次 + 后续半价

**Epic E4.5 · Mysti 价值说明强化**
- `/mysti/` 价格区改为：
  1. 365 天 · 每天一句只属于她的预兆
  2. 12 月 · 每月一封写给她当下的灵魂信
  3. 1 次 · 价值 ¥39 的"她的星图档案"赠送

**W4 验收**
- ✅ 登录用户次日回访 +25%
- ✅ 「她的星图档案」首日卖出 ≥ 50 份
- ✅ 接力触发率 ≥ 30%
- ✅ Mysti 通行证转化率 +15%

---

### W5+ · 沉淀&共建周（把碎片变成档案）

**Epic E5.1 · HER SALON 第三层「沉淀」上线**
- 第一份「她的月报」白皮书（5 月号）
  - 7 句最高共鸣留言 + 编辑部主笔 600 字 + 三联月相 × 三命格 × 三段叙事
  - PDF 导出 + Web 长页（`/her-voice/letters/2026-05/`）
- 复用 next-og 排版能力 + 现有 `we-heard-you/` 结构

**Epic E5.2 · 「她词条」v0 试点**
- 选 5 个高频主题（如 "撤回的话" / "妈妈那一代" / "AI 让我的工作变了"）
- 编辑部主笔 + 命理引擎给坐标 + SALON 留言精选 + AI 共写助手
- 首批 5 词条上线 `/her-voice/atlas/`（暂不开放投稿，邀请制）

**Epic E5.3 · 命理引擎 v2 · 推理规则工具化**
- 第二批 50-100 个工具（行业内部推理技法，按需触发）
- Sub-Agent 自评 + 多流派合参（紫微 / 八字 / 占星 三派）
- 跑一遍 MingLi-Bench 看截尾准确率提升

**Epic E5.4 · KOL 种子邀请**
- W5 月报上线后，给文子（@Eejoylove）/ Hanya（@RealHanyaHu）等女性 KOL 寄送纸质白皮书 + 一份「她的星图档案」
- 不强求互推；目的是让对方知道"还有这条不一样的路"

**W5+ 验收**
- ✅ 月报阅读完成率 ≥ 40%
- ✅ 「她词条」首批 5 条上线，KOL 反馈拿到 ≥ 1 条
- ✅ 命理引擎 v2 在 MingLi-Bench 上对比 v0 提升 ≥ 5 个百分点

---

### Q3 · 战略级 epic（「她词条」共建百科）

> 子计划：[q3-execution-plan-2026-07.md](q3-execution-plan-2026-07.md) —— 包含依赖图、子任务拆解、季度排期、风险登记。

**目标**：50+ 词条上线 + 100 位种子共写者 + 第一份《她词条 · 季度合订本》纸质出版物。

**关键 epic**
- Q3-E1 · 「她词条」开放共写（投稿 + 编辑部 review + 双月发布）
- Q3-E2 · 命理引擎 v3（接入完整 200+ 工具栈，目标 MingLi-Bench 50%+）
- Q3-E3 · HER SALON 创作者徽章 + Voice Sigil 高阶演化（不可炫耀但可识别）
- Q3-E4 · Mysti 「她的星图档案」二代（接 v3 引擎 + 加流年三章动画版）
- Q3-E5 · 第一份纸质出版物（《她词条 · 2026 夏》），定向赠送种子用户 + KOL

---

## 3. 开发任务清单（可直接进 issue tracker）

> 每条任务标注 `[周次] [支柱] [P 优先级] [E effort]`，按 P0 → P3 排序。

### W1 · 认知（5/8 - 5/14）
- [ ] **[W1][首页][P0][E1]** Hero 重写：eyebrow + H1 三行 italic + 对比段 + 双 CTA → `src/app/HomeContent.tsx`
- [ ] **[W1][首页][P0][E2]** IA 重组：6 卷书 → 3 支柱 panel + Roman numeral + 三色 accent
- [ ] **[W1][首页][P0][E1]** Nav 改三支柱导航 + Mysti 今日 + 档案 + 登录
- [ ] **[W1][首页][P1][E0.5]** Social proof 一行 + 适合/不适合段
- [ ] **[W1][首页][P1][E0.5]** FAQ 增 2 题（为什么为女性 / 她词条是什么）
- [ ] **[W1][SALON][P0][E1]** 全站 HER-VOICE → HER SALON 文案替换（URL 不动）
- [ ] **[W1][SALON][P1][E1]** `admin/hermosa/salon/` 主题排期工具雏形（topic CRUD）
- [ ] **[W1][引擎][P0][E2]** 命理引擎技术选型 + MingLi-Bench 跑基线 → `docs/01-strategy/mingli-engine-research-2026-05-XX.md`
- [ ] **[W1][数据][P1][E0.5]** funnel 加事件 `home_pillar_click(pillar)` `home_today_click` `home_salon_click`

### W2 · 围炉 & 今日（5/15 - 5/21）
- [ ] **[W2][首页][P0][E2]** 首页 S4「今日 · TODAY」模块（未登录抽牌 inline）
- [ ] **[W2][首页][P0][E1]** 首页 S5 HER SALON 围炉窗口（当周问题 + 3 条滚动）
- [ ] **[W2][SALON][P0][E1]** DB migration：`hermosa_topics` 表 + RLS
- [ ] **[W2][SALON][P0][E1]** API：`GET /api/hermosa/topics/current` + `POST` 留言时自动打 topic_id
- [ ] **[W2][SALON][P0][E2]** `/her-voice/` 首页 hero 改为当周问题主持卡
- [ ] **[W2][SALON][P1][E1]** 后台 admin/hermosa/salon/ 主题激活 / 关闭 / 编辑部 note
- [ ] **[W2][引擎][P0][E3]** 命理引擎 v0 pipeline：开源排盘库 → 通用 LLM → 编辑部翻译 prompt
- [ ] **[W2][引擎][P0][E2]** 内部 dogfood 工具页 `/internal/star-chart-preview/`（仅 token 访问）
- [ ] **[W2][引擎][P1][E1]** 编辑部翻译 prompt 三个模板：主星 / 流年 / 12 月主题

### W3 · 引导 & 印记（5/22 - 5/28）
- [ ] **[W3][首页][P0][E3]** `/start/` 新生 90 秒引导测 + 推荐分发 + funnel 事件
- [ ] **[W3][首页][P1][E1]** 共用组件 `<PillarBreadcrumb>` + 接入 8 个子页面
- [ ] **[W3][SALON][P0][E2]** Voice Sigil 生成器 `src/lib/sigil/generate.ts`（复用 Galaxy SVG）
- [ ] **[W3][SALON][P0][E1]** DB：`hermosa_sigils` 表 + 写入触发器（首次留言 / 每次升级）
- [ ] **[W3][SALON][P0][E1]** UI 组件 `<VoiceSigil hash={} />` + 替换沙龙留言头处
- [ ] **[W3][SALON][P1][E1]** `/her-voice/my/` 个人印记页（自己看自己的演化）
- [ ] **[W3][引擎][P0][E3]** 抽出第一批 30-50 个原子工具 + 工具调用框架
- [ ] **[W3][引擎][P1][E2]** 内部 30 人 dogfood（招募 + 反馈表）

### W4 · 档案 & 价值（5/29 - 6/4）
- [ ] **[W4][首页][P1][E2]** `<AuthedHomeContent>` 分支 + 4 块（最近的我 / 今日 / 还没测 / 沙龙未读）
- [ ] **[W4][SALON][P0][E2]** 回声链 "我也" 接龙：DB `hermosa_echoes_thread` + API + UI
- [ ] **[W4][SALON][P1][E2]** 同声者匹配 v0（cron 周任务 + 聚类 + my 页展示）
- [ ] **[W4][SALON][P1][E1]** 后台长篇折叠 / 阴阳标注工具
- [ ] **[W4][Mysti][P0][E3]** 「她的星图档案」上线：`/mysti/star-chart/` 表单 → pipeline → Shrine 长卡
- [ ] **[W4][Mysti][P0][E2]** SKU 接入：`mysti-star-chart` ¥39 单次 + 通行证赠送 1 次逻辑
- [ ] **[W4][Mysti][P0][E1]** `/mysti/` 价格区文案改为三点价值说明
- [ ] **[W4][数据][P1][E0.5]** funnel 加事件 `star_chart_view` `star_chart_purchase` `salon_thread_reply`

### W5+ · 沉淀（6/5 起）
- [ ] **[W5][SALON][P0][E3]** 「她的月报」5 月号：长页 `/her-voice/letters/2026-05/` + PDF 导出
- [ ] **[W5][SALON][P1][E2]** 「她词条」v0 试点：5 个词条 + `/her-voice/atlas/` 页面（邀请制）
- [ ] **[W5][引擎][P1][E3]** 第二批 50-100 推理规则工具 + Sub-Agent 自评
- [ ] **[W5][引擎][P2][E1]** 跑一次 MingLi-Bench 对比 v0 提升
- [ ] **[W5][增长][P2][E1]** KOL 种子邀请：5 位（文子 / Hanya 等）寄送月报 + 星图档案

### Q3 · 战略级（7-9 月）
- [ ] **[Q3][SALON][P0]** 「她词条」开放投稿 + 双月发布机制
- [ ] **[Q3][引擎][P0]** 引擎 v3 接入完整 200+ 工具栈，目标 MingLi-Bench 50%+
- [ ] **[Q3][SALON][P1]** 创作者徽章 + Sigil 高阶演化
- [ ] **[Q3][Mysti][P1]** 「她的星图档案」二代（接 v3 + 流年三章动画版）
- [ ] **[Q3][增长][P0]** 《她词条 · 2026 夏》纸质出版物 + KOL 定向赠送

---

## 4. 数据 / 度量看板（合并版）

> 在 `/admin/funnel/` 和 `/admin/hermosa/` 基础上新增看板，**这次升级所有 KPI 都是 outcome 不是 output**。

### 4.1 平台认知（W1-W2 验证）
| 指标 | 基线 | 目标 |
|---|---|---|
| 首页 60 秒跳出率 | 待补 | -30% |
| 新访客 → 完成 1 次测试 | 待补 | +30% |
| 7 日回访率 | 待补 | +50% |
| `home_pillar_click` 三柱均匀度 | 0 | Ⅰ:Ⅱ:Ⅲ ≈ 5:3:2（健康分布） |

### 4.2 Mysti × 引擎（W4-W5 验证）
| 指标 | 基线 | 目标 |
|---|---|---|
| 「她的星图档案」首月销量 | 0 | ≥ 1500 份 |
| 通行证 ¥19/月 转化率 | 待补 | +15% |
| 引擎单次推理成本 | 待标定 | ≤ ¥3 / 档案 |
| MingLi-Bench 截尾准确率 | v0: 待测 | v2 末 ≥ 45% / v3 末 ≥ 50% |

### 4.3 HER SALON（W2-Q3 验证）
| 指标 | 基线 | 目标 |
|---|---|---|
| 沙龙周 UV | 待补 | × 5 |
| 当周围炉留言数 | ~30/周 | ≥ 200/周 |
| 接力 "我也" 触发率 | 0 | ≥ 30% |
| 同声者点击率 | 0 | ≥ 15% |
| 月报阅读完成率 | 0 | ≥ 40% |
| 「她词条」条目数 | 0 | Q3 末 ≥ 50 |
| SALON → 通行证转化 | 待补 | ≥ 5% |

---

## 5. 跨支柱协同点（不能漏）

```
        命理引擎（自研）              HER SALON
              │                           │
              │  给坐标（命格/主星/流日）     │  给经验（女性真实留言/接力）
              │                           │
              └────────────┬──────────────┘
                           ↓
                    「她词条」共建百科
                       （Q3 战略级）
                           ↓
              《她词条 · 季度合订本》纸质出版物
```

**4 个不能漏的接缝**：

1. **Voice Sigil 携带命格** —— W3 引擎产出命格后写入 sigil_payload，让印记带上"她是哪个主星的女儿"，这是 SALON 和 Mysti 的第一次握手
2. **围炉问题接命理事件** —— W2 起每月有 1-2 个围炉问题由命理日历触发（如水逆 / 节气 / 流月换星），让 SALON 主题不只是编辑部直觉
3. **「她的星图档案」末页留 SALON 入口** —— W4 档案 PDF 末页一句"想把这一年留下来吗？走进沙龙 →"，让 Mysti 用户直接被引到 SALON
4. **「她词条」首批主题来自 SALON 高密度话题** —— W5 词条选题 100% 来自 SALON 留言聚类，不是编辑部凭空写

---

## 6. 反模式（团队墙上贴出来）

- ❌ 不再加测试宇宙 / 不强制登录 / 不做评论 / 不做关注 / 不做私信
- ❌ 不强调"准确率" / 不打"AI 算命师"标签 / 不做问事咨询
- ❌ 不抄 LinkedIn-female 圈层 / 不显示头衔 / 不做粉丝数
- ❌ 不在首页直接卖订阅 / 不做信息流推荐 / 不出英文版
- ❌ 不让命理黑话直出 / 不让 Sigil 变成虚荣度数 / 不让接力变阴阳池
- ❌ 不为了赶 KOL 节奏抄 HerName 路线 —— 我们走的是另一条路

---

## 7. 一页墙报（Stand-up 用）

> **三件大事 · 一个节奏**
>
> 1. 把首页改成"她 60 秒能看懂"
> 2. 让 Mysti 用上"她自己的命理引擎 + 编辑部翻译"
> 3. 把"她的话黑板"升级为"她的沙龙"
>
> **5 周 · 5 个验收**
>
> W1 认知到位 · W2 明天还想来 · W3 知道从哪开始 · W4 老用户回来值得 · W5+ 把碎片变成档案
>
> **2 条护城河 · 1 个汇合**
>
> 引擎给坐标 · 沙龙给经验 · Q3「她词条」收口
>
> **写在所有人 README**
>
> 「她进站第一秒，要看到自己；离开时，要带走一份愿意保存的现代神话。」
