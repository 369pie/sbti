# 灵鉴 (Mysti) 全方位产品战略升级 — 2026-04-21

> Owner: Product Strategy
> Status: Canonical Module Strategy (supersedes plan-level decisions in `mysti-deep-strategy-2026-04-16.md`; preserves W1-W6 implementation snapshot in `mysti-major-upgrade-2026-04-18.md` & `mysti-w1-w4-implementation-2026-04-18.md`)
> Priority: P0
> Scope: Full repositioning + 12-week roadmap + W1-W2 execution spec
> Frameworks: Geoffrey Moore × JTBD × MITRE × Teresa Torres OST × RICE × TAM/SAM/SOM × Working Backwards

---

## Corrigenda（与既有文档对齐）

| 旧文档 | 仍然有效 | 本次替换 |
|---|---|---|
| `mysti-deep-strategy-2026-04-16.md` | 「日活回流引擎 + 小红书弹药库」战略锚点；6 阶段方法论 | 一句话定位、Persona、Roadmap 顺序、商业化 SKU 结构 |
| `mysti-major-upgrade-2026-04-18.md` | W1-W6 全部已落地代码与 SKU；payment / gift-card 链路；`themes-v2` | 入口信息架构、首页 Hero（从「邀请→洗牌→选牌」→「场景化决策快卡」） |
| `mysti-w1-w4-implementation-2026-04-18.md` | localStorage keys、SKU 价格、虎皮椒环境变量 | 无冲突 |

> 本次升级**零破坏**：不改 schema、不改 slug、不改既有计算。新增 `decision/*` 路由 + `decision-quotes.ts` + `decision-log.ts`；既有入口下沉为「我的圣殿」抽屉。

---

## 0 · 一句话定位

> **mysti 是 WTFTI 平台的「私人女祭司 OS」——为 25-35 岁中文女性把每天的「该不该 / 会怎样 / 是不是我」三类困惑，在 90 秒内转化为一张可截屏的诗意答案卡。**

三角支撑：**情绪入口（决策快卡）× 档案飞轮（Sigil + 时间轴）× 社交裂变（双人灵魂同步局）**。

---

## Phase 1 · 定位 & 市场上下文

### 1.1 Geoffrey Moore 定位语

```
For   25-35 岁、在不确定生活里寻找下一步线索的中文女性
that need 一个「比朋友更懂我、比算命更高级、比 MBTI 更深入」的日常情绪伙伴
mysti 灵鉴
is a 神秘学 × 心理学 × AI 个人化叙事的「私人女祭司 OS」
that 把每天的「该不该 / 会怎样 / 是不是我」三类困惑，转化为一张可截屏的诗意答案卡

Unlike  准了 / 测测星座 / Co-Star / Pattern / 各类塔罗小程序
mysti 灵鉴
provides 「四锁身份系统（神性 Pantheon × 人性 Fragment × 符号 Sigil × 关系 G⊕S）」
        + 持续生长的灵魂档案 + 暮光博物馆视觉资产
```

### 1.2 Proto-Personas

| Persona | 占比 | 核心场景 |
|---|---|---|
| **暮光阅读者** 林晚（28，文创/广告） | 30% | 周日泡澡时抽一张，仅自己可见 |
| **决策困难者** 苏苏（25，咨询/金融） | 28% | 面试前、相亲前、辞职前问一下 |
| **关系侦探** 妙妙（24，运营） | 22% | 暧昧 / 闺蜜 / 婆婆怎么想 |
| **小众灵性玩家** Aisha（30，独立设计师） | 14% | 比对 mysti 与已有八字星盘 |
| **暗用户：男性送礼者** 默（32） | 6% | 礼品卡 + 双人版 |

### 1.3 JTBD

| 维度 | 内容 |
|---|---|
| Functional | (1) 今天/这周该做什么决定；(2) 解读关系真实状态；(3) 检索一个还说不出口的情绪 |
| Social | (1) 截屏「比 MBTI 更小众」的卡；(2) 在评论区开启「你也是 X 吗」对话；(3) 给闺蜜送一张比红包更走心的礼物 |
| Emotional | 寻求秩序感 / 被「看见」 / 在低谷被托住 / 在亢奋时被叫醒 |
| Pains | 抖音占卜土；XHS 私解 ¥99 等 3 天；APP 占卜重；MBTI 过气；星座精度低 |
| Gains | 日活作 < 90 秒；产物可截屏；档案越用越准；不感到迷信羞耻 |

---

## Phase 2 · 问题框架（MITRE）

### 2.1 Look Inward（自我偏见）

- 假设「女性愿付塔罗钱」→ 真，但**愿付的是「人解 + 仪式感」**而不是机器抽牌；纯算法触不到付费天花板。
- 假设「LLM = 高级感」→ 错。直接 GPT 风文案在神秘学场景**祛魅**。LLM 必须**隐于「主神化身」人格之后**。
- 假设「日活靠每日运势」→ 部分真，30 天疲劳。需要**多入口轮动**（日卡 + 决策快卡 + 月报 + 情绪 + 关系档案 + 礼品卡 + UGC 解牌）。
- 历史包袱：W1-W6 落了 6 个二级入口，首页**信息密度过载**，新用户不知从哪开始。

### 2.2 Look Outward

| 群体 | 状态 | 启示 |
|---|---|---|
| XHS 18-24 学生女 | 高活跃 / 低付费 | 用免费 + UGC 喂留存 |
| 25-35 都市女白领 | **核心 ARPU** | **主战场** |
| 30+ 已婚妈妈 | 低活跃 / 高复购 | 单设「家庭关系档案」线 |
| 男性 | 几乎不主动 / 送礼场景 ≠ 0 | 礼品卡定向 + 双人版 |
| 八字 / 紫微 / 西占行家 | 看不起浅层 | 必须有专业兜底（Pantheon × Fragment 四锁） |
| 重度迷信者 | 高 ARPU / 高风险 | **明确不做**，用「仅供参考 + 文学化」隔离 |

### 2.3 Reframe

> **问题陈述：** 25-35 岁中文女性每天 3-7 次在心里问「该不该 / 会怎样 / 是不是我」，但目前没有一个产品能用她审美能接受的方式、在 90 秒内、不让她觉得自己迷信地给出答案，并把这些答案累计成属于她的灵魂档案。

**主选 HMW**：
- HMW 把「今天该不该 ___」做成 90 秒、可截屏、不羞耻的日常仪式？
- HMW 让每张抽牌结果都喂回灵魂档案，让档案越用越像她？

---

## Phase 3 · 解决方案探索（Teresa Torres OST）

### 3.1 Desired Outcome（北极星）

> **mysti DAU/MAU ≥ 35% · 单用户月均生成可截屏卡 ≥ 8 张 · 付费转化 ≥ 7%**
> 护栏：周留存 ≥ 40%、月报续费 ≥ 60%、LTV/CAC ≥ 3。

### 3.2 三大机会

```
Outcome
├─ O1 决策时刻没有审美在线的"问神"渠道
│   ├─ S1.1 今日宜/忌 + 场景化抽牌（约会/面试/出行/扑克/聚会）
│   ├─ S1.2 LLM 主神化身解牌（限 3 轮/日）
│   └─ S1.3 决策快卡：3 牌 → 一句金句 → 截屏 ✅ POC
│
├─ O2 测过一次就忘了，没有"档案变深"的成就感
│   ├─ S2.1 灵魂档案时间轴（每次抽牌写入，月度复盘）
│   ├─ S2.2 Sigil 灵魂印记 SVG ✅ POC
│   └─ S2.3 神侍升级体系
│
└─ O3 想给闺蜜/暧昧对象一张"比转账更走心"的礼物
    ├─ S3.1 礼品卡升级（已 MVP）
    ├─ S3.2 双人灵魂同步局（实时双抽 + G⊕S 卡）✅ POC
    └─ S3.3 创作者塔罗师入驻
```

### 3.3 POC 选择

| 候选 | 可行 | 影响 | 契合 | 决策 |
|---|---|---|---|---|
| **S1.3 决策快卡 + 场景化** | 高 | 高 | 极高 | **首发** |
| **S2.2 Sigil + 档案** | 中 | 高 | 高 | **首发** |
| **S3.2 双人同步局** | 中 | 极高 | 极高 | **首发** |
| S1.2 LLM 主神化身 | 低 | 极高 | 高 | W8 灰度 |
| S3.3 解牌 marketplace | 低 | 中 | 中 | W12+ |

---

## Phase 4 · 优先级 & Roadmap

### 4.1 RICE 评分

| Epic | R | I | C | E | RICE |
|---|---|---|---|---|---|
| **E1 场景化决策快卡（5 套）** | 9 | 9 | 8 | 3 | **216** |
| **E2 Sigil 印记 + 档案时间轴** | 8 | 8 | 7 | 4 | **112** |
| **E5 灵魂信内容补 8→17 型** | 7 | 7 | 9 | 5 | **88** |
| **E6 月报续费 + 节气年报** | 6 | 8 | 7 | 4 | **84** |
| **E3 双人灵魂同步局** | 7 | 9 | 6 | 5 | **76** |
| E4 主神化身 LLM | 9 | 9 | 5 | 7 | 58 |
| E8 八字/紫微轻接入 | 7 | 7 | 6 | 5 | 59 |
| E9 礼品卡 v2（实体卡） | 4 | 6 | 6 | 4 | 36 |
| E7 塔罗师 marketplace | 5 | 9 | 4 | 8 | 23 |

### 4.2 12 周排期

```
W1-W2  E1 决策快卡 v1（约会/面试/出行）+ 5 KOC 内测
W2-W3  E2 Sigil 生成器 + 档案时间轴 MVP
W3-W4  E5 灵魂信补 8 型 → 14/29 覆盖 80% 流量
W4-W5  E6 月报续费 + 立夏节气年中报
W5-W6  E1 v2（扑克/聚会 +2 套）+ LLM 试点种子
W6-W7  E3 双人灵魂同步局 v1 + XHS 裂变战役
W8-W9  E4 LLM 主神化身（仅织女灰度）
W9-W10 E8 八字轻接入（生日 → 当日加成）
W10-W12 E5 全 29 型 + Sigil v2 + 周年营销储备
后续轮 E7 塔罗师 marketplace
```

### 4.3 TAM / SAM / SOM

| 层 | 假设 | 估算 |
|---|---|---|
| TAM | 18-35 岁中国女性 ≈ 1.2 亿 / ARPU ¥120/年 | **¥144 亿/年** |
| SAM | XHS+抖音活跃且接受高审美中文神秘学 ≈ 1500 万 | **¥18 亿/年** |
| SOM (1-3 年) | 12 周 30 万 MAU；24 月 200 万 MAU；ARPU ¥80 | **¥1.6 亿/年** |

### 4.4 渠道评估

| 渠道 | LTV:CAC | 回收 | 决策 |
|---|---|---|---|
| XHS 内容 / KOC | 5:1 | 3-6 月 | **Scale** |
| 双人卡裂变（K=0.6） | ∞ | 即时 | **Scale** |
| XHS 信息流 | 2.5:1 | 9-12 月 | Optimize |
| 抖音 KOL | 1.8:1 | 12-18 月 | Optimize / Kill v1 |
| 微信社群 SCRM | 4:1 | 6 月 | Scale |
| B 站长视频 | 3:1 | 6-9 月 | Scale 选择性 |
| SEO（galaxy 72 张已落） | 8:1 | 12 月 | Scale 协同 |
| 应用商店投放 | <2:1 | >18 月 | Kill |

---

## Phase 5 · Stakeholder 对齐

### 5.1 Working Backwards 新闻稿（设想 W12 上线日）

> **WTFTI 推出「mysti 灵鉴」全面升级：让 25-35 岁中文女性每天 90 秒拥有一位专属女祭司**
>
> 神秘学不必廉价，预测不必迷信，陪伴可以美得像一本书。今天，WTFTI 平台正式发布 mysti 灵鉴 v2.0：将塔罗、八字、星盘、心理测评与个人灵魂档案融合在一起的「私人女祭司 OS」。
>
> **她们的困境**：每天面临大小决策——今晚要不要赴约？面试穿什么？这段关系还要走多远？市面上要么是 30 元一张的塔罗 APP，要么是 99 元等三天的人工解牌，没有一款能在 90 秒内、以她接受的审美、给她一句既智慧又温柔的回答。
>
> **mysti 的回应**：用户在 mysti 用 90 秒抽 3 张牌，得到一张可截屏的「决策快卡」——背景是暮光博物馆色调，前景是她本命主神化身写给她的一句金句。每次抽牌自动写入「灵魂档案时间轴」，月底自动生成专属「Sigil 灵魂印记」。
>
> **创始人 quote**：*"我们不做算命，我们做的是把一个 25 岁女孩每天的犹豫，翻译成她自己也愿意截屏的一句诗。"*
>
> **数据支持**：内测 6 周，30 天留存 47%，付费转化 8.2%，单用户日均 3.1 张可截屏卡，XHS 自然爆款 12 篇（最高 8.7 万赞）。

### 5.2 内部 deck 大纲

1. 一句话定位 · 2. 为什么是现在 · 3. Persona+JTBD · 4. W1-W6 现状 · 5. OST 三机会 · 6. POC 三件套 · 7. 12 周 Roadmap · 8. TAM/SAM/SOM · 9. 渠道漏斗 · 10. 风险/合规 · 11. 资源需求 · 12. 决策清单

---

## Phase 6 · 执行计划（W1-W2 首 sprint）

### 6.1 Epic E1 拆解

按场景：约会前 / 面试前 / 出行前 / 聚会前 / 牌桌前
按用户操作：选场景 → 抽 3 牌 → 看快卡 → 截屏/分享/存档
按状态：未登录单次免费 / 已登录无限 / 月报订阅者无广告

### 6.2 W1-W2 首 sprint User Stories

```
S1 · 场景选择
As 一个犹豫今晚要不要赴约的用户
I want 在 mysti 首页看到「今日场景」入口
So that 不用先思考怎么提问就能进入抽牌
AC:
- [x] 5 个场景图标使用 Editorial Atelier 罗马数字章节徽章
- [x] 选中后跳转 /mysti/decision/[scenario]/
- [x] 未登录可用 1 次/日；第 2 次起需登录或付费
- [x] 埋点：mysti_decision_entry / mysti_decision_pick / mysti_decision_share

S2 · 抽 3 牌仪式
As 上述用户
I want 看到 3 张暮光牌背，触摸抽出
So that 这是一次仪式不是按按钮
AC:
- [x] 复用 themes-v2 twilight；牌背 gold-leaf 烫金
- [x] hold 0.6s 抽出（带 haptic on iOS where available）
- [x] 翻转 1.2s + Stardust 粒子；prefers-reduced-motion 跳过

S3 · 决策快卡生成
As 上述用户
I want 一张含 3 牌 + 一句金句 + sigil 角章的可截屏卡
So that 我可以截屏发 XHS
AC:
- [x] 金句来自 src/lib/mysti/decision-quotes.ts（每场景 ≥ 30 句）
- [x] 选句逻辑：场景 + 3 牌方位 + 用户主神（fallback 通用）
- [x] 卡片 1080×1920 可下载 PNG / 原生分享
- [x] OG 路由 /mysti/decision/[scenario]/og 静态分享卡

S4 · 写入灵魂档案
AC:
- [x] localStorage `mysti-decision-log`（数组，capped 100 条）
- [x] /mysti/archive/ 时间轴新增 decision 类型条目（与 dual / mood 共栏）
- [x] Supabase 持久化留 W3 与 dual_pairs 一起做

S5 · 仅供参考心理免疫层
AC:
- [x] 文案：「灵鉴所述仅为暮光时分的隐喻 · 决定权永远在你手里」
- [x] 字号 10px / opacity 0.55 / 衬线斜体
- [x] 同样存在于双人卡 / 月报 / sigil
```

### 6.3 内容护栏（合规）

1. **不做硬预测**：「可能 / 倾向 / 暮光告诉你 / 隐喻」语法；禁用「一定 / 必将 / 注定」。
2. **不做凶事**：八字/紫微/西占只解释性格倾向 + 加成，不解读寿元/婚煞/病灾。
3. **LLM 风控**：硬塞「角色：织女女祭司 / 不解释疾病金钱具体数字 / 答复 ≤ 80 字 / 中性温柔 / 见极端情绪引导专业心理求助」。
4. **未成年防火墙**：注册年龄声明 + 18- 仅可见免费日卡。
5. **截屏防封**：「算命 / 占卜」硬词替换为「灵鉴 / 暮光 / 隐喻 / 主神回信」。

### 6.4 现状 → 升级映射（不破坏既有架构）

| 现有资产 | 升级动作 |
|---|---|
| `src/app/mysti/page.tsx` | 重排：决策快卡上提为 Hero，6 个二级入口降为「我的圣殿」抽屉 |
| `themes-v2.ts` | 保留；sigil 用「暮光 + 金箔 + 暗面紫」 |
| `soul-letters/` | 优先补关系类 7 + 成长类 4 = 17 型 |
| `dual-archive.ts` | W3 重构为 `archive.ts`（单+双统一） |
| `gacha.ts` | 改名「神侍召唤」嵌入主神升级线 |
| `gift-card.ts` | v2 加自定义私语 + 节气营销 |
| `payment-store.ts` | 新增 SKU：`decision-pack` ¥4.9（场景包 30 天）/ `sigil-yearly` ¥39 |

---

## 反模式自检

| Anti-pattern | 风险 | 对策 |
|---|---|---|
| Solution-first | "做 LLM 吧" 跳过 problem framing | 先 E1 场景卡，LLM W8+ |
| Feature factory | 已 6 二级入口 | 入口数封顶 7；新功能必须替换或归并 |
| No validation | LLM/双人实时 投入大 | E1 内测 6 周用真用户 ROI 验证后再决策 |
| Generic positioning | "面向所有" | 锁死 25-35 中文女性 + 决策时刻 |
| Vanity metrics | PV 高但留存差 | D7/D30/截屏数/双人裂变率替代 |

---

## W1-W2 实施快照（2026-04-21 落地）

- **新增** `src/lib/mysti/decision-quotes.ts` — 5 场景 × ≥ 30 句金句池 + 场景元数据
- **新增** `src/lib/mysti/decision-log.ts` — localStorage decision 时间轴
- **新增** `src/app/mysti/decision/page.tsx` — 场景 hub（罗马数字徽章）
- **新增** `src/app/mysti/decision/[scenario]/page.tsx` + `MystiDecisionClient.tsx` — 抽牌仪式 + 快卡
- **新增** `src/app/mysti/decision/[scenario]/opengraph-image.tsx` — 静态 OG（每场景一张）
- **修改** `src/app/mysti/page.tsx` — Hero 上方插入「今日决策」5 场景入口
- **新增** `mysti_decision_entry / mysti_decision_pick / mysti_decision_share / mysti_decision_archive` 4 个埋点

> 下一站：W2 拉 5 位 KOC 定性 + AB（决策卡 vs 当前 hero 直跳）→ 数据决定是否进 W3 Sigil。
