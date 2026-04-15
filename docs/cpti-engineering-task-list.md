# CPTI Engineering Task List / Issue Backlog

> 日期：2026-04-15
> 范围：CPTI 后台化一期
> 关联文档：
> - `docs/cpti-backend-prd.md`
> - `docs/cpti-data-model-and-instrumentation.md`
> - `docs/cpti-frontend-interaction-spec.md`
> - `docs/cpti-db-decision-vercel-neon-vs-supabase.md`

---

## 0. 目标

把当前以本地存储为主的 `CPTI` 配对玩法，升级成：

- 可落库
- 可双向同步
- 可跨设备查看
- 可图鉴沉淀
- 可排行榜聚合
- 可在 Vercel 上稳定运行

---

## 1. 推荐执行顺序

### Milestone A：Architecture + Persistence

- 选型与建库
- 匿名身份
- SQL schema
- 基础 `/api/cpti/*`

### Milestone B：Pair Code + Relationship Write Path

- 六位码
- 服务端重算
- 双向关系落库

### Milestone C：Collection + Leaderboard

- 我的图鉴
- 我的关系统计
- 榜单基础版

### Milestone D：Frontend Integration + Privacy + Analytics

- 结果页入口升级
- 图鉴/榜单入口
- 隐私开关
- 埋点与看板

---

## 2. Epic 1：Database & Runtime Foundation

### E1-1 选定数据库与运行时方案

- Priority: P0
- Owner: Tech Lead
- Estimate: 0.5d
- Output:
  - 确认使用 Neon 还是 Supabase
  - 确认数据库接入方式
  - 确认 migration 工具
- Done when:
  - 有书面 ADR
  - 有 `.env` 命名规范
  - 有本地/preview/prod 环境约定

### E1-2 初始化数据库连接层

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E1-1
- Output:
  - `src/lib/server/db/*`
  - 环境变量校验
  - 连接池/driver 初始化
- Done when:
  - 本地和 preview 环境都能连库
  - API route 可执行简单 `select 1`

### E1-3 建立 migration 流程

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E1-1
- Output:
  - migration 命令
  - schema 目录
  - preview/prod migration 规范
- Done when:
  - 新表可通过 CI / deploy 流程自动迁移

---

## 3. Epic 2：Anonymous Identity

### E2-1 新增匿名身份 bootstrap API

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E1-2
- API:
  - `POST /api/cpti/users/bootstrap`
- Output:
  - `cpti_users` 写入
  - 匿名 token 返回
  - cookie/header 策略

### E2-2 前端接入匿名身份初始化

- Priority: P0
- Owner: Frontend
- Estimate: 1d
- Depends on: E2-1
- Files:
  - `src/app/cpti/*`
  - `src/components/CptiQuiz.tsx`
- Output:
  - 首次进入 CPTI 时完成 bootstrap
  - 后续请求自动带身份

### E2-3 昵称更新接口与前端绑定

- Priority: P1
- Owner: Fullstack
- Estimate: 0.5d
- API:
  - `PATCH /api/cpti/users/me`

---

## 4. Epic 3：Profile Snapshot Persistence

### E3-1 自测结果写入 profile snapshot

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E2-1
- Output:
  - `cpti_profile_snapshots`
  - 记录人格 slug 与五维分数

### E3-2 前端从“仅本地 profile”升级为“本地缓存 + 服务端 profile”

- Priority: P0
- Owner: Frontend
- Estimate: 1d
- Depends on: E3-1
- Files:
  - `src/lib/cpti/cpti-profile.ts`
  - `src/components/CptiQuiz.tsx`
- Done when:
  - 当前逻辑不回退
  - profile 同时存在本地缓存和服务端记录

---

## 5. Epic 4：Six-digit Pair Code

### E4-1 建立 pair code 表与生成服务

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E1-3, E3-1
- Output:
  - `cpti_pair_codes`
  - 六位数字码生成
  - direct/open 两种 mode

### E4-2 新增创建 pair code API

- Priority: P0
- Owner: Backend
- Estimate: 1d
- API:
  - `POST /api/cpti/pair-codes`

### E4-3 新增 resolve pair code API

- Priority: P0
- Owner: Backend
- Estimate: 1d
- API:
  - `POST /api/cpti/pair-codes/resolve`

### E4-4 结果页升级为“链接 + 六位码”双入口

- Priority: P0
- Owner: Frontend
- Estimate: 1.5d
- Depends on: E4-2, E4-3
- Files:
  - `src/app/cpti/result/[type]/CptiResultContent.tsx`
- Output:
  - 生成六码
  - 复制六码
  - 带六码分享图入口
  - 保留现有链接邀请

---

## 6. Epic 5：Match Flow & Server-side Recompute

### E5-1 新增 match start API

- Priority: P0
- Owner: Backend
- Estimate: 0.5d
- API:
  - `POST /api/cpti/matches/start`

### E5-2 新增 match complete API

- Priority: P0
- Owner: Backend
- Estimate: 2d
- Depends on: E4-1
- API:
  - `POST /api/cpti/matches/complete`
- Core:
  - 服务端重算人格
  - 服务端重算 relationship
  - 幂等控制

### E5-3 抽离可复用的服务端 CPTI scoring / matching 模块

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E5-2
- Output:
  - 服务端可复用的评分函数
  - 从前端算法中抽取纯逻辑

### E5-4 前端配对提交流程改为走服务端写路径

- Priority: P0
- Owner: Frontend
- Estimate: 1.5d
- Depends on: E5-2
- Files:
  - `src/components/CptiQuiz.tsx`
  - `src/app/cpti/invite/CptiInviteContent.tsx`
  - `src/app/cpti/relationship/CptiRelationshipResult.tsx`
- Done when:
  - sessionStorage 仅作临时缓存
  - 真正结果来源于服务端返回

### E5-5 废弃“原始数据 base64 链接”，改为 opaque token

- Priority: P0
- Owner: Fullstack
- Estimate: 1d
- Depends on: E4-2, E5-2
- Why:
  - 当前 `?code=` / `?r=` / `?c=` 都是原始数据拼字符串后再编码
  - 昵称含 `.` 会有解析风险
  - 关系数据直接暴露在 URL 中不利于后端化
- Done when:
  - 邀请链接改为 share token
  - 回传关系链接改为 relationship token / id
  - 历史链接保留兼容读取策略

---

## 7. Epic 6：Relationship Ledger & Mutual Sync

### E6-1 建立 relationships / relationship_events 表

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E5-2

### E6-2 建立双向关系写入逻辑

- Priority: P0
- Owner: Backend
- Estimate: 1.5d
- Depends on: E6-1
- Output:
  - 发起人与参与者都获得关系记录
  - collection delta 计算

### E6-3 新增关系隐私与上榜状态更新 API

- Priority: P1
- Owner: Backend
- Estimate: 1d
- API:
  - `PATCH /api/cpti/relationships/:id/privacy`

### E6-4 关系结果页展示“已同步到双方图鉴”

- Priority: P0
- Owner: Frontend
- Estimate: 0.5d
- Depends on: E6-2

---

## 8. Epic 7：Collection & Card Migration

### E7-1 新增 user collection stats 聚合

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Depends on: E6-2

### E7-2 新增 collection API

- Priority: P0
- Owner: Backend
- Estimate: 1d
- API:
  - `GET /api/cpti/me/collection`

### E7-3 卡片/图鉴页从纯本地读取升级为“服务端优先，本地兼容”

- Priority: P0
- Owner: Frontend
- Estimate: 2d
- Depends on: E7-2
- Files:
  - `src/lib/wtf-card.ts`
  - `src/app/card/CardContent.tsx`
- Done when:
  - 新关系优先读服务端
  - 历史本地数据不丢

### E7-4 图鉴进度与 recent additions UI

- Priority: P1
- Owner: Frontend
- Estimate: 1d

### E7-5 修复当前“只写答题一侧图鉴”的行为差异

- Priority: P0
- Owner: Backend + Frontend
- Estimate: 1d
- Why:
  - 当前只有完成答题的一侧会 `recordRelationship`
  - 发起人打开回传链接只是看结果，没有真正同步入卡
- Done when:
  - 发起人和参与者两侧的 collection 都由服务端返回控制
  - 关系结果页能明确显示双向同步成功

---

## 9. Epic 8：Leaderboard Foundation

### E8-1 建立榜单查询层

- Priority: P0
- Owner: Backend
- Estimate: 1.5d
- Depends on: E7-1
- Boards:
  - soul_count
  - rare_count
  - collection_progress

### E8-2 新增 leaderboard API

- Priority: P0
- Owner: Backend
- Estimate: 1d
- API:
  - `GET /api/cpti/leaderboards`

### E8-3 新增榜单页或榜单模块

- Priority: P1
- Owner: Frontend
- Estimate: 2d
- Entry points:
  - CPTI 结果页
  - CPTI 关系结果页
  - 卡片/图鉴页

### E8-4 榜单分享图 / 榜单文案

- Priority: P1
- Owner: Frontend + Design
- Estimate: 1.5d

---

## 10. Epic 9：Frontend UX Upgrade

### E9-1 CPTI 结果页交互改版

- Priority: P0
- Owner: Frontend
- Estimate: 1.5d
- Include:
  - 邀请链接
  - 六位码
  - 图鉴入口
  - 榜单入口

### E9-2 CPTI 关系结果页交互改版

- Priority: P0
- Owner: Frontend
- Estimate: 1.5d
- Include:
  - collection delta
  - 继续配对 CTA
  - 图鉴入口
  - 榜单入口
  - 隐私/上榜状态入口

### E9-3 CPTI 首页与导航补入口

- Priority: P1
- Owner: Frontend
- Estimate: 0.5d
- Files:
  - `src/app/cpti/CptiHomeContent.tsx`
  - `src/components/Navigation.tsx`

### E9-3b 把 CPTI 接回统一 Card / Collection 心智

- Priority: P1
- Owner: Frontend
- Estimate: 0.5d
- Why:
  - 其他宇宙已有 `WtfCardCTA`
  - CPTI 当前“已写入卡片”几乎不可见
- Output:
  - CPTI 结果页 / 关系页出现明确的“去我的卡片/图鉴”入口

### E9-4 开放码输入页

- Priority: P1
- Owner: Frontend
- Estimate: 1d

---

## 11. Epic 10：Privacy, Trust, Compliance

### E10-1 更新隐私页

- Priority: P0
- Owner: Frontend / PM
- Estimate: 0.5d
- File:
  - `src/app/privacy/page.tsx`

### E10-2 结果页补充“何时公开/何时上榜”的说明

- Priority: P0
- Owner: PM / Frontend
- Estimate: 0.5d

### E10-3 删除/失效策略

- Priority: P1
- Owner: Backend
- Estimate: 1d
- Includes:
  - 关系失效
  - 用户退出榜单
  - 软删除策略

---

## 12. Epic 11：Analytics & Monitoring

### E11-1 前端行为埋点

- Priority: P0
- Owner: Frontend
- Estimate: 1d
- Events:
  - `cpti_pair_code_created`
  - `cpti_pair_code_copied`
  - `cpti_pair_code_shared`
  - `cpti_match_started`
  - `cpti_leaderboard_viewed`

### E11-2 服务端业务事件埋点

- Priority: P0
- Owner: Backend
- Estimate: 1d
- Events:
  - `cpti_match_completed_server`
  - `cpti_relationship_synced`
  - `cpti_relationship_invalidated`

### E11-3 运营看板

- Priority: P1
- Owner: Data / Backend
- Estimate: 1d

---

## 13. Epic 12：Abuse Prevention

### E12-1 六位码频率限制

- Priority: P0
- Owner: Backend
- Estimate: 1d

### E12-2 match complete 幂等与刷榜校验

- Priority: P0
- Owner: Backend
- Estimate: 1d

### E12-3 风控标记面板

- Priority: P1
- Owner: Backend
- Estimate: 1d

---

## 14. 建议 Sprint 拆分

## Sprint 1

- E1-1
- E1-2
- E1-3
- E2-1
- E2-2
- E3-1
- E3-2

## Sprint 2

- E4-1
- E4-2
- E4-3
- E4-4
- E5-1
- E5-2
- E5-3

## Sprint 3

- E5-4
- E6-1
- E6-2
- E7-1
- E7-2
- E9-1
- E9-2

## Sprint 4

- E7-3
- E8-1
- E8-2
- E9-3
- E10-1
- E11-1
- E11-2
- E12-1
- E12-2

## Sprint 5

- E6-3
- E7-4
- E8-3
- E8-4
- E9-4
- E10-3
- E11-3
- E12-3

---

## 15. Blockers To Resolve Early

- 是否直接上 `Neon` 作为 Vercel 原生 Postgres
- migration 工具选择
- 匿名 token 放 cookie 还是 localStorage + header
- relation visibility 默认值
- 榜单默认关闭还是默认匿名开启
- 当前 `peer` 流程里“观察结果”是否继续写入答题者本人 `cpti` 卡片
- 历史 `.` 分隔符 base64 链接的兼容策略

---

## 16. 建议结论

如果团队资源有限，优先只做：

- E1
- E2
- E4
- E5
- E6
- E7
- E9

也就是先把：

> 匿名身份 -> 六位码 -> 服务端重算 -> 双向落库 -> 图鉴同步 -> 前台入口升级

这条主链做通，再扩榜单和风控后台。
