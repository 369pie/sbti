# 🚀 上线前收口审查报告 — Launch Readiness Audit

> Owner: Operations + QA
> Status: Active Audit
> Priority: P0
> Last Updated: 2026-04-16
> Review Cadence: Before every launch cut
> Next Decision: Decide whether all launch blockers are closed enough for first public release

> 审查时间：2026-04-17
> 目标：确保核心产品模块功能完整、可正常体验，做最小收口后首次上线

---

## 一、全局状态概览

| 模块 | 状态 | 阻塞上线？ | 关键问题数 |
|------|------|-----------|-----------|
| **WTFTI 主测试** | ✅ 完整 | 否 | 0 |
| **BanTI / Kings / Delta** | ✅ 完整 | 否 | 0 |
| **Bird / Flower** | ✅ 完整 | 否 | 0 |
| **XPTI 恋爱XP** | ✅ 完整 | 否 | 0 |
| **SoulTI 灵魂测试** | 🔴 部分 | **是** | 2 |
| **CPTI 关系测试** | 🟡 基本完整 | 否 | 1 |
| **Identify 好友鉴定** | 🟢 基本完整 | 否 | 0（小瑕疵） |
| **Mysti 灵鉴塔罗** | 🟡 基本完整 | 否 | 2 |
| **WTF CARD 档案卡** | 🟡 基本完整 | 否 | 1 |
| **Feng 疯TI** | 🔴 部分 | **是** | 1 |
| **主页 & 导航** | ✅ 完整 | 否 | 1 |

**30+ 个内部链接全部验证通过，无死链。**

---

## 二、按优先级排列的问题清单

### P0 — 🔴 上线阻塞（不修则不能上）

#### 1. SoulTI 全部 32 个人格图片缺失
- **位置**: `public/images/types/soulti/` — 目录不存在
- **影响**: SoulTI 结果页所有人格图片全部加载失败（broken image），分享卡片也没有角色图
- **类型**: 32 个人格的 full PNG + medium WebP + thumbnail WebP 都不存在
- **预估工作量**: 需要批量生成或制作 32 套人格图片素材
- **建议**: 如果短期内无法生成图片，**暂时将 SoulTI 从导航热门推荐中下线**，等图片到位再放回

#### 2. Feng 疯TI 全部 29 个人格图片缺失
- **位置**: `public/images/types/feng/` — 目录不存在
- **影响**: 疯TI 结果页全部 broken image
- **建议**: 同 SoulTI，暂时下线或隐藏入口

---

### P1 — 🟠 严重体验问题（强烈建议修）

#### 3. SoulTI 夜镜/梦镜永远锁死
- **位置**: [SoultiResultContent.tsx](../../../src/app/soulti/result/%5Btype%5D/SoultiResultContent.tsx#L286-287)
- **现状**: `locked: true` 硬编码，CTA 指向 `/auth/register/`，但注册后并无解锁逻辑
- **影响**: 用户完成 SoulTI 测试后看到 3 面镜子，其中 2 面永远打不开，体验很差
- **建议**: 付费暂不上，直接改为 `locked: false` 全部免费开放，上线后再做付费门槛

#### 4. SoulTI 角色图 `fill` 布局 bug
- **位置**: [SoultiResultContent.tsx#L177](../../../src/app/soulti/result/%5Btype%5D/SoultiResultContent.tsx#L177)
- **现状**: `NextImage fill` 但父容器没有 `position: relative`，图片无法正确显示
- **修复**: 给父 div 加 `relative`

#### 5. CPTI 人格图路径错误
- **位置**: `getCptiTypeMediumImage()` 返回 `/images/types/cpti/medium/{slug}.webp`
- **实际**: 文件在 `/images/types/medium/cpti-{slug}.webp`
- **影响**: CPTI 结果页首次加载人格头像失败
- **修复**: 修正路径为 `/images/types/medium/cpti-{slug}.webp`

#### 6. WTF CARD Mysti 徽章永不点亮
- **位置**: [personality-resolver.ts](../../../src/lib/personality-resolver.ts) 缺少 `case 'mysti'`
- **影响**: 用户做了 Mysti 但 WTF Card 宇宙页面永远显示 "?" 未解锁
- **修复**: 在 personality-resolver 中添加 Mysti 映射

#### 7. 缺少 OG 分享图
- **现状**: 整站无 `og-image.png`，社交平台分享无预览图
- **影响**: 微信/小红书/Twitter 分享链接无封面图 — 对病毒传播平台是致命的
- **修复**: 制作一张 1200×630 品牌 OG 图

---

### P2 — 🟡 中等体验问题（建议上线前修）

#### 8. Mysti `reading` 内容未展示
- **位置**: Mysti 结果页 UI 只展示 tagline 和基础信息
- **现状**: 29 个塔罗人格都有精心写的 `reading` 长文字段，但只在 Canvas 分享图中使用，页面上看不到
- **影响**: 用户错过了最好的内容
- **修复**: 在结果页添加 reading 段落展示

#### 9. Identify 历史标签未本地化
- **位置**: IdentifyHistoryPanel
- **现状**: 显示原始英文 "sent" / "received"，应为中文
- **修复**: 改为 "我发起的" / "收到的"

#### 10. Mysti landing 用 `<a>` 代替 `<Link>`
- **现状**: 页面跳转导致全量重载，体验差
- **修复**: 改为 Next.js `<Link>`

---

### P3 — 🟢 低优先级（上线后再修不影响核心体验）

| # | 问题 | 位置 |
|---|------|------|
| 11 | Identify drama/joker 缺 full-res PNG（medium WebP 也缺，分享图显示 emoji fallback） | `public/images/types/` |
| 12 | CPTI missile 和 rollercoaster 画像完全相同（LHHLH），rollercoaster 永远匹配不到 | 数据问题 |
| 13 | CPTI SETTLED 始终优先于 ICEBERG（重叠条件），Euclidean fallback 只覆盖 9/25 关系 | 算法问题 |
| 14 | Mysti 双收藏系统不同步（`mysti-collection` 墙 vs `gacha-collection` 抽卡） | 架构问题 |
| 15 | SoulTI .bak 文件残留 | `src/app/soulti/SoultiLandingContent.tsx.bak` |
| 16 | 服务端分析 TODO 未实现（仅 console.log） | cpti/analytics.ts |
| 17 | Jueti 空目录 | `src/app/jueti/` |
| 18 | 测完后无 WTF Card 提示（"你的 Card 新点亮了！"） | 所有结果页 |

---

## 三、最小收口方案 — Sprint 计划

### 🔥 Sprint A: 阻塞修复 (P0 + P1 关键)

> 这些不修就不能上线

| # | 任务 | 方案 |
|---|------|------|
| A1 | SoulTI 图片问题 | **方案 A**: 生成 32 套图片（耗时长）<br>**方案 B**: 暂时从导航热门位移除 SoulTI 入口、注册 universe 但标记为 hidden（快速） |
| A2 | Feng 图片问题 | 同上。建议和 SoulTI 统一方案 |
| A3 | SoulTI 夜镜/梦镜解锁 | 改 `locked: false`，删除注册 CTA |
| A4 | SoulTI 图片容器布局 | 加 `relative` 到父容器 |
| A5 | CPTI 图片路径修正 | 修正 `getCptiTypeMediumImage()` |
| A6 | WTF CARD Mysti resolver | 添加 `case 'mysti'` |
| A7 | OG 分享图 | 制作 1200×630 品牌图放 `public/og-image.png` |

### ✨ Sprint B: 体验提升 (P2)

| # | 任务 |
|---|------|
| B1 | Mysti 结果页展示 reading 内容 |
| B2 | Identify 历史标签中文化 |
| B3 | Mysti landing 改用 `<Link>` |

### 🧹 Sprint C: 收尾 (P3 — 上线后)

| # | 任务 |
|---|------|
| C1 | Identify drama/joker 补图 |
| C2 | CPTI 数据去重 |
| C3 | Mysti 收藏系统统一 |
| C4 | 清理 .bak 和空目录 |
| C5 | 测完后 WTF Card 提醒 |

---

## 四、上线决策矩阵

| 如果你选择… | SoulTI | Feng | 其他模块 | 预估工作量 |
|-------------|--------|------|---------|-----------|
| **全模块上线** | 需 32 套图 | 需 29 套图 | 修 A3-A7 + B1-B3 | 大（图片为主） |
| **隐藏缺图模块上线** ⭐️ 推荐 | 暂时隐藏 | 暂时隐藏 | 修 A5-A7 + B1-B3 | 小 |
| **仅核心 4 模块上线** | 隐藏 | 隐藏 | 只推 WTFTI + CPTI + Identify + Mysti | 最小 |

**推荐方案: 隐藏缺图模块上线** — SoulTI 和 Feng 暂时从导航中移除（保留代码），其余模块全部修完即可上线。图片素材到位后随时再开放。

---

## 五、各模块完整性详情

### WTFTI + 风格宇宙 (5 个)
- 29 人格 × 5 宇宙 = 145 个结果页，全部完整 ✅
- 所有图片 3 尺寸齐全 ✅
- 测试流程完整 ✅
- 分享功能完整 ✅

### XPTI
- 12 人格，全部完整 ✅
- 独立题库 + 独立 Quiz 组件 ✅
- 全尺寸图片齐全 ✅

### CPTI
- 16 人格 + 25 关系类型 ✅
- 完整的邀请→配对→关系结果流程 ✅
- Supabase 后端 API 完整 ✅
- **Bug**: 人格头像路径错误（P1 #5）

### Identify
- 21 鉴定人格 ✅
- 完整的发起→被鉴定→领取流程 ✅
- 历史面板 + 后端 API ✅
- 代码最干净，零 TODO ✅

### Mysti
- 29 塔罗映射 + 22 大阿尔卡纳每日卡 ✅
- 抽卡系统（稀有度分层）✅
- 3 个分享图生成器 ✅
- **Gap**: reading 内容未展示（P2 #8）

### WTF CARD
- 三 Tab 系统全部工作 ✅
- 13 个宇宙集成 ✅
- 对比分享功能 ✅
- **Bug**: Mysti 永不点亮（P1 #6）

### 主页 & 导航
- 9 个内容版块 ✅
- 4 类导航分组 ✅
- 30+ 内部链接零死链 ✅
- 移动端适配 ✅
- **Gap**: 无 OG 图（P1 #7）
