# /api/cpti/* Interface Draft

> 日期：2026-04-15
> 状态：Draft v1
> 目标：给研发直接作为 Route Handler 草案

---

## 1. 约定

### Base

- 所有接口挂在 `/api/cpti/*`
- 返回 JSON
- 时间统一 ISO 8601

### 身份

- P0 以匿名用户为主
- bootstrap 后下发匿名 token
- 后续请求通过 cookie 或 header 携带

### 错误结构

```json
{
  "error": {
    "code": "PAIR_CODE_EXPIRED",
    "message": "该匹配码已过期"
  }
}
```

---

## 2. Users

## `POST /api/cpti/users/bootstrap`

### 用途

- 初始化匿名身份

### Request

```json
{}
```

### Response 200

```json
{
  "user": {
    "id": "uuid",
    "nickname": "",
    "authState": "anonymous"
  },
  "token": {
    "type": "anonymous",
    "expiresAt": null
  }
}
```

## `PATCH /api/cpti/users/me`

### 用途

- 更新昵称

### Request

```json
{
  "nickname": "阿桃"
}
```

### Response 200

```json
{
  "user": {
    "id": "uuid",
    "nickname": "阿桃"
  }
}
```

---

## 3. Profiles

## `POST /api/cpti/profiles/self`

### 用途

- 自测完成后保存当前人格快照

### Request

```json
{
  "personalitySlug": "xxxx",
  "dimensions": {
    "C1": 2.31,
    "C2": 1.92,
    "C3": 2.72,
    "C4": 1.55,
    "C5": 2.08
  }
}
```

### Response 200

```json
{
  "profileSnapshotId": "uuid",
  "testedAt": "2026-04-15T10:00:00.000Z"
}
```

---

## 4. Pair Codes

## `POST /api/cpti/pair-codes`

### 用途

- 创建六码或分享任务

### Request

```json
{
  "mode": "direct",
  "sourceChannel": "result_page",
  "expiresInHours": 72,
  "maxUses": 1
}
```

### Response 200

```json
{
  "pairCode": {
    "id": "uuid",
    "code": "482731",
    "mode": "direct",
    "expiresAt": "2026-04-18T10:00:00.000Z",
    "maxUses": 1,
    "usedCount": 0
  },
  "share": {
    "token": "opaque_share_token",
    "inviteUrl": "https://www.wtfti.com/cpti/invite?token=opaque_share_token"
  }
}
```

## `POST /api/cpti/pair-codes/resolve`

### 用途

- 输入六码后解析是否有效

### Request

```json
{
  "code": "482731"
}
```

### Response 200

```json
{
  "pairCode": {
    "id": "uuid",
    "mode": "direct",
    "expiresAt": "2026-04-18T10:00:00.000Z"
  },
  "creator": {
    "nickname": "阿桃",
    "personalitySlug": "xxxx"
  }
}
```

### Error Codes

- `PAIR_CODE_NOT_FOUND`
- `PAIR_CODE_EXPIRED`
- `PAIR_CODE_EXHAUSTED`
- `PAIR_CODE_BLOCKED`

## `GET /api/cpti/pair-codes/:id`

### 用途

- 后台或前台查看码详情

---

## 5. Matches

## `POST /api/cpti/matches/start`

### 用途

- 记录开始答题

### Request

```json
{
  "pairCodeId": "uuid",
  "submitSource": "code_entry"
}
```

### Response 200

```json
{
  "match": {
    "id": "uuid",
    "status": "started",
    "startedAt": "2026-04-15T10:05:00.000Z"
  }
}
```

## `POST /api/cpti/matches/complete`

### 用途

- 提交答题
- 服务端重算
- 生成关系

### Request

```json
{
  "pairCodeId": "uuid",
  "clientEventId": "client_uuid_123",
  "participantNickname": "小橘",
  "submitSource": "code_entry",
  "answers": [
    { "questionId": 1, "value": 3 },
    { "questionId": 2, "value": 2 },
    { "questionId": 3, "value": 1 }
  ],
  "settings": {
    "visibility": "mutual",
    "leaderboardOptIn": false
  }
}
```

### Response 200

```json
{
  "match": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2026-04-15T10:09:00.000Z"
  },
  "participantProfile": {
    "snapshotId": "uuid",
    "personalitySlug": "xxxx"
  },
  "relationship": {
    "id": "uuid",
    "slug": "soul",
    "tier": "rare",
    "compatibility": 88,
    "visibility": "mutual"
  },
  "collectionDelta": {
    "initiatorAddedNewSlug": true,
    "participantAddedNewSlug": true
  }
}
```

### Error Codes

- `MATCH_DUPLICATE_SUBMISSION`
- `MATCH_INVALID_PAYLOAD`
- `PAIR_CODE_INVALID`
- `PARTICIPANT_BLOCKED`

---

## 6. Relationships

## `GET /api/cpti/relationships/:id`

### 用途

- 查看一条关系详情

### Response 200

```json
{
  "relationship": {
    "id": "uuid",
    "slug": "soul",
    "tier": "rare",
    "compatibility": 88,
    "visibility": "mutual",
    "createdAt": "2026-04-15T10:09:00.000Z"
  },
  "initiator": {
    "nickname": "阿桃",
    "personalitySlug": "xxxx"
  },
  "participant": {
    "nickname": "小橘",
    "personalitySlug": "yyyy"
  }
}
```

## `PATCH /api/cpti/relationships/:id/privacy`

### 用途

- 更新关系可见性和是否上榜

### Request

```json
{
  "visibility": "public_anonymous",
  "leaderboardOptIn": true,
  "publicCardOptIn": false
}
```

### Response 200

```json
{
  "relationship": {
    "id": "uuid",
    "visibility": "public_anonymous",
    "leaderboardOptIn": true,
    "publicCardOptIn": false
  }
}
```

## `DELETE /api/cpti/relationships/:id`

### 用途

- 软删除或失效关系

---

## 7. Collection

## `GET /api/cpti/me/collection`

### 用途

- 获取我的图鉴摘要与最近关系

### Response 200

```json
{
  "stats": {
    "totalRelationshipCount": 17,
    "uniqueRelationshipSlugCount": 9,
    "soulCount": 3,
    "rareCount": 2,
    "lastRelationshipAt": "2026-04-15T10:09:00.000Z"
  },
  "collection": {
    "collectedSlugs": ["soul", "plastic", "orbit"]
  },
  "recentRelationships": [
    {
      "id": "uuid",
      "slug": "soul",
      "compatibility": 88,
      "createdAt": "2026-04-15T10:09:00.000Z"
    }
  ]
}
```

## `GET /api/cpti/me/collection/summary`

### 用途

- 首页/结果页轻量摘要

---

## 8. Leaderboards

## `GET /api/cpti/leaderboards`

### Query Params

- `type=soul_count|rare_count|collection_progress`
- `period=all_time|weekly|monthly`
- `limit=20`

### Response 200

```json
{
  "board": {
    "type": "soul_count",
    "period": "all_time",
    "updatedAt": "2026-04-15T10:30:00.000Z"
  },
  "entries": [
    {
      "rank": 1,
      "userId": "uuid",
      "displayName": "匿名玩家",
      "score": 10
    }
  ],
  "me": {
    "rank": 18,
    "score": 3
  }
}
```

## `GET /api/cpti/leaderboards/me`

### 用途

- 获取当前用户所有榜单的个人位置摘要

---

## 9. Admin / Ops

## `GET /api/cpti/admin/pair-codes`

### 用途

- 查看码使用情况

## `GET /api/cpti/admin/relationships`

### 用途

- 查看关系记录与异常状态

## `POST /api/cpti/admin/relationships/:id/invalidate`

### 用途

- 将关系标记为不计榜

---

## 10. 前端接入建议

### 结果页

- 创建 pair code 走 `POST /api/cpti/pair-codes`
- 展示 link + code 双入口

### 邀请页 / 六码页

- 输入码走 `POST /api/cpti/pair-codes/resolve`
- 开始答题走 `POST /api/cpti/matches/start`
- 完成答题走 `POST /api/cpti/matches/complete`

### 关系结果页

- 服务端结果作为主数据源
- 隐私开关走 `PATCH /api/cpti/relationships/:id/privacy`

### 卡片页 / 图鉴页

- 摘要走 `GET /api/cpti/me/collection`
- 榜单走 `GET /api/cpti/leaderboards`

