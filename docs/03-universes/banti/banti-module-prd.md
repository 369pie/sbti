# 班TI 模块 PRD — WTFTI「社畜宇宙」

> Owner: Product + Content
> Status: Active Universe PRD
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: Before each BanTI release wave
> Next Decision: Decide whether BanTI moves from MVP skeleton to a full growth and collection loop

> **一句话定义：** 同一套 29 型 WTFTI 人格，穿上职场的皮，在办公室里重新翻译一遍。
>
> **子品牌：** 班TI（读作"班替"）— **WTF 我在职场居然是这种人？**

---

## 一、为什么是班TI

| 论据 | 说明 |
|------|------|
| HPTI 验证了公式 | "知名场景 × 人格映射 × 统一卡牌模板" = 爆款。HPTI 首发帖 4119 赞 / 852 收 / 567 评 |
| 职场是最普适的场景 | 不依赖任何 IP，20-35 岁职场人是小红书第一大群体 |
| 零边际成本 | 复用 WTFTI 核心 29 型人格 + 15 维度测试，只需换文案层和视觉层 |
| 多宇宙首秀 | 班TI 是 WTFTI 第一个真正成立的"换皮宇宙"，验证多宇宙产品模型 |

---

## 二、产品结构

### 2.1 路由设计

```
/wtfti/work/              → 班TI 落地页（介绍 + 入口）
/wtfti/work/test/         → 班TI 测试页（复用 Quiz 组件 + 职场题包）
/wtfti/work/result/[type]/ → 班TI 结果页（29 型职场版文案 + 分享图）
```

### 2.2 与现有系统的关系

```
已有的 /work/             → 独立职场测试（16 型 · 5 维模型）→ 保持不变
新增的 /wtfti/work/       → WTFTI 社畜宇宙（29 型 · 15 维映射）→ 新模块

两者独立共存：
- /work/ = 面向"想测职场人设"的用户（轻量、独立体系）
- /wtfti/work/ = 面向"WTFTI 用户的职场翻译"（同一个我，不同宇宙）
```

### 2.3 数据流

```
用户答题 → 核心 15 维度评分（与 WTFTI 经典版相同）
          → 匹配到 29 型人格 slug
          → 跳转 /wtfti/work/result/{slug}/
          → 读取 banti-personalities.ts 中的职场版文案
          → 渲染结果页 + 生成分享图
```

---

## 三、数据结构

### 3.1 BantiPersonality 接口

```typescript
// src/lib/banti/personalities.ts

export interface BantiPersonality {
  /** 原 WTFTI slug（与 wtfti-personalities.ts 对齐） */
  slug: string;
  /** 原 WTFTI 编号 #001 ~ #029 */
  number: string;
  /** 班TI 职场版中文名 */
  workName: string;
  /** 4 字母 code（可与经典版相同或变体） */
  code: string;
  /** 搞笑 backronym */
  backronym: string;
  /** 一句话标签（职场语境） */
  tagline: string;
  /** 3 个职场标签（emoji + 短语） */
  tags: [string, string, string];
  /** 底部金句 */
  quote: string;
  /** 人格色（复用经典版） */
  color: string;
  /** 四段式文案（复用 WTFTI 结构但内容切换到职场） */
  copy: {
    wtfHit: string;
    osTranslation: string;
    symptoms: string[];
    closer: string;
  };
}
```

### 3.2 复用关系

| 层 | 复用来源 | 新增内容 |
|----|---------|---------|
| 15 维度定义 | `src/lib/dimensions.ts` | 无 |
| 题库 | — | `src/lib/banti/questions.ts`（独立办公室题包） |
| 评分逻辑 | `src/lib/scoring.ts` | 无 |
| slug → 人格匹配 | `src/lib/personalities.ts` | 无 |
| 结果文案 | — | `src/lib/banti/personalities.ts`（全新） |
| 角色图 | — | `public/images/types/banti/` → 首发 8 张先行 |
| 分享图模板 | 参考 WtftiShareImageGenerator | `BantiShareImageGenerator`（新模板） |

---

## 四、卡牌信息架构（5 段式）

每张卡统一模板，与 HPTI 验证过的结构对齐：

```
┌─────────────────────────────┐
│  ① 职场人设名（粗体大字）    │  → workName
│  ② CODE (Backronym)         │  → code + backronym
│                             │
│  ③ "你是那种……"一句话       │  → tagline
│                             │
│  📋 标签1                    │
│  ☕ 标签2                    │  → tags[0..2]
│  🏃 标签3                    │
│                             │
│  [角色主视觉 / 占位色块]     │  → Phase 1 用色块+emoji
│                             │
│  ④ "金句"                   │  → quote
│                             │
│  测测你的班TI → wtfti.com    │  → CTA
└─────────────────────────────┘
```

---

## 五、视觉风格：扁平杂志插画风（Editorial Flat）

| 特征 | 规范 |
|------|------|
| 画风 | 极简几何扁平插画 — 人物由色块 + 简单几何形构成 |
| 色彩 | 每人格一个主色调做大面积底色，配 1-2 强调色 |
| 构图 | 3:4 竖卡（小红书最佳比例），人物居中 |
| 质感 | 杂志排版感 — 干净留白 + 粗体大字 + 标签卡片 |
| 与经典版对比 | 经典 = 3D 潮玩手办感 → 班TI = 2D 平面设计感 |

### Phase 1 占位方案
- 无 AI 生图，用「主色底色 + 大尺寸 emoji + 白色几何卡片」合成
- Canvas 渲染，零外部依赖
- 效果参考：纯色背景 + 粗体中文名 + 标签条 + 底部金句

### Phase 2 升级方案
- 29 张 Editorial Flat 风格角色插画
- RunningHub text-to-image 批量生成角色主视觉，再由代码统一套卡面版式
- 输出到 `public/images/types/banti/{slug}.png`

---

## 六、分享图模板

### 站内分享图（Canvas 合成）

```
尺寸：540×960px（3:4，@2x 渲染）
底色：人格主色调 (浅化到 15% 不透明度)
布局：
  Y=40    [班TI / 社畜宇宙] 小标签
  Y=84    workName（大字粗体）
  Y=136   CODE + Backronym
  Y=182   tagline（一句话）
  Y=250   [角色主视觉区]
  Y=600   三个标签信息卡
  Y=735   底部金句黑条
  Y=860   二维码 + wtfti.com CTA
```

### 小红书首发图（同模板、不含维度条和二维码）

---

## 七、上线节奏

### Phase 1：MVP 骨架（本次实施）

- [x] `docs/03-universes/banti/banti-module-prd.md` — 本文档
- [x] `src/lib/banti/personalities.ts` — 29 型职场版人设映射完整数据
- [x] `src/lib/banti/questions.ts` — 16 道办公室题 + 1 个酒局隐藏分支
- [x] `src/app/wtfti/work/page.tsx` — 落地页（介绍 + 测试入口）
- [x] `src/app/wtfti/work/WtftiWorkLandingContent.tsx` — 落地页客户端组件
- [x] `src/app/wtfti/work/test/page.tsx` — 测试页（接入 `BantiQuiz` 独立题包）
- [x] `src/app/wtfti/work/result/[type]/page.tsx` — 结果页路由
- [x] `src/app/wtfti/work/result/[type]/BantiResultContent.tsx` — 结果页客户端组件
- [x] `src/components/BantiShareImageGenerator.tsx` — 分享图生成器
- [x] `docs/03-universes/banti/banti-launch-8-visual-plan.md` — 首发 8 张正式卡图素材方案
- [x] sitemap.ts 新增 /wtfti/work/ + 29 个结果页

**Phase 1 不含：**
- 全量 29 张正式角色插画（结果页仍以 emoji + 色块占位）
- `/wtfti/` 宇宙内二级入口位
- 首发封面图与九宫格包装图

### Phase 2：内容填充

- 先完成首发 8 张正式卡图，再扩到 29 张
- 缩略图裁切到 `public/images/types/banti/thumbs/`
- 题包从 16+1 扩展到 24-30 题，提高维度稳定性
- WTFTI 落地页 + 首页新增班TI 宇宙入口
- 分享图升级为图片+卡牌混排

### Phase 3：小红书投放

- 首发 8 张最有梗人格卡（竖图 3:4）
- 封面图（"班TI · 29 型社畜图鉴"）
- 引导文案："测测你在办公室是哪种人 → wtfti.com/wtfti/work/"
- 8 张候选：人形甘特图、茶水间情报局、工位隐形人、六点弹射器、精神离职人、操心项目办、汇报美学家、HR 头痛源

---

## 八、成功指标

| 指标 | Phase 1 目标 | Phase 3 目标 |
|------|------------|------------|
| 路由可访问 | 100% 页面无 404 | — |
| 结果页文案覆盖 | 29/29 | 29/29 |
| 小红书首发互动 | — | 单帖 500+ 赞 |
| 站内测试完成率 | — | > 60% |
| 分享图生成率 | — | > 30% 的完测用户 |
