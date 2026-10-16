# Her Voice 战略升级研究：AI 时代的女性共建社区

> Owner: Product Strategy
> Status: Strategic Research
> Priority: P0
> Date: 2026-05-05
> Scope: `/her-voice/` · HERMOSA 她说 · WTFTI women-first community layer
> Framework: Product Strategy Canvas · JTBD · HERTI benchmark · XHS content loop · feminist product safety

---

## 0. 一句话结论

Her Voice 不应该继续只是「留言墙」。它要升级成 WTFTI 的女性共建中枢：

> **把每个女性用户写下的话、正在读的书、想学的 AI、遇到的偏见与自救经验，经过 AI 辅助整理和人工精选，转化为可保存、可学习、可传播、可持续累积的女性知识资产。**

HERTI/Rheaa 最新的两条小红书动作证明了一件事：她们已经不只是做测试，而是在做「女性声音 -> 公共资产」的内容飞轮。

WTFTI 要赢，不能只做一个更好看的墙，而要做成更完整的循环：

```
测试结果触发共鸣
  -> 用户贡献一句话 / 一本书 / 一个 AI 问题 / 一段经验
  -> AI 聚类、去重、标注主题
  -> 编辑精选生成壁纸、书单、AI 学习卡、女性主义概念卡
  -> 小红书 / 微信传播
  -> 新用户回到 WTFTI 测试与 Her Voice 共建
```

这不是「抄 HERTI」，而是把 HERTI 已验证的共建机制升级为一个 AI-native、可持续运营、可产品化的女性社区基础设施。

---

## 1. 研究输入与事实校准

### 1.1 竞品新信号，2026-05-05 抓取

| Source | 观察到的事实 | 产品含义 |
|---|---|---|
| 小红书笔记：`67,765 位女性写下的文字，我们做成了壁纸` | 共鸣墙积累 67,765 条女性留言；筛选文字做成 21 张手机壁纸，对应 HERTI 女性人格 | HERTI 已把 UGC 变成可保存资产，不再只是结果页截图 |
| 小红书笔记：`885本女性在读的书，就是我们女性主义的践行` | 534 位用户贡献藏书，形成 885 本书、2536 次提及的榜单；鼓励用户继续围绕书名写摘抄/书评/感想 | 她们把「阅读」做成低门槛女性主义实践，并引导持续贡献 |
| `https://herti.app/` | 当前站点仍显示 `16 位女性 · 20 道题 · 约 5 分钟`，代码中是 16 位女性、5 维向量、马氏距离匹配、结果含 mirror/opposite | 公开站点与小红书运营层可能不同步；XHS 社区层已经先于产品站迭代 |
| OpenAI 2025 ChatGPT usage research | 到 2025 年中，ChatGPT 用户性别差距显著缩小；多数使用集中在实用指导、信息获取、写作和日常任务 | 女性 AI 学习与日常 AI 使用有巨大窗口，Her Voice 可以承接「我怎么用 AI」的实践分享 |
| UNESCO AI gender equality research | 女性在 AI 技术岗位、AI 研究者、开发者中仍明显不足；LLM 也会放大性别刻板印象 | Her Voice 必须做「女性 AI 能力建设 + AI 偏见识读」，不能只做情绪表达 |
| WEF 2025 gender gap research | 全球性别平等仍需长期推进，AI 行业机会与风险同时存在 | 产品叙事要从「女性情绪」升级到「女性参与新时代生产力」 |

### 1.2 本地 Her Voice 现状

当前仓库已有一个可用但偏轻量的 HERMOSA 系统：

| Surface | 已有能力 | 关键文件 |
|---|---|---|
| 主墙 | `/her-voice/` 展示瀑布流、按宇宙与标签筛选、写留言、共鸣 +1 | `src/app/her-voice/HerVoiceContent.tsx` |
| 结果页入口 | 各测试结果页可嵌入留言入口，提交后生成黑板字报卡 | `src/components/hermosa/HermosaInputCard.tsx` |
| 分享卡 | Next OG 生成 1080×1350 黑板字报 | `src/app/api/hermosa/card/route.tsx` |
| 数据层 | Supabase 表：`hermosa_messages`，字段包括 universe、slug、text、signature、tags、echo_count、featured、status | `db/migrations/2026-04-20_hermosa_messages.sql` |
| 管理台 | 统计标签、精选、隐藏、标记、处理状态 | `src/app/admin/hermosa/AdminHermosaContent.tsx` |
| 产品闭环 | 「她说我们听见了」公开看板，展示 heard / planned / shipped | `src/app/her-voice/we-heard-you/page.tsx` |

现状判断：

- Her Voice 已有「写 -> 展示 -> 共鸣 -> 精选 -> 产品状态」的基础链路。
- 但它还没有「主题征集 -> 聚合数据 -> 生成公共资产 -> 反向传播」的强飞轮。
- 现有标签偏反馈与情绪，缺少书单、AI 学习、女性主义概念、职业/学业经验等结构化贡献类型。
- 现有分享卡是单条内容卡，尚未形成「周榜 / 壁纸包 / 书单榜 / AI 学习卡」等集合型传播资产。

---

## 2. HERTI 产品飞轮拆解

HERTI 的领先点不是测试本身，而是一个非常聪明的社区运营协议。

### 2.1 它的五步飞轮

| Step | HERTI 做法 | 用户心理 |
|---|---|---|
| 1. 给身份 | 16/21 位女性人格，借历史女性提供精神锚点 | 「我不是孤立的，我属于一条更长的女性谱系」 |
| 2. 让用户写 | 共鸣墙、评论、书单征集 | 「我也可以把自己的经验放进去」 |
| 3. 公布总量 | 67,765 条留言、885 本书、2536 次提及 | 「这不是小圈子，是很多女性一起完成的事」 |
| 4. 生成资产 | 壁纸、榜单、书名标签、人物科普笔记 | 「我的文字可能变成公共记忆」 |
| 5. 再征集 | 继续写书评、摘抄、感想、下一位女性 | 「我回来还有事可做」 |

### 2.2 HERTI 当前强项

- **情绪定位极准**：不是「女性励志」，而是「女性被历史托举」。
- **贡献门槛极低**：一句话、一本书、一个书名都可以参与。
- **总量叙事强**：大数字让普通贡献变成共同体证据。
- **素材形态适合小红书**：壁纸、书单、人物卡天然可收藏。
- **AI 辅助开发叙事**：`Created by Rhea & Claude` 让用户感到这是新时代女性创作方式本身。

### 2.3 HERTI 可被超越的弱点

| Weakness | Why it matters | WTFTI 机会 |
|---|---|---|
| 单主理人/单 IP 运营瓶颈 | 人工精选会越来越重，扩容慢 | 用 AI 聚类 + 人工精选，做半自动策展流水线 |
| 贡献类型仍偏文学/阅读 | 学 AI、职业成长、权利意识、工具实践还没被产品化 | Her Voice 可以占住「AI × 女性主义 × 实践知识」 |
| 站点与社区层割裂 | 小红书在进化，网页产品未必同步 | WTFTI 可把站内贡献、测试结果、个人档案、分享卡统一 |
| 用户贡献权益不清晰 | 文本变壁纸涉及授权、署名、撤回 | Her Voice 从一开始建立 consent 与 attribution 机制 |
| 缺少个人回流资产 | 用户贡献后很难拥有自己的历史、收藏、学习路径 | WTFTI 已有 profile / card / library 基础，可做个人「她说档案」 |

---

## 3. Product Strategy Canvas

### 3.1 Vision

Her Voice 的愿景：

> **让中文互联网女性在 AI 时代不只是被算法观看，而是用自己的文字、知识和工具实践共同建设一个可被继承的女性知识共同体。**

价值观：

- 女性是主体，不是被观察样本。
- AI 是放大器，不是替代者；AI 负责整理，人负责判断和署名。
- 女性主义不是口号，而是日常学习、表达、互助、生产力与经济参与。
- 社区不是吵闹广场，而是可沉淀的公共笔记本。

### 3.2 Market Segments

按问题而非人口属性划分：

| Segment | JTBD | Pain | Why first |
|---|---|---|---|
| S1 自我探索型女性用户 | 想被认真看见，并找到同频女性 | MBTI 太冷，普通测试太闹，HERTI 有共鸣但回流少 | 已经是 WTFTI / SoulTI / HERTI 共同核心用户 |
| S2 AI 学习焦虑者 | 想开始用 AI，但不想被技术黑话吓退 | 男性技术叙事强、教程不贴近日常任务、不知道问什么 | OpenAI/Pew 数据说明 AI 正在进入日常学习与工作，此时教育窗口最大 |
| S3 女性主义轻实践者 | 想读书、写作、理解概念、参与共建，但不想进入高冲突社区 | 社媒女权内容容易对立，知识资料分散 | HERTI 书单已验证「阅读即实践」的低摩擦参与方式 |
| S4 女性创作者 / KOC | 想把自己的主题、书单、经验变成可传播内容 | 手动做图、整理留言、维护社群成本高 | WTFTI 长期 UGC 平台战略可承接 |

第一优先段：

> **S1 + S2 的交集：已经喜欢 WTFTI/HERTI 式自我探索，同时想学 AI、想知道女性如何进入新时代生产力的 20-35 岁中文女性。**

理由：她们既有共鸣需求，也有学习需求，最容易从「一句话贡献」升级到「AI 实践贡献」。

### 3.3 Relative Costs

Her Voice 不走低成本工具路线，而走高信任、高审美、高策展的 premium community route。

成本定位：

- 比普通留言墙成本高：需要审核、精选、数据结构、视觉资产生成。
- 比纯人工社区成本低：AI 聚类、去重、摘要、标签建议、书籍标准化、提示词清洗。
- 相对 HERTI 的优势：HERTI 很强但更依赖人工运营；WTFTI 可以用产品系统把运营动作标准化。

### 3.4 Value Proposition

#### S1 自我探索用户

- What before：做完测试，感动一下，截图，然后结束。
- How：结果页直接引导写「她说」；系统把她的声音放进同型人格墙、主题墙、周精选。
- What after：她不只是测出一个人格，而是在一个女性共同体中留下痕迹。
- Alternatives：HERTI 共鸣墙、豆瓣小组、小红书评论区、朋友圈。

#### S2 AI 学习焦虑者

- What before：想学 AI，但教程技术味太重，不知道该问什么、怎么开始。
- How：Her Voice 提供「女性 AI 问题墙」「AI 实践卡」「7 天 AI 小练习」；用户可贡献真实场景，例如求职、阅读、写作、维权信息整理、学习计划。
- What after：她从「AI 旁观者」变成「AI 日常使用者」，且能看到其他女性怎么用。
- Alternatives：B 站教程、公众号课、ChatGPT 自学、知识星球。

#### S3 女性主义轻实践者

- What before：想理解女性主义，但公共讨论常常高冲突，书太多不知道从哪本开始。
- How：Her Voice 把书单、摘抄、概念、问题、生活经验组织成可浏览、可收藏、可分享的知识卡。
- What after：她从「立场焦虑」进入「具体学习」。
- Alternatives：豆瓣书单、女性主义公众号、小红书书单、播客。

#### S4 女性创作者/KOC

- What before：她们能发观点，但很难把评论区变成可复用产品。
- How：Her Voice 提供征集模板、共建榜单、壁纸/书单/AI 卡生成器、署名与贡献榜。
- What after：她们把粉丝互动变成知识资产和可持续内容栏目。
- Alternatives：手动整理评论、Notion、飞书表格、小红书合集。

### 3.5 Trade-offs

Her Voice 明确不做：

- 不做无边界陌生人论坛；MVP 只做结构化贡献、精选、共鸣，不开放自由评论互怼。
- 不做 AI 代替用户写「女性声音」；AI 只做整理、分类、摘要、辅助生成视觉资产。
- 不做未经授权的用户文字商业化；壁纸/合集必须有明确 consent。
- 不做泛泛情绪树洞；每条贡献至少落入一个资产类型：观点、书、AI 实践、问题、经验、产品建议。
- 不做「女性主义正确答案」裁判；做概念解释、阅读路径、不同立场的安全并置。
- 不在早期做复杂私信/群聊；先用轻社交的共鸣、收藏、贡献榜、周报建立信任。

### 3.6 Key Metrics

North Star Metric：

> **每周被保存/分享/二次贡献的女性共建知识资产数。**

资产定义：壁纸、书单卡、AI 实践卡、女性主义概念卡、周精选、同型声音卡。

Quarterly OMTM：

> **Her Voice 有效贡献率 = 有效贡献数 / 进入 Her Voice 入口的 UV。**

目标建议：

| Stage | Target |
|---|---|
| MVP 首月 | 贡献率 >= 5%，精选率 >= 15%，精选资产保存/分享率 >= 20% |
| 第 2 月 | 每周稳定 3 个主题资产包，站内贡献 >= 500 条/周 |
| 第 3 月 | 小红书自然提及 >= 50 条/月，至少 1 个资产包破圈 |

辅助指标：

- `contribution_submit_rate`
- `contribution_valid_rate`
- `artifact_generated_count`
- `artifact_save_click_rate`
- `artifact_share_click_rate`
- `returning_contributor_rate`
- `ai_lab_challenge_completion_rate`
- `book_added_count`
- `book_mention_count`
- `consent_opt_in_rate`

### 3.7 Growth

增长模型：Product-Led + Community-Led + XHS Content-Led。

主渠道：

- **站内测试结果页**：Her Voice 输入卡是最强触发点，情绪刚产生时最愿意写。
- **小红书资产包**：壁纸、书单、AI 学习卡、女性主义概念卡。
- **微信/朋友圈保存图**：低冲突、可私密传播。
- **周报/邮件/站内 inbox**：把贡献者拉回来看「你的话进入了哪一期」。
- **创作者共建**：邀请女性博主发起主题征集，例如「100 位女生第一次用 AI 做了什么」。

飞轮：

```
测试完成 -> 写一句话
  -> 被精选进入主题资产
  -> 资产在 XHS/微信传播
  -> 新用户进入 Her Voice
  -> 做测试 / 加入 AI 小练习 / 贡献书单
  -> 形成下一期资产
```

### 3.8 Capabilities

需要建设的能力：

| Capability | Build / Partner | Notes |
|---|---|---|
| 结构化贡献系统 | Build | 在 `hermosa_messages` 上扩展类型与 metadata |
| AI 聚类/摘要/标签建议 | Build | 先后台半自动，避免前台 AI 幻觉 |
| 书籍标准化 | Partner/Build | 初期手动 + 豆瓣/开放数据备选；注意版权与 API 可用性 |
| 视觉资产生成器 | Build | 复用 Next OG / share generator，做集合型资产 |
| consent / attribution | Build | 投稿授权、署名、撤回、匿名策略 |
| 社区治理 | Build | 关键词、人工审核、争议话题降温、举报 |
| XHS 运营 SOP | Build | 每周主题、首图、标题、评论引导、复盘 |
| 女性主义内容审核 | Build | 复用 `feminist-copy-checklist.md`，加 AI bias checklist |

### 3.9 Can't / Won't

竞争者不容易复制的地方：

- WTFTI 的多宇宙结果身份可以天然触发同型声音墙，HERTI 需要补多产品架构。
- Her Voice 已有 Supabase、结果页入口、分享卡、后台、公开状态看板，升级成本低。
- AI 学习 + 女性主义 + 人格图鉴的交叉定位更宽，HERTI 当前更像文学/历史女性人格 IP。
- 贡献资产一旦积累，会形成「女性文字/书籍/AI 实践」的社区知识图谱，越用越难迁移。
- 署名、精选、贡献历史、个人档案会形成情感 switching cost。

---

## 4. Her Voice V2 产品架构

### 4.1 从留言墙到五个资产馆

| 馆 | 用户贡献 | 平台产出 | 传播物 |
|---|---|---|---|
| 她的声音墙 | 一句话、宣言、故事、情绪片段 | 同型声音墙、周精选、共鸣榜 | 壁纸、长图、人格声音卡 |
| 她的书架 | 书名、作者、摘抄、读后感、适合谁读 | 女性书单榜、人格书单、主题阅读路径 | 9 宫格书单、年度女性阅读地图 |
| 她的 AI 练习室 | AI 问题、prompt、使用场景、踩坑记录 | AI 小练习、场景卡、提示词包、偏见识读卡 | 「女生第一次用 AI」系列 |
| 她的概念笔记 | 女性主义概念、困惑、反例、生活场景 | 概念解释卡、争议词典、阅读路径 | 概念卡、问答卡 |
| 她的产品共建 | 功能建议、体验吐槽、想要内容 | We Heard You 看板、roadmap 信号 | 产品共建榜、已上线回访 |

### 4.2 站内主路径

#### Path A：结果页后 30 秒

1. 用户测完 WTFTI/SoulTI/XPTI。
2. 结果页出现 Her Voice 输入卡，不再只问「想说什么」，而是给 3 个入口：
   - 写一句此刻的你。
   - 推荐一本此刻的你会读的书。
   - 写一个你想用 AI 解决的真实问题。
3. 提交后即时生成个人字报，并展示同型姐妹的 3 条贡献。
4. 如果用户同意精选，进入公共池。

#### Path B：Her Voice 首页

首页不应再是简单墙，而是一个「今日共建仪表盘」：

- 今日主题：例如「你第一次被一本书救到，是哪一本？」
- 本周数字：贡献数、书籍数、AI 问题数、精选数。
- 三个主入口：声音、书架、AI 练习室。
- 本周资产：壁纸包 / 书单榜 / AI 卡。
- We Heard You 产品闭环入口。

#### Path C：小红书回流

小红书用户看到：

- 「873 位女生的 AI 入门问题，我们整理成了 30 张练习卡」
- 「本周 529 位女性提到的书，排第一的是...」
- 「她们写下的 21 句话，被做成了手机壁纸」

点击回站内后落到对应资产页，而不是首页。

---

## 5. MVP 方案：30 天内验证

### 5.1 MVP 名称

**Her Voice Commons · 她说共建馆**

### 5.2 MVP 三个核心功能

#### F1. 主题征集

每周一个主题，固定三类：

- Voice：一句女性视角的话。
- Book：一本正在读/影响过你的书。
- AI：一个你想用 AI 解决的问题或已经用 AI 做成的小事。

#### F2. 后台 AI 策展助手

后台半自动，不直接前台出结论：

- 自动去重、聚类、主题标签。
- 识别高风险内容：隐私、联系方式、仇恨、未成年人、医疗/法律高风险。
- 生成候选标题、摘要、top themes。
- 给编辑推荐可做成壁纸/书单/AI 卡的候选内容。

#### F3. 集合型资产生成

每周产出至少 3 类资产：

- 9 张「她说壁纸」
- 1 张「她的书架榜单」
- 9 张「AI 小练习卡」

### 5.3 最小数据模型扩展

在 `hermosa_messages` 基础上新增字段或新表 `hermosa_contributions`：

| Field | Type | Purpose |
|---|---|---|
| `kind` | enum | `voice` / `book` / `ai_practice` / `question` / `concept` / `feedback` |
| `metadata` | jsonb | 书名、作者、ISBN、AI 工具、prompt、场景等 |
| `topic_week` | text | `YYYY-Www` |
| `curation_status` | enum | `new` / `shortlisted` / `selected` / `published` / `rejected` |
| `consent_to_feature` | boolean | 是否同意进入公开精选/壁纸/合集 |
| `attribution_mode` | enum | `anonymous` / `signature` / `profile` |
| `safety_level` | enum | `safe` / `review` / `blocked` |
| `artifact_ids` | uuid[] | 被纳入哪些资产 |

### 5.4 首批主题建议

| Week | Theme | Why it can spread |
|---|---|---|
| W1 | 100 位女生第一次用 AI 做了什么 | AI + 女性实践，立刻区别于 HERTI |
| W2 | 影响你女性意识的一本书 | 对标 HERTI 书单，但可做得更结构化 |
| W3 | 写给同型人格姐妹的一句话 | 复用现有测试结果入口 |
| W4 | AI 有没有让你更自由一点 | 女性主义 + AI 价值观讨论，适合做概念卡 |

---

## 6. 如何做得比 Rheaa/HERTI 更好

### 6.1 不只「保存」，还要「学习」

HERTI 把文字做成壁纸，已经很强。但壁纸偏情绪资产。

Her Voice 要多一层学习资产：

- 每张壁纸背后关联一个概念或书籍。
- 每个书单关联 3 个入门问题。
- 每个 AI 练习卡给出可复制 prompt 和使用边界。
- 用户可以把资产保存到自己的 WTFTI Library。

### 6.2 不只「女性历史」，还要「女性未来」

HERTI 的强项是把历史中的她带回来。

WTFTI 的差异化是：

> **历史女性给你精神谱系，AI 给你新的行动工具。**

具体产品语言：

- 「她们写过的书」连接过去。
- 「我们现在写下的问题」连接当下。
- 「我们用 AI 做成的事」连接未来。

### 6.3 不只「人工精选」，还要「AI 辅助策展」

AI 不写女性声音，但可以帮助女性声音被看见：

- 从 10,000 条贡献里找出 30 个主题。
- 给相似问题合并标题。
- 找出被忽略的少数声音。
- 检查文本是否落入刻板印象。
- 把长故事摘要成可读卡片，再由人确认。

### 6.4 不只「创作者 IP」，还要「共建协议」

HERTI 强在主理人魅力。WTFTI 要建立更可规模化的协议：

- 贡献前明确授权。
- 资产发布保留匿名/署名选择。
- 每期公开贡献统计。
- 贡献者可收到「你的文字进入第 X 期」通知。
- 可撤回、可隐藏、可更改署名。

### 6.5 不只「小红书热帖」，还要「站内可回访」

每个小红书资产包都要有站内承接页：

- `/her-voice/wallpapers/2026-w18`
- `/her-voice/books/2026-w18`
- `/her-voice/ai-lab/first-100-questions`
- `/her-voice/concepts/room-of-ones-own`

HERTI 的问题是大量内容在小红书流里，站内沉淀弱。WTFTI 可以把每期资产变成 SEO 与回流入口。

---

## 7. 小红书内容打法

### 7.1 账号定位

人设关键词：

- 女性共建策展人
- AI 入门同盟
- 文学/女性主义笔记馆
- 不吵架的知识广场
- 神秘但实用

内容支柱：

1. **共建数字**：多少位女性写下/读过/问过/做过。
2. **可保存资产**：壁纸、书单、AI 练习卡、概念卡。
3. **低门槛参与**：评论/站内写一句、推荐一本书、提交一个 AI 问题。

### 7.2 10 条首发选题

| # | 标题方向 | 内容结构 |
|---|---|---|
| 1 | 100 位女生第一次用 AI，原来都在问这些 | 统计 -> 9 类问题 -> 邀请补充 |
| 2 | 不是教程：这是给女生的 AI 入门问题清单 | 痛点 -> 问题卡 -> 站内共建 |
| 3 | 这些话不是文案，是她们真的写下的 | 声音墙精选 -> 壁纸包 -> 署名机制 |
| 4 | 你最近在读哪本书？我们想做一面女性书架 | 征集 -> 示例 -> 下期榜单 |
| 5 | 女性主义不是很远，它可能是你今天问 AI 的方式 | 场景 -> prompt -> 偏见提醒 |
| 6 | 不是所有温柔都应该被歌颂 | 概念卡 -> 生活例子 -> 讨论 |
| 7 | 如果 AI 把女性写成家庭角色，我们该怎么改 prompt | UNESCO bias 信号 -> 实操改写 |
| 8 | 做完人格测试后，她们没有离开，而是写下这些 | 测试结果 -> 同型声音 -> 入口 |
| 9 | 这 9 句话适合当手机壁纸，也适合当今天的底气 | 壁纸包 -> 贡献者 -> CTA |
| 10 | 我们想建一个女性 AI 问题库，第一期从你开始 | 公开任务 -> 贡献入口 -> 周报承诺 |

### 7.3 标题公式

- `N 位女性 + 具体动作 + 我们整理成了 X`
- `不是 X，是 Y`
- `如果你也想学 AI，先从这 X 个问题开始`
- `她们没有喊口号，只是写下了这些`
- `这不是书单，是女性主义的日常证据`

---

## 8. 风险与护栏

| Risk | Severity | Mitigation |
|---|---|---|
| 用户文字被二次使用引发不适 | High | 投稿时明确 consent；精选前可二次确认；支持撤回 |
| 女性主义内容被平台判定争议/引战 | High | 站位明确但表达具体；少用对立标签，多用学习、阅读、实践 |
| AI 生成内容稀释真实感 | High | AI 只做整理；所有前台文字标注来源和人工精选 |
| 书籍摘抄版权问题 | Medium | 只允许短摘抄；重点做书名、读后感、主题标签 |
| 个人隐私/创伤内容安全 | High | 默认不鼓励细节创伤叙述；敏感内容进入私密/审核，不做传播资产 |
| LLM 性别偏见 | High | 建立 AI bias checklist；引用 UNESCO 信号做教育内容 |
| 社区变成情绪垃圾场 | Medium | 贡献必须结构化；不做自由评论；主题周引导 |
| 运营过重 | Medium | AI 聚类 + 固定栏目模板 + 每周节奏，先少而稳 |

---

## 9. Roadmap

### Wave 0：7 天，验证共建主题

- 新增 Her Voice 首页「本周主题」区。
- 文案从「一个只让女性安静说话的声音广场」升级为「女性文字、书架与 AI 练习共建馆」。
- 新增 3 个投稿入口：一句话 / 一本书 / 一个 AI 问题。
- 后台导出 CSV 或 JSON，先人工整理第一期资产。
- 出第一期 XHS 资产：9 张壁纸 + 1 张书单征集 + 1 张 AI 问题征集。

Success check：

- 7 天内有效贡献 >= 100 条。
- AI 问题贡献 >= 30 条。
- 资产保存/点击 >= 20%。

### Wave 1：2-4 周，产品化资产生成

- 数据模型扩展 `kind` + `metadata` + `consent_to_feature`。
- 后台支持按 kind / topic_week / curation_status 筛选。
- 新增集合型 OG routes：壁纸包、书单榜、AI 练习卡。
- 新增 `/her-voice/books/` 与 `/her-voice/ai-lab/` 两个轻页面。
- 结果页 `HermosaInputCard` 提交后增加「推荐一本书 / 写一个 AI 问题」二选一 follow-up。

Success check：

- 每周 3 个资产包稳定发布。
- 二次贡献率 >= 10%。
- 结果页贡献率 >= 5%。

### Wave 2：4-8 周，AI 辅助策展

- 接入后台 AI 聚类、摘要、标题建议。
- 建立 AI bias / feminist copy 自动检查草案。
- 发布「女性 AI 问题库」第一版。
- 做「同型人格书架」和「同型 AI 练习」。

Success check：

- 编辑每周策展耗时下降 50%。
- 站内回访贡献者 >= 20%。
- XHS 自然提及开始出现。

### Wave 3：8-12 周，共建社区护城河

- 个人「我的她说档案」：贡献、精选、收藏、书架、AI 练习进度。
- 贡献者徽章：First Voice、Book Keeper、AI Starter、Concept Builder。
- 创作者主题征集工具：让 KOC 发起自己的 Her Voice 主题。
- 周报/邮件/站内 inbox：通知用户贡献进入精选。

Success check：

- 返回贡献者占比 >= 25%。
- 每月 1 个外部创作者共建主题。
- 至少 1 个主题资产包在 XHS 破圈。

---

## 10. 关键假设与低成本实验

| Hypothesis | Test | Pass signal |
|---|---|---|
| 女性用户愿意在测试结果后贡献更结构化内容 | 结果页新增「写一句 / 推荐书 / AI 问题」三入口 A/B | 结构化入口贡献率不低于当前留言入口 80% |
| AI 学习是 Her Voice 的差异化抓手 | 发起「100 位女生的 AI 问题」征集 | 7 天 >= 100 条问题，且 XHS 评论有补充 |
| 集合型资产比单条字报传播更强 | 同期发布 9 张壁纸包 vs 单条字报 | 资产包保存/分享 >= 单条 2x |
| 用户接受 AI 辅助整理 | 在资产页标注「AI 聚类，人工精选」 | 负面反馈 < 5%，信任反馈可控 |
| 贡献者在被精选后会回访 | 精选通知/站内提示 | 被精选用户 7 日回访 >= 30% |

---

## 11. Strategy Coherence Check

| Strategy element | Coherence |
|---|---|
| Vision | AI 时代女性知识共同体，不只是情绪社区 |
| Segment | 先抓自我探索 + AI 学习焦虑交集人群 |
| Value | 把真实声音变成可保存、可学习、可传播资产 |
| Trade-off | 放弃重论坛，先做结构化轻社区 |
| Growth | 站内结果页触发 + XHS 资产传播 + 周期回流 |
| Capability | AI 整理 + 人工精选 + 视觉资产生成 + consent |
| Defensibility | 多宇宙身份、贡献图谱、个人档案、社区知识资产 |

结论：Her Voice V2 的核心不是「我们也有共鸣墙」，而是：

> **HERTI 让女性看见自己和历史相连；Her Voice 要让女性看见自己可以与 AI 时代相连，并一起建设下一代女性知识库。**

---

## Sources

- 小红书 · Rheaa：`67,765 位女性写下的文字，我们做成了壁纸`，抓取于 2026-05-05：`https://www.xiaohongshu.com/discovery/item/69f1b754000000002301c9eb`
- 小红书 · Rheaa：`885本女性在读的书，就是我们女性主义的践行`，抓取于 2026-05-05：`https://www.xiaohongshu.com/discovery/item/69f451f70000000035025ee4`
- HERTI app，抓取于 2026-05-05：`https://herti.app/`
- OpenAI, `How people are using ChatGPT`, 2025-09-15：`https://openai.com/index/how-people-are-using-chatgpt/`
- Pew Research Center, `34% of U.S. adults have used ChatGPT`, 2025-06-25：`https://www.pewresearch.org/short-reads/2025/06/25/34-of-us-adults-have-used-chatgpt-about-double-the-share-in-2023/`
- UNESCO, `Women’s access to and participation in technological developments`：`https://www.unesco.org/en/artificial-intelligence/gender-equality`
- UNESCO, `Generative AI: UNESCO study reveals alarming evidence of regressive gender stereotypes`, 2024-03-07：`https://www.unesco.org/en/articles/generative-ai-unesco-study-reveals-alarming-evidence-regressive-gender-stereotypes`
- World Economic Forum, `Global Gender Gap Report 2025`：`https://www.weforum.org/publications/global-gender-gap-report-2025/`
- World Economic Forum, `What to know about AI and the gender gap`, 2025-06-25 / updated 2026-01-05：`https://www.weforum.org/stories/2025/06/amnc25-what-to-know-about-ai-and-the-gender-gap/`

