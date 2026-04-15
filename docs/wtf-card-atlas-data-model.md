# WTF CARD 总图鉴谱前后端 Data Model

> 日期：2026-04-15
> 状态：Draft v1
> 目标：把 `WTF CARD` 从“本地徽章墙”升级成“顶层资产柜”，并为后续总图鉴谱提供统一的数据语言
> 相关文件：
> - `src/lib/wtf-card.ts`
> - `src/lib/universes.ts`
> - `src/app/types/gallery-data.ts`
> - `src/app/card/CardContent.tsx`
> - `docs/cpti-supabase-schema-v1.sql`

---

## 0. 先给结论

`WTF CARD` 不应该再被当成数据库里的一个扁平对象，也不该继续只靠：

- `results`
- `relationships`

这两个字段来承载整个平台资产。

正确做法是：

1. 后端把资产拆成“注册表 + 事实表 + 聚合表”
2. 前端把 `WTF CARD` 定义成“总资产柜 view model”
3. `CPTI` 关系、共享宇宙、独立人格、时态模块分别建模
4. `WTF CARD` 负责把它们拼成用户能看懂的“总图鉴谱入口”

一句话：

> **后端存真相，前端拼总览。**

---

## 1. 当前模型为什么不够

当前本地模型大致是：

```ts
interface WtfCardData {
  id: string
  nickname: string
  createdAt: string
  results: Record<string, UniverseResult | null>
  relationships?: RelationshipRecord[]
}
```

这个模型的问题不是不能用，而是已经不够承载平台现状：

### 1.1 它只适合“一宇宙一个槽位”

适合：

- `standard`
- `xiuxian`
- `wtfti`
- `bird`
- `banti`
- `kings`
- `delta`

但不适合：

- `daily`
- `drunk`
- `cpti-relationship`
- 未来成就、活动卡、群组排行

### 1.2 它把 “solo result” 和 “relationship edge” 混成两类特例

现在 `relationships[]` 是唯一的 edge 型资产，但未来：

- `identify`
- `squad`
- `combo`
- `puzzle`

都可能变成 edge / group asset。

如果继续沿着“再塞一个字段”扩，会越来越碎。

### 1.3 它没有统一注册表

现在全站库存分散在三处：

- `UNIVERSES`
- `gallery-data`
- 首页 `FUN_ITEMS`

没有一个地方同时定义：

- 它属于哪个 shelf
- 是否可收藏
- 是否可比较
- 是否可排行
- 是否会过期
- 是否是 solo 还是 relationship

---

## 2. 推荐的总模型

## 2.1 分层

### Layer 0：WTF Atlas

平台层 ontology。

它定义：

- 平台有哪些资产类型
- 每种资产属于哪个 shelf
- 每种资产的比较规则、收集规则、排行规则

### Layer 1：WTF CARD

用户入口层。

它不是数据库主表，而是一个“聚合 view model”。

它负责展示：

- 我已解锁了什么
- 哪些 shelf 已经成形
- 当前最值得继续收集什么

### Layer 2：事实资产

后端真实事实表：

- 单人结果
- 关系记录
- 状态切片
- 成就解锁

### Layer 3：注册表

后端/种子表维护：

- 系列定义
- 条目定义
- 展示排序
- 可收集与可排行属性

---

## 3. Shelf 设计

## 3.1 Shelf A：共享内核子宇宙

推荐包含：

- `standard`
- `xiuxian`
- `wtfti`
- `bird`
- `banti`
- `kings`
- `delta`

特征：

- 同一底层人格内核的不同翻译皮肤
- 可做“平行宇宙映射”
- 不应简单算成多个完全独立人格

后端事实表建议：`user_module_results`

## 3.2 Shelf B：独立人格模块

推荐包含：

- `flower`
- `soulti`
- `xpti`
- `cpti-role`
- `love`
- `work`

特征：

- 仍然描述“我”
- 但和 Shelf A 不共享同一坐标系

后端事实表建议：`user_module_results`

## 3.3 Shelf C：关系模块

推荐包含：

- `cpti-relationship`
- 后续 `identify` / `squad` 中可沉淀成关系资产的模块

特征：

- 本质是 edge
- 不是单人 badge
- 带隐私边界
- 可重复、多对象

后端事实表建议：

- `cpti_relationships`
- 后续同类 edge tables

辅助聚合表：

- `user_atlas_unlocks`
- `user_atlas_stats`

## 3.4 Shelf D：时态模块

推荐包含：

- `daily`
- `drunk`

特征：

- 更像时间切片
- 可以进 atlas
- 不进入长期人格完成度

后端事实表建议：`user_module_results` + `is_ephemeral = true`

## 3.5 Overlay：成就与运营层

推荐包含：

- 灵魂伴侣数
- 稀有关系数
- 周榜/月榜勋章
- 节日活动卡
- 连击成就

后端事实表建议：

- `user_atlas_unlocks`
- `user_atlas_stats`
- 后续榜单快照表

---

## 4. 后端 Data Model

## 4.1 注册表层

### `wtf_atlas_series`

用途：

- 定义系列
- 定义它属于哪个 shelf
- 定义它是否 live / collectible / rankable

关键字段：

- `id`
- `shelf`
- `module_kind`
- `display_name`
- `comparability_group`
- `total_collectible_items`

示例：

| series_id | shelf | module_kind | 含义 |
|---|---|---|---|
| `standard` | `shelf_a` | `shared_universe` | 标准人格宇宙 |
| `cpti-role` | `shelf_b` | `independent_module` | CPTI 角色 |
| `cpti-relationship` | `shelf_c` | `relationship_module` | CPTI 关系图鉴 |
| `daily` | `shelf_d` | `temporal_module` | 每日状态 |
| `achievement-soul-count` | `overlay` | `achievement_module` | 灵魂伴侣成就 |

### `wtf_atlas_items`

用途：

- 定义系列内的可收集条目
- 提供固定 item catalog

关键字段：

- `series_id`
- `item_key`
- `item_kind`
- `item_slug`
- `rarity`
- `is_ephemeral`
- `is_rankable`

示例：

- `cpti-role` 下的 16 种角色
- `cpti-relationship` 下的 25 种关系
- `standard` 下的 27 张人格卡
- `achievement-*` 下的各类徽章

## 4.2 事实层

### `user_module_results`

这是单人资产事实表。

它统一承载：

- shared universe result
- independent module result
- temporal result

而不是继续拆成一堆 `results[universeId]`。

关键字段：

- `user_id`
- `module_kind`
- `module_id`
- `result_slug`
- `comparability_group`
- `is_current`
- `is_ephemeral`
- `observed_at`
- `expires_at`
- `source_payload`

### `cpti_profile_snapshots`

这是 `CPTI` 自测 / 配对 / 偷测时的人格快照。

用途：

- 关系匹配服务端重算
- 历史留档
- 回看某次关系时的输入依据

### `cpti_relationships`

这是关系资产事实表。

关键点：

- 一条关系 = 一次 edge 事实
- 它和单人结果不是同一种对象
- 可见性、榜单 opt-in、失效状态都必须挂在这里

### `user_atlas_unlocks`

这是“收藏视角”的桥接表。

它不保存原始关系或原始结果，而是保存：

- 对于某个用户来说，某个 atlas item 是否已解锁
- 这个解锁来自哪个 source
- 是否已经过期或归档

这能让：

- 事实层保持真实粒度
- 收藏层保持展示友好粒度

例如：

- 用户与不同人生成 3 次同一种 `cpti-relationship`
- `cpti_relationships` 会有 3 条事实
- `user_atlas_unlocks` 只需要 1 条 `dedupe_key = relationship_slug`

### `user_atlas_stats`

聚合层。

给：

- `WTF CARD`
- 总图鉴谱进度
- 灵魂伴侣统计
- 关系/成就摘要

提供快速查询。

---

## 5. 前端 Data Model

前端不要再直接消费底层原始表，而应该消费一个聚合 view model。

## 5.1 推荐 view model

```ts
type WtfCardViewModel = {
  user: {
    userId: string
    nickname: string
    avatarUrl?: string
    identityStage: 'anonymous' | 'claimed'
  }
  hero: {
    totalUnlocks: number
    totalCollectible: number
    progressPct: number
    lastUnlockAt?: string
  }
  shelves: AtlasShelfView[]
  relationshipSummary: RelationshipSummaryView
  moduleHighlights: ModuleHighlightView[]
  temporalSummary: TemporalSummaryView
  achievementSummary: AchievementSummaryView
  ctas: WtfCardCtaView[]
}
```

## 5.2 Shelf view

```ts
type AtlasShelfView = {
  shelf: 'shelf_a' | 'shelf_b' | 'shelf_c' | 'shelf_d' | 'overlay'
  title: string
  progress: {
    unlocked: number
    total: number
  }
  series: AtlasSeriesCardView[]
}
```

```ts
type AtlasSeriesCardView = {
  seriesId: string
  displayName: string
  moduleKind: string
  unlockedCount: number
  totalCount: number
  isComplete: boolean
  previewItems: AtlasUnlockChip[]
  href: string
}
```

## 5.3 Relationship summary

```ts
type RelationshipSummaryView = {
  uniqueTypes: number
  soulCount: number
  rareCount: number
  latestRelationship?: {
    slug: string
    title: string
    partnerLabel: string
    testedAt: string
  }
  leaderboardEligible: boolean
}
```

## 5.4 为什么前端要用聚合 view model

因为 `WTF CARD` 的职责是“让人一眼看懂我的总资产”，不是暴露底层 schema。

它需要同时兼容：

- solo result
- relationship edge
- temporal slice
- achievements

如果前端直接绑底层表，页面复杂度会失控。

---

## 6. 前后端映射关系

| 前端需求 | 后端来源 |
|---|---|
| 顶部总进度 | `user_atlas_stats` |
| Shelf A 宇宙徽章 | `user_module_results` + `wtf_atlas_series/items` |
| 关系图鉴墙 | `user_atlas_unlocks` + `cpti_relationships` |
| 灵魂伴侣数 | `user_atlas_stats.soul_count` |
| 稀有关系数 | `user_atlas_stats.rare_relationship_count` |
| 最近状态 | `user_module_results` where `is_ephemeral = true` |
| 活动勋章 | `user_atlas_unlocks` with `overlay` shelf |

---

## 7. API 视角

## 7.1 `GET /api/wtf-card/me`

返回聚合后的 `WtfCardViewModel`。

这是 `/card` 页最应该直接依赖的接口。

## 7.2 `GET /api/wtf-atlas/me/shelf/:shelf`

返回某个 shelf 下更详细的 series/items。

适合：

- 点击某个 shelf 进入二级页
- 用户想看完整图鉴墙

## 7.3 `GET /api/cpti/me/collection`

保留为关系模块子接口。

返回：

- 关系类型集合
- 最近关系
- 榜单资格

---

## 8. 迁移建议

## 8.1 先不推翻现有 `WtfCardData`

现有本地模型仍可作为：

- 临时缓存
- 首次认领前草稿
- 未登录访客 fallback

## 8.2 认领资产后再进入服务端真相源

推荐路径：

1. 用户完成结果页
2. 用户点击“认领资产”
3. 匿名登录
4. 本地草稿同步到服务端
5. `/card` 开始优先读取服务端 view model

## 8.3 前端渐进替换顺序

### P0

- `/card` 先从本地换到服务端总览

### P1

- `CPTI` 关系墙换成服务端 collection

### P2

- Shelf B / Shelf D 逐步接入

---

## 9. 当前必须注意的一个实现风险

仓库当前已经把 `cpti` 纳入 `CARD_UNIVERSE_IDS`，但 `resolvePersonality()` 里还没有 `cpti` 分支。

这意味着：

- 结果可能已经记录了
- 但在 `WTF CARD` 上未必能正确点亮显示

这会直接伤害“认领资产”的感知。

所以真正开始推 `CPTI` 认领 CTA 前，至少要保证：

- `CPTI` slot 在 `WTF CARD` 里可见
- 关系图鉴能在认领后立即看到变化

---

## 10. 一句话定义

后端上：

> `WTF Atlas` 是注册表 + 事实表 + 聚合表。

前端上：

> `WTF CARD` 是把这些资产翻译成“一个人看得懂、想继续收集”的总资产柜。
