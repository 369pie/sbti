# WTFTI UI 配色方案全方位评估与升级建议

> 评估日期：2026-06-17
> 评估范围：`/wtfti/*` 及其关联模块（Galaxy、经典 WTF、子宇宙入口）
> 评估依据：`src/app/globals.css`、现有设计系统文档、两次深色模式审计报告、关键落地页代码、WCAG 对比度实测
> 目标：让 WTFTI 的配色从「有设计系统」升级为「像顶级 UI/UX 工作室出品」

---

## 一、执行摘要

**结论：WTFTI 已经拥有一个方向正确、命名清晰的设计 token 架构，但在执行层面被大量硬编码颜色、主题映射语义错位、深色模式「冷灰化」等问题稀释了高级感。**

如果只用三句话概括当前配色的核心问题：

1. **深色模式不是「浅色的神秘版本」，而是退化成了一套偏冷的灰蓝 generic dark UI**，丢失了品牌原有的暮光紫（#1A1530）宇宙仪式感。
2. **浅色模式下，玫瑰、金箔、鼠尾草等强调色直接放在 Warm Oat 背景上时对比度不足**，导致大量使用装饰色做正文/小标签时可读性偏低。
3. **各子模块（CPTI、Mysti、Feng、Fanrenti、Hogti、SoulTI 等）仍在使用自己的独立色板**，全站像多个不同产品拼接，而非一个品牌的不同宇宙。

本报告将给出：
- 现状的量化诊断（含对比度实测）
- 与「顶级 UI 设计」的 5 个具体差距
- 可直接落地的 token 调整方案
- 分优先级的实施路线图

---

## 二、现状诊断

### 2.1 已做对、应当保留的部分

| 方面 | 现状 | 评价 |
|------|------|------|
| **浅色主背景** | Warm Oat `#FBF6F0` + Soft Sand `#F4E9DF` | ✅ 方向高级，符合 2024–2026 年 editorial/lifestyle 产品趋势 |
| **字体搭配** | Cormorant Garamond + Noto Serif SC 衬线显示，Noto Sans SC 正文 | ✅ 女性向、编辑感强，与配色气质匹配 |
| **token 架构** | `@theme` + `body[data-theme='wtfti-light'\|'wtfti-dark'\|'galaxy']` | ✅ 技术路线正确，覆盖完整 |
| **动效/质感** | paper texture、orbit field、glass panel、hairline divider | ✅ 细节有仪式感，不油腻 |
| **品牌词汇** | 暮紫底 / 玫瑰陶土 / 金箔 / 米白 | ✅ 有明确的色彩叙事起点 |

### 2.2 核心问题矩阵

| 维度 | 具体问题 | 证据 | 严重度 |
|------|---------|------|--------|
| **深色品牌一致性** | 当前 dark 主题把 `--galaxy-violet` 映射成冷蓝 `#9DB4D4`，`--galaxy-moon` 映射成灰蓝 `#B8C7D8` | `globals.css` L231–234 | 🔴 高 |
| **浅色可读性** | 玫瑰 `#C9867D`、金箔 `#C9A676`、鼠尾草 `#B7C7A2` 在 Warm Oat 上对比度均低于 3:1 | 实测见 2.3 | 🟡 中 |
| **模块色板分裂** | CPTI 锁定 `#F5F0E8`+`#2c2620`；Mysti 自有 twilight/nocturne/aurora；Feng 自锁 `#050505` | 两次审计报告 | 🔴 高 |
| **语义映射错位** | light 主题下 `--galaxy-violet` 被映射为鼠尾草绿 `#B7C7A2` | `globals.css` L389 | 🟡 中 |
| **硬编码泛滥** | 全站 571+ 处 Tailwind 颜色类、199+ 处任意值 hex、100 处内联样式、仅 31 处 `dark:` 适配 | 审计报告 | 🔴 高 |
| **卡片强调色失效** | `PANTHEON_PILLARS` 罗马数字使用硬编码 `#F59BB8`/`#C7D7A2` 等，在浅色 elevated 卡片上对比度 1.5–2.3:1 | 实测见 2.3 | 🟡 中 |
| **品牌色冲突** | 旧文档定义 WTF 锚点色为 `#ff4d6d`（毒舌红），新版 Galaxy 使用 `#C07A8E`（玫瑰陶土） | `wtfti-design-system.md` | 🟡 中 |

### 2.3 关键对比度实测

使用 WCAG 2.1 相对亮度公式计算：

#### 浅色主题（Warm Oat 底）

| 前景色 | 背景色 | 对比度 | 评级 | 说明 |
|--------|--------|--------|------|------|
| `#3D2C23` text-primary | `#FBF6F0` bg-primary | **12.35:1** | AAA | ✅ 正文优秀 |
| `#5C4035` text-secondary | `#FBF6F0` | **8.72:1** | AAA | ✅ 副文优秀 |
| `#8B6D5E` text-muted | `#FBF6F0` | **4.39:1** | AA18 | ⚠️ 小字/eyebrow 仅满足大号文本 |
| `#C9867D` rose | `#FBF6F0` | **2.72:1** | FAIL | ❌ 不能用作小号强调文字 |
| `#C9A676` gold | `#FBF6F0` | **2.12:1** | FAIL | ❌ 不能用作小号强调文字 |
| `#B7C7A2` sage | `#FBF6F0` | **1.67:1** | FAIL | ❌ 几乎不可读 |
| `#F59BB8` pillar accent | `#FFFFFF` elevated | **2.05:1** | FAIL | ❌ 卡片上罗马数字可读性差 |
| `#C7D7A2` pillar accent | `#FFFFFF` | **1.54:1** | FAIL | ❌ 同上 |

#### 深色主题（当前 LUMINA RITUAL）

| 前景色 | 背景色 | 对比度 | 评级 | 说明 |
|--------|--------|--------|------|------|
| `#F2F2F5` text-primary | `#12121A` bg-primary | **16.67:1** | AAA | ✅ 过度安全，略显冷硬 |
| `#D8D8DF` text-secondary | `#12121A` | **13.14:1** | AAA | ✅ |
| `#B8C7D8` text-muted | `#12121A` | **10.82:1** | AAA | ✅ 但偏冷 |
| `#D4A59A` rose | `#12121A` | **8.56:1** | AAA | ✅ |
| `#D4B889` gold | `#12121A` | **9.77:1** | AAA | ✅ |
| `#9DB4D4` violet(cold) | `#12121A` | **8.79:1** | AAA | ✅ 可读但气质偏冷 |

#### 原始 Galaxy 暮光紫 vs 当前 dark（对比）

| 前景色 | 背景色 | 对比度 | 评级 | 说明 |
|--------|--------|--------|------|------|
| `#F5F0E8` cream | `#1A1530` ink | **15.51:1** | AAA | ✅ 更温暖的深色底 |
| `#C07A8E` rose | `#1A1530` | **5.37:1** | AA | ✅ 品牌玫瑰在暮紫上 |
| `#C9A676` gold | `#1A1530` | **7.71:1** | AAA | ✅ |
| `#9C7CFF` violet | `#1A1530` | **5.65:1** | AA | ✅ 真正的紫罗兰 |
| `#C9B6FF` moon | `#1A1530` | **9.73:1** | AAA | ✅ 月光紫 |

**关键洞察**：当前 dark 主题为了「干净」把暮光紫底换成了 `#12121A` 灰黑，虽然对比度极高，但失去了品牌的宇宙神秘感。原始 Galaxy 的 `#1A1530` 底在可读性上仍然 AAA/AA，同时保留了品牌识别。

---

## 三、与「顶级 UI 设计」的 5 个差距

### 差距 1：没有统一的「色温光源」

顶级产品的深浅模式不是简单反色，而是同一盏灯在不同环境下的表现：

- **浅色** = 午后自然光：暖、柔和、纸质感
- **深色** = 烛光/暮光：暖紫、玫瑰金、暗部带一点紫棕

当前 dark 主题使用 `#12121A`（冷灰黑）+ `#B8C7D8`（冷蓝灰），光源从「暖」跳到了「冷」，两张截图并排放会让人以为是两个产品。

### 差距 2：装饰色被当作信息色使用

浅色主题下，玫瑰/金箔/鼠尾草直接用于 eyebrow、标签、小字，对比度不足。顶级做法：

- **信息色**（文字、图标）必须满足 4.5:1
- **装饰色**（大标题渐变、大面积插画、hover 边框）可以放宽到 3:1

当前问题在于太多小元素直接用 accent，看起来「 branding 不够清晰」且「读起来费劲」。

### 差距 3：模块之间没有「家族相似性」

CPTI 的玫瑰金纸色、Mysti 的暮光紫黑、Feng 的故障纯黑、Fanrenti 的中国风褐绿——每进一个模块都像换了一个 app。

顶级多产品平台的做法：所有模块共享同一套 **surface + text + accent** token，只在 **accent 的色相/饱和度**上做 ±15% 的微调。例如：

- WTFTI Galaxy：accent = 玫瑰陶土
- CPTI：accent = 玫瑰陶土 + 5% 金
- Mysti：accent = 月光紫
- Feng：在 dark-only 模式下允许 `#050505` 作为特殊沉浸，但需要明确声明隔离

### 差距 4：缺少「中性灰」的精确控制

当前浅色文字的 muted 色 `#8B6D5E` 是暖棕灰，深色 muted `#B8C7D8` 是冷蓝灰。顶级设计会让中性灰保持同一色相家族：

- 浅色中性 = 暖灰（带棕/玫瑰色相）
- 深色中性 = 暖灰（带紫/玫瑰色相）

而不是从暖跳到冷。

### 差距 5：渐变和光晕不够克制

`wtfti-site-shell::before` 叠加了 3 个径向渐变 + 1 个线性渐变 + 网点纹理，虽然单看很美，但与卡片阴影、按钮渐变、标题渐变叠加后，整个页面没有「呼吸点」。顶级设计会：

- 背景最多 2 层氛围
- 文字渐变只用于 1 个主标题
- 光晕只出现在 1 个焦点元素

---

## 四、升级方案

### 4.1 设计原则（必须遵守）

1. **One brand, two atmospheres, one light source.** 深浅模式是同一品牌的两种氛围，不是两套品牌。
2. **Color is information.** 每种颜色只有一个语义：rose = primary accent，gold = premium/CTA secondary，sage = success/growth，violet = cosmos/mystic，ink = text。
3. **Light is warm, dark is mystical, never cold-generic.**
4. **Every color must be a token.** 禁止在组件中写死 hex（canvas/OG 图生成除外）。
5. **Decorative color serves content; UI color stays neutral.** 大面积装饰留给插画和英雄区，UI 控件保持克制。

### 4.2 Token 调整建议

#### A. 深色模式：从冷灰回归暮光紫

当前 dark 的 `--galaxy-ink*` 被改成了灰黑系。建议恢复为品牌暮光紫，并建立更丰富的暗部层级：

```css
body[data-theme='wtfti-dark'],
body[data-theme='galaxy'] {
  /* 暮光底 · 四层景深（从深到浅） */
  --galaxy-ink-deep: #0D081F;    /* 比 #0B0B0F 更紫的极深 */
  --galaxy-ink: #161029;         /* 暮紫底，替代 #12121A */
  --galaxy-ink-soft: #231A3D;    /* 卡片/浮层 */
  --galaxy-twilight: #352454;    /* 高亮浮层 */

  /* 内容色 */
  --galaxy-cream: #F5F0E8;       /* 米白：主文字 */
  --galaxy-parchment: #E8E0D2;   /* 羊皮纸：副文字 */
  --galaxy-mist: rgba(245, 240, 232, 0.62);
  --galaxy-mist-faint: rgba(245, 240, 232, 0.28);

  /* 强调色：回归宇宙感 */
  --galaxy-rose: #D4A59A;        /* 玫瑰金，保持 */
  --galaxy-rose-soft: rgba(212, 165, 154, 0.16);
  --galaxy-rose-glow: rgba(212, 165, 154, 0.24);
  --galaxy-gold: #D4B889;        /* 金箔 */
  --galaxy-gold-soft: #E6D6BC;
  --galaxy-gold-faint: rgba(212, 184, 137, 0.26);
  --galaxy-violet: #A88FE8;      /* 从冷蓝 #9DB4D4 改为紫罗兰 */
  --galaxy-violet-soft: rgba(168, 143, 232, 0.16);
  --galaxy-violet-glow: rgba(168, 143, 232, 0.24);
  --galaxy-moon: #C9B6FF;        /* 月光紫 */
  --galaxy-nebula: #F0A8C0;      /* 星云粉，替代 #D4A59A */

  /* 背景渐变 */
  --galaxy-bg-hero: radial-gradient(
    ellipse 130% 80% at 50% 0%,
    #352454 0%,
    #161029 48%,
    #0D081F 100%
  );
  --galaxy-bg-section: radial-gradient(
    ellipse 110% 70% at 50% 30%,
    #231A3D 0%,
    #161029 72%
  );
  --galaxy-bg-paper: linear-gradient(180deg, #161029 0%, #1E1635 100%);

  /* 全站 token 同步覆盖 */
  --color-bg-primary: #161029;
  --color-bg-secondary: #231A3D;
  --color-bg-tertiary: #2E2249;
  --color-bg-elevated: #231A3D;
  --color-text-primary: #F5F0E8;
  --color-text-secondary: #E8E0D2;
  --color-text-muted: #B8A9C4;   /* 暖紫灰，替代冷蓝 #B8C7D8 */
  --color-border: rgba(212, 184, 137, 0.18);
  --color-border-subtle: rgba(212, 184, 137, 0.09);
  --color-accent: #D4A59A;
  --color-rose: #D4A59A;
  --color-gold: #D4B889;
  --color-sage: #A8C4A0;         /* 深绿保留，但偏暖 */
  --color-stone: #B8A9C4;        /* 与 text-muted 同家族 */
}
```

**为什么这样改：**
- `#161029` 比 `#12121A` 深 0.5% 但带有紫相，保留 AAA 可读性（对比 `#F5F0E8` 为 15.51:1）。
- 把冷蓝灰统一改为「暖紫灰」，让深色模式的所有中性色都来自同一个光源。
- `--galaxy-violet` 回归紫罗兰，强化「人格神域」的宇宙品牌。

#### B. 浅色模式：保持温暖，但解决可读性

当前浅色主题整体方向正确，但需要：

1. **不要把 rose/gold/sage 直接用于小号文字**。应使用 `--color-text-primary` + 小面积色块/图标。
2. **把 `--galaxy-violet` 从 sage 绿改回真正的紫**，并为 sage 单独建立 token。
3. **增加一个 `--color-text-accent`** 用于大号展示文字上的品牌色。

```css
body[data-theme='wtfti-light'] {
  /* 保持 Warm Oat 家族 */
  --color-bg-primary: #FBF6F0;
  --color-bg-secondary: #F4E9DF;
  --color-bg-tertiary: #EBDFD1;
  --color-bg-elevated: #FFFFFF;

  --color-text-primary: #3D2C23;
  --color-text-secondary: #5C4035;
  --color-text-muted: #8B6D5E;
  --color-text-on-accent: #FFFFFF;  /* 用于按钮上的白字 */

  --color-accent: #C07A8E;          /* 比现在 #C9867D 稍深，提升对比 */
  --color-rose: #C07A8E;
  --color-rose-deep: #A86B63;
  --color-gold: #C9A676;
  --color-gold-soft: #DDBFA3;
  --color-sage: #9AB37A;            /* 独立 sage */
  --color-violet: #9C7CFF;          /* 独立 violet，不借 sage */

  /* galaxy token 也保持语义一致 */
  --galaxy-violet: #9C7CFF;
  --galaxy-sage: #9AB37A;
}
```

#### C. 新增/明确语义 token

```css
/* Surface 层级 */
--color-surface-default: var(--color-bg-elevated);
--color-surface-secondary: var(--color-bg-secondary);
--color-surface-tertiary: var(--color-bg-tertiary);
--color-surface-hover: color-mix(in oklab, var(--color-bg-elevated) 92%, var(--color-accent));
--color-surface-active: color-mix(in oklab, var(--color-bg-elevated) 88%, var(--color-accent));

/* 文字层级 */
--color-text-accent: var(--color-rose);      /* 大号标题/装饰 */
--color-text-link: var(--color-rose-deep);
--color-text-link-hover: var(--color-accent);

/* 边框层级 */
--color-border-strong: color-mix(in oklab, var(--color-gold) 45%, transparent);
--color-border-accent: color-mix(in oklab, var(--color-rose) 35%, transparent);

/* 阴影（深色下用冷紫，浅色下用暖玫瑰） */
--shadow-card: 0 18px 42px -34px color-mix(in oklab, var(--color-rose) 22%, transparent);
--shadow-elevated: 0 28px 90px -54px color-mix(in oklab, var(--color-rose) 18%, transparent);
```

### 4.3 组件级配色规则

| 组件 | 当前问题 | 建议规则 |
|------|---------|---------|
| **Primary CTA** | 渐变 rose→gold，深色下文字 `#0B0B0F` | 使用 `--color-rose-deep` → `--color-gold` 渐变，文字 `--color-text-on-accent`，确保对比度 ≥ 7:1 |
| **Secondary CTA** | 跟随 surface + border | 使用 `--color-surface-default` + `--color-border`，hover 用 `--color-border-accent` |
| **Eyebrow / Section label** | 浅色下 `#8B6D5E` 对比度 4.39:1，小号字偏浅 | 提升到 `#6B4F42`（约 7:1），或使用 uppercase + tracking-wider 作为大号文本处理 |
| **罗马数字（Pillar）** | 硬编码 `#F59BB8` 等在浅色卡片上不可读 | 使用 `--color-text-accent`（大号装饰文字，3:1 可接受），或给每个 pillar 一个 theme-aware 的 accent 变量 |
| **Personality 卡片** | 背景 `#FFFFFF` 在深色下被兜底改色，但插画色彩可能冲突 | 卡片背景始终用 `--color-surface-default`，插画不做滤镜处理，靠留白自然融入 |
| **导航/页脚** | 在 dark 下使用全局 token，但可能与 Mysti/Feng 冲突 | 全局 chrome 必须跟随 `body[data-theme]`；子模块若要沉浸，需显式隔离或锁定主题 |
| **阴影** | 浅色用玫瑰色阴影，深色也用玫瑰色阴影 | 深色阴影改用 `--galaxy-violet-soft` 或冷紫，避免整体泛红 |

### 4.4 子模块品牌色统一策略

不要消灭各宇宙的个性，而是把它们约束在统一的色彩家族内：

| 模块 | 当前主色 | 建议统一方向 |
|------|---------|-------------|
| WTFTI Galaxy | 玫瑰陶土 + 金箔 | 基准 |
| CPTI | 玫瑰金纸色 `#F5F0E8` | 纸色改为 `--color-paper`，强调色与 Galaxy 一致 |
| XPTI | 酒红 `#A3526E` | 作为「魅惑」变体，使用 `--color-rose-deep` 的加深版 `#A86B63` |
| Mysti | 暮光紫 `#1a1530` | 使用 Galaxy dark token，并增加 daylight 浅色主题 |
| Feng | 纯黑朋克 | 允许作为特殊沉浸模式，但需 `data-keep-dark` 或临时锁定 body theme |
| Fanrenti/Hogti | 中国风褐/绿 | 把深褐文字改为 `--color-text-primary`，深绿/深紫 gallery 背景改用 `--galaxy-bg-hero` |
| SoulTI | 奶油羊皮纸 | 接入全局 light token，夜灯模式与全局 dark 互斥 |

---

## 五、实施路线图

### P0 · 立即执行（1–2 周）

1. **修正深色 token**：把 `--galaxy-ink*` 从灰黑改回暮光紫家族，`--galaxy-violet` 改回紫罗兰，`text-muted`/`stone` 改为暖紫灰。
2. **修正浅色 `--galaxy-violet` 语义**：不再映射为 sage，单独建立 `--galaxy-sage`。
3. **修复可读性硬伤**：
   - eyebrow 颜色加深到 7:1
   - 小字/标签不再直接使用 rose/gold/sage
   - `PANTHEON_PILLARS` 罗马数字使用 theme-aware token 或确保大号装饰文字的 3:1
4. **修复 landing 页硬编码 accent**：`PANTHEON_PILLARS` 数组中的 hex 改为 token 引用。

### P1 · 高优先级（2–4 周）

5. **硬编码颜色清理**：按审计报告逐个修复 P0/P1 文件，重点 CPTI、XPTI、Work、Love、Creator admin。
6. **新增语义 token**：`--color-text-on-accent`、`--color-border-strong`、`--color-surface-hover`、`--shadow-*`。
7. **统一子模块入口**：各宇宙 landing/result 页至少接入 bg/text/border/accent 四个基础 token。
8. **Mysti 增加 daylight 主题**：作为全局 light 主题的 Mysti 变体。

### P2 · 中优先级（1–2 个月）

9. **建立 ESLint/Stylelint 规则**：禁止 `bg-[#...]`、`text-[#...]`、`style={{ color: '#...' }}`（canvas/OG 除外）。
10. **组件级阴影/光晕收敛**：深色模式阴影改用冷紫家族，减少页面整体泛红。
11. **GalaxyThemeBinder 防御**：防止路由崩溃后残留 `galaxy` theme。
12. **Feng 主题隔离**：显式声明沉浸模式，避免浅色主题下突然纯黑。

### P3 · 长期规范

13. **设计系统文档更新**：明确每个 token 的语义、使用场景、禁止用法。
14. **新增色彩审查清单**：每个新宇宙/新页面上线前必须通过 contrast + token 合规检查。
15. **建立 Figma/代码 token 同步**：避免设计稿与代码颜色漂移。

---

## 六、验收标准

### 6.1 可量化标准

- [ ] 所有正文文字（`--color-text-primary`）与背景对比度 ≥ 7:1
- [ ] 所有小号/次要文字（`--color-text-secondary/muted`）与背景对比度 ≥ 4.5:1
- [ ] CTA 按钮文字与按钮背景对比度 ≥ 7:1
- [ ] 任意两个相邻模块在同一主题下不出现超过 20% 色相跳变
- [ ] 全站硬编码 UI hex 颜色减少 80%（从 199+ 降到 ≤ 40，保留 canvas/OG/数据常量）

### 6.2 感性标准

- [ ] 浅色截图和深色截图并排放置时，能明显看出是同一个品牌
- [ ] 进入任意子模块后，导航/页脚/卡片质感与 WTFTI 主站一致
- [ ] 页面不再有「某个角落特别亮/特别冷」的突兀感
- [ ] 装饰性渐变和光晕有明确的视觉焦点，而不是整页都在发光

### 6.3 工程标准

- [ ] 新增代码中禁止出现非 token 的 UI 颜色
- [ ] `dark:` Tailwind 变体仅用于特殊局部覆盖，不成为主要适配手段
- [ ] 所有主题切换无闪屏
- [ ] Lighthouse Accessibility 评分 ≥ 95

---

## 七、附录：给设计师的一句话指南

> **「WTFTI 的颜色应该像一本精装书：浅色是午后阳光下的奶油纸页，深色是烛光下的紫绒封面。同一本书，同一个故事，只是光线不同。」**

如果要再简化成三条铁律：

1. **深底必须是暮光紫，不是冷灰黑。**
2. **小字不能用 accent 色，除非它是大号装饰。**
3. **每个新宇宙只能调整 accent 的浓淡，不能换光源。**

---

*本评估基于当前代码与设计文档。如需针对某一模块（如 Galaxy 测试流程、CPTI、Mysti）生成具体的 token 替换清单和代码补丁，可继续拆解为专项 PR。*


---

## 八、实施日志

### 2026-06-17 · P2 语义 token 收敛与主题一致化

#### 新增语义 token（`src/app/globals.css`）

| token | 浅色值 | 深色值 | 语义 |
|-------|--------|--------|------|
| `--color-text-on-accent` | `#FBF6F0` | `#0D081F` | CTA / 强调按钮上的文字色 |
| `--color-border-strong` | `#C9A676` | `rgba(212,184,137,0.45)` | 需要存在感的分割线/边框 |
| `--color-surface-hover` | `#F5EEE4` | `#2E2249` | hover 态表面色 |
| `--color-backdrop` | `rgba(61,44,35,0.55)` | `rgba(13,8,31,0.72)` | 全局遮罩/ backdrop |
| `--shadow-card` | rose tint | violet tint | 卡片/按钮/小浮层阴影 |
| `--shadow-elevated` | rose tint | violet tint | 面板/下拉/英雄卡片阴影 |
| `--shadow-halo` | rose halo | violet halo | 轨道场/光晕装饰 |

所有 token 在 `@theme` 中注册，因此同时生成 Tailwind utility：`text-on-accent`、`border-strong`、`bg-surface-hover`、`shadow-card`、`shadow-elevated`、`shadow-halo`。

#### 阴影/光晕收敛

- **WTFTI 卡片系统**：`.wtfti-panel`、`.wtfti-card`、`.wtfti-mini-card`、`.wtfti-orbit-field`、`.wtfti-cta-primary` 全部改用 `--shadow-*` token。
- **全站按钮**：`.btn-ink`、`.btn-rose`、`.btn-ghost` 阴影收敛到 `--shadow-card`；文字色改用 `--color-text-on-accent`。
- **导航/下拉**：`.wtfti-global-nav`、`.nav-link-active`、`.nav-dropdown` 阴影收敛到 token。
- **Hero 与档案面板**：`.site-hero-card`、`.mirror-atelier-panel`、`.mirror-atelier-tier`、`.mirror-atelier-archive`、`.mirror-atelier-drawer`、`.mirror-atelier-submit` 改用 token 阴影。
- **分享卡与画廊**：`.share-card-plus`、`.share-card-atelier`、`.tier-cta-atelier`、`.collection-shadow` 的硬编码金/玫瑰色改用 `color-mix(var(--color-*))`。

#### 验证结果

- `pnpm lint`：0 errors / 139 warnings（ warnings 均为历史遗留）
- `tsc --noEmit`：2 个 pre-existing errors（与本次改动无关）
- `npx next build --webpack`：CSS 编译通过；构建失败仅因历史遗留 `Cannot find module '@/lib/basePath'`

#### 待续

- CPTI / XPTI / Mysti 模块仍有大量硬编码，需专项治理。
- FanrentiTheme / HogtiTheme 为中国风/魔法风独立视觉容器，下一步需决定是否接入全局 token 或保留为主题隔离区。
- P3 将引入 ESLint/Stylelint 规则，禁止非 canvas/OG 的硬编码 UI hex。
