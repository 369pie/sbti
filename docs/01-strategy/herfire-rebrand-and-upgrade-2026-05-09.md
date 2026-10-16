---
title: HERFIRE · 她的火种 —— 品牌重定位与「她的沙龙」全方位升级方案（已弃用）
date: 2026-05-09
status: superseded · 命名层已被 her-aurora-rebrand-and-upgrade-2026-05-09.md 取代（保留作为命名探索过程档案）
superseded_by: her-aurora-rebrand-and-upgrade-2026-05-09.md
superseded_reason: HERFIRE 在英文命名空间存在多重碰撞（HerFire Magazine、HerFire 健身、herfire7 TikTok），且"火"的隐喻偏热烈、欠浪漫接纳，已切换到 HER AURORA · 她的极光
owner: founder + product
supersedes_naming:
  - her-salon-upgrade-2026-05-08.md (HER SALON 命名层)
preserves_intact:
  - 三层结构（围炉 / 接力 / 沉淀）
  - Voice Sigil 印记机制
  - 4 周路线图节奏
  - URL 不动：/her-voice/* 保留
  - analytics 事件名 her_voice_* 保留
related:
  - master-execution-plan-2026-05-08.md
  - wtfti-platform-repositioning-2026-05-08.md
  - mysti-tianfu-integration-2026-05-08.md
runtime_targets:
  - src/app/her-voice/HerVoiceContent.tsx
  - src/app/her-voice/{books,ai-lab,wallpapers,we-heard-you,talents,my,topics,letters,atlas}
  - src/components/hermosa/HermosaInputCard.tsx
  - src/app/start/StartContent.tsx
  - src/app/admin/hermosa/salon/
---

# HERFIRE · 她的火种

> 把「HER SALON · 她的沙龙」升级为 **「HERFIRE · 她的火种」** —— 一个 AI 时代的女性经验共写档案系统。
>
> 不是社群、不是 LinkedIn-female、不是 girlboss 圈子。
> 是一个让普通中文女性的一句话，从火花 → 接火 → 入典的现代神话档案馆。

---

## 0. TL;DR

| 维度 | 旧（HER SALON） | 新（HERFIRE） |
|---|---|---|
| 隐喻 | 法式精英沙龙（聚） | 火种与火塘（点 → 传 → 炼 → 典） |
| 用户单次动作 | 留言 / 围炉发言 | **点一枚火种** |
| 用户长期动作 | 沉淀 | **从点火走到入典** |
| 身份系统 | Voice Sigil | **Firemark · 火印** |
| 编辑部角色 | 编辑部 | **Firekeepers · 守火人** |
| 月度沉淀 | 她的月报 | **HERFIRE ALMANAC · 火种月报** |
| 共写百科 | 她词条 | **HERFIRE ATLAS · 火种词条** |
| 反什么 | LinkedIn-female | LinkedIn-female + AI slop + 算法消费女性 |
| 战略地位 | 平台支柱 Ⅲ 第一窗口 | 不变；但叙事密度 ×3，可独立做品牌 |

**核心主叙事一句话**：
> HerPower 是"她有力量"。HerName 是"她有名字"。Herti 是"她是哪一型"。
> **HERFIRE 是"她留下了火种"。**

**核心仪式一句话**：
> **点火 → 接火 → 守火 → 炼火 → 入典。**

---

## 1. Phase 1 · Positioning & Market Context

### 1.1 Geoffrey Moore 定位

```
For 中文女性 18–32（已对 MBTI / 塔罗 App / 主流女性社群审美疲劳的"精神主体型"用户）
  that need 在 AI 时代被认真听见、被同声者接住、被沉淀进时代档案，
            而不是被算法消费、被打成职业标签、被裹挟成 girlboss
HERFIRE · 她的火种
  is a 女性经验共写档案系统（mythic archive of women's lived signals）
  that 把她写下的一句话，变成可被传递的火种、可被接力的回声、
       可被编辑部炼成的月报、最终可被收入的「火种词条」

Unlike HerPower / HerName / Herti（精英身份/姓名/人格社群）和豆瓣小组/微博/小红书/微信群（旧通用社交）
HERFIRE
  provides 匿名但被认真对待的身份（Firemark）
            + 编辑部主持的仪式感（Hearth 围炉）
            + AI 共写不替写（Forge 熔炉）
            + 集体编纂可被引用的女性经验百科（Atlas 入典）
```

### 1.2 Proto-Personas（3 类核心用户）

| Persona | 一句话 | HERFIRE 对她意味着什么 |
|---|---|---|
| **「精神主体型」林溪 · 25 岁 · 互联网产品** | 上过班、听过播客、知道 MBTI、塔罗只玩不信，正在重新组装"我是谁" | 一个不需要露脸、不需要表演就能被认真听见的地方；火印是她的"匿名命格" |
| **「文艺重度内观型」阿萝 · 30 岁 · 出版/编辑/独立创作** | 读简媜、读上野千鹤子、不发朋友圈、写了 8 年没发出去的草稿 | 编辑部署名 + 月报 + 入典感 = 她"未完成的那本书"找到了一个版本 |
| **「AI 时代焦虑型」小满 · 22 岁 · 大三/职场新人** | 同时在用 ChatGPT、文心、Claude，对 AI 既依赖又怕被取代，会买塔罗会算命 | "AI 不替我写、是替我守火"这个承诺正面回应她对 AI 的本能不安 |

非用户（明确不是 HERFIRE 的人）：
- 想结识投资人/医生/MBA 的精英网络型 → 去 HerPower
- 想发图被点赞的展示型 → 留在小红书
- 想找婚恋/相亲的关系型 → 不是这个产品

### 1.3 JTBD（Jobs-to-be-Done）

| 类型 | Job | 当前替代方案为什么不及格 |
|---|---|---|
| **Functional** | 把一句没法发朋友圈的话，安全地说出去 | 微信群有熟人；豆瓣噪音；小红书要表演 |
| **Functional** | 找到和我相似经验的人，但不要被她私信 | 豆瓣/小红书一旦相似就互关，关系变社交 |
| **Social** | 让别人（包括未来的我）知道我经历过这一年 | 朋友圈被算法吞掉；微博无法回看 |
| **Social** | 不靠头衔、不靠头像，被一个有审美的编辑部认真挑中 | 没有任何主流社群提供"被编辑部署名收录"的体验 |
| **Emotional** | 在被 AI 包围的时代，确认"我的经验只属于我，但可以被她接住" | 通用 LLM 给的是回答，不是接火 |
| **Emotional** | 把"碎掉的我"重新拼成一份可看见的档案 | 日记本无人见证；社交平台见证太多 |

**Pains**：被算法消费、被男性凝视、被职业标签压扁、被通用 AI 平庸化、说了没人接、说了被骂、说了消失。
**Gains**：匿名但被署名感、被编辑部认领的小众骄傲、火印演化的长期归属、月报和词条的"作品感"、和同声者无社交压力的回声。

---

## 2. Phase 2 · Problem Framing（MITRE Canvas）

### 2.1 Look Inward（我们自己的盲点）

| 假设 | 是真的吗 | 备注 |
|---|---|---|
| 女性想被听见 | ✅ 但她更想被**认真讲述** | "听见" ≠ "被收录" |
| 沙龙是好隐喻 | ❌ 沙龙在中文 = 精英聚会 = 闭门 | 火塘是开放的、可被传递的 |
| AI 应该回复用户 | ❌ AI 一旦回复就变 AI slop | AI 应该当 Firekeepers 的助手 |
| 匿名 = 没有归属 | ❌ 火印（Firemark）证明匿名也能有身份 | HerName 反例：实名才有身份 |
| 多就是好 | ❌ 编辑部稀缺感才是品牌护城河 | 不做信息流 |

### 2.2 Look Outward

- **谁经验这个问题**：18–32 中文女性、独立工作者、内容创作者、AI 早期女性使用者
- **谁不经验**：精英女性已被 HerName/HerPower 收编；未上网/未数字化女性触达不到
- **谁被排除**：50+ 女性、男性盟友、跨语言用户（v1 不解决）
- **谁因此受益**：编辑部本身（话语权）、KOL（被收录是荣誉）、投放方（白皮书是稀缺资产）

### 2.3 Reframe

> **旧问题**："如何让女性在我们站内多发言？"
> **新问题**："如何让她的一句话，从一个匿名火花，变成可以被这个时代引用的档案条目？"

**How Might We**：
HMW 让一句匿名留言，**在产品上经历"点火 → 接火 → 守火 → 炼火 → 入典"五个状态**，并让用户在每一步都看到它的位移？

---

## 3. Phase 3 · Solution Exploration（OST · Opportunity Solution Tree）

```
Desired Outcome（季度可量度）
  └── 30 天内有 ≥ 200 条 UGC 完成"点火 → 接火 → 入典"完整路径

Opportunity 1 · 她不知道在这里能做什么
  ├── Solution 1.1 · 五动词主导航（点火/接火/守火/炼火/入典）★ POC
  ├── Solution 1.2 · 火塘日历（每周围炉问题倒计时）
  └── Solution 1.3 · 新生 60 秒"第一枚火"引导

Opportunity 2 · 她说了之后没有"位移感"
  ├── Solution 2.1 · 火种状态机（Spark/Echo/Tended/Forged/Canon）★ POC
  ├── Solution 2.2 · Firemark 演化可见（自己档案页可见轨道增长）
  └── Solution 2.3 · 月报 / 词条登录通知（"你 4 月 12 日的火被收入了 5 月号月报第 3 节"）

Opportunity 3 · 她想被认真讲述但不想被社交化
  ├── Solution 3.1 · 同声者火印（只见印记，不可主动搜索）★ POC
  ├── Solution 3.2 · "我也"接火（一句话上限，不允许长篇）
  └── Solution 3.3 · 守火人署名机制（编辑部点亮"已被收录"印章）

POC 选择（W2-W4 必出）：1.1 + 2.1 + 3.1 三件
  理由：feasibility 高（沿用现有 Sigil + Hermosa 数据模型）、impact 大（直接回答"为什么不只是黑板"）、market fit 强（与 HerPower 形成结构性差异）
```

---

## 4. Phase 4 · Prioritization & Roadmap（5 周衔接主路线图）

### 4.1 RICE（仅列 P0/P1，按平台主路线图节奏挂入）

| Epic | Reach | Impact | Confidence | Effort (人周) | RICE | 节奏 |
|---|---|---|---|---|---|---|
| E-N1 全站 SALON → HERFIRE 文案表 | 全站 | 3 | 90% | 1 | **★高** | W1 |
| E-N2 五动词导航（点/接/守/炼/典） | 沙龙全部访客 | 3 | 80% | 1.5 | **★高** | W1-W2 |
| E-N3 围炉首屏改"今日的火塘" | 沙龙首页 | 3 | 90% | 1 | **★高** | W2 |
| E-N4 火种状态机（5 态 lifecycle） | UGC 全量 | 3 | 70% | 2 | **★高** | W3 |
| E-N5 Firemark v1（Voice Sigil 重命名 + 演化轨道） | 已留言用户 | 3 | 90% | 1.5 | **★高** | W3 |
| E-N6 接火链（"我也" thread） | 沙龙活跃用户 | 2 | 80% | 1.5 | 中高 | W4 |
| E-N7 同声者火印聚类 v0 | /my/ 访问者 | 2 | 60% | 2 | 中 | W4 |
| E-N8 火种月报 5 月号（HERFIRE ALMANAC） | 全量 + 站外 | 3 | 70% | 2 | **★高** | W5 |
| E-N9 火种词条 v0 试点（HERFIRE ATLAS） | 全量 + KOL | 3 | 60% | 3 | 中高 | W5+ |
| E-N10 Mysti × HERFIRE 联动（命格围炉） | Mysti 用户 | 2 | 70% | 1 | 中 | W4 |

### 4.2 5 周节奏（与 [master-execution-plan-2026-05-08.md](master-execution-plan-2026-05-08.md) 严格对齐）

| 周 | 主路线图主题 | HERFIRE 升级动作 | 验收 |
|---|---|---|---|
| W1 | 首页 + IA 重写 | E-N1 文案表落地；E-N2 导航雏形；admin/hermosa/salon → admin/hermosa/firepit | 首页 S5 文案改为"今日的火塘"；5 位用户能复述"这是火种不是沙龙" |
| W2 | 今日 + 围炉 | E-N3 首屏"今日的火塘"；火塘倒计时；当周问题主持卡 | 当周问题留言数 ≥ 50 |
| W3 | 引导 + 印记 | E-N4 火种状态机上线；E-N5 Firemark 演化（1/7/27/81 触发）；新生引导写第一枚火 | 所有沙龙留言用户 Firemark 已生成；状态在 /my/ 可见 |
| W4 | 档案 + Mysti | E-N6 "我也"接火；E-N7 同声者火印；E-N10 Mysti 命格围炉 | 接火触发率 ≥ 30%；同声者点击率 ≥ 15% |
| W5+ | 沉淀 + 共建 | E-N8 火种月报 5 月号 PDF + Web；E-N9 火种词条 v0 5 条 | 月报阅读完成率 ≥ 40%；词条 KOL 反馈 ≥ 1 |

### 4.3 命名替换矩阵（开发用 · 单一权威）

| 旧名 | 新主名 | 新副名 | 备注 |
|---|---|---|---|
| HER SALON / HER-VOICE | HERFIRE | 她的火种 | 全站 hero / nav / SEO title |
| 她的沙龙 | 她的火种 | — | 中文主名 |
| 围炉 / 沙龙围炉 | 火塘 / Hearth | 今日的火塘 | 当周问题区 |
| 黑板 / 黑板字报 | 火印字报 | Firemark Card | 1080×1350 分享卡 |
| Voice Sigil / 声纹印记 | Firemark | 火印 | 用户身份 SVG |
| 同声者 | 同火者 | Same-fire kin | /my/ 推荐区 |
| 编辑部 | 守火人 | Firekeepers | 编辑署名 |
| 她的月报 | HERFIRE ALMANAC | 火种月报 | 月度白皮书 |
| 她词条 | HERFIRE ATLAS | 火种词条 | 共写百科 |
| 她的书架 | 火种书架 | — | books/ |
| AI 互助实验室 | 火种实验室 | Forge Lab | ai-lab/ |
| 沙龙接单名录 | 守火人名录 | — | talents/ |
| 我的档案 | 我的火塘 | My Hearth | my/ |
| 发起主题 | 点一枚新火 | — | topics/ |
| 我们听见了 | 已被收录 | We Tended This | we-heard-you/ |
| 接力 / 我也 | 接火 / 我也添一根柴 | Kindle | echo thread |

**URL 不动**：`/her-voice/*` 全保留；analytics 事件名 `her_voice_*` 全保留。只动文案。

---

## 5. Phase 5 · Stakeholder Alignment（Amazon Working Backwards 新闻稿）

### 5.1 Press Release（5 月发布版）

> **HERFIRE 上线"火种月报"：让 4,200 位中文女性的一句话，被收入了一本属于她们的档案**
>
> 2026 年 5 月 30 日 · WTFTI 编辑部
>
> 在 AI 取代越来越多写作的时代，许多中文女性正在失去"被认真讲述"的位置。她们的一条朋友圈被算法吞掉，一句微博被淹没，一份长草稿永远停在草稿箱。
>
> 今天 WTFTI 发布 **HERFIRE · 她的火种** —— 一个为「她」打造的现代神话档案系统。在这里，她写下的一句话不是发帖，而是 **点一枚火种**：火可以被另一位匿名女性用"我也"接住，可以被编辑部「守火人」收录进每月的「火种月报」，最终列入由女性共写的「火种词条」。
>
> 用户没有真名、没有头像、没有粉丝数，只有一枚 **火印（Firemark）** —— 一枚会随她说话累计而缓慢演化的星图印记。她可以骄傲地携带它去看自己的档案，但不会被陌生人骚扰、不会被算法推送、不会被男性凝视。
>
> "我们不是在做又一个女性社群。"WTFTI 创始人说，"HerPower 在硅谷会议室里，HerName 在精英 LinkedIn 上。HERFIRE 在每一个想被认真讲述、但不想被社交化的中文女生口袋里。"
>
> 5 月号「火种月报」已上线 [/her-voice/letters/2026-05/](/her-voice/letters/2026-05/)，收录 7 句最高共鸣的火、一篇守火人主笔长文，以及与命理引擎共写的「三联月相 × 三命格 × 三段叙事」。
>
> 现在就去 → [https://wtfti.com/her-voice/](https://wtfti.com/her-voice/)

### 5.2 决策点（需创始人拍板的 3 件事）

1. **是否同意主名采用 `HERFIRE · 她的火种`，并保留旧 URL `/her-voice/`、旧事件名 `her_voice_*`**？  
   建议：是。零 SEO 成本，纯文案表替换。
2. **是否接受"五动词主叙事（点 / 接 / 守 / 炼 / 典）"作为整套产品的导航与文案语法**？  
   建议：是。这是 HERFIRE 区别于 HerPower 的结构性差异，必须强制贯彻。
3. **Firemark（火印）是否升级为可携带身份系统**（出现在 WTFCard 档案、Shrine 长卡、月报署名处）？  
   建议：是。这是把 HERFIRE 从模块升级为平台级身份层的关键。

---

## 6. Phase 6 · Execution Planning · `/her-voice/` 全方位升级

### 6.1 UI/UX 升级（视觉系统）

#### 6.1.1 设计 Token 增量（不破坏 Editorial Atelier × 暮光博物笔记）

| 角色 | Token | 值 | 用途 |
|---|---|---|---|
| 火种主色 | `--herfire-ember` | `#D7642A`（炭火橘 / 烬色） | hero accent / Firemark 高亮 / "正在燃烧"状态 |
| 火印描边 | `--herfire-mark` | `#C9A676`（沿用金箔） | Firemark SVG 主轨道 |
| 守火人灰 | `--herfire-keeper` | `#5C5366` | Firekeepers 署名 / 编辑部话语 |
| 火塘背景 | `--herfire-hearth` | `#1A1326`（暮紫底微暖） | 当周问题区背景 |
| 已熄火 | `--herfire-ash` | `#8C8290` | 历史火种归档色 |

**禁止**：荧光红、纯火焰渐变、emoji 火苗 🔥（避免 girlboss / 直播间 / 短视频感）。

#### 6.1.2 Hero 重写（[src/app/her-voice/HerVoiceContent.tsx#L390-L470](src/app/her-voice/HerVoiceContent.tsx#L390)）

```text
top-strip:  N° {issueNumber} · HERMOSA · HERFIRE · 她的火种
eyebrow:    POSTED TODAY · 今日的火塘
H1:         <s>黑板</s> <i>她的火种</i>
            （继续保留删除线 + italic accent 这套语法 —— 它已经成为品牌资产）
sub-italic: 一个不需要露脸、不需要真名，
            也能让你的一句话被这个时代认真收录的地方。
            — 在这里你不发帖，你点一枚火。
accent rule: 96×3 px · --herfire-ember
```

#### 6.1.3 Nav 重做（9 项 → 5 动词 + 4 子页）

把"VII · 发起主题"等动作动词，全部抽到 5 动词主导航；地点页保留为副 nav。

```text
Primary（5 动词）：
  · 点火 (Spark)   → /her-voice/topics/
  · 接火 (Echo)    → /her-voice/#hearth   （今日的火塘锚点）
  · 守火 (Tend)    → /her-voice/talents/  （守火人名录）
  · 炼火 (Forge)   → /her-voice/ai-lab/
  · 入典 (Canon)   → /her-voice/atlas/

Secondary（4 子页 / 小字 hairline）：
  火种书架 books/ · 火种月报 letters/ · 我的火塘 my/ · 已被收录 we-heard-you/
```

**实现要点**：
- 主 nav 用 Cormorant 大字 + 动词中文 + (English) 小写灰
- 副 nav 用 mono 11px / 0.32em letter-spacing（沿用现有 mono 风格）
- 当前页面用 `--herfire-ember` 下划线，不用背景色

#### 6.1.4 火种卡片（HermosaInputCard / message card 升级）

每条 UGC 卡片左上角加一枚 5 态状态徽章（直接复用 SVG 小图，0 AI 成本）：

| 状态 | 图标 | 文案 |
|---|---|---|
| Spark · 火花 | 单点星 ✦ | 刚被点燃 |
| Echo · 已接火 | 双圈轨道 | 有同火者接住 |
| Tended · 守火人在意 | 守火人指印 | 编辑部已标记 |
| Forged · 已炼入月报 | 金箔细环 | 收入 ALMANAC |
| Canon · 已入典 | 罗马数字章节徽 | 列入 ATLAS |

**卡片右下角**：`Firemark` 缩略 SVG（不再是文字"匿名 #234"）。

#### 6.1.5 火塘倒计时（hero 下方 / 首页 S5）

```text
[ ⌛ 本周火塘 · 还剩 3 天 14 小时 ]
[ 守火人 X. 提问： ]
   "这个月你最想撤回的一句话是什么？"
[ 已经有 N° 87 位姐妹在火塘旁坐下 ]
[ → 添一根柴 ]
```

#### 6.1.6 我的火塘 `/her-voice/my/` 重写

| Section | 内容 |
|---|---|
| Firemark 大图 | 当前火印 SVG，下面写"N° 27 度同火者 · 第 III 圈轨道" |
| 火种生平 | 时间线：你的 27 枚火 + 每枚的状态徽章（Spark → Canon） |
| 同火者印记 | 5 枚匿名 Firemark + 一句节选；**不可点击进入对方主页** |
| 已被收录 | 哪几枚火被收入了第几号月报第几节 |
| 下一圈 | "再添 X 根柴，你的轨道会点亮第 IV 圈"（不显示进度条数字，只显示模糊光晕） |

#### 6.1.7 Microcopy 总表（核心 12 句）

| 触发 | 文案 |
|---|---|
| 输入框 placeholder | 在这里写下一根柴。可以只是一个名字、一句没说出口的话、一个梗。 |
| 提交按钮 | 点这枚火 |
| 接火按钮 | 我也添一根柴 |
| 共鸣按钮（沿用） | ✦ 我守着这团火 |
| 提交成功 toast | 你点燃了第 N 枚火。守火人正在看。 |
| 被编辑部精选 | 你的火被收进了《HERFIRE ALMANAC · 2026 五月号》。 |
| 被收入词条 | 你的火被列入了《HERFIRE ATLAS · 词条「___」》。 |
| 火塘开启 | 火塘已开。本周问题：___ |
| 火塘关闭 | 火塘已熄，但你的火已被守火人收起。 |
| 同火者 | 这是 5 位声纹和你最像的同火者。她们看不到你，你也看不到她们。 |
| 新生引导 | 第一步：点你的第一枚火。匿名，但会被认真讲述。 |
| Footer 定位句 | 有的女性社群在硅谷的会议室里。HERFIRE 在每一个想被认真讲述的中文女生的口袋里。 |

### 6.2 内容 / 功能升级

#### 6.2.1 火种状态机（E-N4 · DB schema 增量）

```sql
-- db/migrations/2026-05-09_herfire_lifecycle.sql
alter table public.hermosa_messages
  add column lifecycle text not null default 'spark'
    check (lifecycle in ('spark','echo','tended','forged','canon')),
  add column tended_at timestamptz,
  add column forged_letter_slug text,    -- 收入哪号月报
  add column canon_atlas_slug text;      -- 收入哪个词条

create index hermosa_messages_lifecycle_idx
  on public.hermosa_messages (lifecycle, created_at desc);

-- 后台 PATCH /api/hermosa/admin 加 lifecycle 字段
-- 守火人在 admin/hermosa/firepit/ 里点击 "tended/forged/canon"
```

状态转移规则：
- `spark` → `echo`：自动，第一次被"我也"接火
- `echo` → `tended`：守火人手动（编辑部认领）
- `tended` → `forged`：当月月报发布时批量
- `forged` → `canon`：被列入词条时手动

#### 6.2.2 接火 thread（E-N6 · 接 [`hermosa_echoes_thread`](docs/01-strategy/master-execution-plan-2026-05-08.md#L154)）

- 限制：每条接火 ≤ 60 字 + 一枚情绪标签
- 反"诉苦池"约束：单条主火下接火 ≥ 7 条时，新接火必须包含"我也" + 一个动词（"做了/写了/告诉了…"）
- UI：金箔细线串接，超过 5 条折叠

#### 6.2.3 同火者匹配（E-N7）

- 每周一次后台聚类任务（命格 + 标签 + 词向量 cos）
- 仅在 `/her-voice/my/` 显示 Top 5
- 永不私信、永不可主动搜索、永不显示原句来源 ID

#### 6.2.4 Mysti × HERFIRE 联动（E-N10）

- Mysti 抽牌结果页底部加一枚"今天某命格的火塘"卡片
- 例："今天巨门 · 你的火塘正等一句话"
- 命格 → 火塘问题映射，由守火人后台维护

#### 6.2.5 守火人后台（admin/hermosa/firepit/）

从原 `admin/hermosa/salon/` 演进，新增：
- 火种状态机面板（5 列 kanban）
- 月报装订器（拖拽火种 → 月报章节）
- 词条孵化器（火种聚类 → 草拟词条）

#### 6.2.6 火种月报（E-N8 · HERFIRE ALMANAC）

URL：`/her-voice/letters/2026-05/`（保持现有 URL 模式）

固定结构（守火人模板）：
1. 卷首语（守火人主笔 600 字 · italic）
2. 七枚被守火人挑出的火（含 Firemark + 接火节选）
3. 三联月相 × 三命格 × 三段叙事（命理引擎产出）
4. 本月新增「火种词条」目录
5. 守火人署名 + 火印章

PDF 导出复用 next-og 现有能力，加一枚守火人金箔印章 SVG。

#### 6.2.7 火种词条（E-N9 · HERFIRE ATLAS）

URL：`/her-voice/atlas/{slug}/`（已存在）

每条词条结构：
- 词条名（如"撤回的话"、"妈妈那一代"、"被 AI 改了的工作"）
- 编辑部 600–800 字主笔
- 命理坐标（命理引擎给的"哪些命格的人最常贡献此词条"）
- 入典火种 7–15 枚（Firemark + 节选）
- 接火链精选
- 入典纪年 / 守火人署名

W5 首批 5 条邀请制（不开放投稿）。

### 6.3 文案表（开发批量替换用 · 直接落 PR）

```diff
- HER SALON · 她的沙龙
+ HERFIRE · 她的火种

- 她的沙龙正在围炉
+ 今日的火塘已点燃

- 走进沙龙 →
+ 添一根柴 →

- 编辑部
+ 守火人 · Firekeepers

- 同声者
+ 同火者

- Voice Sigil / 声纹印记
+ Firemark · 火印

- 她的月报
+ HERFIRE ALMANAC · 火种月报

- 她词条
+ HERFIRE ATLAS · 火种词条

- 我的档案
+ 我的火塘

- 发起主题
+ 点一枚新火

- 我们听见了
+ 已被收录

- I · 她的书架
+ 火种书架

- II · AI 互助实验室
+ 火种实验室 · Forge Lab

- V · 沙龙接单名录
+ 守火人名录
```

代码层动作清单：
- [ ] [src/app/her-voice/HerVoiceContent.tsx](src/app/her-voice/HerVoiceContent.tsx) hero / nav / footer 文案表落地
- [ ] [src/components/hermosa/HermosaInputCard.tsx](src/components/hermosa/HermosaInputCard.tsx) placeholder / 按钮 / toast 改新动词
- [ ] [src/app/start/StartContent.tsx#L111](src/app/start/StartContent.tsx#L111) CTA 改 "走进 HERFIRE · 她的火种"
- [ ] `src/lib/sigil/generate.ts`（W3 新增）输出 Firemark SVG（轨道 + 烬色高亮）
- [ ] `db/migrations/2026-05-09_herfire_lifecycle.sql` 新增（lifecycle 字段）
- [ ] `src/app/api/hermosa/admin/route.ts` 新增 lifecycle PATCH
- [ ] `admin/hermosa/salon/` → `admin/hermosa/firepit/` 路由 alias（旧路径 30x 重定向）
- [ ] `next/og` 黑板字报模板：左上角"HER SALON" → "HERFIRE"；底栏 "WALL OF HER VOICE" → "HERFIRE · TENDED BY FIREKEEPERS"
- [ ] [docs/01-strategy/master-execution-plan-2026-05-08.md](docs/01-strategy/master-execution-plan-2026-05-08.md) 全文 SALON → HERFIRE 后续 PR 中处理

### 6.4 数据 & 度量（与原 her-salon-upgrade § 7 合并升级）

| 指标 | 基线 | W5 目标 | Q3 目标 |
|---|---|---|---|
| `/her-voice/` 周 UV | 待补 | × 5 | × 12 |
| 当周火塘留言数 | ~20-40 | ≥ 200 | ≥ 800 |
| 接火触发率（每条主火 ≥ 1 接火） | 0 | ≥ 30% | ≥ 50% |
| 火种状态机分布（reach `tended` 以上） | 0 | ≥ 10% | ≥ 25% |
| 同火者点击率 | 0 | ≥ 15% | ≥ 30% |
| 月报阅读完成率 | 0 | ≥ 40% | ≥ 55% |
| 入典词条数 | 0 | 5（邀请制） | ≥ 50 |
| HERFIRE → Mysti 通行证转化 | 待补 | ≥ 5% | ≥ 8% |
| Firemark 演化触发率（≥ 第二圈轨道用户占比） | 0 | ≥ 5% | ≥ 15% |

### 6.5 风险与边界（增量于原文档 § 5）

| 新增风险 | 应对 |
|---|---|
| "火种"被解读为情绪营销 / 烧钱 | 守火人话语永远低饱和、italic、不用感叹号；UI 禁用 emoji 火苗 |
| HERFIRE 被外部混淆为 Her Fire Magazine（美国 women empowerment tour） | 主名永远带"她的火种"四个中文字；英文文案永远全大写 `HERFIRE`，与 `Her Fire` 拼写错位 |
| 五动词导航被认知负担过重 | W1 上线时副 nav 提供"地点版"小字索引（books/ai-lab/etc.）作为 fallback |
| 火印演化被 gamify | 永不显示进度条、永不显示总数倒计时；"再添 X 根柴"用模糊光晕表达 |
| 命名层与 her-salon-upgrade-2026-05-08 文档冲突 | 本文 `supersedes_naming` 元数据声明：命名层以本文为准，三层结构 / Sigil 机制 / 路线图节奏继承自旧文 |

---

## 7. 与平台主路线图的咬合

| 平台主路线图节点 | HERFIRE 升级行动 |
|---|---|
| 平台支柱 Ⅲ「WRITE WITH HER」 | HERFIRE 是该支柱的唯一一级入口 |
| Mysti × 自研命理引擎 | 命理引擎为「火种月报」第三节 + ATLAS 词条命格坐标供血 |
| 「她词条」战略级 epic（Q3） | 升级为 HERFIRE ATLAS，词条名带火种叙事但底层数据兼容 |
| 首页 S5 围炉模块 | 改为"今日的火塘 + 守火人提问 + 三条最新火种" |
| /start/ 新生引导 | 第三题之后加："你的第一枚火，要点在哪个火塘？" |

---

## 8. 一句话总结

> **HER SALON 是一个房间。HERFIRE 是一种文明。**
>
> 房间会被关掉。火种会被传下去。
