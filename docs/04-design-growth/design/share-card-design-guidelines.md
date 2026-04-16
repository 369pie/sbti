# 分享卡片设计规范

> Owner: Design + Frontend
> Status: Active Design Guide
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: Before any share-card overhaul
> Next Decision: Decide whether every module must adopt dynamic-height and compact-footer rules

> 本文档规定 SBTI 所有模块分享卡片（ShareImageGenerator）的设计原则与布局参数。  
> 新增模块必须遵循本规范，现有模块版本迭代时也应逐步对齐。

---

## 一、核心设计原则

### 1. 图片即主角 — Image-First

- 人格图鉴图片是分享卡片的**视觉焦点**，必须占据卡片最大面积（≥ 38% 高度）。
- 图片区域应使用较宽的水平范围（左右边距 ≤ 60px），而非居中小卡片。
- 如果模块有 AI 生成的角色插画，务必加载并以 `drawImageContain` 绘制；仅在加载失败时回退到 emoji。

### 2. 紧凑尾部 — Compact Footer

- 底部包含二维码与链接的引导区域**仅保留够显示的空间**，不留多余空白。
- 标准 footer 高度 ≤ 98px（分割线 + CTA 文字 + URL + QR Code）。
- QR Code 尺寸 72×72 即可（64×64 最小可接受），不需要 80×80。
- Footer 采用**从底部定位**策略：`footerY = CARD_HEIGHT - 98`，确保无论上方内容多少，底部永远紧凑。

### 3. 信息层级 — Visual Hierarchy

从上到下的视觉权重：

```
图片 (Hero Image)  ▸ 最大面积，视觉焦点
  ↓
名称 + 编码        ▸ 粗体大字，快速识别
  ↓
稀有度 / 标语      ▸ 辅助信息，彩色药丸标签
  ↓
维度数据 / 描述    ▸ 数据可视化条形图
  ↓
引导区 (CTA + QR)  ▸ 紧凑排列，不抢视觉重心
```

### 4. 女性向审美 — Feminine Aesthetic

- 整体风格偏向温柔、精致、有设计品味。
- 背景色使用暖调：`#FFF5F7`（粉调）、`#FFF9F2`（奶油色）等柔和色。
- 描边使用半透明主题色，避免硬边。
- 圆角统一：外框 24px、图片容器 20-24px、药丸标签 14px、条形图 999px（全圆）。
- 角饰使用 `✦` 或 `·`，避免过于锐利的装饰。
- 字体使用 PingFang SC + SF Mono，大小适中，不拥挤不空旷。

---

## 二、标准卡片类型

### A. 奶油卡 + 居中图片（Standard Card）

适用模块：SBTI / Love / Work / XPTI / WTFTI / Drunk / Daily / Soulti

| 参数 | 标准值 |
|------|--------|
| 卡片宽度 | 540px |
| 卡片高度 | 1060px（5 维）/ 960px（特殊） |
| 缩放倍率 | 2× (Retina) |
| 图片区域 | x=60, w=420, h≥400 |
| 图片圆角 | 外框 24px，裁剪区 20px |
| 名称字号 | 700 42-48px |
| 编码字号 | 600-700 18-28px |
| 维度条高度 | 8-10px / 行距 28-46px |
| Footer 高度 | ≤ 98px |
| QR Code | 72×72，12px 圆角 |

**典型垂直布局（1060px 卡片）：**

```
┌──────────────────────────────┐  y=14 外框
│  ✦  Module Header  ✦        │  y=46
│                              │
│  ┌──────────────────────┐    │  y=88  图片起始
│  │                      │    │
│  │    Hero Character    │    │  h=400
│  │      Image           │    │
│  │                      │    │
│  └──────────────────────┘    │  y=488
│                              │
│       #001 · CODE            │  y=500
│     「人格名称」              │  y=548
│    ◆ 稀有度 · X% 人         │  y=596
│    ┌─ "标语引言" ──────┐     │  y=630
│    └───────────────────┘     │
│    四轴画像                   │  y=688
│    ████████░░░  A极 ←→ B极   │  ×4 rows, 46px each
│                              │
│  ─────────────────────────   │  y=962 (Footer)
│  测测你的 XX？    ┌────┐     │
│  https://...      │ QR │     │
│                   └────┘     │
└──────────────────────────────┘  y=1060
```

### B. 全出血 + 渐变覆盖（Full-Bleed Card）

适用模块：Banti / Kings / Delta

- AI 生成图片 `drawImageCover` 铺满整个卡片。
- 上方渐变遮罩保证文字可读；下方渐变遮罩放置信息卡片。
- Footer 已经非常紧凑（≤ 46px），无需进一步压缩。
- 毛玻璃特征卡片 + 引言色条是其独特视觉语言，保持不变。

### C. 多元素卡片（Multi-Element Card）

适用模块：Combo / CP / Squad

- 包含多个角色图像或动态高度。
- 布局规则相同：图片区优先、footer 紧凑。
- 因结构复杂度高，保持现有布局但确认 footer 不过度留白。

---

## 三、实现检查清单

新增模块分享卡片时，检查以下项目：

- [ ] 图片区域占卡片高度 ≥ 38%
- [ ] 图片宽度使用 `CARD_WIDTH - 120`（最多 60px 左右边距）
- [ ] Footer 使用从底部定位：`footerY = CARD_HEIGHT - 98`
- [ ] QR Code 尺寸 ≤ 72×72
- [ ] 名称/编码之间间距 ≤ 16px
- [ ] 维度条行距：全宽极性条 ≤ 46px，紧凑名称条 ≤ 28px
- [ ] 使用 Preview Modal（不是直接下载）
- [ ] 支持 `navigator.share` + 微信长按保存提示
- [ ] 背景色为暖柔色系
- [ ] 二维码使用模块专属 URL（非根 URL）

---

## 四、配色参考

| 模块 | 背景色 | 深色文字 | 中灰文字 | 分割线 |
|------|--------|----------|----------|--------|
| XPTI | `#FFF5F7` | `#2D2236` | `#6B5F72` | `#e8dce6` |
| Love / Work | `#FFF9F2` | `#2D2A26` | `#6B6560` | `#e8e0d6` |
| Drunk / Daily | `#FFF9F2` | `#2d2236` | `#6b6380` | `#e8e0d6` |
| Soulti | `#FDFAF6` | `#3D3530` | `#7A6E65` | `#E8E0D8` |
| Banti | full-bleed | cream→transparent | — | — |
| Kings | full-bleed | warm gold tones | — | — |
| Delta | full-bleed | olive green tones | — | — |

---

## 五、变更日志

| 日期 | 描述 |
|------|------|
| 2025-01 | 初版规范。图片区域从 280-320px 扩大至 400px+，footer 从 100-150px 压缩至 ≤98px，新增从底部定位策略。 |
