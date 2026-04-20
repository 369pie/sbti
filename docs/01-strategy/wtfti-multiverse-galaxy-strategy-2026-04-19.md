---
title: WTFTI 多宇宙人格星图战略 v1（W-T-F-I-S 五维 + 星图结果）
stage: strategy
status: draft-v1
owner: pm
last-updated: 2026-04-19
related:
  - docs/01-strategy/wtfti-theory-and-brand-moat-2026-04-18.md
  - docs/01-strategy/wtfti-theory-whitepaper-v1-prose-2026-04-18.md
  - docs/01-strategy/wtfti-s-axis-whitepaper-2026-04-19.md
  - docs/01-strategy/wtfti-s-axis-projection-questions-2026-04-19.md
  - docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md
  - docs/02-modules/wtf-card/galaxy-result-spec-2026-04-19.md
  - scripts/galaxy-planet-prompts.mjs
  - docs/01-strategy/wtfti-galaxy-user-interview-script-2026-04-19.md
ui-design:
  default-skill: ~/.claude/skills/cc-design/SKILL.md
  brand-vocabulary: see AGENTS.md `<!-- BEGIN:ui-design-defaults -->`
  reference-impl: src/components/galaxy/GalaxyPreview.tsx
---

> 🪐 **2026-04-19 叠加层**：所有"星球 / 引力 / 大爆炸 / 星座 / 文学 / 神秘学"叙事统一收口于
> [wtfti-cosmic-romance-narrative-2026-04-19.md](./wtfti-cosmic-romance-narrative-2026-04-19.md)。
> 该文档与本文件**并列阅读**：本文件给"骨架"，叙事层给"温度"。
>
> 🎨 **UI 实施纪律**：所有前端 surface 默认遵循 `cc-design` skill；品牌词汇见 [AGENTS.md](../../AGENTS.md)。

# WTFTI 多宇宙人格星图战略 v1

> 本战略是 [`wtfti-theory-and-brand-moat-2026-04-18.md`](./wtfti-theory-and-brand-moat-2026-04-18.md) 的"第二曲线"升级。
> 核心命题：把"测一次得一个标签"升级为"测一次得到属于你的人格星系"，
> 让 WTFTI 在题型 / 维度 / 结果三层都拥有竞品抄不走的差异化。

## 0. TL;DR

- **维度升级**：W-T-F-I + 新增 **S (Stream)** 潜意识流轴 = 5 维。
- **题型革命**：情境投射题（W/T/F/I）+ 意识流投射题（S）混合，反应时也是数据。
- **结果革命**：星图（主星 1 + 卫星 2-3 + 暗面 1 + 星轨）= 单用户产出 4-5 张可独立分享的卡。
- **传播杠杆**：双人星系碰撞（CCI 已有底座）+ 星图收集系统。
- **护城河**：CAPS（已有） + DMN/IAT（新加） + 多卡 UGC + 视觉资产壁垒。

北极星指标：**单用户平均产出可分享卡数 × 分享转化率**
当前预估 ~1.2 张 × 8% → 12 周内目标 **3+ 张 × 20%+**。

---

## 1. 为什么要这次升级（不是"再换皮"）

| 现状（SBTI 多皮肤期） | 缺口 | 升级后（WTFTI 星图期） |
| --- | --- | --- |
| 一次测试 = 一个 4 字符标签 | 用户的"多面性"被压成一个标签 | 一次测试 = 一组带向量的人设 |
| 题型 = 自述选择题 | 任何竞品抄文案就能复刻 | 题型 = 情境 + 投射 + 节奏 混合 |
| 结果 = 1 张静态卡 | 单卡同质化、传播力封顶 | 结果 = 4-5 张星球卡 + 星图 |
| 视觉 = 平面卡牌 | 不可探索 | 视觉 = 伪 3D 星系 + 解锁动画 |
| 护城河 = 文案 + 流量 | 易被复制 | 护城河 = 理论 + 题型引擎 + 视觉资产管线 |

> 当前 [`docs/01-strategy/wtfti-theory-whitepaper-v1-prose-2026-04-18.md`](./wtfti-theory-whitepaper-v1-prose-2026-04-18.md)
> 已经把 4 轴 + CAPS 锚点立住。这次升级在它之上做 **S 轴 + 星图**，理论一致、不返工。

---

## 2. 五维模型：W-T-F-I-S

| 轴 | 全称 | 中文 | CAPS / 神经科学锚点 | 题型 | 角色 |
| --- | --- | --- | --- | --- | --- |
| W | Wired | 触发反应 | Encoding strategies | 情境选择 | 主测，已上线 |
| T | Tilt | 情绪倾斜 | Affects | 情境选择 | 主测，已上线 |
| F | Flex | 应对弹性 | Self-regulatory plans | 情境选择 | 主测，已上线 |
| I | Imprint | 印记锚点 | Beliefs / values | 情境选择 | 主测，已上线 |
| **S** | **Stream** | **意识流 / 默认走向** | **Default Mode Network (Raichle 2001) + 内隐联想 IAT** | **意识流投射 / 词联想 / 节奏** | **新增 · 暗面解锁** |

S 轴的关键差异：
- 不靠"我是 / 我会"自述句，靠**第一反应 + 反应时**测量
- 不在主测里强出现，而是在主测完成后作为"暗面星球解锁"出现 —— 降低 drop-off
- 给"暗面星球"提供**唯一可信赖的数据来源**

详见 [`wtfti-s-axis-whitepaper-2026-04-19.md`](./wtfti-s-axis-whitepaper-2026-04-19.md)。

---

## 3. 星图结果体系

### 3.1 星球角色

| 星球 | 数据来源 | 视觉 | 文案口吻 | 分享场景 |
| --- | --- | --- | --- | --- |
| 主星 Home | 4 轴主向量 | 最大、居中、暖色 | 严肃 + 一句金句 | "这是我" |
| 卫星 Moons ×2-3 | 4 轴在不同宇宙的子向量（恋爱/工作/深夜独处） | 中型，环绕主星 | 场景化 + 自嘲 | "这是恋爱里的我 / 加班时的我" |
| 暗面 Shadow ×1 | S 轴反应 + 4 轴压力剖面 | 远离主星，冷色 | 悬疑 + 心理学 tooltip | 最 spicy，最易被截图 |
| 星轨 Orbit | 主→卫→暗向量切换路径 | Lottie 动画 | 解读人格切换逻辑 | 截屏录屏均可 |
| 星座共振 Constellation | 双方星图叠加（CCI 复用） | 两人星系叠合 | 兼容度 + 互补点 | 情侣 / 闺蜜局拉新 |

### 3.2 关键交互节奏

```
答题（4 维 20 题，5 分钟）
  → 星系展开动画（主星亮起）
    → 卫星逐个解锁（每个带 1 句话解读，可单独保存）
      → "你的星系还有一颗暗面星球未点亮" CTA
        → S 轴 4 道意识流投射题（45 秒）
          → 暗面星球解锁（最重磅的卡）
            → 全图保存 / 九宫格分享 / 邀请好友碰撞
```

详见 [`docs/02-modules/wtf-card/galaxy-result-spec-2026-04-19.md`](../02-modules/wtf-card/galaxy-result-spec-2026-04-19.md)。

---

## 4. 路线图（W0 → W5，约 12-14 周）

| Wave | 时长 | 关键交付 | 验收指标 |
| --- | --- | --- | --- |
| **W0** | 1w | 12 人用户访谈（脚本：[interview script](./wtfti-galaxy-user-interview-script-2026-04-19.md)）；多卡偏好量化 | "多卡 > 单卡" 偏好 ≥ 70% |
| **W1** | 3w | S 轴白皮书 v1（已交付）；S 轴 12 题题库（已交付）；主星 + 暗面 2 张卡视觉打通 | S 题完成率 ≥ 85% |
| **W2** | 3w | 星图 MVP（CSS parallax + Lottie）；2 颗卫星上线；分享埋点 | 人均产出卡数 ≥ 2.5；完成→分享率 ≥ 15% |
| **W3** | 3w | 卫星全量 3 颗 + 星轨动画；星图收集成就；KOL 合作 | 人均卡数 ≥ 4；次留 ≥ 22% |
| **W4** | 2w | 双人星系碰撞 + 兼容度页；KOL 投放（心理 5 + 玄学 5） | K ≥ 0.8；7 日新增 2× |
| **W5** | 2w | three.js 升级 3D；S 轴节奏 / 音频题 | LTV +30% |

---

## 5. RICE 优先级（核心 Epic）

| ID | Epic | R | I | C | E (人周) | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | S 轴白皮书 v1 + 心理学引用 | 全员 | 3 | 0.7 | 1（已完成） | 品牌护城河 |
| E2 | S 轴投射题引擎（图 + 词） | 全员 | 3 | 0.6 | 4 | 题型差异化 |
| E3 | 星图结果页（伪 3D + 多卡） | 全员 | 3 | 0.75 | 6 | 北极星核心 |
| E4 | 卫星人格算法（情境激活） | 全员 | 3 | 0.65 | 3 | 复用 universe-axes 权重 |
| E5 | 暗面星球（S 轴映射） | 全员 | 3 | 0.6 | 2 | 最 spicy 分享物 |
| E6 | 双人星系碰撞 | 有好友链路 | 3 | 0.7 | 3 | K 系数杠杆 |
| E7 | 星图收集 / 成就 | 次留用户 | 2 | 0.55 | 3 | 后置 |
| E8 | AI 生图星球卡管线 | 全员 | 2 | 0.85 | 2 | 复用 RunningHub |

---

## 6. 风险与对冲

| 风险 | 概率 | 影响 | 对冲 |
| --- | --- | --- | --- |
| 投射题 drop-off 高 | 中 | 高 | S 轴后置为"暗面解锁"，首屏 0 投射题 |
| 多卡稀释单卡传播 | 中 | 中 | A/B 单卡 vs 星图；监控人均分享卡数 |
| 三 D 工程爆炸 | 高 | 中 | MVP 用 CSS + Lottie，three.js 推 W5 |
| 太学术失去娱乐 | 中 | 高 | 严肃锚点藏 tooltip，首屏 100% 荒诞文学 |
| 太娱乐失去护城河 | 中 | 高 | 白皮书 v1 + KOL 合作做背书 |
| AI 生图风格不统一 | 中 | 中 | prompt 文件统一管控，见 [`scripts/galaxy-planet-prompts.mjs`](../../scripts/galaxy-planet-prompts.mjs) |

---

## 7. 唯一性自检（vs 全市场）

| 能力 | MBTI | 16P | SBTI | 占星 | **WTFTI v2** |
| --- | --- | --- | --- | --- | --- |
| 维度数 | 4 | 5 | 3 | 12 宫 | **5（含潜意识轴）** |
| 题型多样性 | 自述 | 自述 | 自述 | 出生信息 | **情境 + 投射 + 节奏** |
| 单次产出卡数 | 1 | 1 | 1 | 1 | **4-5** |
| "多我"叙事 | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| 潜意识层 | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| 科学锚点强度 | 中 | 中 | 弱 | 无 | 强 |
| 可探索 UI | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| 双人碰撞 | ❌ | ❌ | ⚠️ | ✅ | ✅ |

全表唯一同时满足"多我 + 潜意识 + 多卡 + 科学锚点 + 可探索 UI"的产品 = WTFTI v2。

---

## 8. 与现有模块的兼容路径

- **WTF Card 模块**（[`docs/02-modules/wtf-card/`](../02-modules/wtf-card/)）：星图升级版作为新结果展示，老 WTF Card 保留为"主星卡"独立资产。
- **Identify 模块**：双人星系碰撞复用现有 identify pair 通道。
- **Universe 模块**（恋爱 / 修仙 / CPTI / SoulTI / WTFTI 主测）：每个宇宙映射到一颗卫星，权重沿用 `wtfi/axes.ts` 的 universe weight。
- **WTFI 4 轴现有题库**（[`wtfti-sample-questions-wtfi-2026-04-18.md`](./wtfti-sample-questions-wtfi-2026-04-18.md)）：保持不动；S 轴 12 题为新增题包，独立加载。
- **数据库**：S 轴打分新增 `s_axis_score` 字段；星图 layout 落 `result_payload.galaxy`。

---

## 9. 接下来 14 天的行动清单

| 日 | 动作 | 负责 | 产出 |
| --- | --- | --- | --- |
| D1-D2 | 12 人访谈招募 + 第一批 6 人完成 | PM | 关键问题数据表 |
| D2-D3 | S 轴 12 题进 dev/staging（feature flag） | 前端 + 内容 | 可点测试链接 |
| D3-D5 | 星球卡 prompt 批跑（20 张主星 + 10 张暗面） | AIGC | 60 张候选图 |
| D5-D7 | 星图结果页 v0（CSS 静态版，主星 + 暗面 2 卡） | 前端 | 可分享 demo |
| D7-D9 | 第二批 6 人访谈 + 综合洞察 | PM | 访谈报告 |
| D9-D12 | 卫星 1 颗上线（恋爱宇宙激活） | 前端 + 内容 | 主+卫+暗 = 3 卡 |
| D12-D14 | 内测 100 人种子轮 + 数据复盘 | 全员 | W2 上线决策点 |

---

> 战略制定到此结束，下一步等内部决策即可推进 W0 访谈与 W1 工程。
