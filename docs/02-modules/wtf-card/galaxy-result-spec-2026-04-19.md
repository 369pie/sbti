---
title: WTFTI 星图结果页 · 设计与实现规范 v1
stage: module-spec
status: draft-v1
owner: pm + design + frontend
last-updated: 2026-04-19
related:
  - docs/01-strategy/wtfti-multiverse-galaxy-strategy-2026-04-19.md
  - docs/01-strategy/wtfti-s-axis-whitepaper-2026-04-19.md
  - docs/01-strategy/wtfti-s-axis-projection-questions-2026-04-19.md
  - scripts/galaxy-planet-prompts.mjs
---

# WTFTI 星图结果页 · 设计与实现规范 v1

> 这份文档是工程可直接照做的实现规范。
> 视觉风格：女性向、轻娱乐、伪 3D 星系、夜空 + 霓虹 + 雾。

## 1. 信息架构

```
GalaxyResult
├── HeroIntro        // 1 屏：星系展开动画 + Slogan
├── HomePlanet       // 1 屏：主星卡（可单独保存）
├── MoonRing         // 1-2 屏：2-3 颗卫星卡（可逐个保存 + 横向 swipe）
├── ShadowGate       // 1 屏：S 轴未解锁时的 CTA
├── ShadowPlanet     // 1 屏：暗面星球卡（解锁后展示，可保存）
├── OrbitMap         // 1 屏：星轨动画 + 切换说明
├── ConstellationCTA // 1 屏：邀请好友双人星系碰撞
├── Footer           // 全图保存 / 九宫格 / 复测
```

每个 section ≥ 1 屏高，移动优先（375 × 812 baseline）。

---

## 2. 视觉系统（设计 token）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--galaxy-bg` | `radial-gradient(ellipse at 50% 30%, #1a1147 0%, #07051f 70%)` | 全页背景 |
| `--planet-glow-warm` | `0 0 60px rgba(255, 178, 102, 0.55)` | 主星 / 卫星 |
| `--planet-glow-cool` | `0 0 80px rgba(120, 180, 255, 0.45)` | 暗面 |
| `--text-primary` | `#FFF7E6` | 主标题 |
| `--text-muted` | `rgba(255, 247, 230, 0.65)` | 次文案 |
| `--accent-mystic` | `#C9B6FF` | 链接 / CTA |
| `--accent-spicy` | `#FF6FA3` | 暗面星球高亮 |
| `--font-title` | `"Noto Serif SC", serif` | 标题 |
| `--font-body` | `"Inter", "PingFang SC", sans-serif` | 正文 |

字号阶梯：`28 / 22 / 18 / 15 / 13`，行高 1.5。

---

## 3. 动画 / 伪 3D 实现策略（MVP）

| 元素 | MVP 方案 | W5 升级 |
| --- | --- | --- |
| 星空背景 | CSS `background` + 1-2 层 `transform: translate3d` parallax | three.js + 粒子 |
| 主星 | PNG + `box-shadow` glow + `@keyframes` 微旋转 | 3D 模型 |
| 卫星轨道 | `@keyframes orbit` (CSS rotate around center) | three.js orbit |
| 解锁动画 | Lottie JSON + Framer Motion stagger | 同 |
| 星轨连线 | SVG `<path>` + `stroke-dasharray` 动画 | three.js line |
| 暗面解锁 | Framer Motion `AnimatePresence` + Lottie 解锁动画 | 同 |

> **关键约束**：MVP 必须能在 4G 网络下 LCP < 2.5s。所有 3D 仿真用 CSS / SVG 实现。
> 星球图全部 WebP，主屏首屏只加载主星 + 暗面（卫星懒加载）。

---

## 4. 组件清单（建议路径）

```
src/components/galaxy/
├── GalaxyHero.tsx           // 入场动画
├── HomePlanetCard.tsx       // 主星卡（独立分享）
├── MoonCard.tsx             // 卫星卡（×2-3）
├── MoonCarousel.tsx         // 横向 swipe 容器
├── ShadowGate.tsx           // 暗面解锁 CTA
├── ShadowPlanetCard.tsx     // 暗面星球卡
├── OrbitMap.tsx             // SVG 星轨
├── ConstellationCTA.tsx     // 双人邀请
├── GalaxyShareDock.tsx      // 全图保存 / 九宫格
└── shared/
    ├── PlanetGlow.tsx
    ├── StarField.tsx
    └── useGalaxyParallax.ts
```

复用现有：
- `src/components/share/*` 的卡片导出能力
- `src/lib/wtfi/scoring.ts`（W/T/F/I）+ 新加 `src/lib/wtfi/scoring-s.ts`（S）
- AI 资产管线：[`scripts/galaxy-planet-prompts.mjs`](../../../scripts/galaxy-planet-prompts.mjs)

---

## 5. 数据契约（结果 payload）

```ts
type GalaxyResult = {
  homePlanet: {
    code: string;          // e.g. "WTFI-XXXX"
    name: string;          // 主星名
    slug: string;          // 资产 slug
    axesVector: { W: number; T: number; F: number; I: number };
    headline: string;
    body: string;
    cardImageUrl: string;
  };
  moons: Array<{
    universeId: 'romance' | 'work' | 'late-night' | 'cpti' | 'soulti' | string;
    code: string;
    name: string;
    slug: string;
    headline: string;
    body: string;
    cardImageUrl: string;
  }>;
  shadow?: {
    axisScore: number;     // S ∈ [-3, +3]
    bucket:
      | 'SHADOW-DRIFT-A'
      | 'SHADOW-DRIFT-B'
      | 'SHADOW-NEUTRAL'
      | 'SHADOW-ANCHOR-B'
      | 'SHADOW-ANCHOR-A';
    slug: string;
    headline: string;
    body: string;
    tooltip: string;
    cardImageUrl: string;
  };
  orbit: Array<{ from: string; to: string; reason: string }>;
  meta: { resultId: string; createdAt: string; testVersion: string };
};
```

写入位置：`results.payload.galaxy`（沿用现有结果表）。

---

## 6. 关键交互细节

1. **HeroIntro**：1.5s 星系展开动画 → 主星亮起 → 大标题"你的人格星系"。**禁止**首屏出现"测试结果"四个字。
2. **HomePlanet**：长按可保存单卡；卡上自带二维码 + slogan。
3. **MoonRing**：横向 swipe，每张卡上有"恋爱里的你 / 加班时的你 / 深夜独处的你"前缀。
4. **ShadowGate**：CTA 文案：「你的星系还有一颗暗面星球未点亮 · 仅需 45 秒」按钮，跳转 S 轴 12 题。
5. **ShadowPlanet**：解锁动画 2.5s，包含"轰"的低频音效（可关闭）。Tooltip 折叠区藏 DMN / 内隐联想科普一句。
6. **OrbitMap**：SVG 连线 stagger 动画，给每条线一句解读（"恋爱时你倾向 → 卫星 A，但压力下你会被暗面拉回去"）。
7. **ConstellationCTA**：生成专属邀请链接 + 兼容度预告片（"她的暗面是 SHADOW-DRIFT-A，你们的兼容度可能 …"）。
8. **GalaxyShareDock**：固定底部，提供「全图保存（4-5 卡九宫格）」「主+暗 双卡」「邀请好友」三档。

---

## 7. 埋点（最小集合）

| 事件 | 触发 | 关键字段 |
| --- | --- | --- |
| `galaxy_result_view` | 首屏可见 | `resultId`, `homePlanetCode`, `moonsCount` |
| `moon_card_view` | 卫星卡进入视口 | `universeId`, `index` |
| `shadow_gate_click` | 点击"点亮暗面" | `resultId` |
| `shadow_questions_complete` | S 12 题完成 | `latencyAvgMs`, `dropoutAt` |
| `shadow_planet_view` | 暗面卡可见 | `bucket`, `slug` |
| `card_save` | 任意卡保存 | `cardType`, `slug` |
| `card_share` | 任意卡分享 | `cardType`, `slug`, `channel` |
| `constellation_invite_create` | 邀请链接生成 | `resultId` |

北极星指标计算：`avg(card_save 数 / 用户) × share / save`。

---

## 8. A/B 实验清单（W2 上线时）

| 实验 | 变体 A | 变体 B | 关键指标 |
| --- | --- | --- | --- |
| EXP-1 单卡 vs 星图 | 老 WTF Card 单卡结果 | 新星图（主+卫+暗） | 人均分享卡数 |
| EXP-2 暗面前置 vs 后置 | S 题穿插主测中 | S 题作为暗面解锁 | 完成率 |
| EXP-3 严肃 vs 荒诞 文案 | 严肃版 | 荒诞文学版 | 分享率 |
| EXP-4 双人 CTA 位置 | 仅 Footer | 解锁后立即 | K 系数 |

---

## 9. 工程上线 Checklist（W2）

- [ ] `result_payload.galaxy` schema 落库（DB migration + zod schema）
- [ ] `src/lib/wtfi/scoring-s.ts`（含 latency weighted）
- [ ] 12 题题库 JSON（feature flag `wtfti.shadowGateEnabled`）
- [ ] 星图首屏 LCP < 2.5s（preload 主星 + 暗面 webp）
- [ ] 全部卡 `download` API 复用现有 share-card 管线
- [ ] 埋点 8 件齐全 + Looker dashboard
- [ ] OG / Twitter 卡：主星单卡为默认；暗面解锁后切换暗面卡
- [ ] 文案审核：暗面 spicy 文案过敏感词机
- [ ] 18+ 提示语 + 分享卡水印 `wtfti.com`
