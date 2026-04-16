# CPTI 数据模型、API 与埋点方案

> Owner: Backend + Data
> Status: Active Spec
> Priority: P0
> Last Updated: 2026-04-16
> Review Cadence: Weekly until schema and metrics lock
> Next Decision: Decide whether relationship ledger and leaderboard tables ship in the same migration wave
> 模块：CPTI Relationship Backend
> 对应产品文档：`docs/02-modules/cpti/cpti-backend-prd.md`

---

## 1. 目标

为 `CPTI` 的后台版本定义：

- 最小可落地数据模型
- 核心 API 边界
- 榜单聚合口径
- 埋点事件体系
- 本地存储迁移策略

---

## 2. 设计原则

### 2.1 Canonical Truth

服务端数据库是唯一真实来源：

- 关系记录
- 图鉴进度
- 榜单统计
- 配对码状态

前端本地存储仅作：

- 体验缓存
- 短期加速
- 兼容旧逻辑

### 2.2 Anonymous-first

当前产品不应强制登录，数据模型必须支持匿名用户先玩、后认领。

### 2.3 Server-side Recompute

关系结果由服务端根据答题数据重算，不直接信任前端传来的 `relationship_slug` 或 `compatibility`。

### 2.4 Gradual Migration

不推翻现有：

- `src/lib/wtf-card.ts`
- `src/lib/cpti/cpti-profile.ts`
- `src/lib/cpti/cpti-invite.ts`

而是逐步把这些前端状态镜像到后端。

---

## 3. 推荐总体架构

### 3.1 逻辑架构

1. 客户端保留当前答题与结果页体验
2. 新增 Route Handlers 提供后端接口
3. 关系型数据库持久化关系资产
4. 榜单由聚合表或缓存视图提供
5. 前端卡片页逐步从本地数据切到服务端数据

### 3.2 技术建议

推荐使用：

- `Next.js 16` Route Handlers
- `Postgres` 作为主库
- 缓存层按部署环境选用 edge cache / app cache / Redis

实现上可选：

- Supabase Postgres
- Neon + 自建 API

本方案不强依赖 ORM。

---

## 4. 数据模型

## 4.1 表 1：`cpti_users`

用于承载匿名或已认领用户。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `auth_state` | enum | `anonymous` / `claimed` |
| `anon_token_hash` | text nullable | 匿名 token 哈希 |
| `provider` | text nullable | `wechat` / `phone` / `email` |
| `provider_subject` | text nullable | 第三方主体 ID |
| `nickname` | varchar(32) | 昵称 |
| `avatar_url` | text nullable | 头像 |
| `status` | enum | `active` / `blocked` / `merged` |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

### 说明

- P0 可以只支持 `anonymous`
- `claimed` 为后续能力预留

---

## 4.2 表 2：`cpti_profile_snapshots`

保存用户某次配对或自测时的人格快照。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `user_id` | uuid | 关联 `cpti_users.id` |
| `source` | enum | `self_test` / `pair_flow` / `stealth` |
| `personality_slug` | varchar(32) | CPTI 人格 |
| `dim_c1` | numeric(5,2) | 维度分数 |
| `dim_c2` | numeric(5,2) | 维度分数 |
| `dim_c3` | numeric(5,2) | 维度分数 |
| `dim_c4` | numeric(5,2) | 维度分数 |
| `dim_c5` | numeric(5,2) | 维度分数 |
| `tested_at` | timestamptz | 测试完成时间 |
| `created_at` | timestamptz | 创建时间 |

### 说明

- 不直接覆盖用户当前人格
- 用快照保证历史可追溯

---

## 4.3 表 3：`cpti_pair_codes`

承载六码与邀请任务。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `code` | char(6) | 六位数字码 |
| `code_mode` | enum | `direct` / `open` / `campaign` |
| `creator_user_id` | uuid | 发起人 |
| `creator_profile_snapshot_id` | uuid | 发起时的人格快照 |
| `status` | enum | `active` / `expired` / `consumed` / `blocked` |
| `max_uses` | int | 最大使用次数 |
| `used_count` | int | 已使用次数 |
| `expires_at` | timestamptz | 过期时间 |
| `source_channel` | text nullable | `result_page` / `xiaohongshu` / `wechat_group` 等 |
| `share_token` | text nullable | 链接分享 token |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

### 约束

- `code` + `status='active'` 唯一
- `used_count <= max_uses`

---

## 4.4 表 4：`cpti_matches`

承载一次完整的配对任务执行记录。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `pair_code_id` | uuid | 关联配对码 |
| `initiator_user_id` | uuid | 发起人 |
| `participant_user_id` | uuid | 参与者 |
| `participant_profile_snapshot_id` | uuid | 参与者人格快照 |
| `submit_source` | enum | `link` / `code_entry` |
| `status` | enum | `started` / `completed` / `aborted` / `invalid` |
| `started_at` | timestamptz | 开始时间 |
| `completed_at` | timestamptz nullable | 完成时间 |
| `client_event_id` | text nullable | 客户端幂等 ID |
| `created_at` | timestamptz | 创建时间 |

### 说明

- `match` 是任务
- `relationship` 是结果

---

## 4.5 表 5：`cpti_relationships`

真正的关系资产表。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `match_id` | uuid | 关联 `cpti_matches.id` |
| `initiator_user_id` | uuid | 发起人 |
| `participant_user_id` | uuid | 参与者 |
| `initiator_profile_snapshot_id` | uuid | 发起人格快照 |
| `participant_profile_snapshot_id` | uuid | 参与人格快照 |
| `relationship_slug` | varchar(32) | 关系类型 |
| `relationship_tier` | enum | `viral` / `deep` / `rare` |
| `compatibility` | int | 0-100 |
| `visibility` | enum | `private` / `mutual` / `public_anonymous` |
| `leaderboard_opt_in_initiator` | boolean | 发起人是否上榜 |
| `leaderboard_opt_in_participant` | boolean | 参与者是否上榜 |
| `public_card_opt_in_initiator` | boolean | 发起人是否同意公开卡 |
| `public_card_opt_in_participant` | boolean | 参与者是否同意公开卡 |
| `is_valid` | boolean | 是否有效 |
| `invalid_reason` | text nullable | 无效原因 |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

### 关键规则

- 榜单统计只读取 `is_valid = true`
- 全量历史记录保留，但可失效

---

## 4.6 表 6：`cpti_relationship_events`

关系状态变化的审计日志。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `relationship_id` | uuid | 关系 ID |
| `event_type` | text | `created` / `visibility_changed` / `leaderboard_opt_in_changed` / `invalidated` 等 |
| `actor_user_id` | uuid nullable | 操作人 |
| `payload_json` | jsonb | 补充字段 |
| `created_at` | timestamptz | 时间 |

### 说明

- 用于审计
- 用于运营排查
- 用于恢复榜单争议

---

## 4.7 表 7：`cpti_user_collection_stats`

用户当前关系资产的聚合快照表。

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | uuid | 主键 |
| `total_relationship_count` | int | 全部有效关系条数 |
| `unique_relationship_slug_count` | int | 已解锁关系种类数 |
| `soul_count` | int | `SOUL` 数量 |
| `rare_count` | int | rare 层数量 |
| `last_relationship_at` | timestamptz nullable | 最近新增关系时间 |
| `updated_at` | timestamptz | 更新时间 |

### 说明

- 可同步写
- 也可异步任务更新

P0 推荐：

- 先同步写，逻辑简单

---

## 4.8 表 8：`cpti_leaderboard_snapshots`

榜单快照表。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `board_type` | enum | `soul_count` / `rare_count` / `collection_progress` |
| `period_type` | enum | `all_time` / `weekly` / `monthly` |
| `period_key` | varchar(16) | 如 `2026-W16` |
| `rank` | int | 排名 |
| `user_id` | uuid | 用户 |
| `score` | numeric(10,2) | 分数 |
| `display_name` | varchar(32) | 榜单昵称 |
| `created_at` | timestamptz | 生成时间 |

### 说明

- P0 可先不落快照，直接读聚合表 + 缓存
- P1 再做周榜/月榜归档

---

## 5. 关系生成规则

## 5.1 关系唯一性

### P0 建议

一条关系记录的唯一性由以下组合决定：

- `pair_code_id`
- `participant_user_id`

这意味着：

- 同一参与者不能对同一邀请码重复刷结果
- 开放码允许多人参与

## 5.2 关系统计规则

### 图鉴进度

- 以 `relationship_slug` 去重

### 灵魂伴侣数榜

- 统计 `relationship_slug='soul'`

### 稀有关系榜

- 统计 `relationship_tier='rare'`

### 图鉴进度榜

- 统计 `unique_relationship_slug_count`

---

## 6. API 设计

## 6.1 身份接口

### `POST /api/cpti/users/bootstrap`

用途：

- 初始化匿名身份

返回：

- `user_id`
- `anon_token`
- `nickname`

### `PATCH /api/cpti/users/me`

用途：

- 更新昵称
- 更新榜单展示偏好

---

## 6.2 配对码接口

### `POST /api/cpti/pair-codes`

请求体：

```json
{
  "mode": "direct",
  "creatorProfileSnapshotId": "uuid",
  "expiresInHours": 72,
  "maxUses": 1,
  "sourceChannel": "result_page"
}
```

返回：

```json
{
  "pairCodeId": "uuid",
  "code": "482731",
  "shareToken": "xxxx",
  "shareUrl": "https://.../cpti/invite/?code=..."
}
```

### `POST /api/cpti/pair-codes/resolve`

请求体：

```json
{
  "code": "482731"
}
```

返回：

```json
{
  "pairCodeId": "uuid",
  "mode": "direct",
  "status": "active",
  "creatorNickname": "A",
  "creatorPersonalitySlug": "xxxx",
  "expiresAt": "2026-04-18T10:00:00Z"
}
```

---

## 6.3 配对流程接口

### `POST /api/cpti/matches/start`

用途：

- 标记一次参与开始

请求体：

```json
{
  "pairCodeId": "uuid",
  "submitSource": "code_entry"
}
```

### `POST /api/cpti/matches/complete`

用途：

- 提交答题
- 服务端重算人格与关系
- 落库并返回结果

请求体：

```json
{
  "pairCodeId": "uuid",
  "clientEventId": "uuid-or-random",
  "answers": [
    { "questionId": 1, "value": 3 },
    { "questionId": 2, "value": 1 }
  ],
  "participantNickname": "B",
  "visibility": "mutual",
  "leaderboardOptIn": false
}
```

返回：

```json
{
  "matchId": "uuid",
  "relationshipId": "uuid",
  "relationshipSlug": "soul",
  "relationshipTier": "rare",
  "compatibility": 88,
  "participantPersonalitySlug": "xxxx",
  "collectionDelta": {
    "initiatorAdded": true,
    "participantAdded": true
  }
}
```

---

## 6.4 图鉴与榜单接口

### `GET /api/cpti/me/collection`

返回：

- 我的关系统计
- 最近关系记录
- 已收集 `slug` 列表

### `GET /api/cpti/leaderboards?type=soul_count&period=all_time`

返回：

- 榜单条目
- 当前用户排名
- 更新时间

---

## 6.5 隐私接口

### `PATCH /api/cpti/relationships/:id/privacy`

可改字段：

- `visibility`
- `leaderboardOptIn`
- `publicCardOptIn`

---

## 7. 埋点体系

## 7.1 埋点原则

- 产品行为埋点与业务真数据分开
- 前端先打行为事件
- 服务端补充结果事件

## 7.2 关键前端事件

### `cpti_pair_code_created`

触发时机：

- 用户成功生成六码

属性：

- `pair_code_mode`
- `source_page`
- `personality_slug`
- `has_nickname`

### `cpti_pair_code_copied`

属性：

- `copy_target` = `code` / `link`

### `cpti_pair_code_shared`

属性：

- `share_target` = `native_share` / `copy` / `poster`

### `cpti_pair_code_landing`

触发时机：

- 参与者通过链接或六码进入落地页

属性：

- `entry_type` = `link` / `code`
- `pair_code_mode`

### `cpti_match_started`

属性：

- `entry_type`
- `pair_code_mode`

### `cpti_match_completed_client`

属性：

- `question_count`
- `duration_ms`

## 7.3 关键服务端事件

### `cpti_match_completed_server`

属性：

- `pair_code_id`
- `initiator_user_id`
- `participant_user_id`
- `relationship_slug`
- `relationship_tier`
- `compatibility`
- `source_channel`

### `cpti_relationship_synced`

属性：

- `relationship_id`
- `initiator_added_to_collection`
- `participant_added_to_collection`

### `cpti_leaderboard_eligible`

属性：

- `relationship_id`
- `user_id`
- `board_types`

### `cpti_relationship_invalidated`

属性：

- `relationship_id`
- `reason`

---

## 7.4 指标口径

### 配对发起率

`pair_code_created_uv / cpti_result_page_uv`

### 邀请完成率

`match_completed_server_uv / pair_code_landing_uv`

### 双向同步成功率

`relationship_synced_success / match_completed_server`

### 图鉴新增率

`collection_incremented / relationship_synced`

### 榜单参与率

`leaderboard_opt_in_users / active_relationship_users`

---

## 8. 风控与反作弊

## 8.1 风险场景

- 同设备批量刷多个匿名身份
- 同一用户反复给自己刷开放码
- 同一 IP 段短时高频生成结果
- 机器脚本撞六码

## 8.2 P0 防护策略

### 配对码

- 每小时创建数限制
- 单码最大次数限制
- 高频失败输入限制

### 关系生成

- `pair_code_id + participant_user_id` 幂等
- 同设备 / 同用户高频完成触发风控标记
- 可疑关系默认不计榜

### 榜单

- 只统计 `is_valid = true`
- 支持后台一键失效记录

---

## 9. 本地存储迁移方案

## 9.1 当前前端状态

当前核心状态分散在：

- `cpti-my-profile`
- `cpti-relationship`
- `wtf-card`

## 9.2 迁移原则

不要求一次性迁移全部历史本地数据。

P0 采用：

- 新生成的关系走服务端
- 前端继续读取本地旧记录作为兼容展示
- 新版图鉴页优先展示服务端数据，缺失时回退本地数据

## 9.3 推荐迁移顺序

### Phase A

- `cpti_profile` 后端化
- 但仍保留本地缓存

### Phase B

- 新关系全部写服务端
- `wtf-card.relationships` 仅作兼容层

### Phase C

- 卡片页、图鉴页完全切到服务端

---

## 10. 隐私与合规

## 10.1 最小必要原则

P0 只保存：

- 匿名身份
- 昵称
- 人格快照
- 关系结果
- 基础行为日志

不保存：

- 敏感实名信息
- 私聊内容
- 精细心理画像标签扩展字段

## 10.2 前端文案更新点

需要同步更新：

- `src/app/privacy/page.tsx`
- 关系结果页
- 邀请页
- 榜单页

重点说明：

- 什么会被保存到服务端
- 什么情况下会公开
- 榜单是否默认关闭
- 如何删除记录

---

## 11. 仪表盘建议

## 11.1 产品漏斗看板

- 结果页 UV
- 配对码生成 UV
- 落地页 UV
- 开始答题 UV
- 完成配对 UV
- 成功双向同步 UV

## 11.2 关系质量看板

- `SOUL` 占比
- rare 占比
- 平均匹配度
- 单用户平均关系数

## 11.3 榜单与收集看板

- 榜单参与率
- 图鉴平均进度
- 高增长用户占比

## 11.4 风控看板

- 可疑关系数
- 失效关系数
- 码滥用率

---

## 12. 建议实施顺序

### Sprint 1

- `cpti_users`
- `cpti_profile_snapshots`
- `cpti_pair_codes`
- `POST /bootstrap`
- `POST /pair-codes`
- `POST /pair-codes/resolve`

### Sprint 2

- `cpti_matches`
- `cpti_relationships`
- `POST /matches/start`
- `POST /matches/complete`
- 服务端重算

### Sprint 3

- `cpti_user_collection_stats`
- `GET /me/collection`
- 榜单基础接口
- 隐私开关接口

### Sprint 4

- 风控标记
- 后台面板
- 看板指标
- 周榜/月榜预留

---

## 13. 结论

这套方案的核心不是把 CPTI 一次性做成重后台，而是先建立四个最关键的真相源：

1. 用户身份
2. 配对码
3. 关系记录
4. 聚合统计

一旦这四个点成立，前台的六位码、图鉴、榜单、小红书传播、节日活动、称号体系才都有可靠地基。

