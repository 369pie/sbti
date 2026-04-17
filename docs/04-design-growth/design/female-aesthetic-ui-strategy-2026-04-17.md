# WTFTI 女性向 UI 美学战略

> Owner: Design + Product
> Status: Strategy (Proposal)
> Priority: P1
> Last Updated: 2026-04-17
> Review Cadence: 每月 review，视觉改版前必读
> Next Decision: 选定一个宇宙（建议 SoulTI / Mysti / 花TI）作为 v3 "艺术级" 改版试点，2 周内落地
> 适用范围：WTFTI 全站 + 所有宇宙 landing / test / result 页

---

## TL;DR（一页读完）

- **核心用户 = 18–30 岁、一线/新一线女性、85% 占比**。她们是当代"审美基建"的建设者，对"能不能截图发出去还显得自己品味好"极度敏感。
- **当前 UI 已经是"可爱暖糖系"的 70 分**，但离"艺术品位级"差三件事：**字体 / 留白 / 材质**。色彩已经合格。
- **战略方向不是"更粉更甜"，而是"更安静、更克制、更东方"**——从"少女心配色模板"升级为"有品味的女性的私人美学"。
- **信号词**：editorial（杂志感）、museum quiet（美术馆安静感）、tactile（有触感的材质）、slow luxury（慢奢）、deliberate negative space（刻意的留白）。
- **先做 3 件事（Wave 1）**：① 升级字体系统（中文衬线+现代西文无衬线组合）② 全站统一留白节奏（8 点律 → 增至 12/16 点律，单屏信息密度 -30%）③ 结果页加入"杂志封面"级的 Hero 区（大图 + 小字标 + 序号）。
- **不要做的 3 件事**：① 不要全站铺粉（色彩心理学上"过粉"=廉价感） ② 不要用 glassmorphism 当万能解（已审美疲劳）③ 不要加彩虹渐变和霓虹光效（TikTok-core 不等于高级）。

---

## 一、问题陈述（Problem）

### 1.1 用户在说什么（从现有用研 & 数据推断）

来自 `xiaohongshu_tarot_user_behavior_analysis.md` 与用户画像：

- 75% 本科及以上 → 审美耐受度高，对"土"极度敏感
- 分享动机：**"测给自己看 × 截给朋友看"**——UI 就是她的"社交门面"
- 一线/新一线女性当下的 aesthetic vocabulary：**茶系、冷淡风、奶油风、老钱风、法式、暗黑文艺**——没有一个是"糖果粉紫"
- 对标她们真实关注的视觉账号：*The Gentlewoman*、Aesop、观夏、HARMAY、苹果官网、Airbnb、*Kinfolk*、MoMA

### 1.2 当前产品的视觉"做对"与"做错"

**做对（保留）：**
- 暖米白 `#FAF8F5` 底色——已经是女性向平台的正确选择，秒杀冷白
- WTFTI 经典收藏卡风格 + 低多边形纸艺插画——差异化资产
- Mysti 暗夜 + 金色衬线引文——这是目前全站最有艺术感的一块
- 文案体系（荒诞文学 / 四段式 / "说中但不 mean"）——内容层面已经是顶级

**做错 / 做弱（要改）：**
| 症状 | 证据 | 影响 |
|------|------|------|
| 中文字体没处理 | globals.css 依赖系统字体 PingFang / Noto Sans，H1 直接用默认 sans-serif | 所有 hero 视觉"像大学生作业"——字体是女性向产品的 #1 信号 |
| 标题色粉过饱和 | 首页 "什么 WTF 人格?" 用 `#ff4d6d` 打底 | 粉色饱和度 > 70% 在女性高端审美里 = "可爱但不高级" |
| 留白不够 | 首页 hero 下方紧接按钮，按钮下方紧接副标题，行距 1.5 | 缺乏 "呼吸感"，信息密度感像功能产品 |
| 按钮形态雷同 | 所有 CTA 都是"胶囊渐变 + shadow"，各宇宙只改颜色 | 审美疲劳，失去 editorial 张力 |
| 缺乏 brand moments | 没有一个"让用户愿意截屏单独发一条小红书的视觉锚点" | 错失裂变 |
| 插画与 UI 割裂 | 低多边形纸艺是暖色卡通，但页面是 clean web app 风 | 两套视觉语言打架 |

---

## 二、女性向审美的底层原理（原理先行，不是拍脑袋）

### 2.1 女性高审美用户的五条"美学公约"

基于小红书 / 即刻 / Pinterest 头部女性内容账号的聚类观察（不是"所有女性"，而是**有主动审美决策权、18-30、城市白领**这个核心群体）：

1. **克制优于丰盛**（Restraint > Abundance）——少即是多，饱和度越低越"贵"
2. **质感优于色彩**（Texture > Color）——纸感、毛感、哑光、磨砂胜过明快撞色
3. **不对称优于工整**（Asymmetry > Grid）——编辑排版的"断裂感"比齐整网格更有品
4. **留白优于填满**（White space > Density）——呼吸感=品位
5. **叙事优于展示**（Story > Showcase）——UI 要有"这一页想讲一个小故事"的感觉

### 2.2 她们信任的视觉语言

| 语言 | 例子 | 可借鉴给 WTFTI 的点 |
|------|------|------|
| **Editorial / 杂志** | *Kinfolk*、*The Gentlewoman* | 大字标 + 序号 + 引文 + 大图，不怕留白 |
| **美术馆** | MoMA、UCCA、teamLab 官网 | 黑白中性 + 一点点颜色做 accent |
| **老钱 / Quiet luxury** | The Row、Loro Piana | 米色、米灰、裸粉（不饱和）、深棕 |
| **东方侘寂** | 观夏、茶颜、MUJI BOOKS | 淡墨、米白、留白、手写感落款 |
| **法式慵懒** | Sézane、Sandro | 裸粉 + 薄荷 + 奶油 + 少量酒红 |
| **现代占星** | Co–Star、Sanctuary、*The Pattern* | 暗夜 + 金 + 大量衬线 + 复古星象图 |

**WTFTI 的定位建议**：在上述光谱里取 **"现代占星 × 东方侘寂 × editorial"** 这个三角——对应三个模块：Mysti 用现代占星，SoulTI/经典向东方侘寂靠拢，全站结构用 editorial 排版。

### 2.3 反面教材（千万别做）

- ❌ 粉 × 蓝 × 黄撞色（幼稚）
- ❌ 大面积渐变光晕 + 星空底（土嗨）
- ❌ 所有字都居中 + 所有按钮都圆角胶囊（缺 editorial 意识）
- ❌ 霓虹 + 玻璃拟态叠加（2021 已死）
- ❌ emoji 当装饰堆砌（一个页面 >3 个就扣分）
- ❌ 手写体中文字体用于大段正文（装饰字只能出现在 hero 标题）

---

## 三、新视觉战略：WTFTI "Editorial Feminine" v3

### 3.1 一句话定位

> "一个由有审美的女生为有审美的女生做的人格图鉴——像翻一本独立杂志，像走进一家 concept store。"

### 3.2 三条不可动摇的设计原则

1. **Typography is the product**（字体即产品）——字体升级是 ROI 最高的一步
2. **Space is luxury**（留白即奢侈）——一屏讲 1 件事，不是 3 件
3. **Texture tells story**（材质会叙事）——纸、墨、金、绒、玻璃，每个宇宙选一种主材质

### 3.3 视觉分层（一页的视觉层级）

```
① 材质层（底）    纸感噪点 / 细微纹理 / 亚光
② 信息层         editorial 排版 + 克制字重
③ Accent 层     一个主色 + 一个副色（永远只有两个）
④ 仪式层（顶）   一个"仪式动作"（如翻牌 / 盖章 / 签名）
```

---

## 四、Design Tokens v3（女性向艺术级）

> 目标：在保留现有 `#FAF8F5` 暖米白和 `#e06088` 玫瑰粉资产的前提下，**降饱和、加层次、引入中性色锚点**。

### 4.1 色彩系统

#### 核心中性色（新引入 —— "老钱米"色阶）

| Token | Hex | 用途 |
|------|-----|------|
| `--color-paper` | `#FAF8F5` | 页面底色（保留） |
| `--color-paper-deep` | `#F0EBE2` | 次级区块背景（新） |
| `--color-ink` | `#1F1A16` | 标题正文（比原 `#2D2A26` 更深更墨） |
| `--color-ink-soft` | `#5B524B` | 次要文案 |
| `--color-ink-mute` | `#9A908A` | 辅助灰 |
| `--color-rule` | `#CFC6BB` | 细分割线（新，editorial 必备） |
| `--color-stone` | `#857A70` | 深灰棕，用于 badge / meta |

#### Accent 双色（保留粉，降饱和；加一个 Signature 色）

| Token | Hex | 说明 |
|------|-----|------|
| `--color-rose` | `#D26A87` | 玫瑰粉（原 `#e06088` 降饱和 ~12%，更"高级") |
| `--color-rose-dust` | `#EAD3D9` | 裸粉尘（大面积背景用） |
| `--color-gold` | `#B8905A` | **新 Signature 金**（用于仪式感、Mysti、金箔点缀） |
| `--color-ember` | `#8C3E3E` | 深红酒（引文、强调、奢字） |

> **规则**：一个页面里 accent 色（rose/gold/ember）总面积不超过 **8%**。越少越贵。

#### 宇宙分色重新定调（降饱和 + 引入材质情绪）

| 宇宙 | 原 | v3 新 | 情绪词 |
|------|------|------|------|
| WTFTI 经典 | `#e06088` | `#D26A87` 玫瑰粉 + `#FAF8F5` 纸 | 收藏卡 · 纸感 |
| 毒舌版 | `#ef4444` | `#8C3E3E` 酒红 + `#1F1A16` 墨 | 书信红批 |
| 修仙 2.0 | `#a855f7` | `#6E5BA8` 青瓷紫 + `#F0EBE2` 宣纸 | 仙气留白 |
| 班TI | `#0ea5e9` | `#4A6B7C` 雾蓝 + 铅灰 | 办公室冷感 |
| 王者TI | `#f59e0b` | `#B8905A` 旧金 + 深墨 | 兵器谱 |
| 鸟TI | `#38bdf8` | `#6BA38F` 青羽绿 + 米 | 自然图鉴 |
| 花TI | `#e11d48` | `#B85C6E` 干玫 + 米 | 植物标本 |
| 三角TI | `#84cc16` | `#7A8C4A` 苔绿 + 岩灰 | 哑光军绿 |
| **SoulTI** | `#8b7355` | `#8B7355` 烟棕 + `#F5F0E8` 米 | 不动，已是标杆 |
| 恋爱XP | `#a855f7` | `#B36B8A` 豆沙粉 + `#EAD3D9` 裸粉尘 | 法式慵懒 |
| **Mysti** | 暗夜+金 | `#0F0B1E` 深夜 + `#B8905A` 金 + `#D26A87` | 保留，是全站艺术天花板 |

### 4.2 字体系统（#1 ROI 改动）

> **核心矛盾**：现在中文标题用的是 PingFang / Noto Sans，这是"功能字"不是"品味字"。必须引入衬线。

#### 新字体栈（三级）

| 用途 | 字体 | fallback | 备注 |
|------|------|---------|------|
| **品牌字 / 大标题 Display** | `"Noto Serif SC"` + `"Source Han Serif SC"` + `Cormorant Garamond` | Georgia, serif | 这是"高级感"的开关 |
| **正文 / UI sans** | `"Noto Sans SC"` + `PingFang SC` + `Inter` | system-ui | 保留现有 |
| **引文 / 装饰斜体** | `"Cormorant Garamond Italic"` + `"Noto Serif SC Italic"` | Georgia italic | SoulTI / Mysti 已在用 |
| **Editorial 数字 / 编码** | `"Fraunces"` 或 `"PP Editorial New"`（OSS 替代：`"EB Garamond"`） | serif | 序号 01 / 02 / 03 |
| **Meta / 分节小字** | `"JetBrains Mono"` + tracking-widest | mono | 保留 |

#### 排版比例（Type Scale — Major Third 1.25）

```
Display XL   72px  serif   -0.04em  line-height 1.05   （hero，限首页/每个宇宙一次）
Display L    56px  serif   -0.03em  1.1
H1           40px  serif   -0.02em  1.2
H2           28px  sans    -0.01em  1.3
H3           20px  sans     0em     1.4
Body L       17px  sans     0em     1.7  （正文加到 1.7，不是 1.5）
Body         15px  sans     0em     1.7
Meta         12px  mono    +0.22em  1.4  UPPERCASE
```

**关键变化**：
- 所有 hero 标题从"无衬线加粗"改为"衬线常规字重"——这一步等于换了一个品牌
- 行高从 1.5 拉到 1.7（女性用户阅读舒适度 & 杂志感）
- 字间距全局 -0.02em 到 -0.04em（紧排 = 精致）

### 4.3 空间系统（留白革命）

现状：section 间距 `py-16`（64px），内部间距 `gap-4`（16px）。
v3 建议：

```
--space-micro   4px
--space-xs      8px
--space-s       16px
--space-m       32px
--space-l       64px
--space-xl      128px   ← 新，section 之间用这个
--space-xxl     200px   ← hero 上下
```

**规则**：
- 每个 section 上下 padding 至少 **96px**（desktop）/ **64px**（mobile）
- Hero 区下方至少 200px 才出现下一个元素
- 单屏信息密度从当前约 15 个视觉元素 → 压到 7-9 个

### 4.4 Radius / 形态

```
--radius-sharp   0       editorial 硬朗矩形（新，用于大图/卡片）
--radius-soft    4px     默认小圆角
--radius-card    8px     卡片（原 xl 12px 降到 8）
--radius-pill    999px   仅用于 CTA 按钮和 tag
```

**关键变化**：把当前大量 `rounded-xl`（12px）降到 `rounded-md`（8px）或直接方角——editorial 感来自方和圆的对比，不是全部圆。

### 4.5 材质层（Texture — 新增）

每个页面底色叠一层极细的纸纹噪点（`background-image` 用 SVG noise，opacity 2-3%）。这是当前产品最缺的一层，也是"廉价感消失"的关键一步。

```css
.paper-texture::before {
  content: "";
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg ...noise filter... />");
  opacity: 0.025;
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

---

## 五、组件级改造清单

### 5.1 Hero 区（每个 landing page）

**前**：居中 Badge + 居中标题 + 居中副标题 + 居中按钮
**后**：**左对齐 editorial 版式**
```
┌─────────────────────────────────────┐
│                                     │
│   01 · FRIEND IDENTIFIER            │   ← mono meta，左上
│                                     │
│   你朋友是                           │
│   什么 WTF 人格？                   │   ← Noto Serif SC 72px
│                                     │
│   ─────                             │   ← 1px rule
│                                     │
│   不用 ta 来测——你来帮 ta 鉴定。     │   ← 17px body，最多 2 行
│                                     │
│   [  开始鉴定  ]  ·  10 道题 · 3 分钟 │   ← 按钮不渐变，纯色/描边
│                                     │
└─────────────────────────────────────┘
```

### 5.2 CTA 按钮（分三型，不是一型）

现在：全部渐变胶囊。
v3：按语义分三型：

| 型 | 用途 | 样式 |
|------|------|------|
| **Primary** | 开始测试 | 深墨底 `#1F1A16` + 白字 + `radius-soft` + 无 shadow |
| **Accent** | 仪式动作（抽牌 / 生成图） | 玫瑰粉 `#D26A87` 纯色（不渐变）+ 白字 |
| **Ghost** | 次要 | 透明 + 1px `--color-rule` 描边 + 墨字 |

**取消**：所有按钮的 glow shadow、渐变、emoji 开头 ✨。

### 5.3 卡片（人格卡 / 宇宙卡）

**前**：白底 + 圆角 12 + shadow + 文字
**后**：米纸底 + `radius-card` 8 + 1px `--color-rule` 边 + **左上角编号 01/02/03**（serif italic）+ **hover 时底色微变而不是上浮**

```
┌───────────────────────────┐
│ 01                      ◦│   ← 编号 + 右上小装饰
│                           │
│   [插画居中]               │
│                           │
│   气氛组组长              │   ← serif 20px
│   PARTY · 总是最后走的人  │   ← mono meta
│                           │
│   ─────                   │   ← rule
│   场子因你而存在。        │   ← italic 引文
└───────────────────────────┘
```

### 5.4 结果页（"杂志封面"化）

这是 **ROI 最高的单点改造**——结果页=分享截图=裂变素材。

参考 Co–Star / *The Pattern* / MoMA 展览海报：

```
┌─────────────────────────────────────┐
│                                     │
│   ISSUE 04                          │   ← 期号感
│   FRIEND IDENTIFIER                 │
│                                     │
│   PARTY                             │   ← Display XL 衬线
│   气氛组组长                         │
│                                     │
│   [     大图居中 / 留出上下 128px    ]│
│                                     │
│   ─────                             │
│                                     │
│   "场子因你而存在，你一走，           │   ← italic 大引文
│    这个房间立刻掉 30% 电量。"         │
│                                     │
│   ─────                             │
│                                     │
│   OS · HIT · SYMPTOMS · CLOSER      │   ← 四段式用 mono 小标签
│                                     │
└─────────────────────────────────────┘
```

### 5.5 导航 / Navigation

现状（从截图）：左上 logo + 右上 hamburger。
v3：
- Logo 保留，但 "WTF" 改为 Noto Serif SC italic，"TI" 改为 mono small caps
- 增加一条 1px 顶部规则线 `--color-rule`
- Hamburger 展开后用**全屏 editorial 菜单**：左侧大字索引 + 右侧 hover 预览，不是下拉列表

### 5.6 表情 / Emoji 使用规范

- **可以**：人格 emoji 保留（🧚🎭🎪），但只出现在徽章（badge）中
- **禁止**：按钮、hero、段落中出现装饰性 emoji
- **可选替代**：用小型 SVG 线性 icon 或独立插画替代 emoji

---

## 六、动效 / Motion 战略

女性向审美的动效关键词：**slow、organic、fabric-like**，不是 spring bouncy。

| 场景 | 动效 | 时长 / 缓动 |
|------|------|----------|
| 页面切换 | fade + 垂直位移 8px | 600ms, cubic-bezier(0.22, 1, 0.36, 1) |
| 卡片 hover | 底色微变 + rule 线条从左展开 | 400ms, ease-out |
| 开始测试 | 纸张翻页感（transform: rotateY）| 800ms |
| 抽牌（Mysti） | 慢抽 + 轻微抖动落定 | 1200ms |
| 结果生成 | **"显影"** 效果（blur(20) → blur(0) + 字逐行浮现）| 1600ms 总时长 |
| 数据图表 | 细线从 0 画到终点 | 900ms |

**禁止**：bounce、rotate 360、闪烁、彩虹扫光。

---

## 七、"Signature Moments"（让用户截图的瞬间）

每个女性向产品要有 **3 个 signature visual moments**——用户见到会"哇"一下、截屏发小红书的那一刻。

建议的三个：

1. **"开启图鉴" 仪式页**——点击开始测试后，出现一张仿旧书的封面 3 秒（serif 字 + 火漆印章 + 边栏锁线），然后翻开
2. **"四段文案" 排版页**——结果页第二屏，把 HIT/OS/SYMPTOMS/CLOSER 四段做成四张独立的"诗集页"，可单张截图分享
3. **"图鉴墙" 个人收藏**——Wave 2 账号化之后，用户的所有人格卡用 **美术馆 Salon Hang**（萨龙式挂法）排版，不是网格——每张错位、编号、悬于米墙

---

## 八、各宇宙差异化"材质身份"

每个宇宙认领一种材质（Texture Identity），这是差异化的最后一层：

| 宇宙 | 主材质 | 视觉钩子 |
|------|------|------|
| WTFTI 经典 | **纸 / 收藏卡** | 纸纹 + 圆角切角 + 邮票齿孔 |
| 毒舌版 | **钢印 / 红批** | 盖章效果 + 红字批注字体 |
| 修仙 2.0 | **宣纸 / 墨痕** | 留白 + 墨晕渐变 + 竖排小字 |
| Mysti | **塔罗纸 / 金箔** | 金色边框 + 星象细线 |
| SoulTI | **亚麻书页** | 大留白 + 细衬线 + 手写落款 |
| 花TI | **植物标本卡** | 干花压痕 + 拉丁学名 mono |
| 恋爱XP | **丝绒 / 奶油** | 裸粉叠色 + 耳语粉字 |
| 鸟TI | **鸟类图谱** | 图鉴编号 + 羽毛插画 + 分类学名 |
| 班TI | **办公室便签** | 便签黄 + 打印机字体 + 钉孔 |

---

## 九、路线图（3 个 Wave，2 周 / 4 周 / 8 周）

### Wave 1（本周——最高 ROI 的 3 刀）

> 目标：让产品从"可爱"跨到"有品味"，只动核心 tokens 和 3 个页面。

- [ ] **P0 · 字体系统升级**（1 天）——`globals.css` 接入 Noto Serif SC + Cormorant Garamond（Google Fonts / self-host），hero 全改 serif
- [ ] **P0 · Design tokens v3**（1 天）——按 §4 更新颜色 / 空间 / radius 变量
- [ ] **P0 · 首页 + 1 个宇宙（建议 Mysti 或 SoulTI）hero 重排**（2 天）——editorial 左对齐 + 巨大留白
- [ ] **P1 · 纸纹材质层**（0.5 天）——全站 `body::before` 加 2.5% SVG noise

**预期效果指标**：
- 小红书截图分享率 +20%（目测——现在 UI 不值得被单独截）
- 用户会话平均停留时长 +15%
- 首次主观评价关键词从"可爱"→"有质感 / 文艺"（小红书评论关键词监测）

### Wave 2（2 周）

- [ ] **结果页 v3 杂志化改版**（3 天）——跨所有宇宙的通用 result layout 重写
- [ ] **CTA 按钮分型**（1 天）
- [ ] **卡片组件重设计**（1 天）——`PersonalityCard`、`UniverseCard`
- [ ] **动效库**（2 天）——安装 motion primitives（建议用 CSS + 少量 framer-motion）
- [ ] **一张完整的 editorial share image 模板**（2 天）——替换 Canvas 分享图

### Wave 3（4-8 周）

- [ ] 每个宇宙认领自己的 texture identity（§8）
- [ ] Salon Hang 图鉴墙（需账号化联动）
- [ ] 仪式页面（开启 / 揭晓 / 收藏）
- [ ] 暗色模式正式定义（不是反色，是"夜读"——深墨底 + 奶油字 + 金线）

---

## 十、成功指标（Outcome Metrics）

不只看"好看"，要看"女性向高审美是否真的带来商业价值"：

| 指标 | 当前 | Wave 1 后目标 | Wave 3 后目标 |
|------|------|------|------|
| 结果页截图分享率 | ~30% | 40% | 55% |
| 小红书自发投稿数（月）| ? | +30% | +100% |
| 评论关键词"好看/有质感/高级" 占比 | <10% | 25% | 50% |
| 平均单会话 PV | ~4 | 5 | 7 |
| 7 日留存 | <5% | 8% | 15% |
| 品牌搜索量（wtfti / 灵鉴） | 基线 | +20% | +80% |
| NPS 中"愿意推荐给朋友" | ? | — | ≥ 55% |

---

## 十一、反对意见与回应（Anti-Patterns）

| 有人会说… | 为什么不对 |
|------|------|
| "用户喜欢粉，再多加点粉" | 高审美女性对饱和粉反而反感，她们要的是"能过得了朋友圈审美关"的粉 |
| "衬线字体太严肃了，产品是搞笑的" | 反差才是记忆点：**衬线字 + 荒诞文案** 的组合才是 WTFTI 的独家风味（想想 *The New Yorker* 的幽默栏） |
| "留白太多屏幕太空" | 这是从"功能产品思维"跳到"内容产品思维"的必经之路。移动端单屏 1 个 focus 点是 editorial 的黄金律 |
| "要不要跟风极简黑白" | 不要——WTFTI 的资产是"暖" + "纸" + "女性"，黑白会丢掉品牌记忆 |
| "改完会不会丢失品牌识别" | `#FAF8F5` 暖米白、`#D26A87` 玫瑰粉、低多边形纸艺插画、WTFTI logo——四大资产一个不动，改的是字体 / 留白 / 材质 / 排版 |

---

## 十二、决策 Gate

本战略需要的唯一决策：

**选一个宇宙做 v3 试点（2 周内出成品，对比现版验证假设）。**

推荐排序：
1. **Mysti**（已是艺术天花板，基础好，升级最容易被小红书自传播）
2. **SoulTI**（已经是衬线范本，验证"editorial + 材质"组合）
3. **首页 + 经典 WTFTI**（风险高但收益最大，基准改动）

一旦试点验证：截图分享率 / 停留时长 / 小红书自发投稿数任一指标 +20%，则全站铺开 §4-§7 的所有 tokens 和组件改造。

---

## 附录 A · 参考视觉情绪板（Moodboard URL / 关键词）

- Aesop.com — 字体留白 / 米色 / 克制
- Co–Star Astrology — 暗夜 + 衬线 + 金
- The Gentlewoman 杂志 — editorial 女性排版天花板
- Kinfolk — 留白 + 自然 + 冷暖灰
- 观夏 — 中式 + 米 + 墨 + 金
- Sézane — 法式裸粉 + 慵懒
- HARMAY 话梅官网 — 工业冷感中的柔软
- teamLab — 暗色 + 艺术感动效
- MoMA Design Store — editorial + 艺术

## 附录 B · 需要引入的 OSS 资源

- Fonts: Noto Serif SC, Noto Sans SC, Cormorant Garamond, Fraunces（Google Fonts 都有）
- SVG noise generator: `https://www.fffuel.co/nnnoise/`
- Easing curves: `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo), `cubic-bezier(0.65, 0, 0.35, 1)` (in-out-cubic)

## 附录 C · 必读延伸

- 《Refactoring UI》—— Steve Schoger 的色彩与层次章节
- 《Grid Systems in Graphic Design》—— Josef Müller-Brockmann
- *The Gentlewoman* 近 3 期任一刊（排版借鉴）
- Pinterest 标签："quiet luxury"、"editorial layout"、"chinoiserie minimal"
