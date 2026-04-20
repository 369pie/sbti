# 亲密张力坐标系 (Intimacy Tension Coordinates · ITC) v1.0 · 方法学源文档

> Status: v1.0（伴随 XPTI 3.0 上线）
> Owner: XPTI Product
> Last Updated: 2026-04-20
> 引用建议：
> > XPTI Team. (2026). *Intimacy Tension Coordinates (ITC) v1.0 — A Tri-Axial Framework for Sexual & Relational Self-Observation*. WTFTI Internal Methodology Note.

---

## 0. 这份文档是什么

ITC 不是一个新的人格分类系统，也不是又一个 MBTI 衍生品。
它是一套把 XPTI 9 维问卷**重新组织**起来的 **三轴张力坐标**，用于：

1. 让用户在「单一原型 + 9 个分数」之外，看到自己**当前的张力姿态**；
2. 让两个用户做「张力配对」而不是「人格匹配」；
3. 让 9 维体系拥有可以被外部引用的上层叙事。

这份文档是给：

- **产品 / 设计师 / 文案** — 理解 9 维如何被映射到 3 轴；
- **创作者 / 心理学博主** — 引用我们的术语时，知道我们是怎么定义的；
- **未来重构者** — 如果有人想替换底层 9 维问卷或扩展到 12 维，至少 ITC 的命名要稳定。

---

## 1. 三条张力轴

| 轴 ID | 中文 | 英文 | 高位极 | 低位极 | 默认色 |
|------|------|------|------|------|------|
| `control` | 控制 — 臣服 | CONTROL ↔ SURRENDER | DOMINANT | SURRENDER | `#A85A6E` 枯玫瑰 |
| `distance` | 距离 — 沉浸 | DISTANCE ↔ IMMERSION | IMMERSION | DISTANCE | `#6A2A3E` 深酒红 |
| `novelty` | 重复 — 新鲜 | REPETITION ↔ NOVELTY | NOVELTY | REPETITION | `#C9A676` 金箔 |

> 实现见 [src/lib/xpti/itc.ts](../../../src/lib/xpti/itc.ts) 中的 `ITC_AXES`。

### 1.1 为什么是这 3 条而不是 4 条 / 5 条

- **3 是最少的"可被记住"的量** — 经过用户测试，4 条以上会变成"又一份分数表"；
- 这 3 条覆盖了亲密关系里最常被讨论的张力：**"谁在主动" / "走多近" / "要不要变化"**；
- 9 维在因子分析意义上的相关簇，恰好可以归为这 3 群。

### 1.2 9 维 → 3 轴的映射

| 张力轴 | 主要 9 维输入 | 加权方式 |
|------|------------|--------|
| `control` | D1 主导欲（+1.0） / D6 边界弹性（+0.6） / D9 节奏偏好（+0.4，作为节奏强度补偿） | 简单加权平均 |
| `distance` | D2 情感裸露（+1.0） / D5 自我镜像（+0.7） / D8 依附模式（+0.8） | 简单加权平均 |
| `novelty` | D3 感官灵敏（+0.6） / D4 节奏偏好（+0.5） / D7 想象纵深（+0.8） / D9 新鲜vs回味（+1.0） | 简单加权平均 |

实现：`computeItcAxes(dims)` → 9 维 1-3 分 → 三轴 -1..+1 的有符号张力强度。

### 1.3 张力签名（Tier）阈值

- 有符号值 ≥ +0.25 → 落在**高位极**（如 `IMMERSION`）；
- 有符号值 ≤ -0.25 → 落在**低位极**（如 `DISTANCE`）；
- |signed| < 0.25 → 标记为 `NEUTRAL`，文案上称"在这条轴上你偏中间"。

实现：`deriveItcSignature(dims)` → `{ control, distance, novelty }` 各自三态。

---

## 2. 12 原型与 ITC 张力签名的关系

12 个 XPTI 原型不是 12 个 ITC 组合（理论上 3³ = 27 个，去掉中性后仍多于 12）。
原型是**叙事单元**，张力签名是**结构标签**：

- 同一个 ITC 签名可能被叙事化成不同原型（性格 + 情境）；
- 同一个原型在不同张力签名上会有微调（例如「散场之后」可能是 `NOVELTY × DISTANCE × NEUTRAL`，也可能漂向 `NEUTRAL × DISTANCE × NEUTRAL`）；
- 因此 `getXptiTensionSignature(personality)` 是**派生**的，不是手写的。

> 实现：[src/lib/xpti/personalities.ts](../../../src/lib/xpti/personalities.ts) 中 `getXptiTensionSignature()` 用 WeakMap 缓存对每一个原型 `profile` 计算出的 `deriveItcSignature` 结果。

---

## 3. 6 类张力配对模型

把两个人的张力签名两两组合（A 高 / 低 vs B 高 / 低），按"是否同极 / 是否互补 / 是否对冲"归类。
得到 6 个**配对名词**而不是 27 个。

| ID | 名 | 英文 | 一句话 |
|----|----|------|------|
| `co-immersive` | 共沉浸 | Co-Immersion | 两个把所有窗户都打开的人，热得快、烧得也快 |
| `parallel-distant` | 双线疾走 | Parallel Distance | 像两条铁轨，看见彼此但不靠近 |
| `dom-sub-stable` | 主导 / 顺承 · 长稳 | Dominant–Surrender Stable | 一推一就，节奏稳定，关键是别越界 |
| `novelty-clash` | 新鲜冲撞 | Novelty Clash | 一个人想换 BGM 一个人要循环，火花在这里 |
| `mirror-soft` | 互相镜像 | Soft Mirroring | 谁先安静，谁先开口，节奏对得上 |
| `pull-and-pause` | 拉扯与停顿 | Pull & Pause | 节奏忽快忽慢，靠误差感喂养张力 |

匹配逻辑见 [src/lib/xpti/itc-pairing.ts](../../../src/lib/xpti/itc-pairing.ts) 中 `matchTensionPairing(a, b)`。

---

## 4. 局限性与免责说明

- ITC 基于**自我报告问卷**，不是临床心理量表。结果用于自我观察和关系沟通，不构成诊断。
- 所有"配对模型"是**叙事模型**，不是匹配算法。我们不做、也不会做交友撮合。
- 阈值（±0.25）是基于内部样本经验值，不是 ROC 优化结果；v1.1 我们计划用更大样本重新校准。
- "异性恋默认"是当前问卷的局限。v3.2 会推出 LGBTQ+ 全量内容版本，v3.0 仅在结果页提供「视角切换 wrapper」。

---

## 5. 引用与署名

如需在论文 / 播客 / 自媒体内容中引用 ITC，请使用：

> XPTI Team. (2026). *Intimacy Tension Coordinates (ITC) v1.0*. WTFTI. Retrieved from https://wtfti.com/xpti/theory/

我们不要求收费许可；只要求：

- 不把 ITC 包装成「我们自己的 9 维 / 3 轴体系」（必须注明源自 XPTI / WTFTI）；
- 不在不安全的语境（婚介 / PUA / 情感操控话术）中使用；
- 引用时附带 §4 的"局限性"提示。

---

## 6. 实现索引

| 文件 | 内容 |
|------|------|
| [src/lib/xpti/itc.ts](../../../src/lib/xpti/itc.ts) | 三轴定义 / `computeItcAxes` / `deriveItcSignature` |
| [src/lib/xpti/itc-pairing.ts](../../../src/lib/xpti/itc-pairing.ts) | 6 类张力配对模型 + `matchTensionPairing` |
| [src/lib/xpti/personalities.ts](../../../src/lib/xpti/personalities.ts) | `getXptiTensionSignature()` |
| [src/app/xpti/theory/page.tsx](../../../src/app/xpti/theory/page.tsx) | 公开理论页（含 ScholarlyArticle JSON-LD） |
| [src/app/xpti/whitepaper/page.tsx](../../../src/app/xpti/whitepaper/page.tsx) | 打印友好版白皮书（用户可"打印 / 另存为 PDF"导出） |

---

_最后修订：2026-04-20 · 维护者：XPTI Product_
