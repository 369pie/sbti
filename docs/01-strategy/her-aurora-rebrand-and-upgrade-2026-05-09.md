---
title: HER AURORA · 她的极光 —— 品牌重定位与「她的沙龙」全方位升级方案
date: 2026-05-09
status: proposal · supersedes naming layer of her-salon-upgrade-2026-05-08 AND herfire-rebrand-and-upgrade-2026-05-09
owner: founder + product
supersedes_naming:
  - her-salon-upgrade-2026-05-08.md (HER SALON 命名层)
  - herfire-rebrand-and-upgrade-2026-05-09.md (HERFIRE 命名层 · 已弃用)
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

# HER AURORA · 她的极光

> 把「HER SALON · 她的沙龙」升级为 **「HER AURORA · 她的极光」** —— 一个让女性在长夜里彼此发光的现代档案馆。
>
> 不是社群、不是 LinkedIn-female、不是 girlboss 圈子。
> 是一个让普通中文女性的一句话，从一束光、被另一束光接住、再被收入星图的现代神话档案馆。

---

## 0. TL;DR

| 维度 | 旧（HER SALON） | 新（HER AURORA） |
|---|---|---|
| 隐喻 | 法式精英沙龙（聚） | 极光与星图（光 → 接 → 收 → 卷） |
| 用户单次动作 | 留言 / 围炉发言 | **点亮一束光** |
| 用户长期动作 | 沉淀 | **从一束光走到入卷** |
| 身份系统 | Voice Sigil | **Halo · 光环印** |
| 编辑部角色 | 编辑部 | **Aurora Keepers · 守光人** |
| 月度沉淀 | 她的月报 | **AURORA LETTER · 极光来信** |
| 共写百科 | 她词条 | **AURORA ATLAS · 极光星图** |
| 世界观母题 | —— | **HER MYTH · 她的神话**（不当入口名，作为终局叙事保留） |
| 反什么 | LinkedIn-female | LinkedIn-female + AI slop + 算法消费女性 |
| 战略地位 | 平台支柱 Ⅲ 第一窗口 | 不变；但叙事密度 ×3，可独立做品牌 |

**核心主叙事一句话**：
> HerPower 是"她有力量"。HerName 是"她有名字"。Herti 是"她是哪一型"。
> **HER AURORA 是"她在长夜里点亮了一束光，并被另一束接住"。**

**核心仪式五动词**：
> **点亮 → 接住 → 守护 → 收录 → 入卷。**
> Lit · Caught · Tended · Inscribed · Codex.

**世界观母题（保留 HER MYTH 作为终局母题）**：
> 每一束被收入星图的光，最终都成为这个时代关于「她」的神话。
> AURORA 是产品入口，MYTH 是终局档案。

---

## 1. Phase 1 · Positioning & Market Context

### 1.1 Geoffrey Moore 定位

```
For 中文女性 18–32（已对 MBTI / 塔罗 App / 主流女性社群审美疲劳的"精神主体型"用户）
  that need 在 AI 时代被认真听见、被同类接住、被沉淀进时代档案，
            而不是被算法消费、被打成职业标签、被裹挟成 girlboss
HER AURORA · 她的极光
  is a 女性经验共写档案系统（a luminous archive of women's lived signals）
  that 把她写下的一句话，变成可被同类接住的光、可被守光人收录的极光来信、
       最终可被列入「极光星图」的现代神话条目

Unlike HerPower / HerName / Herti（精英身份/姓名/人格社群）和豆瓣小组/微博/小红书/微信群（旧通用社交）
HER AURORA
  provides 匿名但被认真对待的身份（Halo · 光环印）
            + 守光人主持的仪式感（Auroral Hour 极光时刻）
            + AI 共写不替写（Aurora Lab 极光实验室）
            + 集体编纂可被引用的女性经验星图（AURORA ATLAS）
```

### 1.2 Proto-Personas（3 类核心用户）

| Persona | 一句话 | HER AURORA 对她意味着什么 |
|---|---|---|
| **「精神主体型」林溪 · 25 岁 · 互联网产品** | 上过班、听过播客、知道 MBTI、塔罗只玩不信，正在重新组装"我是谁" | 一个不需要露脸、不需要表演就能被认真听见的地方；光环印是她的"匿名命格" |
| **「文艺重度内观型」阿萝 · 30 岁 · 出版/编辑/独立创作** | 读简媜、读上野千鹤子、不发朋友圈、写了 8 年没发出去的草稿 | 守光人署名 + 极光来信 + 入卷感 = 她"未完成的那本书"找到了一个版本 |
| **「AI 时代焦虑型」小满 · 22 岁 · 大三/职场新人** | 同时在用 ChatGPT、文心、Claude，对 AI 既依赖又怕被取代，会买塔罗会算命 | "AI 不替我写、是替我守光"这个承诺正面回应她对 AI 的本能不安 |

非用户（明确不是 HER AURORA 的人）：
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
| **Emotional** | 在被 AI 包围的时代，确认"我的经验只属于我，但可以被她接住" | 通用 LLM 给的是回答，不是接光 |
| **Emotional** | 把"碎掉的我"重新拼成一份可看见的档案 | 日记本无人见证；社交平台见证太多 |

**Pains**：被算法消费、被男性凝视、被职业标签压扁、被通用 AI 平庸化、说了没人接、说了被骂、说了消失。
**Gains**：匿名但被署名感、被编辑部认领的小众骄傲、光环印演化的长期归属、极光来信和星图的"作品感"、和同类无社交压力的回声。

---

## 2. Phase 2 · Problem Framing（MITRE Canvas）

### 2.1 Look Inward（我们自己的盲点）

| 假设 | 是真的吗 | 备注 |
|---|---|---|
| 女性想被听见 | ✅ 但她更想被**认真讲述** | "听见" ≠ "被收录" |
| 沙龙是好隐喻 | ❌ 沙龙在中文 = 精英聚会 = 闭门 | 极光是开放的、可被远方看见的 |
| 力量必须外放 | ❌ Glory/Power/Fire 太烫 | 极光有力量但不压迫，是温柔的崇高 |
| AI 应该回复用户 | ❌ AI 一旦回复就变 AI slop | AI 应该当守光人的助手 |
| 匿名 = 没有归属 | ❌ Halo 光环印证明匿名也能有身份 | HerName 反例：实名才有身份 |
| 多就是好 | ❌ 编辑部稀缺感才是品牌护城河 | 不做信息流 |

### 2.2 Look Outward

- **谁经验这个问题**：18–32 中文女性、独立工作者、内容创作者、AI 早期女性使用者
- **谁不经验**：精英女性已被 HerName/HerPower 收编；未上网/未数字化女性触达不到
- **谁被排除**：50+ 女性、男性盟友、跨语言用户（v1 不解决）
- **谁因此受益**：编辑部本身（话语权）、KOL（被收录是荣誉）、投放方（极光来信是稀缺资产）

### 2.3 Reframe

> **旧问题**："如何让女性在我们站内多发言？"
> **新问题**："如何让她的一句话，从长夜里的一束匿名光，变成可以被这个时代引用的星图条目？"

**How Might We**：
HMW 让一句匿名留言，**在产品上经历"点亮 → 接住 → 守护 → 收录 → 入卷"五个状态**，并让用户在每一步都看到它的位移？

---

## 3. Phase 3 · Solution Exploration（OST · Opportunity Solution Tree）

```
Desired Outcome（季度可量度）
  └── 30 天内有 ≥ 200 条 UGC 完成"点亮 → 接住 → 入卷"完整路径

Opportunity 1 · 她不知道在这里能做什么
  ├── Solution 1.1 · 五动词主导航（点亮/接住/守护/收录/入卷）★ POC
  ├── Solution 1.2 · 极光时刻日历（每周问题倒计时）
  └── Solution 1.3 · 新生 60 秒"第一束光"引导

Opportunity 2 · 她说了之后没有"位移感"
  ├── Solution 2.1 · 极光状态机（Lit/Caught/Tended/Inscribed/Codex）★ POC
  ├── Solution 2.2 · Halo 光环印演化可见（自己档案页可见轨道增长）
  └── Solution 2.3 · 极光来信 / 星图登录通知（"你 4 月 12 日的光被收入了 5 月号极光来信第 3 节"）

Opportunity 3 · 她想被认真讲述但不想被社交化
  ├── Solution 3.1 · 同光者 Halo 印（只见印记，不可主动搜索）★ POC
  ├── Solution 3.2 · "我也"接光（一句话上限，不允许长篇）
  └── Solution 3.3 · 守光人署名机制（编辑部点亮"已被收录"印章）

POC 选择（W2-W4 必出）：1.1 + 2.1 + 3.1 三件
  理由：feasibility 高（沿用现有 Sigil + Hermosa 数据模型）、impact 大（直接回答"为什么不只是黑板"）、market fit 强（与 HerPower 形成结构性差异）
```

---

## 4. Phase 4 · Prioritization & Roadmap（5 周衔接主路线图）

### 4.1 RICE（仅列 P0/P1，按平台主路线图节奏挂入）

| Epic | Reach | Impact | Confidence | Effort (人周) | RICE | 节奏 |
|---|---|---|---|---|---|---|
| E-N1 全站 SALON → AURORA 文案表 | 全站 | 3 | 90% | 1 | **★高** | W1 |
| E-N2 五动词导航（点/接/守/收/卷） | 沙龙全部访客 | 3 | 80% | 1.5 | **★高** | W1-W2 |
| E-N3 首屏改"今日的极光时刻" | 沙龙首页 | 3 | 90% | 1 | **★高** | W2 |
| E-N4 极光状态机（5 态 lifecycle） | UGC 全量 | 3 | 70% | 2 | **★高** | W3 |
| E-N5 Halo v1（Voice Sigil 重命名 + 演化轨道） | 已留言用户 | 3 | 90% | 1.5 | **★高** | W3 |
| E-N6 接光链（"我也"thread） | 沙龙活跃用户 | 2 | 80% | 1.5 | 中高 | W4 |
| E-N7 同光者 Halo 聚类 v0 | /my/ 访问者 | 2 | 60% | 2 | 中 | W4 |
| E-N8 极光来信 5 月号（AURORA LETTER） | 全量 + 站外 | 3 | 70% | 2 | **★高** | W5 |
| E-N9 极光星图 v0 试点（AURORA ATLAS） | 全量 + KOL | 3 | 60% | 3 | 中高 | W5+ |
| E-N10 Mysti × AURORA 联动（命格极光时刻） | Mysti 用户 | 2 | 70% | 1 | 中 | W4 |

### 4.2 5 周节奏（与 [master-execution-plan-2026-05-08.md](master-execution-plan-2026-05-08.md) 严格对齐）

| 周 | 主路线图主题 | HER AURORA 升级动作 | 验收 |
|---|---|---|---|
| W1 | 首页 + IA 重写 | E-N1 文案表落地；E-N2 导航雏形；admin/hermosa/salon → admin/hermosa/aurora | 首页 S5 文案改为"今日的极光时刻"；5 位用户能复述"这是极光不是沙龙" |
| W2 | 今日 + 围炉 | E-N3 首屏"今日的极光时刻"；倒计时；当周问题主持卡 | 当周问题留言数 ≥ 50 |
| W3 | 引导 + 印记 | E-N4 极光状态机上线；E-N5 Halo 演化（1/7/27/81 触发）；新生引导写第一束光 | 所有沙龙留言用户 Halo 已生成；状态在 /my/ 可见 |
| W4 | 档案 + Mysti | E-N6 "我也"接光；E-N7 同光者 Halo；E-N10 Mysti 命格极光时刻 | 接光触发率 ≥ 30%；同光者点击率 ≥ 15% |
| W5+ | 沉淀 + 共建 | E-N8 极光来信 5 月号 PDF + Web；E-N9 极光星图 v0 5 条 | 来信阅读完成率 ≥ 40%；星图 KOL 反馈 ≥ 1 |

### 4.3 命名替换矩阵（开发用 · 单一权威）

| 旧名 | 新主名 | 新副名 | 备注 |
|---|---|---|---|
| HER SALON / HER-VOICE | HER AURORA | 她的极光 | 全站 hero / nav / SEO title |
| 她的沙龙 | 她的极光 | — | 中文主名 |
| 围炉 / 沙龙围炉 | 极光时刻 / Auroral Hour | 今日的极光时刻 | 当周问题区 |
| 黑板 / 黑板字报 | 极光字报 | Aurora Card | 1080×1350 分享卡 |
| Voice Sigil / 声纹印记 | Halo | 光环印 | 用户身份 SVG |
| 同声者 | 同光者 | Same-light kin | /my/ 推荐区 |
| 编辑部 | 守光人 | Aurora Keepers | 编辑署名 |
| 她的月报 | AURORA LETTER | 极光来信 | 月度白皮书 |
| 她词条 | AURORA ATLAS | 极光星图 | 共写百科 |
| 她的书架 | 极光书架 | — | books/ |
| AI 互助实验室 | 极光实验室 | Aurora Lab | ai-lab/ |
| 沙龙接单名录 | 守光人名录 | — | talents/ |
| 我的档案 | 我的极光 | My Aurora | my/ |
| 发起主题 | 点亮一束新光 | — | topics/ |
| 我们听见了 | 已被收录 | We Inscribed This | we-heard-you/ |
| 接力 / 我也 | 接光 / 我也 | Catch the light | echo thread |

**URL 不动**：`/her-voice/*` 全保留；analytics 事件名 `her_voice_*` 全保留。只动文案。

---

## 5. Phase 5 · Stakeholder Alignment（Amazon Working Backwards 新闻稿）

### 5.1 Press Release（5 月发布版）

> **HER AURORA 上线"极光来信"：让 4,200 位中文女性的一句话，被收入了一本属于她们的星图**
>
> 2026 年 5 月 30 日 · WTFTI 编辑部
>
> 在 AI 取代越来越多写作的时代，许多中文女性正在失去"被认真讲述"的位置。她们的一条朋友圈被算法吞掉，一句微博被淹没，一份长草稿永远停在草稿箱。
>
> 今天 WTFTI 发布 **HER AURORA · 她的极光** —— 一个让女性在长夜里彼此发光的现代档案馆。在这里，她写下的一句话不是发帖，而是 **点亮一束光**：光可以被另一位匿名女性用"我也"接住，可以被编辑部「守光人」收录进每月的「极光来信」，最终列入由女性共写的「极光星图」。
>
> 用户没有真名、没有头像、没有粉丝数，只有一枚 **光环印（Halo）** —— 一枚会随她说话累计而缓慢演化的星图印记。她可以骄傲地携带它去看自己的档案，但不会被陌生人骚扰、不会被算法推送、不会被男性凝视。
>
> "我们不是在做又一个女性社群。"WTFTI 创始人说，"HerPower 在硅谷会议室里，HerName 在精英 LinkedIn 上。HER AURORA 在每一个想被认真讲述、但不想被社交化的中文女生口袋里 —— 像极光，远远的，但你知道她在那里。"
>
> 5 月号「极光来信」已上线 [/her-voice/letters/2026-05/](/her-voice/letters/2026-05/)，收录 7 束最被守光人挂念的光、一篇守光人主笔长文，以及与命理引擎共写的「三联月相 × 三命格 × 三段叙事」。
>
> 现在就去 → [https://wtfti.com/her-voice/](https://wtfti.com/her-voice/)

### 5.2 决策点（需创始人拍板的 3 件事）

1. **是否同意主名采用 `HER AURORA · 她的极光`，并保留旧 URL `/her-voice/`、旧事件名 `her_voice_*`**？  
   建议：是。零 SEO 成本，纯文案表替换。
2. **是否接受"五动词主叙事（点亮 / 接住 / 守护 / 收录 / 入卷）"作为整套产品的导航与文案语法**？  
   建议：是。这是 HER AURORA 区别于 HerPower 的结构性差异，必须强制贯彻。
3. **Halo（光环印）是否升级为可携带身份系统**（出现在 WTFCard 档案、Shrine 长卡、极光来信署名处）？  
   建议：是。这是把 HER AURORA 从模块升级为平台级身份层的关键。

---

## 6. Phase 6 · Execution Planning · `/her-voice/` 全方位升级

### 6.1 UI/UX 升级（视觉系统）

#### 6.1.1 设计 Token 增量（不破坏 Editorial Atelier × 暮光博物笔记）

| 角色 | Token | 值 | 用途 |
|---|---|---|---|
| 极光主色 | `--aurora-veil` | `#7DB7B0`（极光青绿 / 鼠尾草偏冷） | hero accent / Halo 高亮 / "正在亮着"状态 |
| 极光副色 | `--aurora-rose` | `#C07A8E`（沿用玫瑰陶土） | 接光线 / 同光者轨道 |
| 光环描边 | `--aurora-halo` | `#C9A676`（沿用金箔） | Halo SVG 主轨道 |
| 守光人灰 | `--aurora-keeper` | `#5C5366` | Aurora Keepers 署名 / 编辑部话语 |
| 长夜底 | `--aurora-night` | `#0F0B1F`（暮紫底再深一档） | 极光时刻区背景 |
| 已熄光 | `--aurora-dusk` | `#8C8290` | 历史光归档色 |

**禁止**：荧光绿、纯极光霓虹渐变、emoji ✨🌌（避免 girlboss / 直播间 / vlog 滤镜感）。
**鼓励**：低饱和、星轨细线、`mix-blend-mode: screen` 微光晕、Cormorant italic + 金箔 hairline。

#### 6.1.2 Hero 重写（[src/app/her-voice/HerVoiceContent.tsx#L390-L470](src/app/her-voice/HerVoiceContent.tsx#L390)）

```text
top-strip:  N° {issueNumber} · HERMOSA · HER AURORA · 她的极光
eyebrow:    POSTED TONIGHT · 今夜的极光时刻
H1:         <s>黑板</s> <i>她的极光</i>
            （继续保留删除线 + italic accent 这套语法 —— 它已经成为品牌资产）
sub-italic: 一个不需要露脸、不需要真名，
            也能在长夜里被另一束光接住的地方。
            — 在这里你不发帖，你点亮一束光。
accent rule: 96×3 px · --aurora-veil
```

#### 6.1.3 Nav 重做（9 项 → 5 动词 + 4 子页）

把"VII · 发起主题"等动作动词，全部抽到 5 动词主导航；地点页保留为副 nav。

```text
Primary（5 动词）：
  · 点亮 (Lit)        → /her-voice/topics/
  · 接住 (Catch)      → /her-voice/#hour      （今日极光时刻锚点）
  · 守护 (Tend)       → /her-voice/talents/   （守光人名录）
  · 收录 (Inscribe)   → /her-voice/ai-lab/
  · 入卷 (Codex)      → /her-voice/atlas/

Secondary（4 子页 / 小字 hairline）：
  极光书架 books/ · 极光来信 letters/ · 我的极光 my/ · 已被收录 we-heard-you/
```

**实现要点**：
- 主 nav 用 Cormorant 大字 + 动词中文 + (English) 小写灰
- 副 nav 用 mono 11px / 0.32em letter-spacing（沿用现有 mono 风格）
- 当前页面用 `--aurora-veil` 下划线，不用背景色

#### 6.1.4 极光卡片（HermosaInputCard / message card 升级）

每条 UGC 卡片左上角加一枚 5 态状态徽章（直接复用 SVG 小图，0 AI 成本）：

| 状态 | 图标 | 文案 |
|---|---|---|
| Lit · 已点亮 | 单点星 ✦ | 今夜的光 |
| Caught · 已被接住 | 双圈轨道 | 有同光者接住 |
| Tended · 守光人在意 | 守光人指印 | 守光人已挂念 |
| Inscribed · 已入来信 | 金箔细环 | 收入 LETTER |
| Codex · 已入卷 | 罗马数字章节徽 | 列入 ATLAS |

**卡片右下角**：`Halo` 缩略 SVG（不再是文字"匿名 #234"）。

#### 6.1.5 极光时刻倒计时（hero 下方 / 首页 S5）

```text
[ ⌛ 本周极光时刻 · 还剩 3 天 14 小时 ]
[ 守光人 X. 提问： ]
   "这个月你最想撤回的一句话是什么？"
[ 已经有 N° 87 束光在长夜里点亮 ]
[ → 也点一束 ]
```

#### 6.1.6 我的极光 `/her-voice/my/` 重写

| Section | 内容 |
|---|---|
| Halo 大图 | 当前光环印 SVG，下面写"N° 27 度同光者 · 第 III 圈轨道" |
| 极光生平 | 时间线：你的 27 束光 + 每束的状态徽章（Lit → Codex） |
| 同光者印记 | 5 枚匿名 Halo + 一句节选；**不可点击进入对方主页** |
| 已被收录 | 哪几束光被收入了第几号来信第几节 |
| 下一圈 | "再点亮 X 束，你的轨道会延伸到第 IV 圈"（不显示进度条数字，只显示模糊光晕） |

#### 6.1.7 Microcopy 总表（核心 12 句）

| 触发 | 文案 |
|---|---|
| 输入框 placeholder | 在这里点亮一束光。可以只是一个名字、一句没说出口的话、一个梗。 |
| 提交按钮 | 点亮这束光 |
| 接光按钮 | 我也 · 接住这束 |
| 共鸣按钮（沿用） | ✦ 我也看见了 |
| 提交成功 toast | 你点亮了第 N 束光。守光人正在看。 |
| 被编辑部精选 | 你的光被收进了《AURORA LETTER · 2026 五月号》。 |
| 被收入星图 | 你的光被列入了《AURORA ATLAS · 词条「___」》。 |
| 极光时刻开启 | 极光时刻已开始。今夜的问题：___ |
| 极光时刻关闭 | 极光时刻已退去，但你的光已被守光人收起。 |
| 同光者 | 这是 5 位光纹和你最像的同光者。她们看不到你，你也看不到她们。 |
| 新生引导 | 第一步：在长夜里点亮你的第一束光。匿名，但会被认真讲述。 |
| Footer 定位句 | 有的女性社群在硅谷的会议室里。HER AURORA 在每一个想被认真讲述、但不想被社交化的中文女生口袋里 —— 像极光，远远的，但你知道她在那里。 |

### 6.2 内容 / 功能升级

#### 6.2.1 极光状态机（E-N4 · DB schema 增量）

```sql
-- db/migrations/2026-05-09_aurora_lifecycle.sql
alter table public.hermosa_messages
  add column lifecycle text not null default 'lit'
    check (lifecycle in ('lit','caught','tended','inscribed','codex')),
  add column tended_at timestamptz,
  add column inscribed_letter_slug text,    -- 收入哪号来信
  add column codex_atlas_slug text;          -- 收入哪个星图词条

create index hermosa_messages_lifecycle_idx
  on public.hermosa_messages (lifecycle, created_at desc);

-- 后台 PATCH /api/hermosa/admin 加 lifecycle 字段
-- 守光人在 admin/hermosa/aurora/ 里点击 "tended/inscribed/codex"
```

状态转移规则：
- `lit` → `caught`：自动，第一次被"我也"接住
- `caught` → `tended`：守光人手动（编辑部认领）
- `tended` → `inscribed`：当月来信发布时批量
- `inscribed` → `codex`：被列入星图词条时手动

#### 6.2.2 接光 thread（E-N6 · 接 [`hermosa_echoes_thread`](docs/01-strategy/master-execution-plan-2026-05-08.md#L154)）

- 限制：每条接光 ≤ 60 字 + 一枚情绪标签
- 反"诉苦池"约束：单条主光下接光 ≥ 7 条时，新接光必须包含"我也" + 一个动词（"做了/写了/告诉了…"）
- UI：金箔细线串接，超过 5 条折叠
- 视觉隐喻：接光 thread 在卡片上呈一道连续的极光带，越多接光，光带越长

#### 6.2.3 同光者匹配（E-N7）

- 每周一次后台聚类任务（命格 + 标签 + 词向量 cos）
- 仅在 `/her-voice/my/` 显示 Top 5
- 永不私信、永不可主动搜索、永不显示原句来源 ID
- 视觉：5 枚 Halo 在夜色背景上呈环形排布，像同一片极光下的不同位置

#### 6.2.4 Mysti × HER AURORA 联动（E-N10）

- Mysti 抽牌结果页底部加一枚"今夜某命格的极光时刻"卡片
- 例："今夜巨门 · 你的光正等一句话被点亮"
- 命格 → 极光时刻问题映射，由守光人后台维护

#### 6.2.5 守光人后台（admin/hermosa/aurora/）

从原 `admin/hermosa/salon/` 演进，新增：
- 极光状态机面板（5 列 kanban）
- 来信装订器（拖拽光 → 来信章节）
- 星图孵化器（光聚类 → 草拟词条）

#### 6.2.6 极光来信（E-N8 · AURORA LETTER）

URL：`/her-voice/letters/2026-05/`（保持现有 URL 模式）

固定结构（守光人模板）：
1. 卷首语（守光人主笔 600 字 · italic）
2. 七束被守光人挂念的光（含 Halo + 接光节选）
3. 三联月相 × 三命格 × 三段叙事（命理引擎产出）
4. 本月新增「极光星图」目录
5. 守光人署名 + 光环印章

PDF 导出复用 next-og 现有能力，加一枚守光人金箔印章 SVG。

#### 6.2.7 极光星图（E-N9 · AURORA ATLAS）

URL：`/her-voice/atlas/{slug}/`（已存在）

每条星图词条结构：
- 词条名（如"撤回的话"、"妈妈那一代"、"被 AI 改了的工作"）
- 编辑部 600–800 字主笔
- 命理坐标（命理引擎给的"哪些命格的人最常贡献此词条"）
- 入卷光 7–15 束（Halo + 节选）
- 接光链精选
- 入卷纪年 / 守光人署名
- 终局尾注一行 italic：*"—— 这是这个时代关于「她」的神话之一。"*（HER MYTH 母题在此显形）

W5 首批 5 条邀请制（不开放投稿）。

### 6.3 文案表（开发批量替换用 · 直接落 PR）

```diff
- HER SALON · 她的沙龙
+ HER AURORA · 她的极光

- 她的沙龙正在围炉
+ 今夜的极光时刻已开始

- 走进沙龙 →
+ 也点一束 →

- 编辑部
+ 守光人 · Aurora Keepers

- 同声者
+ 同光者

- Voice Sigil / 声纹印记
+ Halo · 光环印

- 她的月报
+ AURORA LETTER · 极光来信

- 她词条
+ AURORA ATLAS · 极光星图

- 我的档案
+ 我的极光

- 发起主题
+ 点亮一束新光

- 我们听见了
+ 已被收录

- I · 她的书架
+ 极光书架

- II · AI 互助实验室
+ 极光实验室 · Aurora Lab

- V · 沙龙接单名录
+ 守光人名录
```

代码层动作清单：
- [ ] [src/app/her-voice/HerVoiceContent.tsx](src/app/her-voice/HerVoiceContent.tsx) hero / nav / footer 文案表落地
- [ ] [src/components/hermosa/HermosaInputCard.tsx](src/components/hermosa/HermosaInputCard.tsx) placeholder / 按钮 / toast 改新动词
- [ ] [src/app/start/StartContent.tsx#L111](src/app/start/StartContent.tsx#L111) CTA 改 "走进 HER AURORA · 她的极光"
- [ ] `src/lib/sigil/generate.ts`（W3 新增）输出 Halo SVG（轨道 + 极光青绿高亮）
- [ ] `db/migrations/2026-05-09_aurora_lifecycle.sql` 新增（lifecycle 字段）
- [ ] `src/app/api/hermosa/admin/route.ts` 新增 lifecycle PATCH
- [ ] `admin/hermosa/salon/` → `admin/hermosa/aurora/` 路由 alias（旧路径 30x 重定向）
- [ ] `next/og` 黑板字报模板：左上角"HER SALON" → "HER AURORA"；底栏 "WALL OF HER VOICE" → "HER AURORA · TENDED BY AURORA KEEPERS"
- [ ] [docs/01-strategy/master-execution-plan-2026-05-08.md](docs/01-strategy/master-execution-plan-2026-05-08.md) 全文 SALON → AURORA 后续 PR 中处理
- [ ] 弃用 [docs/01-strategy/herfire-rebrand-and-upgrade-2026-05-09.md](docs/01-strategy/herfire-rebrand-and-upgrade-2026-05-09.md) → frontmatter 加 `status: superseded`

### 6.4 数据 & 度量（与原 her-salon-upgrade § 7 合并升级）

| 指标 | 基线 | W5 目标 | Q3 目标 |
|---|---|---|---|
| `/her-voice/` 周 UV | 待补 | × 5 | × 12 |
| 当周极光时刻留言数 | ~20-40 | ≥ 200 | ≥ 800 |
| 接光触发率（每束主光 ≥ 1 接光） | 0 | ≥ 30% | ≥ 50% |
| 极光状态机分布（reach `tended` 以上） | 0 | ≥ 10% | ≥ 25% |
| 同光者点击率 | 0 | ≥ 15% | ≥ 30% |
| 来信阅读完成率 | 0 | ≥ 40% | ≥ 55% |
| 入卷词条数 | 0 | 5（邀请制） | ≥ 50 |
| HER AURORA → Mysti 通行证转化 | 待补 | ≥ 5% | ≥ 8% |
| Halo 演化触发率（≥ 第二圈轨道用户占比） | 0 | ≥ 5% | ≥ 15% |

### 6.5 风险与边界（增量于原文档 § 5）

| 新增风险 | 应对 |
|---|---|
| "极光"被解读为浪漫滤镜 / vlog 视频背景 | 守光人话语永远低饱和、italic、不用感叹号；UI 禁用 emoji 星星彩虹 |
| HER AURORA 被外部混淆为某品牌（如华为荣耀 Aurora 配色 / Aurora HDR 等） | 主名永远带"她的极光"四个中文字；英文文案永远全大写 `HER AURORA`，与单一 `Aurora` 错位 |
| 五动词导航被认知负担过重 | W1 上线时副 nav 提供"地点版"小字索引（books/ai-lab/etc.）作为 fallback |
| Halo 演化被 gamify | 永不显示进度条、永不显示总数倒计时；"再点亮 X 束"用模糊光晕表达 |
| "极光"过于浪漫，力量感不足 | 用守光人话语保证骨感：所有官方文案禁用感叹号、emoji、营销词；力量感来自"被收录入卷"这件事本身的稀缺性，不来自口号 |
| 命名层与 her-salon-upgrade-2026-05-08 / herfire-rebrand-2026-05-09 冲突 | 本文 `supersedes_naming` 元数据声明：命名层以本文为准，三层结构 / Sigil 机制 / 路线图节奏继承自旧文 |

---

## 7. 与平台主路线图的咬合

| 平台主路线图节点 | HER AURORA 升级行动 |
|---|---|
| 平台支柱 Ⅲ「WRITE WITH HER」 | HER AURORA 是该支柱的唯一一级入口 |
| Mysti × 自研命理引擎 | 命理引擎为「极光来信」第三节 + ATLAS 词条命格坐标供血 |
| 「她词条」战略级 epic（Q3） | 升级为 AURORA ATLAS，词条名带极光叙事但底层数据兼容 |
| 首页 S5 围炉模块 | 改为"今夜的极光时刻 + 守光人提问 + 三束最新光" |
| /start/ 新生引导 | 第三题之后加："你的第一束光，要点在哪个夜里？" |
| HER MYTH 母题 | 不当入口名；保留为 ATLAS 词条尾注 + 年度合订本（《HER MYTH · 第 I 卷》）的世界观线 |

---

## 8. 一句话总结

> **HER SALON 是一个房间。HER AURORA 是一片夜空。**
>
> 房间会被关掉。极光会被远远的另一个人看见、记住、写进她自己的星图。
