# 风格宇宙 · 视觉守则（Universe Style Charter）

> Owner: Design + PM
> Status: Active Design Charter
> Priority: P1
> Last Updated: 2026-04-18
> Review Cadence: 每个新宇宙立项前必读
> Next Decision: 是否把 L2 token 也用 CSS variable + theme provider 双轨化

> 本文件回答一个问题：**新风格宇宙到底要"和首页统一"到什么程度？**
>
> 简短答案：**骨架统一、皮肤独立。**

---

## 1 · 三层视觉系统总览

| 层级 | 名称 | 是否要求统一 | 例子 |
|------|------|--------------|------|
| L1 主站 | Editorial Atelier 老钱米 | ✅ **必须**统一 | 首页、`/test`、`/types`、`/card`、`/me`、`/creator/*`、`/c/*` |
| L2 宇宙 | 自有皮肤 | ❌ **不要求**和首页同色调，但要求自洽 | XPTI 暗紫、Mysti 夜空、WTFTI Feng 赛博、SoulTI 米白衬线、Banti/Kings/Delta 全出血 |
| L3 分享卡 | 三档分层 | 部分统一（mixin） | 见 [visual-unification-and-tiered-share-cards-2026-04-18.md](visual-unification-and-tiered-share-cards-2026-04-18.md#3--分层分享卡：从「成本中心」到「变现资产」) |

---

## 2 · 风格宇宙的「自由度」与「约束」

### 2.1 完全自由（鼓励差异化的三件事）

1. **调色板**：暗黑、米白、赛博、水彩、像素、霓虹皆可。
2. **主插画风格**：low-poly / 水彩 / 漫画 / 像素 / AI 生成皆可。
3. **宇宙独有 chrome 签名**：每个宇宙鼓励有"一个一眼能认出"的视觉签名。
   - Mysti：月相 + 烫金
   - WTFTI 主版：闪电符号
   - WTFTI Feng：故障扫描线
   - SoulTI：烫金衬线
   - Banti：工位日光灯
   - Kings：王者金
   - Delta：橄榄绿迷彩

### 2.2 必须统一（骨架，绝不能歪）

| 维度 | 共用规范 | 文件 |
|------|----------|------|
| 字体家族 | `--font-display / --font-serif / --font-sans / --font-mono / --font-editorial` | [src/app/globals.css](../../../src/app/globals.css) |
| 间距尺度 | `--space-xs / s / m / l / xl / xxl` | 同上 |
| 圆角尺度 | `--radius-sharp / soft / card / pill` | 同上 |
| 动效 token | `--ease-editorial / --ease-quiet` + `--dur-whisper / breath / ritual` | 同上 |
| Chrome 图标 | 一律用 `<Glyph name="..." />`，**禁止**在 UI chrome 用 emoji | [src/components/Glyph.tsx](../../../src/components/Glyph.tsx) |
| Personality emoji | 人格自身数据里的 emoji 是身份的一部分，**保留** | 各 `lib/{universe}/personalities.ts` |
| QR 规格 | 72×72，圆角 12px，颜色取宇宙主色 | 见各 ShareImageGenerator |
| Footer 高度 | `≤ 98px`（标准卡）/ `≤ 46px`（全出血卡） | [share-card-design-guidelines.md](share-card-design-guidelines.md) |

### 2.3 实现机制：CSS Theme Class

```css
/* src/app/globals.css */
.{universe}-theme {
  --color-bg-primary: #...!important;
  --color-bg-secondary: #...!important;
  --color-text-primary: #...!important;
  --color-text-secondary: #...!important;
  --color-accent: #...!important;
  --color-border: rgba(...,0.3)!important;
}
```

```tsx
// src/app/{universe}/layout.tsx
export default function UniverseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="{universe}-theme min-h-screen bg-bg-primary text-text-primary">
      {children}
    </div>
  );
}
```

> 已经做对的参考：[src/app/xpti/layout.tsx](../../../src/app/xpti/layout.tsx#L7) 配 `globals.css:526` 的 `.xpti-dark-theme`。
>
> **禁止**模式：在 universe 内部到处写 `bg-[#xxxxxx]` 魔术色 —— 这样无法主题化、无法夜间模式切换、无法重构。

---

## 3 · 新宇宙立项 Checklist

提 PR 前自检（建议加到 PR 模板）：

- [ ] `src/app/{universe}/layout.tsx` 已 wrap `{universe}-theme` class
- [ ] `globals.css` 已新增 `.{universe}-theme { ...!important }` block
- [ ] 该宇宙下不存在裸 `bg-[#xxxxxx]` 写法（可用 `grep -nE "bg-\[#" src/app/{universe}` 自查）
- [ ] `lib/{universe}/personalities.ts` 走稀有度 token（`legendary / epic / rare / uncommon / common`）
- [ ] `{Universe}ShareImageGenerator.tsx` 实现 `tier: 'free' | 'plus' | 'atelier'` 入参（哪怕暂时只渲染 free）
- [ ] UI chrome 没有用 emoji，全用 Glyph
- [ ] 至少有一个"宇宙独有视觉签名"（写在该宇宙的 README）
- [ ] 共用 L1 的字号 / 间距 / 圆角 / 动效 token

---

## 4 · 已立项宇宙的"皮肤说明"快查表

| 宇宙 | 主色基调 | Theme class | 是否 OK | 备注 |
|------|---------|-------------|---------|------|
| 主站 (L1) | 老钱米 `#FAF8F5` + clay rose `#C07A8E` | （默认 `:root`） | ✅ | Editorial Atelier v4 |
| XPTI | 暗紫玫瑰 `#0D0608` | `.xpti-dark-theme` | ✅ | 暧昧夜场景 |
| Mysti | 夜空 / 苍白双主题 | `MystiThemeProvider`（React） | ⚠️ | 建议补一份 CSS class 版本作为 fallback |
| SoulTI | 米白衬线 `#FDFAF6` | （继承 L1，靠衬线字体差异化） | ✅ | 烫金 + 衬线为签名 |
| WTFTI 主版 | 老钱米 + 闪电红 | （继承 L1） | ✅ | 闪电 Glyph 为签名 |
| WTFTI Feng | 赛博黑 `#050505` | （未抽 class） | ⚠️ | 建议补 `.feng-cyber-theme` |
| Hogti | 暖琥珀 `bg-amber-50/20` | （未抽 class） | ⚠️ | 建议补 `.hogti-warmth-theme` |
| Banti / Kings / Delta | 全出血 IP | 不需要 page-level theme | ✅ | 全靠 ShareImageGenerator 内部 |
| Drunk | 暖琥珀（旧 amber 散落） | （未抽 class） | ❌ | **本批要补**：`.drunk-amber-theme` |
| Creator 后台 | 旧暗黑 `#0a0a0a` | — | ❌ | **本批要回归 L1**，见 [visual-unification-and-tiered-share-cards-2026-04-18.md](visual-unification-and-tiered-share-cards-2026-04-18.md#p0--creator-后台必须立刻改--8-处文件还卡在-bg-0a0a0a) |

---

## 5 · 反模式（必须明确写出来）

- ❌ **不要**为了追求"全站视觉统一"把 XPTI / Mysti / Feng 改成米白 —— 那会让宇宙失去灵魂。
- ❌ **不要**在新宇宙的 page 里直接写 `className="bg-[#xxxxxx]"` —— 永远走 theme class + token。
- ❌ **不要**为了差异化造一套全新字号 / 间距 / 圆角 —— 骨架必须沿用 L1。
- ❌ **不要**在 UI chrome 用 emoji（`💥🧠📋` 等装饰用法）—— 用 Glyph。人格数据里的 emoji 例外。
- ❌ **不要**把宇宙皮肤散落在 30 个组件里 —— 集中到 `globals.css` 一个 class block。

---

## 6 · 关联文档

- 本宪章对应的全站审计 + 分享卡分层方案：[visual-unification-and-tiered-share-cards-2026-04-18.md](visual-unification-and-tiered-share-cards-2026-04-18.md)
- 分享卡布局规范：[share-card-design-guidelines.md](share-card-design-guidelines.md)
- 分享卡内容重构提案：[share-card-redesign-proposal.md](share-card-redesign-proposal.md)
- 全站设计系统总览：[wtfti-design-system.md](wtfti-design-system.md)
