# ADR: CPTI 在 Vercel 上选择 Neon 还是 Supabase

> Owner: Backend + Product Strategy
> Status: Active Spec
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: On database or auth-platform decision changes
> Next Decision: Decide whether any remaining Neon-first assumptions still survive in implementation planning

> 日期：2026-04-15
> 决策类型：Architecture Decision Record
> 当前阶段结论：**推荐 Supabase**
> 备注：该结论适用于“现在就上登录注册、匿名转正、长期留存沉淀”的账号期；如果需求退回到“纯匿名关系 MVP + 服务端真相源”，则 `Neon` 仍是更轻的选择

---

## 1. 背景

这次要解决的，已经不是“给 `CPTI` 接一个数据库”。

当前真实目标是：

- 项目运行在 `Vercel`
- 准备上线登录注册
- 希望用户先玩，再在高价值节点认领身份
- 希望把 `CPTI` 结果、关系图鉴、榜单、`WTF CARD` 总图鉴谱长期沉淀到同一个账号

也就是说，数据库选型的核心判断从：

> 谁更适合做一个轻量 Postgres 真相源

变成了：

> 谁更适合承接“匿名身份 -> 正式账号 -> 长期资产沉淀”这条产品主链。

在这个新前提下，我的建议改为：

> **当前阶段直接上 `Supabase`。**

---

## 2. 官方依据

## 2.1 Vercel 官方

Vercel 官方把 `Neon` 与 `Supabase` 都作为可直接接入的数据库/平台方案提供：

- [Storage on Vercel Marketplace](https://vercel.com/docs/marketplace-storage)
- [Neon for Vercel](https://vercel.com/integrations/neon)
- [Supabase for Vercel](https://vercel.com/marketplace/supabase)

这说明两家在“跑在 Vercel 上”这件事上都成立，不存在平台层面不能用的问题。

## 2.2 Supabase 官方

`Supabase` 官方资料对当前阶段最关键的 4 件事支持很完整：

### A. 登录与会话

- [Auth overview](https://supabase.com/docs/guides/auth)
- [Next.js SSR auth client](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)

### B. 匿名登录与后续升级

- [Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)

这点最关键，因为你现在想做的是：

- 用户先玩
- 先保留资产
- 后面再认领账号

`Supabase` 官方对这条路径描述得非常直接。

### C. 权限模型

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

### D. 后续扩展能力

- [Storage](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Branching](https://supabase.com/docs/guides/deployment/branching)
- [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations)

## 2.3 Neon 官方

`Neon` 官方在以下方面依然很强：

### A. Vercel 集成与 Preview 工作流

- [Vercel integration overview](https://neon.com/docs/guides/vercel-overview)
- [Neon-managed Vercel integration](https://neon.com/docs/guides/vercel/)
- [Branch Per Preview](https://neon.com/branching/branch-per-preview)
- [Branching](https://neon.com/docs/introduction/branching)

### B. Postgres / serverless 场景

- [Serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Connection pooling](https://neon.com/docs/connect/connection-pooling)

### C. Auth 与权限

- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Row Level Security](https://neon.com/docs/guides/row-level-security)

但对当前这条“匿名先玩 -> 后续认领正式账号”的产品主链来说，`Neon` 官方材料里没有给出与 `Supabase Anonymous Sign-Ins` 同样明确、同样完整的路径说明。

---

## 3. 对比结论

## 3.1 登录注册已经进入 P0，所以当前更该选 Supabase

### 原因 1：你现在需要的是“身份系统”，不是“数据库本体”

当前账号期的核心链路是：

1. 用户先进入 `CPTI`
2. 结果出来后形成匿名身份
3. 用户完成关系匹配或图鉴收集
4. 在高价值节点认领正式账号
5. 所有资产继续挂在同一个用户身份上

这条链路里最重要的不是“哪个 Postgres 更轻”，而是：

- 匿名身份是否容易建立
- 后续升级正式身份是否顺滑
- Next.js SSR 会话是否成熟
- 权限模型是否能渐进建立

这一点 `Supabase` 更贴当前目标。

### 原因 2：Supabase 对“匿名转正”支持更清楚

当前产品非常适合“先玩后认领”，不适合“先注册后体验”。

因此你最需要的是：

- 用户先无门槛进入
- 先积累结果
- 在用户最怕丢结果时，再提示认领身份

`Supabase` 官方明确支持匿名登录与后续升级，这正好对上你的产品路径。

### 原因 3：后面很可能还会需要 Storage 与 Realtime

你后续极大概率会做：

- 头像
- 分享卡图
- 自定义封面
- 关系同步提醒
- 图鉴新增提醒
- 榜单刷新提示

如果已经确定账号化要做，`Supabase` 把这些能力放在同一个平台里，会减少之后的心智切换。

---

## 3.2 Neon 仍然强，但它强在“数据库阶段”，不是“账号阶段”

### Neon 更强的地方

- Preview 环境很顺
- branch-per-preview 非常适合 schema 演进
- 更贴近原生 Postgres 心智
- 只做服务端写模型时更轻

### 什么时候继续选 Neon

如果你们这期需求还是：

- 不上登录注册
- 只做匿名 token
- 所有写入只走服务端
- 不急着做身份认领

那我仍会推荐 `Neon`。

但现在不属于这个阶段。

---

## 4. 当前阶段推荐方案

## 4.1 结论

### 当前阶段直接上 Supabase。

不是因为 `Supabase` 在所有维度都赢，而是因为：

- 你的核心问题变了
- `Supabase` 正好覆盖了新核心问题

一句话就是：

> 现在最需要的是把“身份沉淀”做成产品能力，而不是把“数据库接上”做成技术完成项。

## 4.2 推荐架构

### 总体原则：server-first

建议这样落地：

- `Supabase Auth + Supabase Postgres`
- 关键业务写入走 `Vercel Route Handlers` / Server Actions
- 不要一上来让浏览器直接写所有业务表
- RLS 先只覆盖最核心私有表
- 复杂配对、关系完成、图鉴聚合、榜单统计先走服务端

这比“全靠前端 SDK + 一次性写全套 RLS”稳很多。

## 4.3 环境策略

这阶段我不建议把 `Supabase Branching` 当主工作流。

更稳的做法：

- `production`：正式项目
- `staging`：一个长期存在的预发项目
- 本地迁移与 seed：持续维护

原因：

- 你们现在先要把账号、关系、图鉴、榜单主链做稳
- 不是先把 preview 环境做到极致

---

## 5. 落地建议

## 5.1 P0

- 建 `Supabase` 项目
- 上匿名身份
- 在 `CPTI` 高价值节点生成/认领身份
- 把关系记录、图鉴统计、用户聚合先落到服务端

## 5.2 P1

- 用户资料
- 隐私开关
- 榜单聚合
- `WTF CARD` 服务端资产页

## 5.3 P2

- `Storage`
- 图鉴分享图
- Realtime 提醒
- 部分安全可控读取开放到客户端

---

## 6. 最终判断

### 当前阶段推荐：Supabase

原因：

- 登录注册已经变成当期需求
- 匿名转正式账号是产品主链
- `CPTI` 的关系图鉴与 `WTF CARD` 总图鉴谱需要挂在稳定身份上
- `Supabase` 对这条路径的官方支持更直接

### 保留判断：如果退回纯匿名 MVP，则 Neon 仍然更轻

所以不是“Neon 错了”，而是：

> **阶段变了，决策也该跟着变。**
