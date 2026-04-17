---
title: Gallery Museum · Wave 1 执行交付 (2026-04-18)
date: 2026-04-18
status: shipped
owner: eng + content + data
parent: docs/01-strategy/gallery-museum-strategy-2026-04-18.md
---

# Wave 1 执行交付 · 图鉴馆重构

> 把 [/types/](../../src/app/types/page.tsx) 从产品目录升级为 **Museum**：杂志封面 + 进度锚点 + detail 抽屉 + 未解锁剪影态，并为后续 Wave 2/3 留出接口。

---

## 1. 本批代码变更清单

### 1.1 新增
| 文件 | 角色 |
|---|---|
| [src/lib/museum/analytics.ts](../../src/lib/museum/analytics.ts) | `trackMuseum(event, props)` 统一埋点出口（Vercel Analytics + GTM dataLayer） |
| [src/lib/museum/unlocked.ts](../../src/lib/museum/unlocked.ts) | `useMuseumUnlocked()` SSR-safe hook，基于 `useSyncExternalStore` 读取 [wtf-card.ts](../../src/lib/wtf-card.ts) |
| [src/lib/museum/featured-slogans.ts](../../src/lib/museum/featured-slogans.ts) | 人写荒诞文学 slogan 池（12 张） |
| [src/lib/museum/featured.ts](../../src/lib/museum/featured.ts) | `getDailyFeatured(allTabs, n)` 按日期 hash 挑 3 张 |
| [src/components/museum/MuseumCover.tsx](../../src/components/museum/MuseumCover.tsx) | 杂志封面 hero + 2 次卡 + 🎲 随机按钮 |
| [src/components/museum/MuseumProgress.tsx](../../src/components/museum/MuseumProgress.tsx) | 已解锁/总数进度条 + 空态 |
| [src/components/museum/CardDrawer.tsx](../../src/components/museum/CardDrawer.tsx) | 点击卡片后的 detail 抽屉（底部 sheet / 桌面 modal） |
| [scripts/audit-dirty-types-images.mjs](../../scripts/audit-dirty-types-images.mjs) | 脏图审计脚本，输出到 [_audit/](./_audit/) |

### 1.2 修改
| 文件 | 变更 |
|---|---|
| [src/app/globals.css](../../src/app/globals.css) | 新增 `animate-fade-in` / `animate-slide-up` keyframes，`prefers-reduced-motion` 兼容 |
| [src/app/types/page.tsx](../../src/app/types/page.tsx) | Server 端计算 `getDailyFeatured` + 传 totalCount/seriesCount/featured；删除旧的 `<h1>全人格图鉴馆</h1>` 头（已被封面替代） |
| [src/app/types/TypesContent.tsx](../../src/app/types/TypesContent.tsx) | 集成 Cover + Progress + Drawer；Grid cell 改为 button + 未解锁剪影态 + ??? 名称；移动端 grid 2 列、桌面 4-5 列 |

### 1.3 数据层（不动底层）
- `gallery-data.ts` / `src/lib/{universe}/personalities` 未修改
- WTF Card localStorage schema 未修改
- thumbnails pipeline 未修改

---

## 2. 视觉/交互变化

| 维度 | 重构前 | 重构后 |
|---|---|---|
| 首屏 | 灰白标题 + 首张缩略图 | 杂志卷头 `Issue 03 / The Museum` + 大图 hero + 2 次卡 + 🎲 随机按钮 |
| 移动端 grid | 1 列 | 2 列（翻页密度 ×2） |
| 我的 | ✗ | `已解锁 N / TOTAL` 进度卡 + 系列完成度 + 昵称问候 |
| 卡片点击 | 跳转到 result 页（易跳失） | 打开 detail 抽屉，保留沉浸 |
| 未解锁态 | 无 | 人物剪影 + 🔒 + `???` 名称，保留神秘 |
| 品牌 | 与首页脱节 | 复用 `editorial-rule / serial-number / eyebrow / ✦` 四件套 |

---

## 3. 今日精选 Slogan（Wave 1 人写池 · 12 张）

所有 slogan 存储于 [featured-slogans.ts](../../src/lib/museum/featured-slogans.ts)。风格：**荒诞文学 / 您字体 / 2 句话 / 不给建议**。

| Key | Headline | Kicker |
|---|---|---|
| `wtfti:atm-er` | 送钱者 ATM-er | 把心当零钱花的资深玩家 |
| `soulti:moonwalker` | 夜行者 Moonwalker | 凌晨三点的精神股东 |
| `cpti:plastic` | 塑料姐妹 Plastic | 一年合影八次，朋友圈互相取关 |
| `flower:peony` | 牡丹小姐 Peony | 不取悦不解释不让步 |
| `xpti:caretaker` | 照顾型 Caretaker | 把对方的胃口背得比自己生日还熟 |
| `banti:dior-s` | 装满美 Dior-s | 通勤包里 70% 是粉饼 |
| `kings:love-r` | 心动绝缘体 Love-r | 把暧昧当 daily mission 的英雄 |
| `bird:owl` | 猫头鹰小姐 Owl | 别人睡的时候才开始活 |
| `wtfti:emo` | emo 怪 Emo | 一首歌就能哭半小时的资深选手 |
| `soulti:keeper` | 守心人 Keeper | 把秘密锁在抽屉最里层 |
| `cpti:soul` | 灵魂搭子 Soul | 聊一句就能脑补一万字 |
| `love:love-bomb` | 爱意轰炸机 Love-bomb | 一爱起来就是空袭级 |

**选卡逻辑**：以 ISO 日期（Asia/Shanghai, 每日 8:00 切换）+ slug 做 FNV-1a hash 排序，取 top-3。池足够小（12 张）能保证每周 slug 组合稀有，又足够大避免连续两天同一张。

### 下一步（运营）
- 每周新增 5 个 slug 到池，保持 ≥ 20 张
- slug 选择优先级：**SSR / 隐藏款 / 小红书已在讨论的人设**
- 所有新增 slug 必须：① 存在于 gallery 中 ② 通过中文 voice 复核（您字体、无建议）

---

## 4. 埋点清单（已实装）

所有事件均通过 `trackMuseum(event, props)` 出口，见 [analytics.ts](../../src/lib/museum/analytics.ts)。

| event | 触发 | 关键属性 |
|---|---|---|
| `museum_view` | `/types/` mount | `total_cards` |
| `museum_progress_seen` | 进度卡首次对有解锁用户展示 | `total_unlocked`, `total_cards`, `unlocked_tabs` |
| `museum_cover_cta_click` | 点击封面 hero / 次卡 | `source=featured`, `slug`, `position` |
| `museum_random_pick` | 点击 🎲 随便给我一张 | `slug` |
| `museum_tab_switch` | 切换系列 tab | `tab` |
| `museum_card_drawer_open` | 打开 detail 抽屉 | `tab`, `slug`, `unlocked` |
| `museum_card_drawer_close` | 关闭 detail 抽屉 | `tab`, `slug` |
| `museum_locked_card_click` | 点击未解锁卡（同时也会触发 drawer_open） | `tab`, `slug` |
| `museum_card_unlock_test_click` | 抽屉中 CTA 点击 "去做测试解锁" | `tab`, `slug`, `unlocked` |
| `museum_screenshot_intent` | **W2 预留**：长按截图 | `tab`, `slug` |

### W1 Dashboard 应看的 6 个指标
1. `museum_view` 日 PV（基准线）
2. `museum_card_drawer_open` / `museum_view` ≥ **25%**（卡片互动率）
3. `museum_random_pick` / `museum_view` ≥ **8%**（封面信任度）
4. `museum_card_unlock_test_click` / `museum_card_drawer_open(unlocked=false)` ≥ **30%**（解锁转化）
5. `museum_progress_seen` / `museum_view` 中 has-progress 用户占比（留存信号）
6. 平均 `museum_tab_switch` 次/用户（浏览深度）

**Day-14 Gate**：见 [主策略 §9](./gallery-museum-strategy-2026-04-18.md#9-优先级-roadmap-rice--3-wave) → 停留 ≥ 90s；CTR ≥ 18%。

---

## 5. 脏图审计结果

运行方式：
```bash
node scripts/audit-dirty-types-images.mjs
```

首次输出：[_audit/dirty-images-2026-04-17.md](./_audit/dirty-images-2026-04-17.md) — **54 个 thumbnail 被标记**。

**分类**：
- **25 张** cpti/relationships/thumbs/* — **合规**：这本来就是关系卡设计（CPTI × CPTI 双人组合），保留
- **14 张** bird/cards/thumbs/* — **合规**：Bird universe 本来就有 text-overlay card 变体，保留
- **15 张** >120KB 的普通系列 thumb — **待内容侧复核**，优先级：
  - 如果纯人物 art 导致体积大（如牡丹花 art 精细）→ 调整 webp 压缩参数
  - 如果是结果页截图 / 包含中文标题 → 重新走 [generate-gallery-thumbnails.mjs](../../scripts/generate-gallery-thumbnails.mjs) 从干净原图重生

**本周 actionable 列表**（只看 >120KB & 非 cards/relationships）：
```bash
cat docs/01-strategy/_audit/dirty-images-2026-04-17.json | \
  jq '.items[] | select(.reasons[] | contains("thumb >")) | .path' | head -15
```

**内容侧 SLA**：Wave 1 发版后 1 周内清完 top-15。

---

## 6. 已知限制（明确留给 Wave 2）

| 限制 | 处置 |
|---|---|
| 🎲 随机只从今日 featured 池 3 张抽，非全库随机 | W2 改为全库 + 偏好倾斜（已解锁系列抽未解锁卡） |
| Drawer 没有"生成小红书 9:16 收藏图" | W2：`ScreenshotCard.tsx` + `html2canvas` 或 OG canvas |
| 没有筛选器（情绪/稀有度/星座） | W2：在 tab 上方加第二行 chip |
| 未解锁卡 hover 提示为通用文案 | 可以在 Drawer 里读 `FEATURED_COPY` 的 kicker 做个性化 teaser，这次已实装 |
| CPTI-relationship 没有 "unlock" 语义 | 当前默认按 card.relationships 记录；若用户做过 CPTI 但没做过关系测，相关卡保持剪影 |

---

## 7. QA 清单（上线前必跑）

- [ ] `/types/` 首屏渲染有 hero featured 卡 + 2 次卡 + 🎲 按钮
- [ ] 无测试过的新用户：进度卡显示"您的图鉴还是空的 · 420 等您" + 做第一个测试 CTA
- [ ] 做完 WTFTI 测试后回到 /types/：对应 slug 从剪影变成彩色；进度卡 +1
- [ ] 点击任意卡片：打开 drawer，未解锁态显示 🔒 + ???；Esc / 背板点击可关闭
- [ ] drawer 里 "去做 XX 测试解锁" CTA 能跳到正确 testHref
- [ ] 移动端 375px：hero 不溢出，grid 为 2 列
- [ ] `prefers-reduced-motion` 下所有动画关闭
- [ ] 控制台 0 error；[埋点 §4](#4-埋点清单已实装) 全部能在 Vercel Analytics debug 中看到
- [ ] Lighthouse performance 移动端 ≥ 85，LCP ≤ 2.5s

---

## 8. 后续动作（本周）

- [ ] 运营新增 5-8 个 slogan 到 `FEATURED_COPY`
- [ ] 设计：W2 hifi → 🎲 抽卡落地动效 + 9:16 截图收藏图模板
- [ ] 工程：清掉脏图 top-15
- [ ] 数据：配置 Vercel Analytics 自定义事件看板；上线 48h 后第一次看数

---

> 全文配合主策略阅读：[docs/01-strategy/gallery-museum-strategy-2026-04-18.md](./gallery-museum-strategy-2026-04-18.md)
