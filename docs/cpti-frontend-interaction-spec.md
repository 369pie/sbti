# CPTI 前台交互稿说明

> 日期：2026-04-15
> 范围：`CPTI 结果页 -> 六位码 -> 关系结果 -> 图鉴/榜单入口`
> 目标：在不打断现有体验的前提下，把前台升级为后台化入口

---

## 1. 当前前台流转

### 当前路径

1. 用户进入 `/cpti/test`
2. 完成测试后进入 `/cpti/result/[type]`
3. 在结果页可：
   - 复制分享文案
   - 复制结果链接
   - 生成邀请链接
   - 进入 stealth 模式
4. 对方进入邀请页 `/cpti/invite`
5. 完成答题后进入 `/cpti/relationship`
6. 当前关系结果主要靠：
   - `sessionStorage`
   - `localStorage`
   - URL 编码回传

### 当前主要文件

- [src/app/cpti/result/[type]/CptiResultContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/result/[type]/CptiResultContent.tsx)
- [src/app/cpti/relationship/CptiRelationshipResult.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/relationship/CptiRelationshipResult.tsx)
- [src/components/CptiQuiz.tsx](/Users/caonanya/AI_Code/repos/sbti/src/components/CptiQuiz.tsx)
- [src/app/card/CardContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/card/CardContent.tsx)
- [src/app/cpti/CptiHomeContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/CptiHomeContent.tsx)

### 当前显性缺口

- `CPTI` 结果页没有“输入匹配码”入口
- `CPTI` 结果页和关系页都没有明显的“去我的图鉴/卡片”入口
- 发起人通过回传链接看到结果时，页面上看起来像“同步成功”，但实际上当前实现并没有稳妥地写回双方服务端资产
- 邀请链接、回传链接仍然是“原始数据编码进 URL”的老方案，不适合长期后台化

---

## 2. 设计原则

### 2.1 不推翻现有结果页，只在现有结构上“加一层任务入口”

当前结果页体验已经成立，不建议大改 Hero 与人格内容，只改分享与配对相关区块。

### 2.2 让“生成邀请码”从隐藏次入口，升级成主入口

当前“生成邀请链接”在结果页下半部分，曝光还不够。新版需要让用户更快进入“发起配对”动作。

### 2.3 六位码是泛传播入口，链接是定向入口

前台不应该让用户在两者之间做复杂选择，而是用清晰文案区分用途。

### 2.4 关系结果页必须有“下一步”

当前关系页结束感太强。新版必须引导：

- 查看图鉴
- 继续配对
- 看榜单

---

## 3. 结果页改版说明

文件：

- [src/app/cpti/result/[type]/CptiResultContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/result/[type]/CptiResultContent.tsx)

## 3.1 当前问题

当前结果页的分享区主要是：

- 复制分享文案
- 复制链接
- 快速分享
- 重新测试

而真正和 `CPTI` 增长最相关的邀请配对入口，被放在单独的 `InviteAndStealthCTA` 区块里，且只有链接，没有六码。

## 3.2 新版结构建议

### 模块顺序

1. Hero
2. 角色速写
3. 五维画像
4. 分享区
5. **关系配对主区**
6. 图鉴/榜单入口区
7. stealth 入口
8. 其他角色

### 新增模块：关系配对主区

标题建议：

- 想知道你们是什么关系？

副文案建议：

- 发给特定的人用邀请链接
- 发到群聊/小红书用六位匹配码

### 区块布局建议

#### 卡片 A：定向邀请

- 标题：发链接给 ta
- 说明：适合发给 crush / 对象 / 闺蜜
- CTA：
  - 生成邀请链接
  - 复制链接
  - 原生分享

#### 卡片 B：公开配对

- 标题：生成六位匹配码
- 说明：适合发到群聊、评论区、封面图
- CTA：
  - 生成六码
  - 复制六码
  - 生成带码海报

#### 卡片 C：偷偷测

- 保留当前 stealth 入口
- 但从主 CTA 降级为第三入口

## 3.3 具体插入点

建议将当前 `InviteAndStealthCTA` 拆成：

- `CptiPairEntryPanel`
- `CptiStealthEntryCard`
- `CptiCollectionEntryCard`

插入在当前分享区之后。

## 3.4 图鉴/榜单入口区

结果页新增一行两卡：

### 卡片 1：我的关系图鉴

- 文案：看看你已经收集了多少种关系
- 内容：
  - 已收集数
  - 稀有关系数
- CTA：进入图鉴

### 卡片 2：灵魂伴侣榜

- 文案：看看你的关系体质排第几
- 内容：
  - 当前排名
  - 灵魂伴侣数
- CTA：查看榜单

---

## 4. 邀请页改版说明

文件：

- [src/app/cpti/invite/CptiInviteContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/invite/CptiInviteContent.tsx)

## 4.1 当前状态

邀请页只支持链接参数解码，不支持六码输入。

## 4.2 新版建议

邀请页拆成两种入口：

### 路由 A：链接直达

- 维持现状

### 路由 B：六码输入页

新增一个可公开访问的入口：

- `/cpti/pair`

页面内容：

- 输入六码
- 解析成功后展示发起人昵称与人格
- 点击开始答题

### 交互要求

- 粘贴六码后自动提交
- 错码/过期码有清晰错误态
- 若是开放码，文案不要写成“ta”，而写“发起人”

---

## 5. 关系结果页改版说明

文件：

- [src/app/cpti/relationship/CptiRelationshipResult.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/relationship/CptiRelationshipResult.tsx)

## 5.1 当前问题

当前关系结果页有：

- 关系速写
- 五维对比
- 回传链接
- 分享区

但少了最关键的后台化反馈：

- 这条关系是否已经保存
- 图鉴是否新增
- 下一步去哪里

此外还有一个实现语义风险需要同步给产品和研发：

- 当前 `peer` 流程里“我眼中的 ta”的结果，代码里有把它当成答题者本人 `cpti` 结果写进本地卡片的风险
- 后台化后，关系页文案必须严格区分：
  - 谁是发起人
  - 谁是参与者
  - 谁的 `self profile`
  - 谁的 `observed profile`

## 5.2 新增模块顺序

1. Hero
2. **同步成功反馈条**
3. 关系速写
4. 五维对比
5. 回传链接
6. 分享区
7. **图鉴与榜单入口**
8. 继续配对 CTA

## 5.3 新增模块：同步成功反馈条

位置：

- Hero 下方第一块

文案示例：

- 已同步到你们双方的关系图鉴
- 解锁了新关系：灵魂伴侣
- 你的图鉴进度已更新为 9 / 25

如果不是新关系：

- 已记录到你的关系履历中

## 5.4 新增模块：图鉴与榜单入口

### 卡片 A：去看我的图鉴

- 展示：
  - 当前图鉴进度
  - 稀有关系数

### 卡片 B：去看排行榜

- 展示：
  - 当前灵魂伴侣数
  - 当前榜单名次

### 卡片 C：继续配对

- 引导用户继续生成新六码

## 5.5 新增模块：隐私与上榜状态

在关系页底部或图鉴入口旁新增一个轻设置区：

- 仅双方可见
- 匿名加入榜单
- 不参与榜单

---

## 6. 卡片/图鉴页改版说明

文件：

- [src/app/card/CardContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/card/CardContent.tsx)

## 6.1 当前状态

已有：

- 全站宇宙卡片
- CP 关系图鉴

## 6.2 新版建议

在现有关系图鉴上增加三块摘要：

### 区块 1：关系体质摘要

- 灵魂伴侣数
- rare 关系数
- 总关系条数

### 区块 2：最近新增

- 最近 3 条关系

### 区块 3：榜单入口

- 我的榜单表现
- 查看完整榜单

## 6.3 迁移原则

- 服务端优先
- 本地 `wtf-card` 作为兼容 fallback

---

## 7. CPTI 首页改版说明

文件：

- [src/app/cpti/CptiHomeContent.tsx](/Users/caonanya/AI_Code/repos/sbti/src/app/cpti/CptiHomeContent.tsx)

## 7.1 新增入口

在首页 Hero CTA 下新增次导航：

- 测我的角色
- 输六码配对
- 看关系图鉴
- 看灵魂伴侣榜

## 7.2 三种玩法区块更新

当前“三种玩法”应改成：

- 自测角色
- 邀请配对
- 输入六码

stealth 模式不再是首页三大主玩法之一，可下沉到结果页和二级入口。

---

## 8. 组件拆分建议

建议新增组件：

- `src/components/cpti/CptiPairEntryPanel.tsx`
- `src/components/cpti/CptiPairCodeCard.tsx`
- `src/components/cpti/CptiCollectionSummaryCard.tsx`
- `src/components/cpti/CptiLeaderboardEntryCard.tsx`
- `src/components/cpti/CptiPrivacyControls.tsx`

建议保留但重构：

- `InviteAndStealthCTA`

建议改造成：

- `CptiPairActions`
- `CptiStealthEntry`

---

## 9. 状态设计

### 9.1 生成六码状态

- idle
- generating
- ready
- copied
- expired
- error

### 9.2 配对提交状态

- ready
- submitting
- synced
- partial_success
- failed

### 9.3 图鉴状态

- no_data
- loaded
- local_fallback

---

## 10. 文案方向

### 结果页

- 发链接给 ta：更适合定向邀请
- 生成六码：更适合公开配对

### 关系页

- 已同步到双方图鉴
- 你又解锁了一种关系
- 去看看你是不是灵魂伴侣体质

### 榜单入口

- 灵魂伴侣榜
- 稀有关系榜
- 图鉴进度榜

避免：

- 魅力值
- 斩男值
- 拿下率

---

## 11. 最小前台交付范围

如果只做最小可用版本，建议先改：

1. 结果页加六码入口
2. 关系页加图鉴/榜单入口
3. 新增六码输入页
4. 卡片页改成服务端优先读取

只要这 4 步做出来，前台就已经具备后台化承接能力。
