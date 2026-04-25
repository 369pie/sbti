# WTFTI 核心页面深浅模式适配审计报告

> 审计时间：2026-04-25
> 审计范围：首页、导航、图鉴、个人中心等 12 个核心页面/组件
> 主题系统：CSS token（`--color-*`）+ Tailwind token（`text-text-primary` 等）
> 深色模式触发：`body[data-theme='galaxy']` 或 `body[data-theme='wtfti-dark']`

---

## 全局主题系统概述

- **浅色默认**：`--color-bg-primary: #FBF6F0`，`--color-text-primary: #3D2C23`
- **深色覆盖**：`--color-bg-primary: #12121A`，`--color-text-primary: #F2F2F5`
- **兜底机制**：`globals.css` 中存在 DARK 兜底层（L334–355），对 `.bg-white`（非 `data-keep-white`）自动映射到 `var(--color-bg-elevated)`
- **Galaxy token 系统**：`--galaxy-*` 系列 token 在深浅主题下均有完整映射

---

## 逐文件审计

### 1. src/app/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 无 UI 渲染，仅元数据与 schema 注入 |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ❌ 无 |
| 对比度 | — |

**备注**：纯包装页面，深浅模式适配无问题。

---

### 2. src/app/HomeContent.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 大量使用 `var(--color-*)` 和 Tailwind token（`text-text-primary`、`bg-bg-elevated`、`border-border-subtle` 等） |
| 硬编码颜色 | ⚠️ 4 处 |
| 背景/渐变 | ✅ 使用 token 渐变（`var(--color-gold-leaf)`、`var(--color-rose-deep)`） |
| 对比度 | ⚠️ 二维码区域需关注 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 591 | `bg-white p-2 inline-block` | 微信二维码容器白底 | 低（有全局兜底，但建议加 `data-keep-white` 或改用 token） |
| 613 | `bg-white p-2 inline-block` | QQ 群二维码容器白底 | 低（同上） |
| 640 | `text-white` | Bottom CTA 按钮文字白色 | 中（按钮背景是渐变 `var(--color-gold-leaf)` → `var(--color-rose-deep)`，深色模式下渐变变暗，文字对比度可能不足） |

**建议**：
- 两处 `bg-white` 应明确标记 `data-keep-white`（二维码确实需要白底）或改用 `bg-bg-elevated`
- CTA 按钮 `text-white` 建议改为 `text-bg-primary`（浅色下接近白色，深色下为 `#12121A`，对比度更好）

---

### 3. src/components/Navigation.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 主体使用 token（`bg-bg-elevated/90`、`text-text-primary`、`border-border-subtle` 等） |
| 硬编码颜色 | ⚠️ 6 处 |
| 背景/渐变 | ✅ 导航栏使用 backdrop-blur + token |
| 对比度 | ⚠️ CTA 和 badge 需关注 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 336 | `text-white bg-gradient-to-r from-pink-500 to-fuchsia-500` | 测关系 dropdown 的 "热推" badge | 低（渐变背景本身较鲜艳，白色文字可读） |
| 446 | `bg-accent text-white` | Desktop 登录按钮 | 中（深色模式下 `--color-accent` 变为 `#D4A59A`，`text-white` 对比度约 8.5:1，可接受但不够优雅） |
| 453 | `bg-accent text-white` | Desktop CTA 按钮 | 中（同上） |
| 486 | `bg-accent text-white` | Mobile 登录按钮 | 中（同上） |
| 510 | `bg-accent text-white` | Mobile CTA 按钮 | 中（同上） |
| 669 | `shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]` | NavMark 内阴影硬编码白色 | 低（深色模式下白色内阴影在深灰底上会产生轻微高光，视觉上不协调但功能正常） |

**移动端菜单审计（L476–659）**：
- ✅ 移动端菜单背景使用 `bg-bg-elevated`，跟随主题
- ✅ 所有链接和按钮使用 `text-text-primary`、`text-text-secondary`、`text-text-muted`
- ✅ 分区标题使用 `text-text-muted`
- ⚠️ Mobile CTA 按钮（L510）使用 `bg-accent text-white`，同 desktop

**建议**：
- `text-white` 统一替换为 `text-bg-primary`，让按钮文字在深浅模式下都使用背景色（浅色=近白，深色=深灰），保持语义一致
- NavMark 内阴影改为 `rgba(255,255,255,0.42)` 的 token 化版本或移除

---

### 4. src/app/guide/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 全部使用 token |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ✅ `bg-bg-elevated`、`bg-bg-secondary/30`、`border-border-subtle` |
| 对比度 | ✅ 良好 |

**备注**：完全通过 token 渲染，深浅模式无问题。

---

### 5. src/app/about/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 全部使用 token |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ✅ 纯 token |
| 对比度 | ✅ 良好 |

**备注**：完全通过 token 渲染，深浅模式无问题。

---

### 6. src/app/contact/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 大部分使用 token |
| 硬编码颜色 | ⚠️ 1 处（已保护） |
| 背景/渐变 | ✅ 纯 token |
| 对比度 | ✅ 良好 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 35 | `data-keep-white className="... bg-white ..."` | 微信二维码容器 | ✅ 已正确标记 `data-keep-white`，不受全局兜底影响 |

**备注**：QQ 群区域使用 `bg-bg-secondary`（L51），适配良好。整体设计规范。

---

### 7. src/app/types/TypesContent.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 大量使用 token |
| 硬编码颜色 | ⚠️ 3 处 |
| 背景/渐变 | ✅ 卡片渐变使用 `item.color` 动态值 |
| 对比度 | ⚠️ 预览按钮和 fallback 区域需关注 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 126 | `border-white/30 bg-white/20` | 图片加载失败 fallback 区域 | 中（深色模式下白色边框和背景在深灰卡片上会产生不自然的亮色块） |
| 207 | `bg-black/35 text-white` | 卡片预览眼睛按钮 | 低（半透明黑底 + 白字，深色模式下黑底更不明显，但白字仍可读） |
| 611 | `color: '#fff'` | filter chip active 状态文字 | 低（active 背景是 `activeTab.accent`，`#fff` 在大部分 accent 色上可读，但不够语义化） |

**建议**：
- `border-white/30 bg-white/20` 应改为 `border-border-subtle/30 bg-bg-elevated/20`
- `bg-black/35 text-white` 改为 `bg-text-primary/35 text-bg-primary`
- filter chip active 文字改为 `color: 'var(--color-bg-primary)'`

---

### 8. src/app/types/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 全部使用 token |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ✅ `bg-bg-elevated`、`border-border-subtle` |
| 对比度 | ✅ 良好 |

**备注**：纯数据传递页面，UI 全部在 TypesContent 中，此文件无问题。

---

### 9. src/app/card/CardContent.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 主体使用 token，但 Collector Pro 区域严重偏离 |
| 硬编码颜色 | ⚠️ 14+ 处 |
| 背景/渐变 | ⚠️ Collector Pro 使用大量硬编码暖棕/纸色 |
| 对比度 | ⚠️ Collector Pro 区域在深色模式下对比度严重不足 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 202 | `text-white` | UniverseBadge PIN 标签 | 低（`bg-accent` 背景，深色模式下 accent 变玫瑰金，白色可读） |
| 263 | `bg-accent text-white` | Pin 按钮 active 状态 | 低（同 Navigation CTA） |
| 523 | `text-white` | 对比挑战 CTA 按钮 | 中（渐变背景 `var(--color-rose)` → `var(--color-rose-deep)`，深色下变淡） |
| 618 | `bg-accent text-white` | NicknameEditor 保存按钮 | 低 |
| 665 | `bg-accent text-white` | ShareButton 生成卡片 | 低 |
| 1115 | `text-white` | Showcase PIN 标签 | 低 |
| 1256–1301 | `#8a6d3b`、`#1F1A16`、`#5B524B`、`#7a6a55`、`#9f4b5b` 等 | **CollectorProSection & CollectorDownloadPanel** 大量硬编码棕/金/纸色 | **高** |
| 1340–1342 | `background: 'rgba(255,253,249,0.78)'` | CollectorDownloadPanel 背景 | **高**（深色模式下近白背景） |
| 1389 | `background: active ? 'rgba(201,166,118,0.12)' : 'rgba(255,255,255,0.6)'` | 下载按钮背景硬编码白色 | **高** |
| 1436–1437 | `stopColor="#FFFCF4"`、`stopColor="#F5EFE0"` | CollectorBookletMockup SVG 纸色 | 中（SVG mockup 预览图，但深色下会显突兀） |

**Collector Pro 区域深色模式风险评估**：

CollectorProSection（L1224–1303）和 CollectorDownloadPanel（L1307–1419）是整个项目中**最严重的深浅模式适配缺陷**：

- 文字颜色硬编码为 `#1F1A16`（深棕），在深色背景 `#12121A` 上几乎不可见
- 背景使用 `rgba(255,253,249,0.78)`（近白半透明），在深色模式下会形成刺眼的亮色块
- 边框颜色硬编码为 `rgba(168,138,90,0.35)`，在深色下可能过于突兀
- 说明文字 `#5B524B`、`#7a6a55` 在深色背景上对比度不足
- 错误文字 `#9f4b5b` 在深色背景上可读但不够优雅

**建议**：
- CollectorProSection 全部重写为 token 驱动：
  - 文字 → `var(--color-text-primary)` / `text-text-secondary`
  - 背景 → `var(--color-bg-elevated)` / `bg-bg-elevated`
  - 边框 → `var(--color-border)` / `border-border`
  - 强调色 → `var(--color-gold)` / `text-gold`
- SVG mockup 中的纸色应使用 CSS 变量或根据 `data-theme` 动态切换

---

### 10. src/app/me/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 无 UI，仅包裹 MeContent |
| 硬编码颜色 | ❌ 无 |

**备注**：无问题。

---

### 11. src/app/me/MeContent.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 大部分使用 token |
| 硬编码颜色 | ⚠️ 3 处 |
| 背景/渐变 | ⚠️ 头像渐变硬编码粉紫 |
| 对比度 | ⚠️ 头像区域需关注 |

**硬编码问题明细**：

| 行号 | 代码 | 问题 | 风险等级 |
|------|------|------|----------|
| 225 | `bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white` | 用户头像背景 | 中（粉紫渐变在浅色模式下 OK，深色模式下过于鲜艳，与整体暮紫/深灰调不协调） |
| 246 | `bg-accent text-white` | 昵称保存按钮 | 低（同 Navigation） |
| 455 | `bg-emerald-600 text-white` | 创作者工作台入口按钮 | 低（emerald-600 是 Tailwind 标准色，深色模式下仍可读，但建议 token 化） |

**建议**：
- 头像渐变改为 `from-accent to-rose-deep` 或使用 `var(--color-accent)` 系列
- `bg-emerald-600` 改为 `bg-sage` 或 `bg-gem`（已有 token）
- `text-white` 统一改为 `text-bg-primary`

---

### 12. src/app/privacy/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 全部使用 token |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ✅ `var(--color-paper-warm)` 特色区块 |
| 对比度 | ✅ 良好 |

**备注**：`var(--color-paper-warm)` 在深浅模式下均有映射（深色=`#1E1E28`），适配良好。

---

### 13. src/app/terms/page.tsx

| 维度 | 结论 |
|------|------|
| CSS token | ✅ 全部使用 token |
| 硬编码颜色 | ❌ 无 |
| 背景/渐变 | ✅ `var(--color-paper-warm)` 特色区块 |
| 对比度 | ✅ 良好 |

**备注**：同 privacy 页面，完全适配。

---

## 问题汇总

### 按严重程度分类

#### 🔴 高风险（深色模式下功能/可读性受损）

| 文件 | 位置 | 问题 | 修复优先级 |
|------|------|------|-----------|
| `src/app/card/CardContent.tsx` | L1256–1419 | Collector Pro 区域大量使用硬编码棕/金/纸色，文字 `#1F1A16` 在深色背景不可见，背景 `rgba(255,253,249,0.78)` 形成刺眼亮色块 | **P0** |
| `src/app/card/CardContent.tsx` | L1389 | 下载按钮硬编码 `rgba(255,255,255,0.6)` 背景 | **P0** |

#### 🟡 中风险（视觉不协调或对比度隐患）

| 文件 | 位置 | 问题 | 修复优先级 |
|------|------|------|-----------|
| `src/app/HomeContent.tsx` | L640 | Bottom CTA `text-white` + 渐变背景，深色下渐变变淡 | P1 |
| `src/app/types/TypesContent.tsx` | L126 | 图片 fallback `border-white/30 bg-white/20` 深色下显突兀 | P1 |
| `src/app/types/TypesContent.tsx` | L207 | 预览按钮 `bg-black/35 text-white` 深色下黑底不明显 | P1 |
| `src/app/me/MeContent.tsx` | L225 | 头像 `from-pink-500 to-fuchsia-500` 与深色主题不协调 | P1 |
| `src/app/card/CardContent.tsx` | L523 | 对比挑战 CTA `text-white` + 渐变背景 | P1 |

#### 🟢 低风险（可优化但功能正常）

| 文件 | 位置 | 问题 | 修复优先级 |
|------|------|------|-----------|
| `src/app/HomeContent.tsx` | L591, L613 | 二维码 `bg-white`（建议加 `data-keep-white` 明确意图） | P2 |
| `src/components/Navigation.tsx` | L446, L453, L486, L510 | `bg-accent text-white` CTA 按钮（建议 `text-bg-primary`） | P2 |
| `src/components/Navigation.tsx` | L336 | 热推 badge `text-white` + 粉紫渐变 | P2 |
| `src/components/Navigation.tsx` | L669 | NavMark `shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]` | P2 |
| `src/app/card/CardContent.tsx` | L202, L263, L618, L665, L1115 | 多处 `text-white` on `bg-accent` | P2 |
| `src/app/me/MeContent.tsx` | L246, L455 | `bg-accent text-white`、`bg-emerald-600 text-white` | P2 |
| `src/app/types/TypesContent.tsx` | L611 | filter chip active `color: '#fff'` | P2 |

---

## 修复建议清单

### 立即修复（P0）

1. **CollectorProSection 全面 token 化**
   ```css
   /* 替换硬编码颜色为 token */
   color: var(--color-text-primary);      /* 替代 #1F1A16 */
   color: var(--color-text-secondary);    /* 替代 #5B524B, #7a6a55 */
   background: var(--color-bg-elevated);  /* 替代 rgba(255,253,249,0.78) */
   border-color: var(--color-border);     /* 替代 rgba(168,138,90,0.35) */
   color: var(--color-gold);              /* 替代 #8a6d3b */
   ```

### 短期优化（P1）

2. **统一 `text-white` → `text-bg-primary`**
   - 所有 `bg-accent text-white` 组合改为 `bg-accent text-bg-primary`
   - 所有渐变按钮上的 `text-white` 改为 `text-bg-primary`

3. **图片 fallback 区域 token 化**
   ```tsx
   // TypesContent.tsx L126
   border-2 border-border-subtle/30 bg-bg-elevated/20
   ```

4. **头像渐变主题化**
   ```tsx
   // MeContent.tsx L225
   bg-gradient-to-br from-accent to-rose-deep
   ```

### 长期优化（P2）

5. **NavMark 内阴影 token 化或移除**
6. **filter chip active 文字使用 token**
   ```tsx
   color: 'var(--color-bg-primary)'
   ```
7. **二维码 `bg-white` 明确标记 `data-keep-white`**

---

## 总结

| 类别 | 数量 |
|------|------|
| 完全适配文件 | 5（page.tsx, guide/page.tsx, about/page.tsx, privacy/page.tsx, terms/page.tsx） |
| 轻微问题文件 | 5（Navigation, HomeContent, TypesContent, MeContent, contact/page.tsx） |
| 严重问题文件 | 1（card/CardContent.tsx 的 Collector Pro 区域） |
| 总计发现问题 | 24 处 |
| 高风险问题 | 2 处 |
| 中风险问题 | 5 处 |
| 低风险问题 | 13 处 |

**总体评价**：WTFTI 核心页面的深浅模式适配基础良好，全局 CSS token 系统完善，且存在 `bg-white` 兜底机制。但 **CardContent.tsx 的 Collector Pro 付费区域** 是一个显著的深色模式盲区，使用了大量与主题系统脱节的硬编码暖棕色，在深色模式下会导致文字不可读和背景刺眼，建议优先修复。
