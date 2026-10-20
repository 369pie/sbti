# WTFTI 全局产品审计 · 2026-10-20

> 范围：www.wtfti.com 生产环境 + `origin/main@a4f67d3`（含 PR #12 一键建档、#13 断链修复）。只读审计，未改产品代码。
> 数据：prod `product_events`，窗口 2026-10-17 00:00 ～ 10-20 20:52（北京时间），只读查询。截图：iPhone 13 视口，Playwright，Mac 本地 `~/AI_Code/wtfti-audit-screens-2026-10-20/`（32 张）。
> 依据文档：`wtfti-her-refocus-2026-10.md`（定位）、`wtfti-design-system-v3-2026-10.md`（奶油日记 / 丝绒夜）。

---

## 执行状态（更新于 2026-10-21 01:10 北京时间）

| 阶段 | 状态 | PR | 内容 |
|---|---|---|---|
| 阶段 1 · 修正门 | ✅ 已上线 | #15、#16 | 首测 v3（`/test`）+ 结果页一键建档；`/start` 改测试大厅；底栏「测试 · 今日 · 我和他 · 美我 · 我」；匿名「我」可见；统一 `test_start/test_finish`；/wtfti、HOGTI 等 308；修复一次存档建 2 个匿名用户、匿名档案顶栏显示「我的档案」 |
| 阶段 2 · 合并 | ✅ 已上线 | #17、#18 | 决策 3：XPTI couple + CPTI =「我和他」（入口 `/xpti/couple/`，`test_id: wohe` + `mode`，单一双人报告付费点，CPTI SEO URL 保留并换 v3 外观，squad/stealth/gallery/leaderboard 与单人 `/cpti/test` 308）；决策 4：唯一 ¥19/月会员 `/member/`（暮光通行证并入，`/mysti/subscribe`、`/xpti/pricing`、`/cpti/pricing` 308；¥9.9 首月 / 季卡 / 年卡下线）；生产补建 `device_user_bindings` + `mysti_orders.user_id`，会员回填迁移已执行（0 行） |
| 阶段 3 · UI 统一 | ⏳ 下一步 | — | 按流量顺序换 v3：`/cpti/result/*`、`/cpti/scenarios/*`、`/cpti/relationship/*` 正式重写（目前为 token 桥接）→ `/xpti` 单人结果 → `/soulti` → `/mysti`（灵鉴命名与旧风格）→ 法务/页脚；长落地页压到 ≤3 屏 |
| 「我和他」收尾 | ⏳ 下一步 | — | CPTI 配对（`/cpti/join`、`/cpti/invite`、`pairCodeId`）与偷偷测并入「我和他」统一流程 |

---

## 0. 一页结论（TL;DR）

1. **「测试是正门」这件事在产品里其实没做到。** 首页两个主 CTA「90 秒，先测测你是谁」都指向 `/start/`，但 `/start/` **不是人格测试**，是 3 道「天气 / 一个人 / 认识·陪着·认领」的意图分流题（旧版「认识她 / 陪着她 / 写下她」三支柱文案）。做完给的不是人格结果，而是一个 pillar 标签 + 建档卡 + 跳去别的模块。
   - `first_look_finish` 目前是在 `/start` 答完 3 题时上报的（`home` 模块，`slug=pillar_X`），**所以 22–39% 的「首测完成率」量的是分流题，不是测试**。
   - 真正的「第一张牌」测试 `/test/`（FirstLookQuiz + 结果页）**首页、导航、/start 都没有入口**，4 天只有 13 台设备到过。
2. **/start 的分流有一条死循环。** Pillar I →「走进 WTFTI · 12 神性女性档案」→ `/wtfti/`（「人格神域，把你召回自己」，旧定位、旧视觉）→ 主 CTA `/wtfti/galaxy/test/` → **308 回 `/start/`**。Pillar I 次链接 `/types/` 308 回首页。Pillar II（占 70%：58/83）去 `/mysti/daily/` 塔罗，Pillar III 去树洞。**也就是说，从首页点「测一测」，没有任何一条路径能直接做完一个人格测试。**
3. **真实流量很薄，集中在少数门面。** 4 天约 800 台设备，其中 646 台（~80%）只有 1 条事件（大多是 `/start/` 的 `onboarding_start`，直接访问、无 referrer、国家以 US/NL/SG 为主，ua 未记录 → 高度疑似爬虫/预取/挂 VPN 的秒退）。有 ≥2 条事件的「真用户」约 150 台，落地页排序：`/start/` 52 · `/` 35 · `/xpti/couple/` 10 · `/cpti/result/balanced/` 9 · `/cpti/scenarios/lover/` 6 · `/test/` 5。外部来源几乎只有 Google（~50）；utm 只有 2 条 chatgpt.com。**跨日回访设备 = 3。**
4. **测试完成埋点有断层**：30 天内有完成事件的只有 SoulTI（`soulti_finish` 237）、first_look（37）、XPTI 情侣（`couple_completed` 4）、Mysti（3）。XPTI 单人、CPTI、经典 SBTI、WTFTI 主测**没有 finish 事件**，无法回答「哪个测试被做完」。
5. **视觉：只有「5 个 tab 根页 + 美我子页 + 登录」用上了 v3；所有测试本身（/start、/test、XPTI、CPTI、SoulTI、Mysti、/wtfti）都是旧风格**——也就是流量和付费真正发生的页面恰恰没统一。
6. **付费出口分散且重名**：「¥19/月 会员」（今日/美我）与 Mysti「暮光通行证 ¥19/月 起」同价两套；XPTI pricing、CPTI pricing、SoulTI 深度报告各自一套页面和文案。自 09-11 起 0 单。

**方向建议（需你拍板）**：把 WTFTI 定位从「三件事（测我/美我/懂我）并列」改为 **「一个测试 → 一份会长大的我 → 每天回来」**：测试是唯一正门和持续内容引擎，档案 / 今日卡 / 美我 / 我和他 / 塔罗全部作为「测完之后」的层，挂在测试结果上。

---

## 1. 路由 / 页面清单

`src/app` 下共 **约 250 个 page.tsx**。next.config 已把 28 个前缀 308 掉（`bird flower fanrenti work drunk love identify daily cp jueti squad rank combo puzzle gacha banti card` → `/start/`；`creator ugc c lingjian her-books her-wealth weekly theory guide share-templates types` → `/`；`her-voice` → `/bottle/`；`wtfti/kings|delta|feng|galaxy` → `/start/`）。源码仍在盘上（约 110 个页面是死代码）。

状态：curl 生产（2026-10-20 21:30 北京时间）。流量：去重设备数，10-17～10-20，事件 pathname（含 1 事件设备）。

### 1.1 主线页面（live）

| 路由 | 用途 | 导航/首页入口 | 状态 | 设备数 | 视觉 |
|---|---|---|---|---|---|
| `/` | 首页 v3（奶油日记） | logo | 200 | 231 | ✅ 一致（基准） |
| `/start/` | 3 题意图分流 + 建档卡（**非人格测试**） | 首页主 CTA×2、tab「测我」、/today CTA | 200 | 417（多为 1 事件） | ❌ 旧风格 |
| `/test/` | 「第一张牌」10 题 first look 测试 | **无**（仅 SoulTI/XPTI 页脚、结果页重测） | 200 | 13 | ❌ 旧风格 |
| `/test/classic/` | 经典 SBTI 46 题 | 仅 /test 结果页小字 | 200 | — | ❌ 旧 |
| `/test/result/[slug]/` | first look 结果 | — | 200 | — | ❌ 旧；含 `/card/`、`/types/` 链接（均 308） |
| `/today/` | 今日卡 + streak（未登录为引导） | tab「今日」 | 200 | 52 | ⚠️ 部分（见 §2） |
| `/mirror/` + `palm/color/face` | 美我 hub + 掌纹 / 色彩季型 / 脸型 | tab「美我」 | 200 | 19 / 2 / 2 / 2 | ✅ 一致 |
| `/mirror/atelier/` | 「灵镜 Atelier」换装 | 美我 hub | 200 | — | ❌ 旧（Cormorant、灵镜命名） |
| `/mirror/challenge/`, `/mirror/leaderboard/` | 挑战 / 排行 | 美我 hub | 200 | — | 未截图，疑旧 |
| `/bottle/` | 懂我 · 树洞 | tab「懂我」 | 200 | 41 | ⚠️ 部分 |
| `/me/`, `/me/library/` | 我的（未登录 → /auth/login） | tab「我的」 | 200 | — | ⚠️ 未登录无内容；含 `/creator/studio`、`/types`、`/card` 死链 |
| `/auth/*` | 登录/注册/找回 | header | 200 | 10（register） | ✅ |
| `/about/ /privacy/ /terms/ /contact/` | 法务 | 页脚 | 200 | — | ❌ 旧 |

### 1.2 测试宇宙（live，但不在导航；靠 SEO / 分享直达）

| 前缀 | 页面数 | 关键页 | 设备数 | 视觉 | 备注 |
|---|---|---|---|---|---|
| `/xpti/` | 11 | 落地、test、result/[type](/deep)、**couple 我和他**、couple result/poster、archive、pricing、theory、whitepaper | couple 21、archive 4、theory 5 | ❌ 旧（XPti 品牌字、长页 6300px） | 历史第一付费（xpti-couple-report）；`/xpti/couple/` 是第 3 大落地页 |
| `/cpti/` | 21 | 落地、test、result/[type]、relationship/*、scenarios/*、pricing、gallery、leaderboard、squad、stealth、invite/join、me/* | result/balanced 23、scenarios/lover 16、其它 SEO 长尾 ~40 | ❌ 旧 | **第二大自然流量来源**（Google 长尾），但 CPTI 不出现在首页/导航/「我和他」叙事里 |
| `/soulti/` | 11 | 落地「深夜的你需要 8 分钟」、test、result、report/[type]、map、pair、rarity、origin、nature | ~10 | ❌ 旧 | 完成事件最多（237/30 天）；soulti-deep-mirror 历史付费 |
| `/mysti/` | 19 | 「灵鉴」落地、daily、subscribe（暮光通行证）、destiny、decision、gacha、monthly、dream、naming、sigil、star-chart、gift、seasonal、archive、collection、result | daily 15、/ 12、subscribe 7 | ❌ 旧（灵鉴/神谕室命名） | /start pillar II 的去向（70%） |
| `/wtfti/` | 约 15 live | 落地「人格神域」、test、result、daily「今日天象签」、moon、duet、letters、profile、symptoms、shrine、work | module_landing_view 实为 today/bottle/mirror 上报 | ❌ 旧（神域定位） | 主 CTA → galaxy 308 → /start 循环 |
| `/hogti/` | 4 | 霍格沃茨测试 | 0 | ❌ 旧 | 与女性向定位无关 |
| `/result/[type]/` | 1 | 经典 SBTI 结果 | — | ❌ 旧 | |
| `/u/share/[token]/` | 1 | 分享博物馆页 | — | ❌ 旧 | |
| `/admin/*`, `/cpti/admin/*` | 7 | 后台 | — | — | 应 noindex |

### 1.3 已 308、源码残留：约 110 个页面（bird / flower / fanrenti / work / drunk / love / identify / daily / cp / squad / rank / combo / puzzle / gacha / card / creator(11) / ugc / c / lingjian / her-books / her-wealth / weekly / theory / guide(4) / share-templates / types(4) / her-voice(15) / wtfti/kings|delta|feng|galaxy(12)）。

**仍指向 308 前缀的站内链接（非死代码文件内）**：`sitemap.ts`（24 处，向搜索引擎提交重定向 URL）、`Navigation.tsx`（23，旧导航组件，已不挂载）、`MystiCollectionContent`（8）、`MeContent`（5：`/creator/studio`、`/creator/apply`、`/types`、`/card`）、`WtftiLandingContent`（4 + galaxy×3）、`FirstLookResultContent`（`/card/`、`/types/`）、`StartContent`（`/types/`）、`GrowthTimeline`、`DailyTodayCTA`、`DailyCheckInCTA`、`ResultClosureEngine`（2，挂在 12 个结果页上）、`PillarBreadcrumb`、`mirror/*` → `/lingjian/`、`mysti/page` → `/lingjian/`（×3）、`about/page`。

---

## 2. UI 一致性审计（对照首页 + v3）

判定标准：v3 = `.skin-journal`/`.skin-velvet` 容器 + `s-card / s-btn / s-title / s-eyebrow / s-tape` 原语 + ZCOOL XiaoWei 标题 + 奶油底。

| # | 页面 | 评级 | 具体问题 |
|---|---|---|---|
| 01 | `/` | ✅ 一致 | 基准。「7 万+ 人来过」与实际 DAU 落差大，注意可信度 |
| 02 | `/start/` | ❌ 旧 | Cormorant 斜体 + 等宽 eyebrow「A FIELD GUIDE TO HER」，0 个 s- 原语；文案「她」第三人称、「认领 / 沙龙」旧概念；**tab bar 在此页显示，盖住选项 A**（截图中第 1 个选项被底栏遮挡）；metadata 仍写「认识她 / 陪着她 / 一起写下她」 |
| 03 | `/test/` | ❌ 旧 | 「Nº 00 FIRST LOOK / 你的第一张牌正在洗」塔罗式仪式感，与「90 秒测你是谁」承诺不一致（实际 10 题 3-4 分钟） |
| 04 | `/test/classic/` | ❌ 旧 | Noto Sans 默认样式 |
| 05 | `/today/` | ⚠️ 部分 | 主体 v3 正确；但 **body 背景是丝绒夜 `#0D081F`，页脚整块深紫**，与奶油主体断层；未登录状态对新访客展示「通知被关掉了…」提示（应只对已拒绝推送者展示） |
| 06–09 | `/mirror/` + palm/color/face | ✅ 一致 | palm 标题用 Noto Serif 非 ZCOOL（小问题） |
| 10 | `/mirror/atelier/` | ❌ 旧 | 「灵镜 Atelier」命名 + Cormorant，3900px 长页，与美我 hub 风格割裂 |
| 11 | `/bottle/` | ⚠️ 部分 | 与 /today 相同的深紫页脚断层 |
| 12 | `/me/` | ⚠️ | 未登录直接跳登录页，「我的」tab 对 99% 匿名用户是一堵墙；匿名档案（PR #12）没有在这里展示 |
| 13–17 | XPTI 落地/test/couple/archive/pricing | ❌ 旧 | 「XPti」品牌字、英文副标「Intimacy Tension Pairing / Tension Archive」、6300px 长落地；couple 与 v3「我和他」叫法不一致 |
| 18–19 | SoulTI 落地/test | ❌ 旧 | Georgia 衬线、6700px |
| 20–23 | CPTI 落地/scenarios/result/pricing | ❌ 旧 | 8600px 落地；结果页 6600px；pricing「命名一段关系，然后留下所有关系」 |
| 24–26 | Mysti 落地/daily/subscribe | ❌ 旧 | 「灵鉴 / 神谕室 / 暮光通行证」三套命名；与 v3 塔罗应在「测我」里的定位不符 |
| 27 | `/hogti/` | ❌ 旧 | EB Garamond，题材离题 |
| 28–30 | `/wtfti/`、test、daily | ❌ 旧 | 「人格神域，把你召回自己」= 被 refocus 否定的旧定位，8900px |
| 31 | `/about/` | ❌ 旧 | |
| 32 | `/auth/login/` | ✅ | |
| 全站 | 页脚 | ❌ | 仍写「What's The F* Type Inside / SBTI 主题原创作者：B站…」，与「女生私人顾问」不符；在丝绒夜 body 上颜色跳变 |

**统计**：截图 32 页 → 一致 8、部分 3、旧风格 21。**按流量加权（设备数）旧风格页面占 ~75%**（/start 417 + 测试宇宙），因为大部分流量落在 /start 和测试宇宙。

---

## 3. 流程审计：测试 → 结果 → 档案 → 今日/美我/树洞 → 付费

### 3.1 实际路径（生产验证）

```
首页 ─「90秒测」→ /start (3 题分流，非测试) ─┬ I  (20%) → /wtfti/ 神域 → galaxy/test ─308→ /start  ♻ 循环
                                           │           └ 次链接 /types/ ─308→ /
                                           ├ II (70%) → /mysti/daily 塔罗（旧风格，有 paywall）
                                           └ III(10%) → /bottle 树洞
                       完成页另有 ArchiveSaveCard（只存 pillar，没有人格结果）
/today 未登录 →「90 秒测一测·免注册建档」→ /start（同上）
/test（真测试）→ /test/result → ArchiveSaveCard? 否（只在 StartContent）；结果页链 /card/ /types/ 均 308
```

### 3.2 问题清单

| 级别 | 问题 | 位置 |
|---|---|---|
| P0 | 正门不是测试；「测完会有档案和今日卡」的承诺兑现不了（档案里没有人格） | `/start` |
| P0 | Pillar I 死循环 /start→/wtfti→galaxy→/start | `StartContent` I.href、`WtftiLandingContent` |
| P0 | `first_look_finish` 定义错位：统计的是分流 3 题；真测试 `first_look/first_look_finish` 另算 → 漏斗失真 | `StartContent` enqueue |
| P0 | 主流测试（XPTI 单人、CPTI、WTFTI、经典）没有 finish 事件；测试结果页没有统一「存进档案」入口（ArchiveSaveCard 只在 /start） | 各 ResultContent |
| P1 | 测试宇宙与主线互不相认：CPTI/XPTI/SoulTI/Mysti 结果页不通向 /today、/mirror、档案；主线页也不通向它们（「测我」chips 写了「我和他 / 掌纹 / 塔罗」但都只到 /start） | 首页 PILLARS、HerNav |
| P1 | 「我和他」存在两套：XPTI couple（付费主力）与 CPTI（SEO 主力），且都不叫「我和他」 | /xpti/couple, /cpti |
| P1 | 两套 ¥19/月：会员（今日/美我）vs Mysti 暮光通行证；还有 XPTI/CPTI/SoulTI 各自 pricing | /mysti/subscribe, MembershipSubscribeCard |
| P1 | 「我的」对匿名用户是登录墙，匿名档案不可见 → 一键建档后无处查看 | /me |
| P1 | 30+ 处站内链接、sitemap 24 条指向已 308 前缀 | §1.3 |
| P2 | 命名混乱：WTFTI / 神域 / 灵鉴 / 灵镜 / 暮光 / XPti / CPti / SoulTI / 第一张牌 / 今日天象签（`/wtfti/daily`）与 今日卡（`/today`）重复 | 全站 |
| P2 | 重复「每日」内容：/today 今日卡、/mysti/daily 每日一牌、/wtfti/daily 今日天象签、/wtfti/moon | |
| P2 | tab bar 在 /start 上遮挡答题选项（/start 被列为 tab root） | `HerNav` TAB_BAR_PATHS |
| P2 | 孤儿页：/hogti、/wtfti/symptoms|shrine|duet|letters|work、/soulti/origin|nature|rarity、/cpti/squad|stealth|gallery|leaderboard、/mirror/challenge|leaderboard、/xpti/whitepaper、/u/share | — |

---

## 4. 战略提案

### 4.1 定位声明（建议）

> **WTFTI：懂你的女生私人顾问——从一个准到想截图的人格测试开始，测完你会得到一份越用越懂你的「我」，每天给你一张今日卡，帮你变好看、看懂他。**

- 对外一句话：**「90 秒测出你是谁，然后每天都更懂你一点。」**
- 结构关系：**测试 = 正门 + 内容引擎**（获客、SEO、分享、复测都来自测试）；**档案（我） = 所有测试结果的容器**；**今日卡 / 美我 / 我和他 / 塔罗 = 消费档案的玩法与付费层**；树洞 = 情绪留存层，从结果页和今日卡导入，不作为一级获客入口。
- 判断新功能的唯一标准：**它是否（a）以某个测试结果为输入，或（b）把人带回去做/分享一个测试。** 两者都不满足 → 不做或下线。

### 4.2 信息架构 / 导航（建议）

底栏 5 tab 改为 **「测试 · 今日 · 我和他 · 美我 · 我」**（树洞下沉到今日卡 / 结果页 / 我）：

| Tab | 根页 | 内容 |
|---|---|---|
| 测试（默认首页 CTA） | `/start/` → 改为**测试大厅** | 1 个主推「90 秒首测」（直接开题，结果即档案）+ 精选 5-6 个测试卡（SoulTI 深夜 8 分钟、XPTI、CPTI 我和 TA、Mysti 塔罗、经典 SBTI），每张写清时长和「测完解锁什么」 |
| 今日 | `/today/` | 今日卡（合并 /mysti/daily、/wtfti/daily）+ 树洞入口 + 「今天再测一个」 |
| 我和他 | `/xpti/couple/`（新 v3 外壳） | 合并 XPTI couple + CPTI：单人测 → 邀请他 → 双人报告（付费） |
| 美我 | `/mirror/` | 不变；入口文案挂人格（「嘴硬甜心适合的颜色」） |
| 我 | `/me/` | 匿名也可见：我的所有测试结果、档案完整度（"再测 2 个今日卡更准"）、会员 |

首页：保持 v3 视觉，但三支柱改为「测试 → 档案 → 今日」一条线；主 CTA **直接进首测第 1 题**，不经过分流题。

### 4.3 功能 Keep / Merge / Cut

| 功能 | 决定 | 说明 |
|---|---|---|
| /start 3 题分流 | **Cut → 替换为测试大厅 + 首测** | 分流题不产生结果，是当前最大漏洞 |
| /test first look | **Keep & 升级为官方首测** | 改 v3、改 90 秒/≤10 题、结果直接建档 |
| 经典 SBTI 46 题 | Keep（大厅次级） | SEO 资产 |
| SoulTI | **Keep（主推深度测试）** | 完成数最高、有付费历史 |
| XPTI 单人 + couple | **Keep → 合并进「我和他」** | 付费主力 |
| CPTI | **Merge 进「我和他」**，SEO 页保留 URL 但换 v3 外壳并导向我和他 | Google 长尾第二大来源 |
| Mysti 塔罗 | Keep 但**降为「今日」里的玩法 + 一个塔罗测试**；/mysti 子页 19 个收敛到 daily / decision / result 3-4 个 | 70% 分流用户去了这，但 0 留存 |
| 暮光通行证 ¥19 | **Merge 进统一会员 ¥19** | 消除双会员 |
| /wtfti/ 神域落地及其子页 | **Cut（308 → 测试大厅）**；/wtfti/test、/wtfti/result 视数据保留为一个测试 | 旧定位 + 循环 |
| /wtfti/daily、/wtfti/moon | Merge → /today | 重复每日 |
| 今日卡 / streak | Keep（核心留存） | 输入改为「所有测试结果」 |
| 美我 hub/palm/color/face | Keep | atelier 改名「换一身」+ v3；challenge/leaderboard 无数据先隐藏 |
| 树洞 /bottle | Keep，降为二级入口 | 从结果页「说说你的感受」导入 |
| HOGTI、/cpti/squad|stealth|gallery|leaderboard、/soulti/origin|nature|rarity、/xpti/whitepaper、/wtfti/symptoms|shrine|duet|letters|work、/u/share | **Cut 或 noindex** | 孤儿、离题 |
| 已 308 的 ~110 个源码页面 | 删源码（单独 PR） | 降低维护和误链 |

### 4.4 路线图

**阶段 0 · 定方向（本周，需你确认 §5 的决定）**

**阶段 1 · 修正门（P0，~1 周）**
1. 首页 CTA / tab「测试」→ 直接进首测（/test 升级版），结果页内嵌一键建档 + 今日卡预览（复用 PR #12 组件）。
2. 删除 Pillar I 循环；/wtfti/ 308 → 测试大厅。
3. 统一埋点：所有测试上报 `test_start / test_finish {test_slug, result_type, entry}`；`first_look_finish` 只在真实测试完成时上报；记录 `ua`、`landing_path`、`referrer`，过滤 bot。
4. sitemap 去掉 308 URL；修 §1.3 的站内死链（`/card` `/types` `/lingjian` `/creator`）。
5. tab bar 不在答题页显示；/today、/bottle body 背景与页脚改为奶油（或页脚跟随 skin）。

**阶段 2 · 结果页即中枢（~2 周）**
6. 做一个**统一结果页外壳（v3）**：人格卡（可截图分享）→「存进我的档案」→「今日卡预览」→「适合你的颜色（美我）」→「他是什么类型？（我和他）」→ 深度报告付费。先套在 SoulTI、XPTI、CPTI、首测四个结果页。
7. /me 匿名可见，列出所有测试结果 + 完整度。
8. 统一会员：一个 ¥19/月（含今日卡完整版 + 美我额度 + 塔罗无限 + 一份深度报告折扣），下线暮光通行证独立售卖；单次报告（我和他、SoulTI 深度）保留。

**阶段 3 · UI 统一（按流量排序，~2-3 周）**
9. `/start`（测试大厅）→ `/test` 及结果 → `/xpti/couple` → `/cpti/result/*` + `/cpti/scenarios/*`（SEO 页，先换外壳不改 URL）→ `/soulti` → `/mysti/daily` → pricing/subscribe 页 → about/法务/页脚。
10. 长落地（6000-9000px）砍到 ≤3 屏：一个 hero + 「测完你会得到」+ 开始按钮。

**阶段 4 · 内容引擎（持续）**
11. 每 2 周上一个新的「女生向」短测（≤12 题），全部产出同一档案维度，推动复测与回访；今日卡展示「本周新测试」。
12. 清理 ~110 个 308 源码页。

### 4.5 指标

| 层 | 指标 | 现状 | 阶段 1 目标 | 阶段 2 目标 |
|---|---|---|---|---|
| 正门 | 首页 → 测试开始（真实测试） | 不可测（无事件） | ≥50% | ≥55% |
| 测试 | 测试开始 → 完成 | first_look 13→6 台 | ≥60% | ≥65% |
| 档案 | 完成 → 建档 | 11-19%（分母失真） | ≥35% | ≥45% |
| 留存 | D1 回访（建档用户） | 3 台跨日 | ≥10% | ≥20% |
| 分享 | 结果页分享/邀请率 | couple_invite 6 台 | ≥5% | ≥8% |
| 付费 | 付费转化（完成测试用户） | 0（09-11 起） | 首单 | ≥0.5% |
| 数据质量 | 1 事件设备占比 / bot 过滤 | ~80% | 区分 bot 后真实 DAU | — |

---

## 5. 需要你确认的决定

1. **首页「90 秒测」直接进真实首测，取消 /start 3 题分流**（/start 改为测试大厅）。
2. **底栏改为「测试 · 今日 · 我和他 · 美我 · 我」，树洞降为二级入口。**
3. **XPTI couple + CPTI 合并为「我和他」**（URL 保留，统一外壳与付费）。
4. **只保留一个 ¥19/月会员**，暮光通行证并入；单次报告保留。
5. **下线 /wtfti/ 神域落地及 HOGTI 等孤儿页**（308 到测试大厅）。
6. **先修埋点再看数**：所有测试统一 `test_finish`，`first_look_finish` 重新定义；在此之前 22-39% / 11-19% 的漏斗数不作决策依据。
7. 首测选型：用现有 `/test` first look（10 题）改造，还是用 SoulTI / XPTI 某一个作为官方首测？（建议：/test 改造为 ≤10 题、结果命名沿用首页「嘴硬甜心」式女生人格）

---

### 附：数据查询口径
- 设备 = `coalesce(device_id, session_id)`；时间 `ts` 转 Asia/Shanghai。
- 落地页 = 每台设备第一条事件的 `pathname`；referrer 取 host。`ua` 列在该窗口内为空，无法直接识别 bot。
- 每日设备：10-17 212 · 10-18 219 · 10-19 224 · 10-20（截至 20:52）151。
