# WTFTI Design System v2 — 午后纸页 × 烛光紫绒（权威规范）

> Owner: Design System
> Status: Canonical
> Priority: P0
> Last Updated: 2026-08-15
> Review Cadence: Monthly
> Next Decision: Decide 是否在 W1 落地 light CTA 深玫瑰底色（#83403F 系）与 4 个文字级 accent token 的 globals.css 补丁

---

## 0 · 裁定声明（Supersede & 最终裁决）

### 0.1 本规范取代以下文档

| 文档 | 处置 | 原因 |
|------|------|------|
| `docs/brand-spec.md`（2026-04-23，SUMMER BLUSH） | **Superseded** | 见 0.2 裁决一 |
| `docs/04-design-growth/design/wtfti-color-scheme-evaluation-2026-06.md`（2026-06-17） | **Superseded**（作为"评估"已完成使命，其提案经本次实测裁定后并入本规范） | 评估不是规范；且其"P0/P1 未完成"的判断已过时（见 0.2 裁决二） |
| `docs/04-design-growth/design/wtfti-design-system.md`（2026-04-16，Geist Sans / `#FAF8F5` / `#ff4d6d`） | **Superseded**（色彩与字体部分） | 色板与字体早已不在代码中实现；其"宇宙自定义层"思想由本文 §7 继承 |

仍然有效、不被取代的相邻规范：

- `docs/04-design-growth/women-first-visual-guide.md` — 图像/插画/构图的女权叙事合规，与色彩 token 不冲突，继续强制。
- `docs/01-strategy/visual-unification-and-tiered-share-cards-2026-04-18.md` — L1/L2/L3 三层视觉架构与分享卡分档策略，本文 §7/§9 将其 canonize 为工程规范。

### 0.2 三项裁决

**裁决一：Light 主线 = Warm Oat「午后纸页」，SUMMER BLUSH 降级为装饰遗产。**

- `brand-spec.md` 声称 Light 默认 = SUMMER BLUSH（`#FFF7F8` + `#F59BB8`），但这两个 hex **在现行 `globals.css` 中完全不存在**（全文检索 0 命中）——该规范描述的色板从未落地或早已被移除，与实际产品脱节。
- 实测（WCAG 2.1 相对亮度公式，脚本见附录 A）：SUMMER BLUSH 唯一主 accent Strawberry Pink `#F59BB8` 在其自家背景 `#FFF7F8` 上对比度仅 **1.94:1**，连装饰级 3:1 都达不到，`brand-spec.md` 自己也承认"不当文字色"——一个不能做文字、不能做功能组件、连装饰门槛都不够的"唯一主 accent"无法支撑产品线。
- Warm Oat 家族（`#FBF6F0` / `#F4E9DF` / `#EBDFD1` + Deep Espresso `#3D2C23`）实测正文 **12.35:1 AAA**，且自 2026-04-24 起即为 `globals.css` 实际实现，同时符合 04-18 战略文档 L1 层"老钱米 Editorial Atelier"的定位。
- **吸收而非抹除**：SUMMER BLUSH 的粉以「星云粉」身份保留为**纯装饰层**（见 §6 motifs），Matcha Leaf 的绿并入 sage 家族（装饰 `#B7C7A2` + 文字级 `#5F7A45`）。

**裁决二：Dark 主线 = 暮紫「烛光紫绒」，确认现行实现为 Canonical，6 月评估的"P0 未完成"判断已过时。**

- 6 月评估（2026-06-17）基于当时代码诊断"深色冷灰化"（`--galaxy-ink: #12121A`、violet 冷蓝 `#9DB4D4`），并把修复列为 P0。**核实 2026-08-15 现行代码**：`globals.css:224-246` 已是暮紫家族（`--galaxy-ink: #161029`、`--galaxy-violet: #A88FE8`），冷灰 `#12121A` / 冷蓝灰 `#B8C7D8` 全文仅残留 1 处（`globals.css:328` `--color-model-attitude: #9DB4D4`）。浅色侧 `--galaxy-violet` 误映射为 sage 的问题也已修复（现为 `#9C7CFF`，并独立出 `--galaxy-sage`）。
- 实测确认暮紫底全线达标：Cream `#F5F0E8` on `#161029` = **16.23:1 AAA**，violet `#A88FE8` on ink = **6.80:1**，CTA 配对（深字 `#0D081F` on 玫瑰金渐变）**9.00–10.28:1 AAA**。
- 因此深色侧裁决为"**保持 + 收尾**"：token 值不变，补齐 1 处冷蓝残留与文档化。

**裁决三：真正的 P0 在浅色 accent 层与 CTA。**

实测现行浅色 accent 全部失守（连装饰 3:1 门槛都达不到）：

| 前景 | 背景 | 实测 | 门槛 | 结论 |
|------|------|------|------|------|
| rose `#C9867D` | `#FBF6F0` | **2.72:1** | 装饰 ≥3:1 | ❌ FAIL |
| gold `#C9A676` | `#FBF6F0` | **2.12:1** | 装饰 ≥3:1 | ❌ FAIL |
| sage `#B7C7A2` | `#FBF6F0` | **1.67:1** | 装饰 ≥3:1 | ❌ FAIL |
| text-on-accent `#FBF6F0` | rose-deep `#A86B63`（CTA 渐变起点） | **3.95:1** | 按钮文字 ≥7:1 | ❌ FAIL |
| text-on-accent `#FBF6F0` | gold `#C9A676`（CTA 渐变终点） | **2.12:1** | 按钮文字 ≥7:1 | ❌ FAIL |

即：现行 `.wtfti-cta-primary`（浅字 + rose-deep→gold 渐变）是一个**已上线的可读性缺陷**。v2 的修法见 §2.4 / §2.5。

### 0.3 三条铁律（继承 6 月评估，实测确认后升格为强制）

1. **深底必须是暮光紫，不是冷灰黑。**（已实现，禁止回退）
2. **小字不能用 accent 色，除非它是大号装饰。**（v2 新增 4 个文字级 accent token 解决"想用品牌色写字"的正当需求）
3. **每个新宇宙只能调整 accent 的浓淡，不能换光源。**（±15% 规则，见 §7）

---

## 1 · 设计原则

1. **One brand, two atmospheres, one light source.** 浅色 = 午后自然光下的奶油纸页；深色 = 烛光下的紫绒封面。同一本书，同一个故事，只是光线不同。
2. **Color is information.** 每个颜色只有一个语义：rose = 主 accent（亲和/聚焦），gold = 珍藏/付费/仪式感，sage = 成功/生长，violet = 宇宙/神秘，ember = 警告/删除，espresso 系 = 文字。
3. **Light is warm, dark is mystical, never cold-generic.** 中性灰在浅色带暖棕相、在深色带暖紫相，禁止跨色温跳变。
4. **Every color must be a token.** 组件中禁止写死 hex（canvas / OG 图 / `src/lib/*` 数据常量豁免，见 §10 注）。
5. **Decorative color serves content; UI color stays neutral.** 大面积装饰只留给 hero 与插画，控件保持克制。

---

## 2 · 色板 · Light「午后纸页」（`body[data-theme='wtfti-light']`，全站默认）

### 2.1 纸面与墨（surface & text）— 现状即 Canonical，实测全 AAA

| token | hex | 用途 | 实测对比度（on 各底） | 评级 |
|-------|-----|------|----------------------|------|
| `--color-bg-primary` | `#FBF6F0` | Warm Oat · 主背景 | — | — |
| `--color-bg-secondary` | `#F4E9DF` | Soft Sand · 中段背景 | — | — |
| `--color-bg-tertiary` | `#EBDFD1` | Dusty Beige · 深层浮层 | — | — |
| `--color-bg-elevated` | `#FFFFFF` | 真白卡片 | — | — |
| `--color-surface-hover` | `#F5EEE4` | hover 态表面 | — | — |
| `--color-text-primary` | `#3D2C23` | Deep Espresso · 正文/标题 | 12.35（primary）/ 11.10（secondary）/ 13.27（elevated）/ 11.52（hover） | ✅ AAA |
| `--color-text-secondary` | `#5C4035` | 副文字 | 8.72 / 7.84 / 9.38 / 8.14 | ✅ AAA |
| `--color-text-muted` | `#8B6D5E` | 弱提示文字 | 4.39（primary）/ 4.72（elevated） | ⚠️ **仅限 ≥18px 大字**；<18px 请用 secondary |
| `--color-stone` | `#6A4E41` | eyebrow / 标签 / 时间戳 | 7.03（primary）/ 7.56（elevated）/ 6.56（hover） | ✅ AAA，小字 eyebrow 的指定色 |

### 2.2 Accent 双层制（v2 核心变更）

浅色 accent 一律分两层：**装饰层**（大面积色块、渐变、徽章底色、≥24px 展示大字）与**文字层**（链接、强调小字、icon 旁标注）。**装饰层 hex 禁止用作 <24px 文字。**

| 角色 | 装饰层（display/decoration，≥3:1） | 实测 | 文字层（text-grade，≥4.5:1） | 实测（on primary / elevated / hover） |
|------|-----------------------------------|------|------------------------------|----------------------------------------|
| Rose 主 accent | `--color-accent` / `--color-rose` → **`#C07A8E` 玫瑰陶土**（v2 从 `#C9867D` 2.72:1 加深至此） | 3.05 / 3.27 / 2.84（hover 底上仅作装饰，不写小字） | **`--color-rose-text` = `#A24E63`**（新增） | 5.13 / 5.52 / 4.79 ✅ |
| Rose 按压 | `--color-rose-deep` = `#A86B63`（保留） | 3.95 / 4.24 — 仅限 ≥24px 大字 | — | — |
| Gold 珍藏 | `--color-gold` = `#C9A676` 铜金（保留，仅装饰/边线） | 2.12 / 2.28 ⚠️ 仅用于非信息性装饰（hairline、徽章描边、烫金层） | **`--color-gold-text` = `#8A6D3B`**（新增） | 4.51 / 4.85 / 4.21 ✅（bg-secondary 上 4.06，仅限 ≥18px） |
| Sage 成功 | `--color-sage` = `#B7C7A2` 抹茶（保留，仅装饰） | 1.67 ⚠️ 仅大面积色块/成功态底色 | **`--color-sage-text` = `#5F7A45`**（新增） | 4.49 / 4.82 / 4.19 ✅（bg-secondary 上 4.03，仅限 ≥18px） |
| Violet 宇宙 | `--color-violet` / `--galaxy-violet` = `#9C7CFF`（保留，仅装饰/大字渐变） | 2.90 ⚠️ 装饰 | **`--color-violet-text` = `#7A5CD6`**（新增） | 4.51 / 4.85 / 4.21 ✅ |
| Ember 警告 | — | — | `--color-ember` = `#9C5C52`（保留） | 4.81 / 5.16 ✅ 可作小字错误提示 |
| Nebula 星云粉 | `--color-nebula-light` = `#E07AA0`（新增，SUMMER BLUSH 遗产） | 2.81（elevated）⚠️ **仅装饰**：hero 渐变停止色、≥32px 展示字、插画 | — | — |

### 2.3 边框层级

| token | hex / 值 | 用途 | 实测 |
|-------|----------|------|------|
| `--color-border-subtle` | `#F0E4D8` | 纯装饰分隔（不承担信息） | 1.25:1 · 豁免（非功能边界） |
| `--color-border` | `#E0D0C0` | 卡片/面板默认边 | 1.51:1 · 豁免（配 shadow 共同表达边界） |
| `--color-border-strong` | `#C9A676` | 强调分割（hairline 金色） | 2.28:1 · 仅装饰性强调 |
| **`--color-border-input`（新增）** | `#A98A6C` | **功能边界**：输入框、可点区轮廓、焦点前态 | 3.21:1（elevated）/ 2.99:1（primary）✅ ≥3:1 |

规则：凡是"用户需要靠边界找到这个控件"的场合（input、select、可点击卡），边框必须 ≥3:1，用 `--color-border-input`；装饰 hairline 不受限。

### 2.4 CTA（v2 必修缺陷）

现行 `.wtfti-cta-primary` 浅字 `#FBF6F0` on rose-deep→gold 渐变 = 3.95 / 2.12:1，FAIL。v2 规范：

| token | hex | 配对实测 | 评级 |
|-------|-----|----------|------|
| `--color-cta-from`（新增） | `#83403F` 深玫瑰 | `#FBF6F0` on it = **7.05:1** | ✅ AAA |
| `--color-cta-to`（新增） | `#7A3438` 深绛 | `#FBF6F0` on it = **8.23:1** | ✅ AAA |
| `--color-text-on-accent` | `#FBF6F0`（不变） | 仅允许出现在 cta-from/cta-to/ember 之上 | — |

Primary CTA = `linear-gradient(135deg, var(--color-cta-from), var(--color-cta-to))` + `var(--color-text-on-accent)`，两端实测均 ≥7:1。装饰性玫瑰/金渐变只允许出现在没有文字或文字为深色的地方（备选浅色 CTA：深字 `#3D2C23` on gold-soft `#DDBFA3` = 7.62:1 AAA）。

### 2.5 语义与阴影（沿用 6 月 §8 已落地成果）

`--color-backdrop: rgba(61,44,35,0.55)`；`--shadow-card` / `--shadow-elevated` / `--shadow-halo` 维持 rose tint 的 `color-mix(in oklab, …)` 实现，不变。

---

## 3 · 色板 · Dark「烛光紫绒」（`body[data-theme='wtfti-dark']` / `body[data-theme='galaxy']`）

**本套 = 现行 `globals.css` 实现，实测确认后封存为 Canonical。数值不许再动，只允许增补。**

### 3.1 暮紫景深与文字

| token | hex | 用途 | 实测（on ink `#161029`） | 评级 |
|-------|-----|------|--------------------------|------|
| `--galaxy-ink-deep` / `--color-paper-deep` | `#0D081F` | 极深画布底 | cream on it = 17.27 | ✅ AAA |
| `--galaxy-ink` / `--color-bg-primary` | `#161029` | 暮紫主底 | cream = 16.23 | ✅ AAA |
| `--galaxy-ink-soft` / `--color-bg-elevated` | `#231A3D` | 卡片/浮层 | cream = 14.39 | ✅ AAA |
| `--color-bg-tertiary` / `--color-surface-hover` | `#2E2249` | hover 态 | cream = 12.84 | ✅ AAA |
| `--galaxy-twilight` | `#352454` | 高亮浮层 | cream = 12.09 | ✅ AAA |
| `--color-text-primary` / `--galaxy-cream` | `#F5F0E8` | 米白正文 | 见上 | ✅ AAA |
| `--color-text-secondary` / `--galaxy-parchment` | `#E8E0D2` | 羊皮纸副文 | 14.05（ink）/ 12.45（soft）/ 10.46（twilight） | ✅ AAA |
| `--color-text-muted` / `--color-stone` | `#B8A9C4` | 暖紫灰 muted | 8.34（ink）/ 7.39（soft）/ 6.60（hover） | ✅ AAA（深色侧 muted 可用于小字） |

### 3.2 Accent（全部文字级达标）

| token | hex | 实测 on ink / ink-soft | 用途 |
|-------|-----|------------------------|------|
| `--color-accent` / `--galaxy-rose` | `#D4A59A` 玫瑰金 | 8.46 / 7.50 ✅ | 主 accent，可直接写字 |
| `--color-rose-deep` | `#B8877A` | 5.95 ✅ | hover/pressed |
| `--color-gold` / `--galaxy-gold` | `#D4B889` 金箔 | 9.66 / 8.56 ✅ | 珍藏/付费 |
| `--color-gold-soft` | `#E8D7BC` | 13.05 ✅ | 大字金 |
| `--galaxy-violet` | `#A88FE8` 紫罗兰 | 6.80 / 6.03 ✅ | 宇宙/神秘（**禁止回退冷蓝**） |
| `--galaxy-moon` | `#C9B6FF` 月光紫 | 10.19 ✅ | 展示大字 |
| `--galaxy-nebula` | `#F0A8C0` 星云粉 | 9.71 / 8.60 ✅ | SUMMER BLUSH 遗产在深色侧的家：装饰/大字 |
| `--color-sage` | `#A8C4A0` | 9.71 ✅ | 成功 |
| `--color-ember` | `#A86F62` | 4.49 · 仅 ≥18px | 警告 |

### 3.3 CTA 与边框

- CTA：`linear-gradient(135deg, var(--galaxy-rose), var(--galaxy-gold))` + `--color-text-on-accent: #0D081F`（深字），实测 **9.00 / 10.28:1 AAA**。深色侧浅字-on-深玫瑰的组合（`#F5F0E8` on `#B8877A` = 2.73:1）**禁止**。
- 边框：`--color-border` = `rgba(212,184,137,0.22)`、`--color-border-strong` = `rgba(212,184,137,0.45)` 为装饰级（合成约 1.58–2.89:1，豁免）；**功能边界**新增 `--color-border-input: rgba(212,184,137,0.55)`，合成 `#7F6C5E` ≈ **3.69:1** ✅。

### 3.4 已知残留（P0 收尾项）

- `globals.css:328` `--color-model-attitude: #9DB4D4` 冷蓝 — 深色侧唯一冷色残留，改为 `#A8C4A0`（sage 家族）或 `#A88FE8` 家族，具体由模型五色环的色相区分度决定。
- `.paper-texture` dark 覆写（`globals.css:350`）网点色 `rgba(184,199,216,…)` 仍带冷蓝相，应换为暖紫灰 `rgba(184,169,196,…)`。

---

## 4 · `--galaxy-*` 家族收敛方案

现状问题：`--galaxy-*` 有三层定义（`:root` 默认暮紫 / dark 覆写 / light 覆写），`:root` 默认值（`#1A1530` / `#C07A8E` 等）与 dark 覆写（`#161029` / `#D4A59A`）存在肉眼难辨但不必要的漂移；`GalaxyThemeBinder` 崩溃残留时即暴露（审计 §3.2）。

v2 收敛规则：

1. **`:root` 默认值对齐到与 dark 覆写完全一致**（`--galaxy-ink: #161029`、`--galaxy-rose: #D4A59A` 等），消除"两个暮紫"。裸用 `var(--galaxy-*)` 而未设主题的页面直接得到 dark 正确值。
2. **冻结 `--galaxy-*` 词表**：不再新增任何 `--galaxy-*` token。新代码一律使用 `--color-*` 语义层；`--galaxy-*` 仅作为存量组件（`GalaxyPreview.tsx` inline-style 体系等）的兼容映射层。
3. **light 覆写保持"翻译层"语义不变**（cream→深浓缩棕等），这是浅色模式下 galaxy 组件可读的根因，不动。
4. 长期（P2）：把 `GalaxyPreview.tsx` 等 inline-style 引用迁到 `--color-*`，之后 `--galaxy-*` 可整体下线。

---

## 5 · 字体系统（使用纪律）

| 角色 | token | 字体栈 | 只允许用于 | 禁止 |
|------|-------|--------|-----------|------|
| Display | `--font-display` | Cormorant Garamond → Noto Serif SC → Source Han Serif / Songti | h1/h2、hero、section-headline、`.wtfti-display` | 正文段落、按钮文字 |
| Serif | `--font-serif` | Noto Serif SC 优先的中文衬线 | 中文长文标题、引文块 | UI chrome |
| Editorial | `--font-editorial` | Fraunces → Cormorant（italic 斜体层） | `<em>` 强调、引文、罗马数字、拉丁副标、`N°` 编号、`.wtfti-roman` | 整段正文斜体 |
| Sans | `--font-sans` | Noto Sans SC → PingFang SC → system | 正文、按钮、表单、列表 | display 标题 |
| Mono | `--font-mono` | JetBrains Mono / SF Mono | eyebrow（0.68rem / tracking 0.34em / uppercase）、数据 HUD、人格编码 | 正文 |

硬性规则：

- ❌ Inter / Roboto / Arial 作 display（反 slop）。
- 品牌字标：`.brand-wtf` 用 `--font-heading` 700 几何无衬线，`.brand-ti` 用 display italic 衬线 —— 这是唯一允许"几何+衬线"混排的地方。
- 标题 `text-wrap: balance`、段落 `text-wrap: pretty`、中文 `hanging-punctuation: allow-end` 已在全局生效，组件不要覆盖。
- 字号锚点：正文 `clamp(1rem, 1.4vw, 1.125rem)` / line-height 1.9（`.wtfti-copy`）；eyebrow 恒为 mono 小字 + `--color-stone`（light）/ `--color-text-muted`（dark）。

---

## 6 · 视觉 Motifs · CSS 实现规范

五个签名元素。**同一屏内 motifs 总量 ≤3 种，光晕焦点 ≤1 个**（6 月评估"差距 5"的落地）。

### 6.1 椭圆轨道环（Orbit Ring）

```css
.orbit-ring {
  position: absolute;
  inset: 9%;
  border: 1px solid color-mix(in oklab, var(--color-gold) 45%, transparent);
  border-radius: 50%;
  transform: rotate(-18deg) scaleX(1.18);   /* 椭圆化：压扁 + 倾斜 */
}
/* 第二环：inset 20% / rotate(28deg) scaleX(1.35) / rose 34% */
```

纪律：每屏 ≤2 环；线宽恒 1px；颜色只许 gold/rose 的 `color-mix` 透明化；禁止同心圆 >2 层、禁止加 glow。

### 6.2 罗马数字徽章（Roman Numeral）

```css
.wtfti-roman {
  font-family: var(--font-editorial);
  font-style: italic;
  font-variant-numeric: tabular-nums;
  color: var(--color-rose-text);   /* v2 修正：light 下必须用文字级玫瑰 #A24E63 */
}
```

纪律：light 下 `.wtfti-roman` 若 <24px 必须用 `--color-rose-text`（`--color-rose` 2.72–3.05:1 仅够装饰/大字）；`PANTHEON_PILLARS` 等数组中的硬编码 hex 全部废除，改用 `data-accent="rose|gold|sage|violet"` + token 映射。

### 6.3 金色分割线（Hairline）

```css
--galaxy-hairline: linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent);
/* 用法：height: 1px; background: var(--galaxy-hairline); */
```

纪律：仅 1px 高水平线；eyebrow 两侧的短翼（1.9rem）是其唯一变体；禁止用于卡片四边描边。

### 6.4 星屑（Stardust）

```css
@keyframes wtfti-stardust-drift {
  0%   { transform: translate3d(0,0,0); opacity: 0; }
  10%  { opacity: 0.55; }              /* 峰值透明度 ≤0.55 */
  100% { transform: translate3d(-12vw,-110vh,0); opacity: 0; }
}
```

纪律：只许 transform + opacity；粒子色 light 用 `color-mix(text-primary 7%)` 网点、dark 用 `rgba(245,238,233,0.12)`；`prefers-reduced-motion` 下动画归零（已在 `globals.css:838-843` 实现，新增星屑组件必须继承该媒体查询）。

### 6.5 玫瑰光晕（Rose Halo）

```css
/* dark：双层 bloom */
--galaxy-rose-halo: 0 0 60px rgba(212,165,154,0.22), 0 0 120px rgba(212,165,154,0.11);
/* light：无 bloom，改实体轻影 */
/* 0 12px 36px rgba(192,122,142,0.20), 0 2px 8px rgba(192,122,142,0.10) */
```

纪律：每屏最多 1 个 halo 焦点元素；alpha 上限 dark 0.22 / light 0.20；light 主题禁止径向 bloom 式发光（纸页不发光）。

---

## 7 · 模块统一规则（L1/L2/L3 canonized）

继承 04-18 战略的三层架构，落地为工程纪律：

| 层 | 范围 | 规则 |
|----|------|------|
| **L1 主站基调** | 所有非风格宇宙路由 | 必须用 `--color-*` token；禁止写死任何 hex；bg/text/border/accent 四类 token 是强制面 |
| **L2 风格宇宙皮肤** | `/xpti/*` `/mysti/*` `/wtfti/feng/*` `/soulti/*` `/cpti/*` 等 | 允许且鼓励自有调性，但**必须**以 `.{universe}-theme` CSS 块集中定义（参考 `.xpti-dark-theme` / `.feng-cyber-theme` / `.hogti-warmth-theme` / `.mysti-pale-theme` / `.mysti-celestial-theme`），禁止散落 `bg-[#xxxxxx]` |
| **L3 分享物料** | 各 ShareImageGenerator canvas | 走 `src/lib/share-card-tiers.ts` 共享常量，见 §9 |

### 7.1 子宇宙 accent 约束（"只调浓淡，不换光源"）

- 子宇宙的 accent 允许在品牌 rose/gold/violet/sage 家族内做 **±15% 浓淡（明度/饱和度）微调**；**禁止**引入家族外色相作为 UI accent（插画与数据人格色除外，它们是内容不是 UI）。
- 实测参考：`#C07A8E`（light 基准）→ XPTI 酒红 `#A3526E` 属于 rose 家族加深变体 ✅；Work 的 `indigo-500`、Love 的 `pink-500`、Daily 的 `teal-500` 均为家族外色相 ❌，须收敛。
- 骨架五统一（字体 / 间距 / 圆角 / 动效 / Glyph 图标）沿用 04-18 §2.2，不在本文重复。

### 7.2 沉浸模块隔离（v2 新增强制）

- 需要锁深色的沉浸模块（Feng 故障黑、Mysti celestial、XPTI 暧昧夜、`data-wtfti-ritual` 测试流程）**必须显式声明隔离**：根容器打 `data-keep-dark`（新增约定，与既有 `data-keep-white` 对称），并在该宇宙 `layout.tsx` wrap 对应 `.{universe}-theme` class。
- 隔离模块内文字/muted 仍需满足本规范门槛。实测抽检：XPTI `#F3E8EB` on `#0D0608` = 16.77 ✅、Feng `#F2F2F4` on `#050505` = 18.23 ✅、Hogti 13.62 ✅、Mysti celestial 16.88 ✅；**不合格项**：Mysti pale 主题 muted `#A89A98` on `#F7F4EF` = **2.47:1 FAIL**、secondary `#7A6E6E` = 4.47:1 未达 4.5 —— 列入 P1 修复。
- `GalaxyThemeBinder` 需增加防御：`WtftiThemeProvider` mount / 路由变化时重新 assert 自身主题，防止崩溃残留 `galaxy`。

---

## 8 · 动效纪律

| token | 值 | 用途 |
|-------|-----|------|
| `--ease-editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | 卡片/CTA 的入场与 hover |
| `--ease-quiet` | `cubic-bezier(0.65, 0, 0.35, 1)` | 主题切换、颜色过渡 |
| `--dur-whisper` | 230ms | 微反馈（hover、focus） |
| `--dur-breath` | 420ms | 卡片浮起、面板展开 |
| `--dur-ritual` | 1200ms | 仪式感时刻（印戳、编号揭示）——每屏 ≤1 次 |

规则：只许 animate `transform` 与 `opacity`；hover 位移上限 `translateY(-3px)`，按压 `scale(0.98)`；主题切换过渡 480ms/320ms 已在 body 上，组件不得再加背景色 transition 造成双重动画；所有新动效必须挂 `prefers-reduced-motion` 降级（transform 归零 + duration 归零，范式见 `globals.css:794-806`）。

---

## 9 · 分享卡三档视觉规范（Free / Plus / Atelier）

策略与定价见 04-18 战略文档 §3，此处为视觉工程规范。canvas 常量归 `src/lib/share-card-tiers.ts`；DOM 预览容器用 `.share-card-plus` / `.share-card-atelier`（已落地 `globals.css:1557-1613`）。

| 维度 | Free 基础卡 | Plus 精修卡 | Atelier 藏品卡 |
|------|------------|------------|----------------|
| 背景 | `--color-paper` 素底 | paper + 6% gold / 4% rose 双色晕染 | paper-warm + 10% gold 径向 + sage/rose 165° 线性 |
| 边框 | 单线 1px `--color-border` | 双线：1px gold 35% + inset gold 12% | 四角藏书票感：gold 55% 主边 + inset 双线 + 6px paper-warm 垫环 + 7px gold 40% 外环 |
| 角饰 | ✦ | ✦ + `PLUS` mono 9px 角标 | `N° ATELIER` editorial italic 角标 + 编号 + 印戳 |
| 主标字体 | `--font-sans` | `--font-display`（Cormorant/宋衬） | `--font-editorial` + 金箔渐变文字（`.gold-leaf-text`） |
| 金句 | 无 | 引文 + 引号 | 引文 + hairline 烫金分隔 + 拉丁副标 |
| 水印 | 站点 logo | 无 | 无 + 收藏者署名 |
| 分辨率 | 1080×1620 PNG | 1080×1920 PNG | 1500×2250 PNG + 可印 PDF |

反模式（继承 04-18 §5）：❌ 不给 Free 故意降级打丑水印；❌ 不在 Plus/Atelier 塞更多数据条；❌ 不做"立省 50%"式弹窗，解锁文案统一 `✦ 解锁 N° 藏品`。

---

## 10 · 迁移 Backlog：199+ 硬编码 → ≤40

口径：只统计**非 canvas/OG/数据常量**的 UI 级硬编码（`bg-[#…]`、`text-[#…]`、内联 style hex、Tailwind 默认色板类 `bg-rose-500` 等）。`src/lib/*` 人格/维度色、share-card 常量、OG/canvas 为豁免区，但需登记（P2-4）。

### P0 · 阻断级（深色下不可读 / 与全局主题冲突）

引用：`docs/audit-dark-mode-colors.md` §1.2-P0、`docs/audit-test-modules-dark-mode.md` §6-P0、`docs/audit-core-pages-dark-mode.md` 高风险清单。

1. `src/components/cpti/CptiPricingLadder.tsx` — 全页 `bg-[#F5F0E8] text-[#2c2620]` → `bg-bg-primary text-text-primary`
2. `src/app/cpti/me/codex/CptiCodexClient.tsx` — 15+ 处（`text-[#5a4f3e]`、`bg-white` 输入框等）→ token
3. `src/app/cpti/*/CptiHisPovClient.tsx` — 12+ 处 → token
4. `src/app/me/MeContent.tsx` L375/451/455 — emerald 面板 → sage 家族 token
5. `src/app/creator/admin/ops/page.tsx` L70/214 — emerald/rose 状态标签 → token
6. `src/app/creator/apply/page.tsx` L250 — emerald 成功卡 → token
7. `src/components/CptiQuiz.tsx` L383 — `bg-rose-50` 错误提示 → `--color-rose-dust` + `--color-ember` 文字
8. `src/app/xpti/layout.tsx` L10 — `selection:bg-rose-200/60` → token 化 selection
9. `src/app/soulti/result/[type]/SoultiResultContent.tsx` L1370/1396 — stone 系 → token
10. `src/app/card/CardContent.tsx` Collector Pro 付费区 — 全面 token 化（审计 §修复建议清单有现成映射表）
11. `src/app/xpti/whitepaper/WhitepaperContent.tsx` — 删除 `body { background:#fff !important }` 强制覆盖
12. SoulTI 夜灯模式（`html[data-soulti-night]`）与全局主题互斥逻辑
13. **v2 新增**：`.wtfti-cta-primary` light 侧改 §2.4 深玫瑰渐变（可读性硬伤，随本规范一并修）
14. **v2 新增**：`globals.css:328` `--color-model-attitude` 冷蓝残留 + `:350` paper-texture 冷蓝网点

### P1 · 品牌一致性（视觉出戏但可读）

- CPTI 全模块 `bg-rose-500` 系列（join / invite / squad / theory / relationship / result / constellation / stealth / gallery / 两个 ShareImageGenerator 的弹窗外按钮）→ `--color-accent` / `--color-cta-*`
- XPTI 专用深色组件（`WtfCardCTA`、`UgcShareCTA`、`IdentifyViralCTA`、`DailyCheckInCTA`、`UniversePreviewCards`）的 `#1A0C11`/`#A3526E`/`#D4C5C9` → 收敛进 `.xpti-dark-theme` 块并打 `data-keep-dark`
- Fanrenti / Hogti landing & result 硬编码褐绿文字（`#3a2e18` 等）→ token；gallery 全页硬编码暗色 → 主题感知
- Work `indigo-500` / Love `pink-500` / Daily `teal-500` / Drunk `amber-400` 家族外色相 → §7.1 收敛
- `Navigation.tsx` L336 粉紫渐变 badge、`HomeContent.tsx` L640 CTA `text-white` → token
- Mysti pale 主题 muted/secondary 对比度修复（2.47 / 4.47 FAIL，§7.2）
- `HomeContent.tsx` L591/613 二维码容器补 `data-keep-white`

### P2 · 治理与防御

1. ESLint 规则：禁止 `bg-[#` / `text-[#` / `border-[#` / `style={{ color: '#…' }}`，豁免目录 `src/lib/**`、`**/ShareImageGenerator*`、`src/app/*/og*`
2. 23+ 个 ShareImageGenerator 弹窗抽公共 Modal（消 `bg-black/80` 微差）
3. `GalaxyThemeBinder` 残留防御（§7.2）
4. 豁免区登记表：把 `src/lib/*` 数据常量颜色列入 `docs` 附录，明确"内容色 ≠ UI 色"
5. Mysti daylight 浅色主题；Feng 显式 `data-keep-dark` 声明
6. CSS 兜底规则扩展评估：`bg-white/60` 以下透明度、`text-black` 的 dark 映射

---

## 11 · 验收标准

### 11.1 对比度门槛（WCAG 2.1，实测为准）

- [ ] 正文（`--color-text-primary/secondary`）on 任意 surface ≥ **7:1**
- [ ] 次要/标签小字（muted、eyebrow、form label）≥ **4.5:1**
- [ ] CTA 按钮文字 on 按钮背景 ≥ **7:1**（渐变两端都测）
- [ ] 大字（≥24px / ≥18.66px bold）与装饰 accent ≥ **3:1**，低于 3:1 的颜色只能做非信息性装饰
- [ ] 功能边界（输入框、可点区轮廓）≥ **3:1**（用 `--color-border-input`）

### 11.2 工程门槛

- [ ] Lighthouse Accessibility ≥ **95**（light 与 dark 各跑一次）
- [ ] 全站 UI 级硬编码 hex ≤ **40** 处（当前 199+；豁免区见 §10 口径）
- [ ] 新增代码 ESLint 零硬编码颜色告警
- [ ] 主题切换无闪屏、无 `galaxy` 残留

### 11.3 感性门槛

- [ ] 浅色截图与深色截图并排放置，能明显看出是同一品牌（同一盏灯）
- [ ] 进入任意子模块，导航/页脚/卡片质感与主站一致；沉浸模块有显式隔离声明
- [ ] 单屏 motifs ≤3 种、光晕焦点 ≤1 个，页面有"呼吸点"

---

## 附录 A · 测量方法

- 公式：WCAG 2.1 相对亮度（sRGB → linear → `L = 0.2126R + 0.7152G + 0.0722B`，ratio = `(L1+0.05)/(L2+0.05)`）。
- 脚本：临时 node 脚本（2026-08-15 运行于 `/tmp/wtfti-contrast-v2.mjs` 与 `/tmp/wtfti-contrast-v2b.mjs`，不入库）；覆盖 §2/§3 全部 token 配对、6 月评估引用值复核、SUMMER BLUSH 复审、四个沉浸模块抽检，共 90+ 组配对。
- 半透明边框按实色合成后测量（如 dark 金边 55% over `#161029` ≈ `#7F6C5E`）。
- 6 月评估引用值抽查复核：text-primary 12.35 ✅、rose 2.72 ✅、gold 2.12 ✅、sage 1.67 ✅、cream-on-暮紫 15.51→（新底 `#161029`）16.23 ✅，其方向性结论全部成立；但其 §8" P0/P1 未完成"的状态判断已过时，以本文 0.2 裁决二为准。

## 附录 B · 与既有文档的条文映射

| 旧条文 | 去向 |
|--------|------|
| brand-spec.md · SUMMER BLUSH 色板 | 废除；粉并入 nebula 装饰层（§2.2/§3.2），Matcha 并入 sage 家族 |
| brand-spec.md · LUMINA RITUAL 色板 | 被现行 dark token（§3）取代（`#0C0A22`/`#1C1338` 系 → `#0D081F`/`#161029` 系） |
| brand-spec.md · 字型表 | 沿用并细化使用纪律（§5） |
| 6 月评估 §4.2-A 深色 token 提案 | 已落地，封存（§3） |
| 6 月评估 §4.2-B 浅色提案 | 部分采纳：accent 改 `#C07A8E` ✅；`--color-text-accent` 未采纳，由更精确的 4 个文字级 token 取代（§2.2） |
| 6 月评估 §8 语义 token | 全部保留（§2.5/§3.3），补 `--color-border-input` 与 `--color-cta-*` |
| wtfti-design-system.md · 宇宙自定义层 | 由 §7 L2 规则取代 |

---

## 附录 C · v2.1 修订（2026-08-16）— Sakura Blush 初樱迁移 + 星灵具象化

**配色迁移（浅色层整体从 Warm Oat 暖燕麦转 Sakura Blush 初樱，暗色层不动）：**

| Token | v2 旧值 | v2.1 新值 | 说明 |
|-------|---------|-----------|------|
| `--color-bg-primary` | `#FBF6F0` | `#FDF8F6` | 樱米白，更白更清透 |
| `--color-bg-secondary` | `#F4E9DF` | `#F9EFEB` | 淡樱沙 |
| `--color-bg-tertiary` | `#EBDFD1` | `#F3E4E0` | 樱粉米 |
| `--color-stone` | `#6A4E41` | `#795157` | 玫瑰灰棕（eyebrow 仍 ≥4.5:1） |
| `--color-rose` / `--color-accent` | `#C07A8E` | `#CD8299` | 初樱粉（仍仅装饰层，小字走 `*-text`） |
| `--color-rose-deep` | `#A86B63` | `#B06E7E` | — |
| `--color-gold` 家族 | `#C9A676` / `#DDBFA3` | `#D0AB7C` / `#E9CDAE` | 香槟金 |
| `--color-cta-from/to` | `#83403F` / `#7A3438` | `#8E3B4F` / `#812F42` | 浆果玫瑰，深度不减、on-accent 对比度不降 |
| 文字级 `rose/gold/sage/violet-text` | 不变 | 不变 | AAA 纪律不动 |
| 文字三色 `text-primary/secondary/muted` | 不变 | 不变 | AAA 纪律不动 |

同步范围：`@theme` 浅色层、`body[data-theme='wtfti-light']` 覆写块、`--galaxy-*` 浅色装饰层（rose/gold/moon/nebula/bg 三段渐变/hairline/halo）、`::selection`、`.wtfti-site-shell` 与 `.mirror-atelier-shell` 雾光（22/18/12% → 13/11/8%，更干净）。`sage` 抹茶家族保留不动。

**首页视觉语言（Celestial Editorial 工具类，globals.css 尾部）：** `.starfield-paper`（浅色静态细点星野，暗色自动反转为墨点）、`.hairline-gold`、`.plate`/`.plate-core`（双层标本卡）、`.orbit-fig`、`.orb-matte`（哑光星球，无 bloom）、`.rise-in`（CSS-only 入场，reduced-motion 归零）。红线：无渐变字标、无发光球体、无 100dvh 虚空 hero。

**星灵具象化（StarSpiritSprite v2）：** 抽象星云椭圆 → 具象萌宠（圆脸、大眼、腮红、头顶星芒、茧丝纹、成灵星角与轨道环），props 接口不变，全部调用点自动升级。色相仍 rose/gold/violet 三家族，亮度仍由连续夜数驱动，形态仍由四阶段（茧/幼灵/成灵/共生体）驱动。二次元人物立绘为后续美术资产方向，本版保持 SVG 参数化路线（零资产依赖、确定性渲染）。
