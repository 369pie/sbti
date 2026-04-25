# WTFTI 全站硬编码颜色与主题冲突审计报告

**审计日期**: 2026-04-25
**审计范围**: `/Users/caonanya/AI_Code/repos/sbti/src/` 全部 TSX/TS/CSS 文件
**审计人**: AI Agent
**版本**: v1.0

---

## 执行摘要

WTFTI 目前存在三套主题系统：

1. **全局 WTFTI 主题**（`body[data-theme='wtfti-light'|'wtfti-dark']`）—— 通过 `globals.css` token 切换 Warm Oat 浅色 / LUMINA RITUAL 深色。
2. **Galaxy 暮光主题**（`body[data-theme='galaxy']`）—— `/wtfti/galaxy/*` 路由专用，与 `wtfti-dark` 共享同一套 dark token。
3. **Mysti 独立主题**（React Context `MystiThemeProvider`）—— `/mysti/*` 路由内部三态（twilight/nocturne/aurora），**不操作 body dataset**。

全站硬编码颜色数量庞大（571+ 处 Tailwind 颜色类，199+ 处 `#[...]` 任意值颜色，大量数据常量颜色），在 dark 模式下存在不同程度的可读性与视觉协调问题。

---

## 1. 硬编码颜色扫描结果

### 1.1 扫描方法

- `rg "text-white|text-black|bg-white|bg-black|bg-rose-|bg-pink-|..."` — 571 处匹配
- `rg "#[0-9a-fA-F]{3,8}"` — 199+ 处匹配（排除 SVG/canvas/数据常量后仍有大量 UI 级硬编码）
- `rg "bg-\[#|text-\[#|border-\[#"` — 199 处任意值 Tailwind 颜色
- `rg "style=\{\{.*(?:color|background|bg|border).*\}\}"` — 100 处内联样式
- `rg "dark:"` — 仅 31 处 `dark:` 前缀，几乎全部集中在 ShareImageGenerator 与 ClaimAssetCard

### 1.2 按严重度分级

#### P0 — 在 dark 模式下直接瞎眼 / 不可读

| 文件 | 行号 | 代码片段 | 问题说明 |
|------|------|----------|----------|
| `src/app/me/MeContent.tsx` | 375 | `border border-emerald-200 bg-emerald-50` | 浅色专用面板，dark 下无覆盖，bg 极浅在深色背景上刺眼 |
| `src/app/me/MeContent.tsx` | 451 | `border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800` | 同上，文字 emerald-800 在深色背景上对比度不足 |
| `src/app/me/MeContent.tsx` | 455 | `bg-emerald-600 text-white` | 按钮本身可读，但与 dark token 的 `--color-sage` 不一致，视觉出戏 |
| `src/app/creator/admin/ops/page.tsx` | 70 | `border-emerald-200 bg-emerald-50 text-emerald-700` | admin 状态标签，dark 下不可读 |
| `src/app/creator/admin/ops/page.tsx` | 214 | `rounded-3xl border border-rose-200 bg-rose-50 p-8` | 整个卡片浅色化，dark 下形成大面积白色斑块 |
| `src/app/creator/apply/page.tsx` | 250 | `rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700` | 成功提示卡片，dark 下刺眼 |
| `src/app/cpti/me/codex/CptiCodexClient.tsx` | 206 | `border border-[#c9a676]/50 bg-white/80 p-4 text-[13px] leading-[1.7] text-[#5a4f3e]` | `bg-white/80` 在 dark 下被 CSS 兜底转为 elevated，但 `text-[#5a4f3e]` 深棕在深色底上不可读 |
| `src/app/cpti/me/codex/CptiCodexClient.tsx` | 301 | `border-[#c9a676]/40 bg-white/70 text-[#5a4f3e]` | 同上，深棕文字在深色背景不可读 |
| `src/app/cpti/me/codex/CptiCodexClient.tsx` | 312 | `border-dashed border-[#c9a676]/50 bg-white/70` | 空白状态背景，dark 下形成白块 |
| `src/app/cpti/me/codex/CptiCodexClient.tsx` | 414-433 | `border border-[#c9a676]/40 bg-white px-3 py-2 text-[13px] text-[#2c2620]` | 输入框纯白底+深黑字，dark 下被兜底为 elevated，但 `text-[#2c2620]` 硬编码导致文字不可读 |
| `src/components/cpti/CptiPricingLadder.tsx` | 120 | `min-h-screen bg-[#F5F0E8] text-[#2c2620]` | 全页硬编码浅色，dark 下 body 已被全局主题设为深色，但该组件仍强制 `#F5F0E8` 背景，**直接造成背景色与全局主题冲突** |
| `src/components/CptiQuiz.tsx` | 383 | `rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5` | 错误提示，浅色专用 |
| `src/app/xpti/layout.tsx` | 10 | `selection:bg-rose-200/60 selection:text-rose-900` | 硬编码 selection 颜色。在 wtfti-dark 下，rose-200 极浅，选中文字几乎不可见 |
| `src/app/soulti/result/[type]/SoultiResultContent.tsx` | 1370 | `border border-stone-300/40 bg-stone-100/30 text-sm text-stone-500` | 按钮在 dark 下 stone-100/30 几乎透明，文字对比度不足 |
| `src/app/soulti/result/[type]/SoultiResultContent.tsx` | 1396 | `border border-stone-300/40 text-sm text-stone-500` | 同上 |
| `src/app/HomeContent.tsx` | 591, 613 | `bg-white p-2` | 图片容器，无 `data-keep-white`，dark 下会被 CSS 兜底转为 elevated，但如果用户期望真白底展示截图，会被改色 |

#### P1 — 视觉不协调（按钮/标签颜色与 token 系统脱节）

| 文件 | 行号 | 代码片段 | 问题说明 |
|------|------|----------|----------|
| `src/components/Navigation.tsx` | 336 | `bg-gradient-to-r from-pink-500 to-fuchsia-500` | Nav PRO badge，与 `--color-accent` 不一致 |
| `src/components/Navigation.tsx` | 446, 453, 486, 510 | `bg-accent text-white` | 这**不是**硬编码，但 `bg-accent` 依赖 token，可忽略 |
| `src/app/love/LoveHomeContent.tsx` | 44, 162 | `bg-pink-500 text-white` / `bg-pink-500` | Love 宇宙 CTA，pink-500 与全局 rose 不一致 |
| `src/app/love/result/[type]/LoveResultContent.tsx` | 230, 244 | `border border-pink-500/20 bg-pink-500/5 text-sm text-pink-400` | 结果页按钮，未用 token |
| `src/app/work/WorkHomeContent.tsx` | 44, 162 | `bg-indigo-500 text-white` | Work 宇宙 CTA |
| `src/components/WorkShareImageGenerator.tsx` | 487, 550 | `bg-indigo-500 text-white` | 分享按钮 |
| `src/app/daily/DailyHomeContent.tsx` | 38 | `bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400` | 标题渐变，与 token 无关 |
| `src/components/DailyTodayCTA.tsx` | 40, 57, 84 | `bg-teal-500 text-white` | 每日 CTA 按钮 |
| `src/components/DailyCheckInCTA.tsx` | 52, 87 | `border-teal-500/15 bg-gradient-to-r from-teal-500/5 to-emerald-500/5` | 面板边框/背景，无 dark 适配 |
| `src/components/IdentifyViralCTA.tsx` | 28, 42 | `border-pink-500/15 bg-gradient-to-r from-pink-500/5 to-rose-500/5` / `bg-pink-500 hover:bg-pink-600` | CTA 面板与按钮 |
| `src/app/cpti/stealth/StealthContent.tsx` | 49 | `bg-rose-500 text-white` | CPTI stealth 按钮 |
| `src/app/cpti/stealth/StealthContent.tsx` | 74 | `bg-purple-500 text-white` | 另一按钮 |
| `src/app/cpti/join/JoinContent.tsx` | 252, 270, 367 | `bg-rose-500 text-white` | 多处 rose-500 |
| `src/app/cpti/invite/CptiInviteContent.tsx` | 112, 242, 282, 302 | `bg-rose-500 text-white` | 多处 |
| `src/app/cpti/squad/CptiSquadClient.tsx` | 180, 262, 277 | `bg-rose-500/90` / `border-rose-500/30 bg-rose-500/10 text-rose-300` / `from-amber-500 to-rose-500` | 小队页面 |
| `src/app/cpti/theory/page.tsx` | 215 | `bg-rose-500 text-white` | 理论页按钮 |
| `src/app/cpti/relationship/CptiRelationshipResult.tsx` | 493, 553, 910, 1157 | `bg-rose-500` / `bg-rose-400` / `border-emerald-500/20 bg-emerald-500/5 text-emerald-500` / `border-amber-500/30 from-amber-500/10 text-amber-300` | 关系结果页大量使用非 token 颜色 |
| `src/components/CptiGalleryContent.tsx` | 140, 249, 290, 421 | `bg-gradient-to-r from-rose-500 to-amber-500` / `bg-emerald-400` / `bg-rose-500 text-white` | 画廊页 |
| `src/components/CptiShareImageGenerator.tsx` | 477, 504, 556 | `bg-rose-500 text-white` / `border-rose-500/20 bg-rose-500/5 text-rose-400` | 分享生成器 |
| `src/components/CptiRelationshipShareImageGenerator.tsx` | 504, 587 | `bg-rose-500 text-white` / `border-rose-500/20 bg-rose-500/5 text-rose-400` | 同上 |
| `src/app/cpti/me/constellation/CptiConstellationClient.tsx` | 134, 226 | `bg-rose-500 text-white` / `bg-rose-500/90 text-white` | 星图页 |
| `src/app/cpti/result/[type]/CptiResultContent.tsx` | 446, 460 | `border-rose-500/20 bg-rose-500/5 text-rose-400` | 结果页 |
| `src/app/cpti/scenarios/[scenario]/page.tsx` | 154, 247 | `text-white font-semibold` + 无 bg 颜色（靠外层渐变） | 场景页按钮颜色未显式声明 |
| `src/app/gacha/GachaContent.tsx` | 108 | `bg-gradient-to-r from-pink-400 to-violet-400 text-white` | 抽卡按钮 |
| `src/app/combo/ComboContent.tsx` | 314 | `bg-gradient-to-r from-accent via-purple-400 to-cyan-400` | 标题渐变含非 token 色 |
| `src/components/ResultClosureEngine.tsx` | 231 | `text-white` + 动态背景 | 按钮文字依赖动态 personality.color，在浅色 personality.color 上可能不可读 |
| `src/app/drunk/DrunkHomeContent.tsx` | 29 | `bg-gradient-to-r from-amber-400 via-orange-400 to-red-400` | 标题渐变 |
| `src/components/DrunkShareImageGenerator.tsx` | 522 | `bg-amber-500 text-white` | 按钮 |
| `src/components/IdentifyShareImageGenerator.tsx` | 474, 537 | `bg-gradient-to-r from-pink-500 to-rose-500 text-white` | 按钮 |
| `src/components/FlowerShareImageGenerator.tsx` | 499, 562 | `bg-gradient-to-r from-amber-400 to-rose-400 text-white` | 按钮 |
| `src/app/flower/FlowerHomeContent.tsx` | 39, 56, 239 | `bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500` / `text-white` | 标题与按钮 |
| `src/app/bird/BirdLandingContent.tsx` | 32, 155 | `bg-accent text-white` | 使用 token，OK |
| `src/app/c/[universe]/result/[type]/CreatorResultContent.tsx` | 120-317 | 大量 `text-white/30`, `bg-white/5`, `border-white/10` | UGC 创作者结果页**全页 hardcoded dark**，在 wtfti-light 下会全黑底+半透明白字，形成大面积不可读区域 |
| `src/app/hogti/gallery/page.tsx` | 45-166 | 大量 `text-white`, `text-white/70`, `border-white/20` | Hogti 画廊全页硬编码暗色，在 wtfti-light 下不可读 |
| `src/app/fanrenti/gallery/page.tsx` | 46-166 | 同上模式 | 凡人画廊全页硬编码暗色 |
| `src/components/MystiCollectionContent.tsx` | 512 | `min-h-screen bg-[#0a0a0f] text-white` | **Mysti 收藏页强制 `#0a0a0f` 背景+白字**。如果 Mysti 主题为 aurora（浅色）且全局主题为 wtfti-light，body 背景为 Warm Oat，但该组件强制黑底，**实际上在此文件内部是 self-contained 的**，因为最外层 div 已覆盖背景。但如果与 Mysti theme.text 不一致，可能导致子元素冲突。 |
| `src/components/MystiSubscribeContent.tsx` | 457 | `min-h-screen flex items-center justify-center bg-[#0B0D17] text-[#F3EFE6]` | 同上，强制深色背景 |
| `src/app/mysti/payment/return/page.tsx` | 242 | `min-h-screen flex items-center justify-center bg-[#0B0D17] text-[#F3EFE6]` | 支付返回页强制深色 |
| `src/app/mysti/collection/page.tsx` | 31 | `fallback={<div className="min-h-screen bg-[#0B0D17]" />}` | Suspense fallback 强制深色 |
| `src/app/mysti/page.tsx` | 477, 556-606 | 大量 `text-white` / `hover:bg-white/5` | Mysti 首页使用了 Mysti theme 对象，但也有部分 `text-white` hardcoded |
| `src/app/wtfti/feng/FengLandingContent.tsx` | 15 | `min-h-screen bg-[#050505] text-white` | 疯 TI 全页强制黑底+白字（**有意设计**） |
| `src/app/wtfti/feng/result/[type]/FengResultContent.tsx` | 288 | `min-h-screen bg-[#050505] text-white` | 同上 |
| `src/components/WtfiPreviewQuiz.tsx` | 145, 374 | `text-white` | 按钮文字，依赖外层动态背景色，若背景为浅色则不可读 |
| `src/app/wtfti/symptoms/[slug]/SymptomsContent.tsx` | 183, 272 | `text-white` | 症状页按钮 |
| `src/app/wtfti/symptoms/page.tsx` | — | — | Hub 页未知 |
| `src/components/WtfCardCTA.tsx` | 53, 60, 71, 79, 97, 104 | 大量 `bg-[#1A0C11]`, `text-[#F3E8EB]`, `text-[#A38A90]`, `bg-[#3D1A25]/60`, `bg-[#20181A]`, `border-[#A3526E]/20` | 专门给 xpti isDark 分支写的颜色，在 xpti 深色模式下是自洽的，但在 wtfti-light 全局下会突兀 |
| `src/components/UgcShareCTA.tsx` | 17, 23 | `bg-[#1A0C11] border-[#A3526E]/20 text-[#D4C5C9]` / `text-[#A38A90]` | 同上，xpti 专用深色 |
| `src/components/IdentifyViralCTA.tsx` | 27, 32, 41 | `border-[#A3526E]/20 ...`, `text-[#F3E8EB]`, `bg-[#C2485E]` | xpti 专用深色分支 |
| `src/components/DailyCheckInCTA.tsx` | 51, 57, 69, 86, 92, 96 | 大量 `text-[#E6CDD5]`, `bg-[#A3526E]/20`, `text-[#F3E8EB]` | xpti 专用深色分支 |
| `src/components/UniversePreviewCards.tsx` | 82 | `text-[#A38A90]` | xpti 专用 |
| `src/components/WtfCardBanner.tsx` | — | — | 未在本次搜索中命中，但历史已知有 hardcoded 颜色 |
| `src/components/DeferredWtfCardBanner.tsx` | — | — | 同上 |
| `src/components/PremiumPaywall.tsx` | — | — | 未扫描到，但历史已知有硬编码 |
| `src/components/PriceAnchor.tsx` | — | — | 同上 |
| `src/components/premium/BundleCta.tsx` | — | — | 同上 |
| `src/components/premium/PremiumFoil.tsx` | — | — | 同上 |

#### P2 — 轻微瑕疵 / 可接受的局部硬编码

| 文件 | 行号 | 代码片段 | 问题说明 |
|------|------|----------|----------|
| `src/app/creator/profile/[id]/page.tsx` | 211 | `from-white/[0.06]` | 装饰性渐变，几乎不可见 |
| `src/app/creator/studio/page.tsx` | 90 | `from-white/[0.08] via-white/[0.04]` | 同上 |
| `src/app/creator/leaderboard/LeaderboardContent.tsx` | 58 | `from-white/[0.08] to-white/[0.03]` | 同上 |
| `src/components/TheoryAnchorCard.tsx` | 42 | `border-white/10 bg-white/5` | 卡片在 dark 模式下的毛玻璃效果，通过 `isDark` 条件渲染，但无 light 对应 |
| `src/components/CciPanel.tsx` | 32 | `border-white/10 bg-white/5 backdrop-blur-sm text-white` | CCI 面板，通过 `isDark` 条件渲染，专门用于深色模式 |
| `src/components/museum/DailyPickOverlay.tsx` | 422 | `bg-black/55 backdrop-blur-md` | 遮罩层，合理 |
| `src/components/museum/CardDrawer.tsx` | 141 | `bg-black/50 backdrop-blur-[3px]` | 同上 |
| `src/components/museum/CardLightbox.tsx` | 135 | `bg-black/72 backdrop-blur-md` | 同上 |
| `src/components/museum/ReelView.tsx` | 203 | `text-white` | 按钮在深色图片背景上，合理 |
| `src/components/museum/SnapshotShareButton.tsx` | 128, 144 | `text-white` | 按钮在深色渐变背景上，合理 |
| `src/components/museum/FreePathPanel.tsx` | 136 | `text-white shadow-lg` | 浮动提示，背景由动态 personality.color 决定 |
| `src/components/museum/BirthdayBadge.tsx` | 113 | `text-white` + `style={{ background: accent }}` | 徽章文字在动态色上，若 accent 为浅色可能不可读（已知的边缘情况） |
| `src/components/CollectionWall.tsx` | 53 | `border-[#C9A676] border-t-transparent` | 加载动画 spinner，品牌金 |
| `src/app/types/TypesContent.tsx` | 126, 207 | `border-white/30 bg-white/20` / `bg-black/35` | 类型图鉴页特定交互效果 |
| `src/app/types/month/[ym]/MonthlyRecapPage.tsx` | 150 | `text-white` | 按钮在深色渐变上 |
| `src/app/types/today/DailyPickPage.tsx` | — | — | 未命中但可能有 |
| `src/components/WeeklySoulContent.tsx` | 193 | `bg-accent text-white` | 使用 token，OK |
| `src/components/DailyStatusAvatar.tsx` | — | — | 未命中 |
| `src/components/DailyMoonPhasePanel.tsx` | — | — | 未命中 |
| `src/components/DailyQuiz.tsx` | — | — | 未命中 |
| `src/lib/universes.ts` | 114, 140, 179, 232, 258 | `bg-rose-100 text-rose-700`, `bg-[#0a0a0a] text-[#39ff14]`, `bg-rose-50 text-rose-600`, `bg-stone-100 text-stone-700` | 宇宙分类标签的 activeClass，数据级硬编码，在 dark 下会形成浅色标签 |
| `src/components/quiz-formats/*` | — | — | 需要单独审计，本次未完全覆盖 |
| `src/components/galaxy/*` | — | — | Galaxy 组件大多使用 `galaxy-*` token，表现良好 |

### 1.3 数据常量文件中的颜色（非 UI 渲染，标记为参考）

以下文件包含大量颜色常量，但主要用于**数据描述**（personality color、dimension color、share card preset 等），不直接参与 UI 渲染，但在 canvas/SVG 生成时会被使用：

- `src/lib/drunk/personas.ts` — 12 种人格颜色
- `src/lib/drunk/dimensions.ts` — 5 维度颜色
- `src/lib/cp-matching.ts` — 6 种关系匹配颜色
- `src/lib/soul-frequency.ts` — 16 种灵魂频率颜色
- `src/lib/xiuxian.ts` — 修仙体系大量颜色
- `src/lib/gacha.ts` — 5 种稀有度颜色
- `src/lib/fanrenti/personalities.ts` — 编号颜色
- `src/lib/fanrenti/characters.ts` — 角色配色
- `src/lib/feng/personalities.ts` — 疯 TI 28 种人格霓虹色 + 编号
- `src/lib/wtfti-personalities.ts` — WTF 编号 + 颜色
- `src/lib/mysti/decision-quotes.ts` — 5 种 accentHex
- `src/lib/wtf-card-collector.ts` — SVG 字符串中的硬编码颜色（canvas 生成）
- `src/lib/social-image.tsx` — OG 图片中的硬编码颜色
- `src/lib/share-card-tiers.ts` — 分享卡等级颜色

> ⚠️ 这些数据常量中的颜色**不应**被要求改为 token，因为它们是品牌/内容语义的一部分（例如"疯 TI"的 `#39ff14` 霓虹绿就是其人格定义的一部分）。但如果在**非 canvas 的 UI 组件**中直接引用这些颜色，则需要审计。

---

## 2. globals.css Token 完整性检查

### 2.1 Light Token → Dark Token 映射完整性

| Token 类别 | Light 值 | Dark 覆盖 | 完整？ |
|------------|----------|-----------|--------|
| `--color-bg-primary` | `#FBF6F0` | `#12121A` | ✅ |
| `--color-bg-secondary` | `#F4E9DF` | `#1E1E28` | ✅ |
| `--color-bg-tertiary` | `#EBDFD1` | `#282836` | ✅ |
| `--color-bg-elevated` | `#FFFFFF` | `#1E1E28` | ✅ |
| `--color-paper` | `#FBF6F0` | `#12121A` | ✅ |
| `--color-paper-deep` | `#F4E9DF` | `#0B0B0F` | ✅ |
| `--color-paper-warm` | `#F5EEE4` | `#1E1E28` | ✅ |
| `--color-text-primary` | `#3D2C23` | `#F2F2F5` | ✅ |
| `--color-text-secondary` | `#5C4035` | `#D8D8DF` | ✅ |
| `--color-text-muted` | `#8B6D5E` | `#B8C7D8` | ✅ |
| `--color-ink` | `#3D2C23` | `#F2F2F5` | ✅ |
| `--color-ink-soft` | `#5C4035` | `#D8D8DF` | ✅ |
| `--color-ink-mute` | `#8B6D5E` | `#B8C7D8` | ✅ |
| `--color-stone` | `#A88B7D` | `#B8C7D8` | ✅ |
| `--color-border` | `#E0D0C0` | `rgba(212, 184, 137, 0.22)` | ✅ |
| `--color-border-subtle` | `#F0E4D8` | `rgba(212, 184, 137, 0.11)` | ✅ |
| `--color-rule` | `#E0D0C0` | `rgba(212, 184, 137, 0.22)` | ✅ |
| `--color-rule-soft` | `#F0E4D8` | `rgba(212, 184, 137, 0.10)` | ✅ |
| `--color-accent` | `#C9867D` | `#D4A59A` | ✅ |
| `--color-accent-light` | `#E7C6C0` | `rgba(212, 165, 154, 0.14)` | ✅ |
| `--color-accent-dim` | `rgba(201, 134, 125, 0.12)` | `rgba(212, 165, 154, 0.08)` | ✅ |
| `--color-rose` | `#C9867D` | `#D4A59A` | ✅ |
| `--color-rose-dust` | `#E7C6C0` | `rgba(212, 165, 154, 0.18)` | ✅ |
| `--color-rose-deep` | `#A86B63` | `#B8877A` | ✅ |
| `--color-gold` | `#C9A676` | `#D4B889` | ✅ |
| `--color-gold-soft` | `#DDBFA3` | `#E8D7BC` | ✅ |
| `--color-gold-leaf` | `#C9A676` | `#D4B889` | ✅ |
| `--color-ember` | `#9C5C52` | `#A86F62` | ✅ |
| `--color-sage` | `#B7C7A2` | `#9DB4D4` | ✅ |
| `--color-gem` | `#9AB37A` | `#B8C7D8` | ✅ |
| `--color-model-self` | `#C9867D` | `#D4A59A` | ✅ |
| `--color-model-emotion` | `#A86B63` | `#B8877A` | ✅ |
| `--color-model-attitude` | `#B7C7A2` | `#9DB4D4` | ✅ |
| `--color-model-action` | `#C9A676` | `#D4B889` | ✅ |
| `--color-model-social` | `#E7C6C0` | `rgba(201, 134, 125, 0.22)` | ✅ |
| `galaxy-ink-deep` | `#0F0A22` | `#0B0B0F` | ✅ |
| `galaxy-ink` | `#1A1530` | `#12121A` | ✅ |
| `galaxy-ink-soft` | `#2A1C4D` | `#1E1E28` | ✅ |
| `galaxy-twilight` | `#3F2F6B` | `#2D2D3A` | ✅ |
| `galaxy-cream` | `#F5F0E8` | `#F2F2F5` | ✅ |
| `galaxy-parchment` | `#EDE3D2` | `#D8D8DF` | ✅ |
| `galaxy-mist` | `rgba(245, 240, 232, 0.65)` | `rgba(242, 242, 245, 0.64)` | ✅ |
| `galaxy-mist-faint` | `rgba(245, 240, 232, 0.35)` | `rgba(242, 242, 245, 0.32)` | ✅ |
| `galaxy-rose` | `#C07A8E` | `#D4A59A` | ✅ |
| `galaxy-rose-soft` | `rgba(192, 122, 142, 0.22)` | `rgba(212, 165, 154, 0.18)` | ✅ |
| `galaxy-rose-glow` | `rgba(192, 122, 142, 0.28)` | `rgba(212, 165, 154, 0.28)` | ✅ |
| `galaxy-gold` | `#C9A676` | `#D4B889` | ✅ |
| `galaxy-gold-soft` | `#D4B58A` | `#E8D7BC` | ✅ |
| `galaxy-gold-faint` | `rgba(201, 166, 118, 0.35)` | `rgba(212, 184, 137, 0.28)` | ✅ |
| `galaxy-violet` | `#9C7CFF` | `#9DB4D4` | ✅ |
| `galaxy-violet-soft` | `rgba(156, 124, 255, 0.22)` | `rgba(157, 180, 212, 0.18)` | ✅ |
| `galaxy-violet-glow` | `rgba(156, 124, 255, 0.28)` | `rgba(157, 180, 212, 0.28)` | ✅ |
| `galaxy-moon` | `#C9B6FF` | `#B8C7D8` | ✅ |
| `galaxy-nebula` | `#FF9BB8` | `#D4A59A` | ✅ |
| `galaxy-bg-hero` | 渐变 A | 渐变 B | ✅ |
| `galaxy-bg-section` | 渐变 A | 渐变 B | ✅ |
| `galaxy-bg-paper` | 渐变 A | 渐变 B | ✅ |
| `galaxy-hairline` | 渐变 A | 渐变 B | ✅ |
| `galaxy-divider-gold` | `1px solid rgba(...)` | `1px solid rgba(...)` | ✅ |
| `galaxy-rose-halo` | shadow A | shadow B | ✅ |
| `galaxy-violet-halo` | shadow A | shadow B | ✅ |

**结论**: **globals.css 的 dark token 完整覆盖了所有 light token 的对应项**，无遗漏。

### 2.2 CSS 兜底规则评估

```css
body[data-theme='galaxy'] .bg-white:not([data-keep-white]),
body[data-theme='wtfti-dark'] .bg-white:not([data-keep-white]) {
  background-color: var(--color-bg-elevated) !important;
}
```

- ✅ 覆盖 `.bg-white` 基础类
- ✅ 覆盖 `.bg-white/95`, `/90`, `/85`, `/80`, `/70`（使用 `color-mix`）
- ❌ **未覆盖** `.bg-white/60` 及以下、`.bg-white/50` 等中间透明度
- ❌ **未覆盖** `text-white`（深色下白字通常是可读的，但在某些硬编码浅色背景上会出问题）
- ❌ **未覆盖** `text-black`、`bg-black`
- ⚠️ 使用 `!important` 可能导致开发者调试困难

---

## 3. 主题系统冲突检查

### 3.1 操作 `body.dataset.theme` 的组件清单

| 组件 | 操作 | 触发的主题值 | 风险 |
|------|------|-------------|------|
| `WtftiThemeScript.tsx` | `document.body.dataset.theme = 'wtfti-' + v` | `wtfti-light` / `wtfti-dark` | 无闪屏脚本，首屏即应用 |
| `WtftiThemeProvider.tsx` | `body.dataset.theme = 'wtfti-' + next` | `wtfti-light` / `wtfti-dark` | 客户端持久化 |
| `WtftiThemeProvider.tsx` (cleanup) | 恢复 `prev` | 上一值 | 卸载时恢复，安全 |
| `GalaxyThemeBinder.tsx` | `body.dataset.theme = 'galaxy'` | `galaxy` | **⚠️ 覆盖 WTFTI 主题**，但 unmount 时恢复 prev |

### 3.2 冲突分析：GalaxyThemeBinder

**行为**：
1. 进入 `/wtfti/galaxy/*` → `GalaxyThemeBinder` mount → `body.dataset.theme = 'galaxy'`
2. 离开 `/wtfti/galaxy/*` → `GalaxyThemeBinder` unmount → 恢复之前 theme

**风险**：
- 如果用户从 galaxy 页面导航到其他页面时发生错误（如 JS 崩溃导致 unmount cleanup 未执行），body 可能保持 `galaxy`，导致非 galaxy 页面使用暮光暗色 token。
- `galaxy` 与 `wtfti-dark` 的 token 值**非常接近但不完全相同**（例如 `--galaxy-ink: #1A1530` vs dark 下 `--galaxy-ink: #12121A`），大多数用户难以察觉差异，但理论上存在视觉不一致。

**建议**：GalaxyThemeBinder 的行为是有意的设计，但应在路由切换时增加防御性检查（如 `WtftiThemeProvider` 在 mount 时重新 assert 自身 theme）。

### 3.3 Mysti 主题系统 vs 全局 WTFTI 主题

**MystiThemeProvider** 特点：
- 完全不操作 `body.dataset.theme`
- 使用 React Context 传递 `theme` 对象
- 组件通过 `useMystiTheme()` 读取并在 JSX 中内联 `style={{ color: theme.text }}`
- localStorage key: `mysti-theme-v2`

**是否冲突？**

| 场景 | 全局 WTFTI Theme | Mysti Theme | 结果 |
|------|------------------|-------------|------|
| A | wtfti-light (Warm Oat #FBF6F0) | twilight (暗紫底 #1a1530) | Mysti 组件外层 div 通常强制 `bg-[#0B0D17]` 或 `bg-[#1a1530]`，所以内部是自洽的。但如果某个 Mysti 组件**没有**强制背景，直接继承 body 的 Warm Oat，而 Mysti theme.text 是 `#F5F0E8`（白），则文字不可读。 |
| B | wtfti-dark (#12121A) | aurora (米白底 #FAF8F5) | 若 Mysti 组件未强制浅色背景但文字是 `#1F1A16`（深），在 dark body 下可读。但若 Mysti 强制了 `bg-[#FAF8F5]`，而全局导航/页脚仍是 dark token，则视觉跳跃。 |

**实际检查发现**：
- `MystiCollectionContent.tsx:512` 强制 `bg-[#0a0a0f] text-white`
- `MystiSubscribeContent.tsx:457` 强制 `bg-[#0B0D17] text-[#F3EFE6]`
- `MystiGiftContent.tsx` 等大量使用 `style={{ background: theme.cardSurface }}`
- `MystiThemeToggle.tsx` 的浮动按钮使用 `theme.isDark ? 'rgba(37, 26, 58, 0.85)' : 'rgba(255, 253, 249, 0.92)'`

**结论**：
- **没有直接 dataset 冲突**（Mysti 不碰 body.dataset.theme）。
- **存在间接视觉冲突风险**：Mysti 模块内部通过强制背景色 + 内联样式自洽，但如果出现漏掉的子组件未强制背景，或 Mysti 与全局组件（如 Navigation、Footer）同屏，会产生明显的浅色/深色块拼接感。
- **更大的问题**：Mysti 的 `theme` 对象颜色（如 `#C07A8E`）与全局 token（`--color-rose: #D4A59A` 在 dark 下）**不完全一致**，导致用户在 Mysti 页面感知的"品牌色"与在 WTFTI 其他页面略有不同。

### 3.4 XPTI 硬编码深色分支

多个组件（`WtfCardCTA`, `UgcShareCTA`, `IdentifyViralCTA`, `DailyCheckInCTA`, `UniversePreviewCards`）内部使用 `isXpti` 条件分支：

```tsx
isXpti
  ? 'bg-[#1A0C11] border-[#A3526E]/20 text-[#D4C5C9]'
  : 'bg-bg-elevated border-border text-text-primary'
```

这些硬编码颜色（`#1A0C11`, `#A3526E`, `#D4C5C9`, `#F3E8EB`, `#C2485E`）是 XPTI 子品牌的特定配色，未纳入全局 token。

**风险**：
- 当全局主题为 `wtfti-light` 时，这些 XPTI 组件显示为深色卡片，与周围 Warm Oat 环境形成强烈反差（可能是设计意图）。
- 但当全局主题为 `wtfti-dark` 时，XPTI 深色卡片与全局深色融合度较好。
- **真正的问题**：`#A3526E`（玫红）与全局 dark `--color-rose: #D4A59A`（玫瑰金）色调不同，造成"同一产品两种品牌色"的认知混淆。

---

## 4. ShareImageGenerator 弹窗审计

> 注：用户要求忽略 ShareImageGenerator 的 QR code canvas 配置，但弹窗 UI（modal overlay）属于 UI 渲染，需要审计。

所有 ShareImageGenerator 组件（共 23+ 个）的弹窗 UI 模式高度一致：

```tsx
<div className="fixed inset-0 ... bg-black/80 backdrop-blur-sm">
  <button className="... bg-black/55 ... text-white ...">
  <p className="... text-white/60 ...">
  <button className="... border-white/30 text-white hover:bg-white/10 ...">
```

**评估**：
- 弹窗背景 `bg-black/80` 在 light/dark 主题下都提供足够的对比度，属于**合理设计**。
- 按钮 `text-white` 在黑色半透明背景上始终可读。
- 这些弹窗**不依赖全局主题 token**，自成一体。

**但存在以下问题**：
- `FengShareImageGenerator.tsx:429` 使用 `bg-black/90`（比其他组件的 `/80` 更深）
- `FengShareImageGenerator.tsx:438` 使用 `bg-black/60`（关闭按钮比其他组件 `/55` 略深）
- `FengShareImageGenerator.tsx:473` 使用 `text-black` 在一个按钮上（`text-bg-primary text-sm ... text-black`），而该按钮背景是 personality.color（动态颜色）。如果 personality.color 为深色（如 `#001` 或 `#6366f1`），则 `text-black` 不可读。
- `SoultiShareImageGenerator.tsx:566, 641` 使用 `bg-gradient-to-r from-stone-600 to-amber-700` 而非 token。

---

## 5. Tailwind `dark:` 变体使用情况

全站仅 31 处 `dark:` 前缀，分布如下：

- `ClaimAssetCard.tsx` — 5 处（`dark:border-neutral-800`, `dark:from-neutral-900`, `dark:text-neutral-100`, `dark:hover:bg-neutral-800`, `dark:text-neutral-300`, `dark:text-neutral-500`）
- 24 个 ShareImageGenerator 组件 — 各 1 处（`dark:` 在某个 canvas/截图相关元素上）
- `XptiCoupleClient.tsx` — 1 处

**评估**：
- `dark:` 变体的使用**极其稀少**，说明全站几乎没有组件针对 dark 模式做 Tailwind 级别的适配。
- 全局主题切换**完全依赖 CSS token 重映射** + `globals.css` 的 `.bg-white` 兜底。
- 对于使用了 `bg-emerald-50`、`bg-rose-50`、`bg-white`、`text-[#2c2620]` 等硬编码颜色的组件，**没有任何 `dark:` 适配**，这正是 P0 问题的根源。

---

## 6. 建议修复优先级

### 🔴 紧急（P0）— 上线前必须修复

1. **CptiPricingLadder.tsx**: `bg-[#F5F0E8] text-[#2c2620]` 全页硬编码 → 改为 `bg-bg-primary text-text-primary`
2. **CptiCodexClient.tsx**: 多处 `bg-white`, `text-[#2c2620]`, `text-[#5a4f3e]` → 改用 token
3. **MeContent.tsx**: `bg-emerald-50`, `border-emerald-200`, `text-emerald-800` → 改用 token 或增加 `dark:` 变体
4. **xpti/layout.tsx**: `selection:bg-rose-200/60 selection:text-rose-900` → 使用 token 或 `selection:bg-accent/30 selection:text-text-primary`
5. **creator/admin/ops/page.tsx**: 大量 emerald/rose 硬编码状态标签 → 改用 token
6. **creator/apply/page.tsx**: `border-emerald-300 bg-emerald-50 text-emerald-700` → 改用 token
7. **CptiQuiz.tsx**: `border-rose-200 bg-rose-50` → 改用 token
8. **SoultiResultContent.tsx**: `border-stone-300/40 bg-stone-100/30 text-stone-500` → 改用 token

### 🟡 重要（P1）— 影响品牌一致性

9. **Navigation.tsx**: `from-pink-500 to-fuchsia-500` badge → 改为 `from-rose to-accent` 或品牌渐变 token
10. **LoveHomeContent.tsx / LoveResultContent.tsx**: `bg-pink-500`, `text-pink-400` → 统一为 `--color-rose` 系列
11. **WorkHomeContent.tsx / WorkShareImageGenerator.tsx**: `bg-indigo-500` → 统一为 accent token
12. **DailyTodayCTA.tsx / DailyCheckImageGenerator.tsx**: `bg-teal-500` → 统一为 accent token
13. **Cpti 系列页面**（join, invite, squad, theory, relationship, result, constellation, stealth）: 大量 `bg-rose-500` → 统一为 `--color-rose` 或 `--color-accent`
14. **GachaContent.tsx**: `from-pink-400 to-violet-400` → 品牌渐变 token
15. **FengLandingContent.tsx / FengResultContent.tsx**: `text-black` 按钮在动态背景上 → 增加对比度检查
16. **XPTI 组件**（WtfCardCTA, UgcShareCTA, IdentifyViralCTA, DailyCheckInCTA）: `#1A0C11`, `#A3526E`, `#D4C5C9` 硬编码 → 考虑抽象为 XPTI 子品牌 token

### 🟢 建议（P2）— 体验优化

17. **扩展 CSS 兜底规则**：覆盖 `text-white`、`bg-black`、`text-black` 在 dark 下的映射
18. **增加 `data-keep-white`** 到需要保持真白的元素（如二维码展示容器、图片对比展示）
19. **Mysti 品牌色对齐**：将 Mysti `theme.accent` `#C07A8E` 与全局 `--color-rose` 在 light 下的 `#C9867D` 统一（差值极小，可合并）
20. **GalaxyThemeBinder 防御**：在 `WtftiThemeProvider` 的 route 监听或 visibilitychange 中增加 theme 断言，防止 galaxy 页面崩溃后残留 `galaxy` theme
21. **统一 ShareImageGenerator 弹窗样式**：提取公共 Modal 组件，避免 23 个文件各自维护略有差异的黑色弹窗

---

## 7. 附录：扫描原始数据统计

| 扫描模式 | 命中次数 | 说明 |
|----------|----------|------|
| `text-white\|text-black\|bg-white\|bg-black\|bg-rose-\|bg-pink-\|...` | 571 | Tailwind 颜色类 |
| `#[0-9a-fA-F]{3,8}` | 300+ | 包含数据常量和 UI 颜色 |
| `bg-\[#\|text-\[#\|border-\[#\|from-\[#\|to-\[#` | 199 | Tailwind 任意值颜色 |
| `style=\{\{.*(?:color\|background\|bg\|border).*\}\}` | 100 | 内联样式 |
| `dark:` | 31 | Tailwind dark 变体 |
| `body\.dataset\.theme` | 10 | 主题系统操作点 |

---

*报告结束*
