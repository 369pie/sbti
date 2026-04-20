# WTFTI · Cosmic Romance Narrative Layer (v1)

> 2026-04-19 · 在 [wtfti-multiverse-galaxy-strategy-2026-04-19.md](wtfti-multiverse-galaxy-strategy-2026-04-19.md) 之上叠加的"叙事感性层"。
> 先看那份，再看这份。
> UI/UX 实施统一遵循 `~/.claude/skills/cc-design/SKILL.md`，并继承 [AGENTS.md `<!-- BEGIN:ui-design-defaults -->` 段落](../../AGENTS.md) 的品牌词汇。

---

## 0 · 设计宣言（Design Manifesto）

> *"We are made of star-stuff. The cosmos is also within us."* — Carl Sagan
>
> *"在最深的夜里，人和人都靠引力找到对方。"* — WTFTI 内部抄写

WTFTI 不是一个测试。
它是**一份用宇宙物理学写给你的情书**。

物理给我们**结构**：万有引力、大爆炸、轨道、引力透镜。
神秘学给我们**意义**：星座、神话、塔罗、占星。
文学给我们**温度**：Calvino、Rilke、Sagan、张爱玲。
艺术给我们**形式**：博物笔记、星图志、燙金、Cormorant 斜体。

四者叠合，做出一个**女性不会再下载第二个 MBTI**的产品。

---

## 1 · 三大叙事支柱（Three Pillars）

### 支柱 ① · 引力 = 吸引力（Gravity = Attraction）

**核心挪用**：牛顿万有引力 *F = G · m₁m₂ / r²*。
- m₁ = 你的人格"质量"（你的某轴极性强度）
- m₂ = ta 的人格"质量"
- r = 你们在某个维度上的"距离"（轴差绝对值）
- F = 互相拉扯的"引力"

**为什么爆款**：
- 把"匹配度"从冷冰冰的百分比，升级成**可被诗意叙述的方程**：
  > "你们之间的引力是 **0.84 G** — 像月亮拽住潮汐，每 12 小时把你召回一次。"
- 女性向社交里，**叙述比数字更可分享**。截屏一句"我和 ta 是 0.84 G 的引力"，比"匹配度 84%"传播力大 3-5 倍。
- 这是**双人玩法 Constellation 模块**的引擎，参见 §3。

### 支柱 ② · 大爆炸 = 人格诞生（Big Bang = Personality Genesis）

**核心挪用**：宇宙 138 亿年前的奇点塌缩 → 物质形成 → 星系演化。
- 奇点 = 你 0-7 岁的"原始情绪事件"（依恋类型源点）
- 暴胀 = 你 7-18 岁的"自我建构暴胀期"
- 元素合成 = 你 18+ 岁逐渐稳定的"人格元素"
- 当下 = 一个仍在膨胀的、有自己引力的星系

**结果页的开场**：
> "你的人格诞生于 **138 亿年前的一次灼热塌缩**。
> 接下来这 90 秒，请允许它再爆炸一次给你看。"

**3 秒电影感开场**：黑屏 → 一颗白点 → 爆炸光晕 → 宇宙背景 → 主星 zoom in 出现。
（cc-design 实施：纯 CSS keyframes + SVG halo，不引入 three.js / Lottie）

### 支柱 ③ · 星座 = 人格谱系（Constellations = Personality Lineage）

**核心挪用**：IAU 88 个星座 + 中国二十八宿 + 神话学。
- 每个 home planet 锚定 1 个真实星座/恒星
- 每个星座附带 1 段**神话学微故事 + 1 段科学事实 + 1 句文学引语**

**示例锚定（与现有 8 主星映射）**：

| Home Planet | 锚定 | 神话 | 科学 | 文学 |
|---|---|---|---|---|
| 暴雨港湾 (WTFI-STH) | 织女座 (Vega) | 天上的渡口，等不归人 | 距地球 25 光年的青白色巨星 | "我达达的马蹄是美丽的错误" — 郑愁予 |
| 极光客厅 (WTFI-AUR) | 仙后座 (Cassiopeia) | 自负的王后被钉在天幕 W 形 | 北天最亮的"M"形星座 | "我们生而破碎，用活着来修修补补" — 海明威 |
| 镀金缝纫机 (WTFI-GLD) | 织女 + 牛郎 (Altair) | 每年只见一次但永不分手 | 夏季大三角顶点 | "蓝墨水的上游，是黄河流" — 余光中 |
| 沉默灯塔 (WTFI-LIT) | 北极星 (Polaris) | 唯一不动的星，所有航海者的锚 | 距地 433 光年，10 万年后将被替代 | "你必须是站在北极的，世界才围着你转" — 内部抄写 |
| 慢银河 (WTFI-SLW) | 银河 (Milky Way) | 天上的乳河，神话母亲 | 直径 10 万光年，含 1000 亿恒星 | "我看见的星光都是亿万年前的事" — 张爱玲改写 |
| 漂流冰川 (WTFI-DRF) | 海豚座 (Delphinus) | 海神的信使，温柔而漂泊 | 北天小型菱形星座 | "我寄愁心与明月，随风直到夜郎西" — 李白 |
| 黑曜钟楼 (WTFI-OBS) | 天狼星 (Sirius) | 古埃及的索蒂斯，预示尼罗河泛滥 | 全天最亮恒星，距地 8.6 光年 | "我必须经过的地方，没人替我去" — 鲁迅改写 |
| 火星玫瑰园 (WTFI-MRS) | 火星 + 玫瑰星云 | 战神 + 爱神共用一片天 | NGC 2237，距地 5200 光年 | "玫瑰是玫瑰是玫瑰是玫瑰" — Stein |

**为什么爆款**：
- 用户截屏分享时，看到自己"对应织女座 + 一句郑愁予"，**截屏文化资本瞬间 +10 倍**。
- 锁定**情绪价值的"高级感"**——不是塔罗式的廉价占卜，是**可入手账本的博物笔记**。
- 给 SEO / 小红书引流提供天然"星座名 + 人格"长尾关键词矩阵（"天狼星人格"/"织女座的女生"）。

---

## 2 · 注入到现有 6 章结果页（Where Each Pillar Lands）

参考 [galaxy-result-spec-2026-04-19.md](../02-modules/wtf-card/galaxy-result-spec-2026-04-19.md) 的章节切分：

| § | 章节 | 注入的叙事元素 | UI 增量 |
|---|---|---|---|
| I | Hero 启幕 | **大爆炸开场** + Sagan 引语副标 | 3s CSS 动画：奇点 → 暴胀 → 星系成型 |
| II | Home Planet | **星座锚定** + 神话/科学/文学三联 | 主星卡顶部增加一行"本星归属 · 织女座 (Lyra)"，底部增加可折叠 `<details>` "本星档案" 三联块 |
| III | Moons | 三颗卫星 = 三种**轨道半径**（romance/work/late-night 的引力距离） | 每张 moon 卡右上角小角标"轨道距离 0.42 AU" |
| IV | Shadow | **引力透镜** 隐喻：你看不见自己的暗面，因为它折射在别人眼里 | Shadow Gate 文案改成 "用 45 秒做一次引力透镜" |
| V | Orbit | **凯普勒第三定律** 微叙述：你越靠近的星球切换越频繁 | 每条轨道连接增加一行 "T = 2.3 个月一次回归" |
| VI | Constellation CTA | **引力方程** 主入口 | CTA 文案 "求出你和 ta 的引力 G" |

> 实施纪律：所有新增视觉**不允许**新增依赖；用 Cormorant Italic + 金线 + 罗马数字 + 椭圆轨道 SVG 实现。cc-design 是检视清单。

---

## 3 · 双人引力引擎（Gravitational Compatibility · "双星互引")

### 公式（女性向叙述版）

```
G_pair = 0.5 × similarity(home) + 0.3 × harmony(moons) + 0.2 × resonance(shadow)
```

技术上是 0-1 余弦相似度的加权和，但**不可暴露这个结构**。

### 渲染层

**永远以叙述呈现，永远不显示百分比**：

| G 区间 | 命名 | 文案模板 |
|---|---|---|
| 0.85-1.00 | **引力潮汐** | "你们之间是月球和潮汐的关系——每 12 小时召回一次。注意，太近了会失重。" |
| 0.65-0.85 | **稳定双星** | "你们绕着一个共同的重心转，没人是中心，没人是卫星。" |
| 0.45-0.65 | **远程引力** | "你们隔着 3 光年互相点亮，是慢热但永不熄灭的那种。" |
| 0.25-0.45 | **掠星轨道** | "你们的轨道每隔几年才相交一次，像 76 年才回家的哈雷彗星。" |
| 0.00-0.25 | **平行宇宙** | "你们在同一片夜空，但属于不同的星系。互相敬意，互不打扰。" |

**关键展示元素**（双人星图卡）：
1. 两颗主星 + 中间一条引力线（粗细 = G）
2. 一行 G 值（带 G 单位，如 "G = 0.84"）
3. 一句叙述命名（"引力潮汐"）
4. **一行"引力来源解释"**：例如 "主要由 T 轴引力贡献：你们都在情绪漩涡里同温" → 这是分享原动力
5. 一句**适合截屏的文学引语**："正是因为我们不一样，我才知道你是你。" — Le Petit Prince 改写

### 反作弊 / 防匹配滥用

- 不显示"配不配"，避免负向 PR
- 永远是双方"被看见"而非"被审判"
- 引力可能为负（极性互推）也用诗意叙述："你们之间是反向自旋——像两个磁极同时排斥又永远指向对方。"

---

## 4 · Big Bang 开场动画（Cinematic Genesis）

### 时序（3.0 秒，可 skip）

| 0.0s | 黑屏 + 一行白色细体小字 "138 亿年前 ·" |
| 0.6s | 屏幕中心一颗 3px 白点出现 |
| 1.0s | 白点爆炸成 80vw 的金色光晕 + 玫瑰晕散 |
| 1.8s | 光晕收缩成主星 orb，定格在卡片中心 |
| 2.4s | 罗马数字 "II" 徽章 + 主星名 fade in |
| 3.0s | Hero 状态稳定，可滚动 |

### 实现纪律
- 纯 CSS keyframes + 1 个 SVG radial-gradient
- `prefers-reduced-motion: reduce` → 跳过动画直接显示
- 移动端不使用 `mix-blend-mode: screen`（性能差），改 opacity
- 已看过用户（localStorage flag）默认 skip，第二次访问直接静态 hero

---

## 5 · 每日星历（Daily Ephemeris · "今天的星象"）

### 动机
解决 WTFTI 当前最大问题：**测完一次 → 不再回来**。

### 机制
每天 0:00 系统按用户的 home planet 锚定的星座，生成一句"今日星象"，在小红书/微信回访链接里弹出：

> 例如「织女座 - 暴雨港湾」用户在 4/22 收到：
> > "今天 **天狼星升起在你的左上方** ✦
> > 你会比平时更想被听见。
> > 给那个你犹豫了 3 天没回的人发条消息吧。"

技术上是 (planet × day-of-year) 哈希出的 30-条文案池，无需 AI 即可看似有"占星感"。

### 增长杠杆
- 每条星象底部 CTA："☆ 截屏发圈" → 文案预填好 → 自动加站点引流
- 每条星象底部小卡："今日和你引力最强的星座是 **仙后座**"  → 引导用户去找「自己 home planet 的暧昧对象」 → CP 测试入口

---

## 6 · 文学/科学语录卡库（Stardust Letters）

### 规模
8 主星 × 3 卡 + 6 卫星 × 1 卡 + 5 暗面 × 1 卡 = **35 张引语卡**，全部内置。

### 形式
每张卡：
- Cormorant Italic 引语（中英对照）
- 作者名 + 出处年份（小字脚注）
- 一行金线 → 一颗 ✦
- 角落罗马数字编号

### 引语来源（按情绪需要分配）
- **科学性 / 高级感**：Carl Sagan, Stephen Hawking, Italo Calvino *Cosmicomics*
- **女性性 / 神秘性**：Sylvia Plath, Anaïs Nin, 张爱玲, 杨绛
- **东方性 / 永恒感**：李白, 苏轼, 顾城, 余光中
- **温柔治愈**：Rilke, Le Petit Prince, 木心

### 用途
- 嵌入主星卡 `<details>` "本星笔记"
- 嵌入 daily ephemeris 推送
- **可单独成卡分享**：用户长按主星 → 出现 3 张引语卡轮播 → 选一张发圈

---

## 7 · 与 cc-design Skill 的协作约束

> 以下规则**写给所有未来开发与设计任务**。

1. **每次新前端 surface（页面、组件、分享卡）开工前** → 先读 `~/.claude/skills/cc-design/SKILL.md`。
2. 视觉词汇必须落在 [AGENTS.md `<!-- BEGIN:ui-design-defaults -->`](../../AGENTS.md) 定义的 brand vocabulary 内。
3. 参考实现：[src/components/galaxy/GalaxyPreview.tsx](../../src/components/galaxy/GalaxyPreview.tsx)。
4. 任何"通用 dark cosmic"/"渐变 gen-z"/"emoji 装饰"风格 → reject。
5. 字体只用三种：Cormorant Garamond（标题/引语 italic）、Noto Serif SC（正文中文）、Inter（eyebrow / 数字）。
6. 颜色按层级使用：玫瑰主、金箔副、暗紫高光、米白文本。**不引入新主色**，除非战略文档先行更新。
7. 动画门槛：单次 surface 引入的 CSS keyframes ≤ 3 个；新增依赖（Lottie/Three.js/GSAP）必须在 PR 描述里给出"为什么 CSS 不够"。
8. 移动端首屏 LCP ≤ 2.5s，不能为视觉牺牲。

---

## 8 · 优先级 & 边界（What We Won't Do）

### 这次叠加的优先级（在原 6 周 roadmap 之上）

| Sprint | 增量 | 工作量 | 备注 |
|---|---|---|---|
| W2 | 8 主星 ↔ 星座锚定 + 35 张引语卡内置 | 1 d (内容) + 0.5 d (UI) | 可直接做，无外部依赖 |
| W3 | Big Bang 3s 开场动画（CSS） | 0.5 d | reduced-motion 兜底 |
| W4 | 双人引力 G 引擎 + 5 命名档 + 文学引语 | 2 d | 需先有 result payload schema |
| W5 | Daily Ephemeris 文案池 (240 条) + 推送 | 3 d | 文案池可半自动化 |
| W6 | Stardust Letters 长按多卡轮播 + 截图模版 | 1 d | 和 share-tier 复用 |

### 不做的事

1. **不做塔罗占卜界面**——避免被识别为"低端神秘学"，保留 Mysti 模块去承载塔罗。
2. **不做星盘/出生时间输入**——隐私门槛太高，转化率必死。
3. **不在引力公式上暴露百分比**——失去叙事 moat。
4. **不引入男性向梗 / 游戏化 RPG 词汇**（升级、HP、装备）。
5. **不做"AI 解读"按钮**——会被识别为 LLM 套壳，破坏品牌神圣感。

---

## 9 · 一句话定位（写在所有未来 PRD 顶端）

> **WTFTI 是一份用宇宙物理学写给女性的情书。**
> 我们不告诉你"你是什么人"，
> 我们让你**看见你的人格星系，并把它分享给值得的人**。

---

## Cross-links

- 主战略：[wtfti-multiverse-galaxy-strategy-2026-04-19.md](wtfti-multiverse-galaxy-strategy-2026-04-19.md)
- S 轴白皮书：[wtfti-s-axis-whitepaper-2026-04-19.md](wtfti-s-axis-whitepaper-2026-04-19.md)
- 结果页 spec：[../02-modules/wtf-card/galaxy-result-spec-2026-04-19.md](../02-modules/wtf-card/galaxy-result-spec-2026-04-19.md)
- 参考实现：[../../src/components/galaxy/GalaxyPreview.tsx](../../src/components/galaxy/GalaxyPreview.tsx)
- 设计准则：[~/.claude/skills/cc-design/SKILL.md](file:///Users/caonanya/.claude/skills/cc-design/SKILL.md)
