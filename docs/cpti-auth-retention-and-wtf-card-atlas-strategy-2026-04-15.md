# CPTI 登录留存与 WTF CARD 总图鉴谱产品战略

> 日期：2026-04-15
> 状态：Draft v1
> 方法：延续 `docs/cpti-relationship-growth-strategy-2026-04-15.md` 的用户语境研究，结合当前代码结构与账号期产品判断
> 适用范围：`CPTI`、登录注册、匿名转正、`WTF CARD` 顶层图鉴体系、数据库选型

---

## 0. 结论先行

这次结论和前一版有一个重要变化：

### 0.1 数据库建议改判

如果目标还是“匿名先玩，只补一层 Postgres 真相源”，我仍然会选 `Neon`；
但如果目标已经变成：

- 现在就上登录注册
- 匿名先玩，后续引导认领账号
- 把 `CPTI` 结果、关系图鉴、排行榜和总图鉴谱长期沉淀到同一个身份上

那当前阶段更适合 **直接上 `Supabase`**。

不是因为 `Neon` 不行，而是因为你现在的主问题已经不是“接一个数据库”，而是“把身份系统做成产品能力”。

### 0.2 CPTI 是最适合做登录留存切入口的模块

当前所有模块里，`CPTI` 最适合承接账号化，原因不是它更完整，而是它的情绪价值最强：

- 用户刚测完自己，会想保留结果
- 用户刚匹配完关系，会想保留“我们”的结果
- 用户刚解锁稀有关系，会怕丢
- 用户看到自己能开始累计图鉴和榜单，会愿意认领身份

所以登录不该从首页硬塞，而该从 `CPTI` 的高价值节点自然弹出。

### 0.3 WTF CARD 应该是“顶层资产柜”，不是现在就做成一张大一统平面图

当前最自然的战略不是把所有模块强行塞进一个同构图谱，而是分层：

- `Layer 0`：`WTF Atlas`，平台级总谱
- `Layer 1`：`WTF CARD`，用户个人入口与资产柜
- `Shelf A`：共享内核子宇宙
- `Shelf B`：独立人格模块
- `Shelf C`：关系模块
- `Shelf D`：时态模块
- `Overlay`：成就、榜单、稀有度、活动层

先把“柜子分层”做对，再逐步汇成总图鉴谱，会比现在直接做大一统图稳很多。

---

## 1. 为什么战略判断变了

前一阶段的产品命题是：

> 证明 `CPTI` 有传播力，先把“配对码 -> 关系结果 -> 图鉴 -> 榜单”闭环跑起来。

而你现在的命题已经变成：

> 在增长强劲的窗口期，把流量尽快沉淀成账户资产与长期留存。

这意味着产品重心发生了切换：

- 之前：先把关系玩法做成立
- 现在：要把“关系玩法”升级成“身份沉淀入口”

也意味着系统重心切换：

- 之前：数据库只是后端真相源
- 现在：数据库 + 账号体系是用户价值的一部分

如果还继续按“纯匿名 MVP”的技术前提推进，最大的损失不是技术债，而是：

- 高峰流量无法转成可持续用户资产
- 用户换设备、清缓存、跨端访问时结果丢失
- 图鉴、关系、榜单、成就无法统一到同一身份
- 后面再上账号时，会产生一次昂贵的迁移与补绑工程

---

## 2. Product Strategy Canvas

## 2.1 Vision

把 `SBTI` 从“一个个可传播的测试结果页”，升级成：

> 一个可以持续积累、持续对比、持续被看见的“多宇宙人格与关系图鉴平台”。

其中 `CPTI` 的角色不是附属测试，而是：

> 把“我和你”这件事，转译成可保留、可收集、可比较的关系身份。

平台价值观应保持：

- 先玩后认领，而不是先注册后体验
- 给用户命名感，而不是审判感
- 把表达做轻，把沉淀做深
- 把关系当资产，而不是一次性结果

## 2.2 Market Segments

### Segment A：关系表达型用户

她们想解决的问题不是“做一道题”，而是：

- 我跟这个人到底是什么感觉
- 这段关系能不能被一句话说清
- 我想发给对方，但又不想太尴尬

这是第一优先级人群。

原因：

- 她们最容易触发分享
- 她们最能带来二次参与
- 她们最容易在结果页产生“想保存”的动机

### Segment B：收集与比较型用户

她们的核心驱动力是：

- 我要把关系图鉴集齐
- 我要看自己是不是容易遇到灵魂伴侣
- 我要看自己在朋友里是不是关系体质更强

这部分用户是留存和榜单的主要来源。

### Segment C：多宇宙人格深挖型用户

她们已经不满足于单次测试，而希望：

- 把不同宇宙的“我”统一放进一个总谱里
- 看见“关系中的我”和“平时的我”有什么差异
- 把平台从“测一次”变成“长期收藏”

这是 `WTF CARD` 顶层价值成立后的核心沉淀人群。

## 2.3 Relative Costs

这一阶段不应该优化“最低成本”，而应该优化“最高价值的留存结构”。

因此选择上应偏向：

- 更适合账号化
- 更适合匿名转正式身份
- 更适合持续扩展到图鉴、Storage、Realtime、权限控制

而不是只看：

- 哪个 Postgres 更轻
- 哪个 preview branch 更顺

所以这里是“价值优先”，不是“基础设施最轻优先”。

## 2.4 Value Proposition

### 对 Segment A：关系表达型用户

- `What before`
  用户测完只能截图，或者做一次关系结果；一旦换设备或后续还想回看，资产容易丢。
- `How`
  用 `CPTI` 的结果页和关系页承接匿名身份，在高价值结果时提醒“登录保存你们的关系图鉴与总图鉴谱”。
- `What after`
  用户会感知到：这不是临时测试，而是我正在建立自己的关系档案。
- `Alternatives`
  截图收藏、聊天记录回翻、单次分享链接、普通测试网站。

### 对 Segment B：收集与比较型用户

- `What before`
  现在只能零散做几次关系测试，没有长期成长反馈。
- `How`
  给出关系图鉴、稀有关系数、灵魂伴侣数、榜单与阶段成就。
- `What after`
  用户会从“测一次”切到“我想继续解锁”。
- `Alternatives`
  本地收藏、社交平台晒图、其他一次性测试。

### 对 Segment C：多宇宙人格深挖型用户

- `What before`
  现在 `/types` 是浏览馆，`/card` 是本地徽章墙，两者没有统一的账户级语义。
- `How`
  把 `WTF CARD` 升级成总资产入口，把共享宇宙、独立人格、关系模块、时态模块分层整合。
- `What after`
  用户会把平台理解成“我的人格收藏柜”，而不是“很多分散的小测试”。
- `Alternatives`
  手动收藏不同链接、截图归档、只记住印象最深的结果。

## 2.5 Trade-offs

明确不做：

- 不做重社交 feed
- 不做站内聊天
- 不做先注册后体验
- 不把所有模块都硬压成同一种可比节点
- 不在 P0 把整个 atlas 做成复杂知识图谱
- 不为了前端省事，把核心关系写入直接暴露给浏览器

这些“不做”会带来焦点：

- `CPTI` 先承担账号化楔子
- `WTF CARD` 先承担资产入口
- 图谱先分层，不急着全量连通

## 2.6 Key Metrics

### North Star Metric

`周活跃持久化图鉴用户数`

定义建议：

- 一周内至少发生 1 次资产写入
- 资产写入包括：新宇宙结果、新关系记录、新图鉴解锁、新成就获得

这个指标比 DAU 更符合你现在的阶段，因为你要的不是“来过”，而是“沉淀了”。

### OMTM（当前季度）

`CPTI 高价值节点的游客转账户率`

高价值节点包括：

- 自测完成页
- 关系匹配完成页
- 稀有关系解锁页
- 图鉴页首次出现“可永久保留”提示时

辅助指标：

- `CPTI result -> create anonymous identity` 转化率
- `CPTI relationship -> claimed account` 转化率
- 7 日关系图鉴回访率
- 30 日 `WTF CARD` 再访问率
- 登录用户的人均图鉴新增数

## 2.7 Growth

增长模型应该从“结果页分享”升级成“身份资产飞轮”：

1. 用户完成 `CPTI` 自测
2. 生成邀请链接或六码发给别人
3. 对方完成配对
4. 双方解锁关系结果
5. 结果页提示登录保存
6. 用户认领身份，开始累计关系图鉴
7. 图鉴与榜单刺激再次邀请
8. 用户再去测别的宇宙，充实 `WTF CARD`
9. 总图鉴谱越丰富，用户切换成本越高

这是一条：

- acquisition 由分享驱动
- retention 由资产驱动
- expansion 由总图鉴谱驱动

的连续飞轮。

## 2.8 Capabilities

要赢这一阶段，必须补齐以下能力：

### 账号与身份

- 匿名身份
- 登录注册
- 匿名转正式账号
- 昵称、头像、个人主页入口

### 图鉴与关系资产

- 统一 collection registry
- 资产分层模型
- `CPTI` 关系账本
- 用户聚合统计

### 隐私与权限

- 私有
- 双方可见
- 匿名公开
- 榜单参与

### 增长与运营

- 榜单聚合
- 稀有度调控
- 事件埋点
- 后台运营视图

### 技术形态

- `Vercel + Next.js`
- `Supabase Auth + Postgres`
- server-first 写模型
- 渐进式 RLS

## 2.9 Can't / Won't

当前最重要的防御力不是算法壁垒，而是：

- 个人图鉴越积越多，迁移成本越高
- 关系图鉴与总图鉴谱越完整，切换成本越高
- 用户与他人的真实互动越多，数据网络效应越强
- 子宇宙越丰富，`WTF CARD` 的平台心智越强

竞争对手可以很快复刻一道测试题，但不容易同时复刻：

- 你的多宇宙库存
- 你的关系图鉴
- 你的朋友和你之间的关系记录
- 你的总资产柜

---

## 3. 为什么 CPTI 应该是账号入口，而不是普通模块

你不应该把登录注册放成一个通用浮层，而应该把它绑定在“用户最怕丢”的瞬间。

`CPTI` 正好拥有这样的时机。

### 3.1 最强触发点

#### 自测完成后

用户会想：

- 这个结果我以后还想回来看
- 我不想下次还重新测

#### 配对完成后

用户会想：

- 我想把这段关系保留下来
- 我想以后还能继续看

#### 首次解锁稀有关系后

用户会想：

- 这个很难得，我不想丢

#### 图鉴累计到一定阶段后

用户会想：

- 我已经收集了这么多，现在再不保存就亏了

### 3.2 登录提示文案方向

不是：

- 立即注册
- 登录查看更多

而是：

- 登录后永久保留你的关系图鉴
- 把这次匹配收进你的 `WTF CARD`
- 认领你的总图鉴谱，下次回来不会丢
- 你已经解锁 `x` 种关系，现在认领身份可永久保存

也就是说，登录不是权限门，而是“认领资产”。

---

## 4. WTF CARD 总图鉴谱应该怎么做

## 4.1 先统一认知

`WTF CARD` 现在更像一个本地徽章墙，而不是完整 atlas。

代码里已经能看到 4 层雏形：

- `src/lib/universes.ts`
- `src/app/types/gallery-data.ts`
- `src/lib/wtf-card.ts`
- `src/app/card/CardContent.tsx`

但它们还没有被一个统一 ontology 串起来。

## 4.2 推荐 hierarchy

### Layer 0：WTF Atlas

平台级总谱。

职责：

- 定义“平台里有哪些可积累资产”
- 定义这些资产属于哪一层
- 定义是否可比较、是否可排行、是否会过期、是否是 solo 还是 relationship

### Layer 1：WTF CARD

用户个人入口页。

它不是底层数据结构本身，而是“用户的总资产柜”。

应该承载：

- 我的已解锁宇宙
- 我的关系图鉴
- 我的独立人格模块
- 我的近期状态
- 我的稀有资产与榜单

### Shelf A：共享内核子宇宙

建议包括：

- `standard`
- `xiuxian`
- `wtfti`
- `bird`
- `banti`
- `kings`
- `delta`

特点：

- 共享同一套底层人格内核
- 只是不同语境、不同命名皮肤
- 可以互相映射，但不宜简单累加成“重复人格”

### Shelf B：独立人格模块

建议包括：

- `xpti`
- `soulti`
- `flower`
- `cpti-role`
- 后续 `love / work`

特点：

- 仍然描述“我”
- 但不共享同一坐标系
- 适合放进总资产柜，但不应强行与 `Shelf A` 做等价比较

### Shelf C：关系模块

建议包括：

- `cpti-relationship`
- 后续 `identify / squad / combo / rank` 中可转资产的部分

特点：

- 这是 graph edge，不是 solo badge
- 天然带隐私边界
- 可重复、多对象、可沉淀成关系账本

### Shelf D：时态模块

建议包括：

- `daily`
- `drunk`
- 未来任何“状态切片型”结果

特点：

- 更像时间序列记录
- 可以进入 atlas
- 但不要和长期人格共用同一完成度

### Overlay：成就与运营层

包括：

- 榜单
- 稀有度
- 徽章
- 连击
- 活动卡
- 纪念称号

它应该叠在 atlas 之上，而不是写进底层 ontology。

## 4.3 为什么现在不要直接做“大一统图”

因为会产生四个问题：

### 假可比性

共享内核宇宙、独立人格、关系图鉴、每日状态，本来就不是同一种对象。

### 永久资产被短期状态污染

`daily`、`drunk` 一旦与长期人格混在同一完成度里，用户会觉得图鉴变杂。

### 关系模块被错误降级

`CPTI` 关系不是“多一个 badge”，而是双人、可重复、带隐私和对账逻辑的关系记录。

### 新宇宙上线速度下降

如果每个新模块都要先进入复杂总谱，产品扩张效率会变差。

所以正确路线是：

> 先做“统一注册表 + 分层资产柜”，再做“渐进连通的总图鉴谱”。

---

## 5. 数据库与技术建议

## 5.1 当前阶段建议：Supabase

原因很直接：

- 你现在需要的是账号化，不只是数据库
- 你需要匿名先玩、后续认领
- 你需要把一切沉淀到同一个 `user id`
- 你后面大概率还会需要头像、分享图、通知、Realtime 提醒

当前官方能力里，`Supabase` 在这些方面更顺：

- `Auth`
- anonymous sign-in
- Next.js SSR auth client
- RLS
- Storage
- Realtime

而 `Neon` 仍然更适合：

- 只想要 Postgres
- 更在意 preview branch fidelity
- 还没把账号体系放进当期范围

## 5.2 推荐架构：server-first，不要一上来就全前端直连

建议落地方式：

- `Supabase` 负责身份与主库
- 业务关键写入走 `Vercel Route Handlers` / Server Actions
- 前期复杂关系写入、聚合和榜单都在服务端完成
- RLS 先覆盖最核心的用户私有表
- 等 schema 和权限边界稳定后，再逐步开放部分客户端读取

这条路比“一上来就用浏览器直接读写一堆表”稳很多。

## 5.3 环境建议

当前不建议把 `Supabase Branching` 当第一阶段主工作流。

更稳的方式：

- `production`：正式项目
- `staging`：长期存在的预发项目
- 本地迁移与 seed：持续维护

等 schema、账号体系、RLS 稳定后，再考虑更激进的 preview branch 工作流。

---

## 6. 90 天阶段路线图

## Phase 1：先把“关系结果不丢”做成立

目标：

- 用户完成 `CPTI` 自测或配对后，可生成匿名身份
- 结果、关系、图鉴可持久保存
- 首页不强注册，价值节点再认领

范围：

- Supabase Auth
- 匿名身份
- `cpti_users` 与关系资产表
- 结果页登录保存提示
- `WTF CARD` 服务端版本雏形

## Phase 2：把“关系资产”升级成“关系图鉴”

目标：

- `CPTI` 关系墙改为真实服务端图鉴
- 出灵魂伴侣数、稀有关系数、图鉴进度
- 出基础榜单

范围：

- 图鉴聚合
- 榜单快照
- 隐私开关
- 关系记录页

## Phase 3：把 `WTF CARD` 升级成“总资产柜”

目标：

- 不只看 `CPTI`
- 能看见自己跨宇宙的资产结构

范围：

- 统一 collection registry
- `Shelf A/B/C/D` 前端入口
- 个人主页与总资产摘要
- 跨宇宙探索 CTA

---

## 7. 关键假设与低成本验证

## 7.1 假设一

用户在 `CPTI` 关系结果页的登录意愿，高于普通测试结果页。

### 验证

只在 `CPTI` 关系结果页先上“认领资产”提示，不在其他宇宙同步上线，对比游客转账户率。

## 7.2 假设二

“保存关系图鉴”比“保存测试结果”更能促进登录。

### 验证

同一页面做两版文案：

- 保存测试结果
- 保存关系图鉴与总图鉴谱

对比点击和转化。

## 7.3 假设三

`WTF CARD` 总资产入口能提升跨宇宙复访率。

### 验证

给一部分用户在 `CPTI` 结果页露出“去我的总图鉴谱”，另一部分只保留当前 CTA，对比 7 日跨宇宙访问率。

## 7.4 假设四

“先匿名、后认领”比“先注册、后体验”更适合当前阶段。

### 验证

保留游客主流程，只在资产保存节点创建匿名身份并提示认领；不要把注册前置到答题前。

---

## 8. 这轮最重要的产品决策

### 决策 1

`CPTI` 不是一个普通模块，而是账号化与留存的最佳切入口。

### 决策 2

当前阶段数据库应直接走 `Supabase`，因为身份系统已经变成产品能力本身。

### 决策 3

`WTF CARD` 先做顶层资产柜，不急着把所有模块压成一个平面大图谱。

### 决策 4

路线要从“测题裂变”升级成“关系资产 -> 账号认领 -> 总图鉴谱”的连续飞轮。

---

## 9. 参考与依据

- 现有代码结构：
  - [src/lib/universes.ts](/Users/caonanya/AI_Code/repos/sbti/src/lib/universes.ts)
  - [src/lib/wtf-card.ts](/Users/caonanya/AI_Code/repos/sbti/src/lib/wtf-card.ts)
  - [src/app/types/gallery-data.ts](/Users/caonanya/AI_Code/repos/sbti/src/app/types/gallery-data.ts)
  - [src/app/card/CardContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/card/CardContent.tsx)
- 已有战略文档：
  - [docs/cpti-relationship-growth-strategy-2026-04-15.md](/Users/caonanya/AI_Code/repos/sbti/docs/cpti-relationship-growth-strategy-2026-04-15.md)
  - [docs/cpti-backend-prd.md](/Users/caonanya/AI_Code/repos/sbti/docs/cpti-backend-prd.md)
  - [docs/cpti-data-model-and-instrumentation.md](/Users/caonanya/AI_Code/repos/sbti/docs/cpti-data-model-and-instrumentation.md)
- 官方资料：
  - [Supabase Auth](https://supabase.com/docs/guides/auth)
  - [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
  - [Supabase Next.js SSR Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)
  - [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
  - [Supabase Storage](https://supabase.com/docs/guides/storage)
  - [Supabase Realtime](https://supabase.com/docs/guides/realtime)
  - [Neon Auth Overview](https://neon.com/docs/auth/overview)
  - [Neon Vercel Overview](https://neon.com/docs/guides/vercel-overview)
  - [Neon Branch Per Preview](https://neon.com/branching/branch-per-preview)
  - [Vercel Supabase Marketplace](https://vercel.com/marketplace/supabase)
  - [Vercel Neon Integration](https://vercel.com/integrations/neon)
