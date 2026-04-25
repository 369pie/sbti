# WTFTI 测试模块深浅模式适配审计报告

> 审计日期：2026-04-25
> 审计范围：CPTI / XPTI / WTFTI / Mysti / 各宇宙测试页
> 审计目标：检查深浅模式适配、硬编码颜色、可读性、主题冲突

---

## 1. 执行摘要

**总体结论：深色模式体验"一团糟"的结论成立。**

- **CPTI**：完全脱离全局主题系统，大量硬编码浅色纸色（#F5F0E8）和深棕文字（#2c2620），深色模式下页面仍是"白纸黑字"，与全局深色主题割裂。
- **XPTI**：Layout 层正确使用 CSS 变量，但部分子页面（archive、couple、whitepaper）存在硬编码浅色背景和反色文字。
- **WTFTI**：主体跟随全局主题，但 Feng（疯TI）子模块完全硬编码了自己的深色朋克风格，与全局主题切换无关。
- **Mysti**：拥有独立的 v2 主题系统（twilight/nocturne/aurora），不跟随全局 token，但三套主题都是暗色系，浅色模式完全缺失。
- **各宇宙**：71 处硬编码 hex 颜色，是重灾区。多数宇宙（flower、fanrenti、hogti、soulti）完全写死浅色配色，深色模式下不可读。
- **SoulTI**：拥有独立的"夜灯模式"（22:00-06:00 自动触发），与全局主题系统并存，造成双重主题覆盖的混乱。

| 模块 | 硬编码 hex 数量 | 是否跟随全局主题 | 深色模式评级 |
|------|----------------|------------------|-------------|
| CPTI | 70+ | 否 | F |
| XPTI | 1+ | 部分 | C |
| WTFTI 主体 | 7 | 是 | B |
| WTFTI /feng | 大量 | 否（自锁深色） | N/A |
| Mysti | 2+ | 否（自有系统） | B（但只有深色） |
| 各宇宙 | 71+ | 否 | D-F |
| SoulTI | 大量 | 否（独立夜灯） | C |

---

## 2. 全局主题系统概述

### 2.1 Token 架构

- **切换机制**：`body[data-theme='wtfti-light' | 'wtfti-dark']` + `body[data-wtfti-theme='light' | 'dark']`
- **默认状态**：根 `layout.tsx` 硬编码 `data-theme="wtfti-light"`，即**全站默认浅色**
- **Provider**：`WtftiThemeProvider`（`src/components/wtfti/WtftiThemeProvider.tsx`）
  - 默认 `light`（BE TRUE 奶油玫瑰）
  - 持久化到 `localStorage['wtfti.theme']`
  - 切换时重映射全局 CSS token（`--color-bg-primary`、`--color-text-primary` 等）

### 2.2 DARK 兜底层

`globals.css` 第 334-355 行提供了一层"抢救阀"：

```css
body[data-theme='galaxy'] .bg-white:not([data-keep-white]),
body[data-theme='wtfti-dark'] .bg-white:not([data-keep-white]) {
  background-color: var(--color-bg-elevated) !important;
}
```

**局限性**：
- 仅对 Tailwind 的 `bg-white` 类有效，对 `bg-[#F5F0E8]`、`bg-white/80` 等硬编码写法无效
- 不处理文字颜色重映射
- 不处理内联 `style={{ background: '#FFF' }}`

### 2.3 WTFTI 仪式沉浸态

`body[data-wtfti-ritual='1']` 会强制 `background: #0a0820 !important` 并隐藏导航/页脚。
部分测试流程会触发此状态，进一步干扰深浅模式的一致性。

---

## 3. 模块级审计详情

### 3.1 CPTI（严重）

**状态**：完全未接入全局主题系统。CPTI 有自己的玫瑰金纸色视觉语言，所有页面硬编码了相同的浅色纸色。

#### 3.1.1 硬编码背景色（浅色锁定）

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `CptiHisPovClient.tsx:54` | `bg-[#F5F0E8]` | 全屏纸色背景，深色模式下仍亮白 |
| `CptiCodexClient.tsx:184` | `bg-[#F5F0E8]` | 同上 |
| `CptiCodexClient.tsx:229` | `bg-[#FFF8E8]` | 邀请提示卡片，暖黄底色 |
| `CptiResultContent.tsx:279` | `bg-[#fffaf2]` | 结果页卡片，极浅暖白 |
| `pricing/page.tsx` fallback | `bg-[#F5F0E8]` | Suspense 兜底背景 |
| `relationship/*/his/page.tsx` fallback | `bg-[#F5F0E8]` | Suspense 兜底背景 |
| `relationship/*/deep/page.tsx` fallback | `bg-[#F5F0E8]` | Suspense 兜底背景 |

#### 3.1.2 硬编码文字色（深棕锁定）

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `CptiHisPovClient.tsx:54` | `text-[#2c2620]` | 深棕文字，在深色背景上几乎不可见 |
| `CptiResultContent.tsx:285` | `text-[#2c2620]` | 结果标题 |
| `CptiResultContent.tsx:290` | `text-[#6b5b3f]` | 结果正文 |
| `CptiCodexClient.tsx:206` | `text-[#5a4f3e]` | 卡片内文字 |
| `CptiCodexClient.tsx:208` | `text-[#2c2620]` | 卡片标题 |
| `CptiCodexClient.tsx:233` | `text-[#2c2620]` | 通知文字 |
| `CptiCodexClient.tsx:247` | `text-[#8a6d3a]` | 链接文字 |

#### 3.1.3 bg-white 直接写死

- `CptiCodexClient.tsx:206`：`bg-white/80`（通知卡片）
- `CptiCodexClient.tsx:301`：`bg-white/70`（状态标签）
- `CptiCodexClient.tsx:312`：`bg-white/70`（空状态）
- `CptiCodexClient.tsx:349`：`bg-white/92`（编年史卡片）
- `CptiCodexClient.tsx:414,425,433`：`bg-white`（表单输入框）

> **兜底层对这些 `bg-white/80` 等半透明白色无效**，深色模式下它们会变成深灰底上的亮白卡片，视觉撕裂。

#### 3.1.4 "一团糟"的具体表现

1. **页面整体仍是浅色纸色**：全局切到深色后，CPTI 结果页、 codex 页、关系报告页仍然是 `#F5F0E8` 暖白纸色，与全局深色导航/页脚形成强烈反差
2. **文字不可读**：`text-[#2c2620]` 深棕文字在假设的深色背景上对比度几乎为零（实际因为背景仍是浅色所以能读，但与全局主题割裂）
3. **按钮配色混乱**：`bg-rose-500 text-white` 按钮在浅色页面上尚可，但在深色全局主题下，周围全是深色 UI 元素，唯独 CPTI 页面是亮的
4. **表单输入框纯白**：`bg-white` 输入框在深色模式下成为视觉焦点，非常刺眼

#### 3.1.5 建议

- 将 CPTI 的纸色系统映射到全局 token：`--color-paper` / `--color-bg-primary`
- 文字色使用 `--color-text-primary` 替代 `#2c2620`
- 装饰色 `#c9a676` 可保留（金色在深浅模式下都可用），但需降低饱和度依赖
- 为 CPTI 设计深色专属纸色变体（深棕底 + 暖金文字）

---

### 3.2 XPTI（中等）

**状态**：Layout 层正确接入全局主题，但子页面存在逃逸。

#### 3.2.1 正确的做法

`src/app/xpti/layout.tsx`：
```tsx
<div
  className="min-h-screen selection:bg-rose-200/60 selection:text-rose-900"
  style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
>
```

这是全站测试模块中**唯一正确接入全局主题 token 的 layout**。

#### 3.2.2 问题点

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `ArchiveClient.tsx:17` | `PALETTE = { paper: '#F5F0E8', ink: '#1F1A16', ... }` | 局部 PALETTE 对象，完全绕过全局 token |
| `ArchiveClient.tsx:199,209` | `background: '#FFFDF9'` | 硬编码暖白卡片底色 |
| `CoupleClient.tsx:546,825,831` | `background: '#FFFDF9'` | 硬编码暖白卡片底色 |
| `XptiHomeContent.tsx:180` | `color: '#FFFFFF'` | 内联白色文字 |
| `XptiHomeContent.tsx:559` | `background: VELVET_DARK_WINE, color: '#FFFFFF'` | 深酒红按钮 + 白字，在浅色主题下可读，但硬编码 |
| `whitepaper/WhitepaperContent.tsx:54` | `body { background: #fff !important; }` | **强制覆盖 body 背景为纯白**，全局深色 token 被 !important 覆盖 |

#### 3.2.3 "一团糟"的具体表现

1. **whitepaper 页面强制纯白**：`body { background: #fff !important; }` 在深色模式下会让整个页面背景强制纯白，而导航/页脚仍是深色，形成强烈反差
2. **archive/couple 卡片硬编码暖白**：`#FFFDF9` 卡片在深色主题下成为亮斑
3. **VELVET_DARK_WINE 按钮**：在浅色主题下是深酒红底 + 白字，虽然可读，但完全不跟随全局 accent 系统

#### 3.2.4 建议

- 删除 `WhitepaperContent.tsx` 中的 `body { background: #fff !important; }`
- 将 `PALETTE` 对象替换为 CSS 变量引用
- `#FFFDF9` 卡片使用 `var(--color-bg-elevated)` 或 `var(--color-bg-secondary)`

---

### 3.3 WTFTI 经典测试（良好，有例外）

**状态**：主体跟随全局主题，结果页、测试页使用 token 友好。

#### 3.3.1 正确做法

- `WtftiResultContent.tsx`、`DeltaResultContent.tsx`、`KingsResultContent.tsx`、`BantiResultContent.tsx` 等结果页使用 `bg-accent text-white` 按钮，accent 色会随全局主题切换（深色下为 `#D4A59A`，浅色下为 `#C9867D`）
- `wtfti/layout.tsx` 使用 `wtfti-site-shell` class，跟随 body token

#### 3.3.2 问题点：Feng（疯TI）子模块

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `FengLandingContent.tsx:15` | `bg-[#050505] text-white` | **全屏强制纯黑底 + 白字** |
| `FengResultContent.tsx:288` | `bg-[#050505] text-white` | 同上 |
| `FengLandingContent.tsx` 多处 | `color: '#fff'`、`borderColor: '#ffffff20'` 等 | 完全自包含的朋克视觉系统 |

**Feng 是一个"自锁深色"模块**。它不管全局主题是 light 还是 dark，永远显示黑底白字。这在设计上是意图（朋克/故障风格），但技术上它没有声明 `data-keep-white` 或隔离主题影响。

#### 3.3.3 "一团糟"的具体表现

1. **Feng 模块在浅色主题下仍是纯黑**：用户切到 BE TRUE 浅色主题后，进入 /wtfti/feng 页面会突然变成纯黑，造成惊吓
2. **白色透明度层次过多**：`bg-white/[0.03]`、`bg-white/5`、`bg-white/10` 等在 Feng 的黑底上形成微妙的灰度层次，但全局主题切换到浅色后，如果 Feng 的父容器背景变浅，这些白色半透明元素会消失或变脏

#### 3.3.4 建议

- Feng 模块应显式声明 `data-keep-dark` 或类似属性，并在加载时临时将 body 主题锁定为 dark
- 或在 Feng 的 root div 上使用 `isolation: isolate` + 绝对定位深色背景，确保不影响全局

---

### 3.4 Mysti（独立体系，浅色缺失）

**状态**：拥有完全独立的主题系统，不跟随全局 token。

#### 3.4.1 Mysti v2 主题系统

- `MystiThemeProvider`（`src/components/MystiThemeProvider.tsx`）
- 三套主题：`twilight`（暮光紫黑）、`nocturne`（深夜蓝黑）、`aurora`（晨光——实际上是暗色系）
- 自动切换：根据时间 22:00-06:00 自动切到 nocturne
- 存储键：`mysti-theme-v2`

#### 3.4.2 与全局主题的关系

- **完全不交互**：Mysti 不读取 `body[data-theme]`，全局主题切换不影响 Mysti
- **视觉上不冲突**：因为 Mysti 的三套主题都是暗色系，即使全局是浅色，Mysti 页面也是深色，形成"白昼中的暗夜"效果
- **浅色模式完全缺失**：Mysti 没有任何浅色主题选项

#### 3.4.3 硬编码点

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `mysti/collection/page.tsx:31` | `bg-[#0B0D17]` | Suspense fallback 硬编码 |
| `mysti/payment/return/page.tsx:242` | `bg-[#0B0D17] text-[#F3EFE6]` | 支付返回页硬编码 |
| `mysti/daily/page.tsx:48` | `background: '#0B0D17'` | 内联深色背景 |
| `mysti/gacha/page.tsx:44` | `background: '#0B0D17'` | 内联深色背景 |
| `mysti/page.tsx:639` | `linear-gradient(180deg, #1a1530 0%, #231A3A 100%)` | 首页加载 fallback |

#### 3.4.4 "一团糟"的具体表现

1. **从浅色首页进入 Mysti 会"闪黑"**：全局导航是浅色奶油色，点击 Mysti 入口后页面突然变成紫黑色，视觉跳跃大
2. **没有浅色选项**：用户如果偏好浅色模式，在 Mysti 内完全无法选择
3. **Suspense fallback 硬编码**：页面加载中的 fallback 背景是 `#0B0D17`，如果全局是浅色，加载时会先闪一下深色再渲染内容

#### 3.4.5 建议

- 为 Mysti 增加一套 `daylight` 浅色主题（暖纸底 + 玫瑰金文字）
- 将硬编码 fallback 背景改为透明或跟随父容器
- 考虑在 Mysti 入口增加主题过渡动画，缓解视觉跳跃

---

### 3.5 各宇宙测试页（严重）

#### 3.5.1 Flower（花卉人格）

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `FlowerHomeContent.tsx:15` | `linear-gradient(180deg, #FFFAF5 0%, #FFF5F0 40%, #FFFAF5 100%)` | 全屏渐变，粉色暖白 |

**深色模式下**：页面仍是粉白渐变，与全局深色导航/页脚割裂。按钮 `text-white` 在渐变背景上依赖渐变色本身是否够深（渐变很浅，白字可能不可读）。

#### 3.5.2 Bird（鸟类人格）

- `BirdLandingContent.tsx`：使用 `bg-accent text-white` — **正确**，跟随全局 accent
- `BirdResultContent.tsx:122`：`text-[#1A2340]` — 硬编码深蓝文字，在深色背景上不可读

#### 3.5.3 Work（社畜人格）

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `WorkHomeContent.tsx:44` | `bg-indigo-500 text-white` | 硬编码靛蓝按钮 |
| `WorkHomeContent.tsx:162` | `bg-indigo-500 text-white` + `shadow-[0_0_40px_rgba(99,102,241,0.2)]` | 硬编码 |

`bg-indigo-500` 在浅色主题下没问题，但在深色主题下，`indigo-500` 与深色背景对比度降低，且 `text-white` 在深色下本应正常，但如果背景也偏蓝紫，可读性下降。

#### 3.5.4 Love（恋爱人格）

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `LoveHomeContent.tsx:44` | `bg-pink-500 text-white` | 硬编码粉红按钮 |
| `LoveHomeContent.tsx:162` | `bg-pink-500 text-white` + 粉紫光晕 | 硬编码 |

与 Work 相同的问题：`pink-500` 不跟随全局 accent 系统。

#### 3.5.5 Drunk（醉后人品）/ Daily（每日一签）

- 使用动态 personality color 系统（`color.bg`、`color.base`）
- 没有明显硬编码 hex，但颜色来自数据配置，未考虑深色模式适配
- `DrunkResultContent.tsx:73`：`radial-gradient(ellipse, ${persona.color}12, transparent 70%)` — 动态颜色的 7% 透明度，在深色下可能过于暗淡

#### 3.5.6 Fanrenti（凡人修仙）

**重灾区**。大量硬编码中国风纸色：

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `FanrentiLandingContent.tsx:16` | `color: '#5a4528'` | 深褐文字 |
| `FanrentiLandingContent.tsx:24` | `color: '#5a4528'` | 深褐文字 |
| `FanrentiLandingContent.tsx:32` | `color: '#3a2e18'` | 近黑文字 |
| `FanrentiLandingContent.tsx:57` | `borderColor: 'rgba(90, 69, 40, 0.35)', color: '#5a4528'` | 边框 + 文字 |
| `FanrentiLandingContent.tsx:75` | `color: '#7a6a4a'` | muted 文字 |
| `FanrentiLandingContent.tsx:88` | `color: '#8a6a2f'` | 金色装饰文字 |
| `FanrentiLandingContent.tsx:120` | `color: '#4a3a1e'` | 卡片文字 |
| `FanrentiResultContent.tsx:113` | `color: '#3a2e18'` | 结果正文 |
| `FanrentiResultContent.tsx:177` | `color: '#3a2e18'` | 结果描述 |
| `FanrentiResultContent.tsx:239` | `color: '#3a2e18'` | closer 文字 |
| `FanrentiGallery.tsx:36` | `linear-gradient(135deg, #0f2320 0%, #1a3a35 50%, #0f2320 100%)` | 图库页硬编码深绿渐变 |
| `FanrentiGallery.tsx:58` | `background: '#4a7a6a', color: '#f0ede8'` | 按钮硬编码 |
| `FanrentiGallery.tsx:132` | `color: '#8b2a1a'` | 暗红文字 |
| `FanrentiGallery.tsx:167` | `linear-gradient(135deg, #2a4d4f, #1a6b5a)` | CTA 按钮渐变 |

**gallery 页面是深色渐变，而 landing/result 是浅色纸色**。同一模块内部深浅不统一。

#### 3.5.7 Hogti（修仙人格）

与 Fanrenti 完全相同的模式：

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `HogtiLandingContent.tsx:38` | `bg-amber-100 text-[#2a1e0f]` | 琥珀浅底 + 深褐字 |
| `HogtiLandingContent.tsx:68` | `color: '#6a4e1f'` | muted 文字 |
| `HogtiLandingContent.tsx:79` | `color: '#8a6a2f'` | 装饰文字 |
| `HogtiLandingContent.tsx:108` | `color: '#4a3a1e'` | 卡片文字 |
| `HogtiResultContent.tsx:101` | `color: '#fbf3df'` | 浅黄文字 |
| `HogtiResultContent.tsx:201` | `color: '#3a2e18'` | 结果描述 |
| `HogtiGallery.tsx:36` | `linear-gradient(135deg, #1a1535 0%, #2e2460 50%, #1a1535 100%)` | 图库深紫渐变 |
| `HogtiGallery.tsx:55` | `background: '#f5c842', color: '#1a1535'` | 按钮硬编码 |
| `HogtiGallery.tsx:154` | `linear-gradient(135deg, #3a2f6b, #7c3aed)` | CTA 渐变 |

#### 3.5.8 SoulTI（灵魂测试）

**拥有独立夜灯模式，与全局主题系统并存**。

| 文件 | 硬编码值 | 问题描述 |
|------|---------|---------|
| `SoultiResultContent.tsx:166` | `style={{ background: '#FAF8F5' }}` + `data-soulti-surface="cream"` | 硬编码奶油底 |
| `SoultiResultContent.tsx:175` | `text-[#7A6A5A]` | 灰褐文字 |
| `SoultiResultContent.tsx:178` | `text-[#7A6A5A]` | 灰褐文字 |
| `SoultiResultContent.tsx:206` | `text-[#7A6A5A]` | 灰褐文字 |
| `SoultiResultContent.tsx:215` | `text-[#7A6A5A]` | 灰褐文字 |
| `SoultiResultContent.tsx:266` | `text-[#6A6054]` | 深灰褐文字 |
| `SoultiResultContent.tsx:309` | `text-[#6A6054]` | 深灰褐文字 |
| `SoultiResultContent.tsx:336` | `text-[#6A6054]` | 深灰褐文字 |
| `SoultiResultContent.tsx:376` | `text-[#8b7355]` | 棕褐文字 |
| `SoultiResultContent.tsx:381` | `text-[#7A6A5A]` | 灰褐文字 |
| `SoultiResultContent.tsx:515` | `background: '#EDE8E2'` | 进度条背景 |
| `SoultiResultContent.tsx:586` | `background: '#EDE8E2'` | 进度条背景 |
| `SoultiResultContent.tsx:626` | `background: '#FDFCFA'` | 卡片背景 |
| `SoultiResultContent.tsx:718` | `background: '#FDFCFA'` | 卡片背景 |
| `SoultiResultContent.tsx:745` | `bg-[#FDFCFA]/60` | 遮罩层 |
| `SoultiLandingContent.tsx` | 按钮 `text-white` | 按钮白字 |
| `SoultiPairPickerContent.tsx` | 按钮 `text-white` | 按钮白字 |

**双重主题覆盖问题**：
- 全局主题是 `wtfti-dark` → body 背景 `#12121A`，文字 `#F2F2F5`
- SoulTI 夜灯模式 22:00-06:00 触发 → `html[data-soulti-night='1']` 覆盖背景为 `#14121b`
- SoulTI 页面本身硬编码 `#FAF8F5` → 页面内容区域是奶油色

结果：深色全局主题 + SoulTI 夜灯 CSS 覆盖 + 硬编码奶油底色 = **三层颜色叠加，视觉混乱**。

#### 3.5.9 "一团糟"的具体表现（各宇宙汇总）

1. **fanrenti / hogti 的 gallery 页 vs 其他页深浅不一**：landing/result 是浅色纸色，gallery 突然变成深绿/深紫渐变，用户感觉像进了不同网站
2. **flower 的粉白渐变在深色主题下刺眼**：`#FFFAF5` 在深色导航包围下像一盏灯
3. **work / love 的硬编码按钮不跟随 accent**：全局主题切到深色后 accent 变成玫瑰金，但 work 仍是靛蓝、love 仍是粉红，品牌一致性断裂
4. **soulti 的三层主题叠加**：导航是深色、夜灯加了蓝紫光晕、内容区是奶油色，文字 `text-[#7A6A5A]` 在深色背景上完全不可读

---

### 3.6 其他模块

#### 3.6.1 CP 配对（src/app/cp/）

- `CPResultContent.tsx:386`：`color: '#FFFFFF'` — 结果页硬编码白字
- 整体使用粉色渐变按钮，未接入全局 accent

#### 3.6.2 Squad（小队）

- `SquadContent.tsx`：`bg-accent text-white` — **正确**，使用了全局 accent

#### 3.6.3 Identify（识人挑战）

- `IdentifyResultContent.tsx:378`：`text-white`（svg 图标）
- `IdentifyResultContent.tsx:455`：`bg-gradient-to-r from-pink-500 to-rose-500 text-white` — 硬编码渐变
- `IdentifyChallengeContent.tsx`：同上，硬编码粉红渐变

#### 3.6.4 Mirror（镜像人格）

- 未发现明显硬编码颜色问题

---

## 4. 组件层共享问题

### 4.1 ShareImageGenerator 系列

所有分享图生成器组件（`DeltaShareImageGenerator`、`SoultiShareImageGenerator`、`MystiShareImageGenerator`、`SymptomsShareImageGenerator`、`WtfCardShareImageGenerator`、`CPShareImageGenerator`、`IdentifyShareImageGenerator`、`SquadShareImageGenerator`）都有以下特点：

- **Canvas 绘制使用硬编码颜色**：`ctx.fillStyle = '#ffffff'`、`fillRoundedRect(..., '#FFFFFF')` 等
- **这是正确的**：分享图是生成给用户保存/分享的图片，需要固定配色以确保在任何设备上显示一致
- **但预览/编辑弹窗 UI 使用深色遮罩**：`bg-black/80 backdrop-blur-sm` + `text-white` 按钮，这部分在浅色主题下是深色弹窗，与浅色页面形成对比，可接受

### 4.2 SoultiWishingWell

- `background: '#fff'` 硬编码（`src/components/SoultiWishingWell.tsx:188,237,256`）
- 这是许愿井动画的粒子/卡片背景，在深色模式下会成为亮斑

---

## 5. 问题根因分析

### 5.1 设计层面：每个模块都有自己的视觉语言

- CPTI 要"玫瑰金纸色编辑风"
- XPTI 要"天鹅绒酒红诱惑风"
- Mysti 要"暮光紫黑塔罗风"
- Feng 要"故障艺术朋克风"
- Fanrenti/Hogti 要"中国风卷轴风"
- SoulTI 要"奶油羊皮纸温暖风"

每个模块的设计者都选择了**表达品牌差异化**而非**遵循全局主题系统**。

### 5.2 技术层面：缺乏强制约束

- 没有 ESLint 规则禁止硬编码 hex 颜色
- 没有代码审查检查清单要求新页面使用 CSS token
- `globals.css` 的兜底层只覆盖了 `bg-white`，对 `bg-[#F5F0E8]`、`style={{ background: '#FFF' }}` 等写法无能为力
- Tailwind v4 的 `@theme inline` token 虽然定义了，但没有被广泛使用

### 5.3 架构层面：多重主题系统并存

| 系统 | 控制范围 | 存储键 | 与全局关系 |
|------|---------|--------|-----------|
| 全局 WTFTI 主题 | 全站 body | `wtfti.theme` | 根系统 |
| Mysti v2 主题 | Mysti 子树 | `mysti-theme-v2` | 独立 |
| SoulTI 夜灯 | SoulTI 子树 | `soulti-night-mode` | 独立 + DOM 覆盖 |
| WTFTI 仪式态 | 测试流程 | 无（运行时） | 临时覆盖 |

四个系统互不感知，可以同时生效，造成叠加混乱。

---

## 6. 修复优先级建议

### P0（立即修复，阻断深色模式体验）

1. **CPTI 核心页面接入全局 token**
   - `CptiHisPovClient.tsx`、`CptiCodexClient.tsx`、`CptiResultContent.tsx`
   - 将 `bg-[#F5F0E8]` → `bg-[var(--color-bg-primary)]` 或 `bg-paper`
   - 将 `text-[#2c2620]` → `text-[var(--color-text-primary)]`
   - 将 `bg-white` 输入框 → `bg-bg-elevated`

2. **XPTI whitepaper 强制 body 背景**
   - 删除 `WhitepaperContent.tsx` 中的 `body { background: #fff !important; }`

3. **SoulTI 夜灯模式与全局主题互斥**
   - 当全局主题为 dark 时，禁用 SoulTI 夜灯的 `html[data-soulti-night]` CSS 覆盖
   - 或让 SoulTI 夜灯直接读取全局主题状态，而不是独立判断

### P1（高优先级，改善一致性）

4. **CPTI 按钮和卡片去硬编码**
   - `bg-rose-500 text-white` → 使用全局 accent 系统
   - `bg-[#fffaf2]`、`bg-[#FFF8E8]` → 使用 `bg-bg-secondary`

5. **XPTI archive/couple 卡片去硬编码**
   - `background: '#FFFDF9'` → `var(--color-bg-secondary)`
   - 局部 `PALETTE` 对象逐步替换为 CSS 变量

6. **Fanrenti / Hogti landing & result 页**
   - 将硬编码 `#3a2e18`、`#5a4528` 文字色替换为 token
   - gallery 页的深色渐变需要判断当前主题，浅色模式下应使用浅绿/浅紫渐变

7. **Flower 粉白渐变**
   - `linear-gradient(180deg, #FFFAF5...)` → 使用 `var(--galaxy-bg-hero)` 或条件渐变

### P2（中优先级，优化细节）

8. **Work / Love 按钮**
   - `bg-indigo-500` / `bg-pink-500` → `bg-accent` 或模块专属 accent token

9. **Mysti 增加 daylight 浅色主题**
   - 让 Mysti 也响应全局主题切换，或至少提供一套浅色选项

10. **Feng 模块显式声明主题隔离**
    - 避免用户在浅色主题下突然进入纯黑页面造成惊吓

### P3（低优先级，代码规范）

11. **引入 ESLint 规则禁止硬编码颜色**
    - 禁止 `bg-[#...]`、`text-[#...]`、`style={{ color: '#...' }}` 等写法
    - 例外：Canvas 绘制、OG 图片生成、data-keep-white 元素

12. **统一主题存储**
    - 考虑让 Mysti 和 SoulTI 读取全局主题状态，作为默认值
    - 或提供"跟随系统"选项，减少用户需要管理多套主题的认知负担

---

## 7. 附录：关键文件清单

### 7.1 硬编码颜色最多的文件（Top 20）

| 排名 | 文件 | 硬编码颜色数 | 严重程度 |
|------|------|-------------|---------|
| 1 | `CptiCodexClient.tsx` | 15+ | 严重 |
| 2 | `CptiHisPovClient.tsx` | 12+ | 严重 |
| 3 | `FanrentiLandingContent.tsx` | 10+ | 严重 |
| 4 | `FanrentiResultContent.tsx` | 8+ | 严重 |
| 5 | `HogtiLandingContent.tsx` | 8+ | 严重 |
| 6 | `HogtiResultContent.tsx` | 8+ | 严重 |
| 7 | `SoultiResultContent.tsx` | 12+ | 严重 |
| 8 | `FengLandingContent.tsx` | 20+ | 中等（设计意图） |
| 9 | `FengResultContent.tsx` | 10+ | 中等（设计意图） |
| 10 | `CptiRelationshipResult.tsx` | 6+ | 严重 |
| 11 | `CptiResultContent.tsx` | 5+ | 严重 |
| 12 | `XptiHomeContent.tsx` | 3+ | 中等 |
| 13 | `ArchiveClient.tsx` | 3+ | 中等 |
| 14 | `CoupleClient.tsx` | 3+ | 中等 |
| 15 | `IdentifyChallengeContent.tsx` | 2+ | 低 |
| 16 | `IdentifyResultContent.tsx` | 2+ | 低 |
| 17 | `WorkHomeContent.tsx` | 2+ | 低 |
| 18 | `LoveHomeContent.tsx` | 2+ | 低 |
| 19 | `MystiPaymentReturn.tsx` | 2+ | 低 |
| 20 | `SoultiLandingContent.tsx` | 2+ | 低 |

### 7.2 完全跟随全局主题的文件（正面案例）

- `src/app/xpti/layout.tsx` — 使用 `var(--color-paper)` 和 `var(--color-ink)`
- `src/app/wtfti/layout.tsx` — 使用 `wtfti-site-shell`
- `src/app/squad/SquadContent.tsx` — 使用 `bg-accent`
- `src/app/mirror/MirrorClient.tsx` — 未发现硬编码

---

*报告结束。如需针对特定模块的修复方案，可进一步拆解为具体 PR。*
