# 灵鉴卡（Mysti Card）UI 设计规范 & 前端实现方案

> 版本：v1.0  
> 适用范围：SBTI 项目「灵鉴」神秘学模块（单人结果页 & 双人合盘页）  
> 目标平台：小红书分享、微信私域传播、Web 端展示

---

## 一、Figma 设计描述

### 1.1 整体版式

灵鉴卡采用「**竖版神谕卡**」版式，强调「**塔罗牌面即视觉焦点**」。整体构图遵循古典对称美学，信息层级自上而下递进：

```
┌─────────────────────────────┐
│  ✦  顶部神秘学标识线  ✦     │  ← 12px 装饰带
├─────────────────────────────┤
│                             │
│      ┌─────────────┐        │  ← 塔罗牌面区域（视觉中心）
│      │             │        │    圆角容器 + 内发光边框
│      │   牌面图    │        │    占卡片宽度 76%
│      │             │        │    比例约 2:3（塔罗经典比例）
│      └─────────────┘        │
│                             │
│        编号 ·  CODE         │  ← 序列号
│      ═══════════════════    │
│         人格称号             │  ← 主标题
│      "一句神谕解读"          │  ← 副标题/引语
│                             │
│  ┌─────────────────────┐    │  ← 解读卡片
│  │  关键词标签云        │    │
│  │  命定解读 / 维度描述  │    │
│  └─────────────────────┘    │
│                             │
│  —— 品牌水印 · 二维码 ——    │  ← 底部
└─────────────────────────────┘
```

### 1.2 组成部分详解

| 区域 | 说明 | 设计细节 |
|------|------|----------|
| **塔罗牌面区** | 视觉焦点，必须最抢眼 | 圆角 `r=20`，带 1.5px 主题色描边 + 内发光；牌面图做 `object-fit: contain`，上下留少许「牌边」呼吸感 |
| **人格信息区** | 编号、CODE、称号、神谕 | 居中对齐；编号用 11px Mono 字间距 2px；CODE 用 20px Mono 加粗；称号用 36px Serif/Display 体；神谕用 15px 斜体 |
| **一句话解读** | 核心的社交传播金句 | 放在 quote card 内，左右带装饰引号「"」，背景为半透主题色面板 |
| **关键词/维度** | 3~5 个 pill 标签 | 居中换行排列，tag 高 28px，圆角 14px，细边框 |
| **品牌水印** | 左下角文案 + 右下角二维码 | 二维码带 8px 圆角白底衬垫 |
| **四角装饰** | 增强神秘学氛围 | 使用 `✦` 或 `◈` 符号，配合极淡的主题色透明度 |

### 1.3 色彩策略（双主题方案）

#### 主题 A：星夜秘典（Celestial Arcana）
适合追求**深邃、高贵、占星感**的用户。

| Token | 色值 | 用途 |
|-------|------|------|
| `bg-primary` | `#0B0D17` | 卡片主背景（接近漆黑的深蓝） |
| `bg-deep` | `#070810` | 边缘更深晕染 |
| `accent-gold` | `#C9A86C` | 主强调色（古铜金） |
| `accent-aura` | `#7B61FF` | 辅助灵光圈（星尘紫） |
| `text-strong` | `#F3EFE6` | 主文字（暖白） |
| `text-body` | `#B8B2A7` | 次要文字（旧纸色） |
| `text-muted` | `#6B665C` | 弱化文字 |
| `divider` | `rgba(201,168,108,0.25)` | 分隔线、细边框 |
| `card-surface` | `rgba(201,168,108,0.06)` | 解读卡片背景 |

**渐变策略**：
- 背景：径向渐变，中心 `#0F1220` → 边缘 `#070810`。
- 顶部 aura wash：`#7B61FF` @ 12% 透明度，中心亮、边缘消散。
- 底部 gold wash：`#C9A86C` @ 6% 透明度，营造地平面微光。

#### 主题 B：苍白圣痕（Pale Sacrament）
适合追求**神圣、复古、神谕感**的用户，小红书传播更「亮眼」。

| Token | 色值 | 用途 |
|-------|------|------|
| `bg-primary` | `#F7F4EF` | 卡片主背景（象牙白/羊皮纸） |
| `bg-deep` | `#EDE8E0` | 边缘晕染 |
| `accent-rose` | `#A85C64` | 主强调色（暗玫瑰金） |
| `accent-sage` | `#5E716A` | 辅助色（灰绿 sage，用于合盘或第二人格） |
| `text-strong` | `#2D2424` | 主文字（深褐） |
| `text-body` | `#5A4F4F` | 次要文字 |
| `text-muted` | `#9A8F8A` | 弱化文字 |
| `divider` | `rgba(168,92,100,0.25)` | 分隔线、细边框 |
| `card-surface` | `rgba(168,92,100,0.05)` | 解读卡片背景 |

**渐变策略**：
- 背景：径向渐变，中心 `#FAF8F4` → 边缘 `#EDE8E0`。
- 顶部 aura wash：`#A85C64` @ 8% 透明度。
- 底部 rose wash：`#A85C64` @ 4% 透明度。

### 1.4 字体规范

> Canvas 绘制时无法加载外部网络字体（CORS/性能风险），因此**只使用系统字体栈**。

| 层级 | 字体栈 | 字号 | 字重 | 字间距 |
|------|--------|------|------|--------|
| 编号/模块标识 | `SF Mono`, `Roboto Mono`, monospace | 11px | 500 | 2px |
| CODE | `SF Mono`, `Roboto Mono`, monospace | 18px | 600 | 4px |
| 人格称号 | `"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif` | 36px | 700 | 0.5px |
| 神谕引语 | `"PingFang SC", "Noto Sans SC", sans-serif` | 15px | 500 italic | 0.3px |
| 正文/解读 | `"PingFang SC", "Noto Sans SC", sans-serif` | 14px | 400 | 0 |
| 标签文字 | `"PingFang SC", "Noto Sans SC", sans-serif` | 12px | 600 | 0 |
| 底部水印 | `"PingFang SC", "Noto Sans SC", sans-serif` | 12px | 500 | 0 |

**Figma 设计建议**：
- 在 Figma 中可以使用「思源宋体」或「方正清刻本悦宋」作为称号字体，体现神秘学高级感。
- 引语部分可尝试 slightly italic 或 Optical size 调节，增加神谕氛围。

### 1.5 边距与尺寸（设计稿基准：540×?）

| 元素 | 尺寸/边距 |
|------|-----------|
| 卡片设计宽度 | 540px（与现有 ShareImageGenerator 保持一致） |
| 卡片实际渲染宽度 | 1080px（SCALE=2） |
| 左右安全边距 | 36px |
| 塔罗牌面容器宽度 | 428px（540 - 112） |
| 塔罗牌面容器高度 | 642px（2:3 比例） |
| 牌面图内边距 | 容器内留 10px "牌边"，图实际绘制区 408×622 |
| 模块标识区顶部边距 | 46px |
| 各模块之间间距 | 24~32px |
| quote card 内边距 | 20px 水平，16px 垂直 |
| tag 高度 / 圆角 | 28px / 14px |
| tag 间距 | 8px |
| 二维码尺寸 | 56×56px |
| 底部高度 | 90px |
| 圆角外框 | r=24，距离边缘 14px |
| 内框 | r=18，距离边缘 22px |

---

## 二、Canvas 实现方案

### 2.1 分辨率与输出

沿用现有架构，保证与 WTFTI / XPTI 分享图生成器一致：

```ts
const CARD_W = 540;
const MAX_H = 4000;   // 超大画布，最后按实际内容裁剪
const SCALE = 2;      // 输出 1080px 宽，适配小红书/微信高清图
```

输出格式：`image/png`（保留透明边缘或纯色背景）。

### 2.2 层级结构（从底到顶）

```
Layer 0: 纯色背景填充
Layer 1: 径向渐变 aura wash（中心亮 → 边缘消散）
Layer 2: 底部渐变 glow
Layer 3: 顶部装饰线（线性渐变 fade-in/out）
Layer 4: 塔罗牌面容器（shadow + surface + stroke）
Layer 5: 牌面图（clip to rounded rect）
Layer 6: 人格信息文字（编号 / CODE / 称号 / 神谕）
Layer 7: Quote card（背景 + 边框 + 文字）
Layer 8: 关键词标签云（pill badges）
Layer 9: 底部分隔线 + 品牌文案 + 二维码
Layer 10: [裁剪后叠加] 双层圆角边框 + 四角装饰符号
```

### 2.3 渐变背景绘制逻辑

```ts
// 1. 底色
ctx.fillStyle = theme.bgPrimary;
ctx.fillRect(0, 0, CARD_W, MAX_H);

// 2. 顶部 aura wash（星尘紫或玫瑰金）
const aura = ctx.createRadialGradient(CARD_W/2, 280, 0, CARD_W/2, 280, 420);
aura.addColorStop(0, hexToRgba(theme.accentAura, 0.12));
aura.addColorStop(1, hexToRgba(theme.accentAura, 0));
ctx.fillStyle = aura;
ctx.fillRect(0, 0, CARD_W, 720);

// 3. 底部微光
const glow = ctx.createRadialGradient(CARD_W/2, MAX_H, 0, CARD_W/2, MAX_H, 400);
glow.addColorStop(0, hexToRgba(theme.accentGold, 0.06));
glow.addColorStop(1, hexToRgba(theme.accentGold, 0));
ctx.fillStyle = glow;
ctx.fillRect(0, MAX_H - 400, CARD_W, 400);
```

### 2.4 装饰元素

| 装饰 | 实现方式 |
|------|----------|
| 顶部装饰线 | `createLinearGradient(60→480)`，两端 transparent，中段 `accent` @ 30% 透明度，线宽 1px |
| 四角符号 | 裁剪后的 `croppedCanvas` 上绘制 `✦`（星夜主题）或 `◈`（苍白主题），字号 14px，颜色 `accent` @ 40% |
| 分隔线 | 同顶部装饰线逻辑，或使用 fade gradient line |
| 牌面容器内发光 | `ctx.save(); ctx.shadowColor = hexToRgba(accent, 0.25); ctx.shadowBlur = 24; ctx.shadowOffsetY = 0; roundRectPath(...); ctx.fillStyle='rgba(0,0,0,0)'; ctx.fill(); ctx.restore();` |

### 2.5 图片裁剪/容器逻辑

塔罗牌面图通常为竖版插画，需要保持比例完整展示（不能被裁切）：

```ts
function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const s = Math.min(w / sw, h / sh);
  const dw = sw * s;
  const dh = sh * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
```

牌面绘制步骤：
1. 绘制外层容器圆角矩形（带 shadow）。
2. `ctx.save()` → `roundRectPath(innerX, innerY, innerW, innerH, r-2)` → `ctx.clip()`。
3. 在 clip 区域内调用 `drawImageContain`。
4. `ctx.restore()`。
5. 绘制容器边框 `strokeRoundedRect`。

**注意**：塔罗牌面区域建议上下各留 10px「牌边」（即图片实际绘制区比容器小 20px），模拟真实塔罗牌的边框感。

---

## 三、React 组件设计

### 3.1 建议组件名与文件位置

```
src/components/MystiShareImageGenerator.tsx      # 分享图生成器（核心）
src/components/MystiCard.tsx                      # 可选：纯展示用 DOM 卡片
src/lib/mysti/themes.ts                           # 主题色配置表
src/lib/mysti/types.ts                            # 灵鉴相关类型定义
```

### 3.2 Props 接口

```ts
// src/lib/mysti/types.ts
export interface MystiPersonality {
  slug: string;
  code: string;           // 如 "THE-FOOL"
  number: string;         // 如 "0"
  name: string;           // 人格称号，如 "愚者"
  tagline: string;        // 神谕短句
  description: string;    // 长描述（用于 quote card）
  color: string;          // 主色（可被主题覆盖）
  keywords: string[];     // 关键词标签
  cardImageUrl: string;   // 塔罗牌面图 URL
}

export type MystiThemePreset = 'celestial' | 'pale-sacrament';
```

```ts
// src/components/MystiShareImageGenerator.tsx
export interface MystiShareImageHandle {
  generate: () => void;
}

interface MystiShareImageGeneratorProps {
  personality: MystiPersonality;
  theme?: MystiThemePreset;
  /** 双人合盘时传入第二位人格 */
  partner?: MystiPersonality;
  /** 合盘关系关键词，如 "灵魂共鸣 · 镜像之旅" */
  bondTagline?: string;
}
```

### 3.3 与现有分享图组件的关系

| 现有组件 | 关系 |
|----------|------|
| `WtftiShareImageGenerator.tsx` | **直系参考**：学习其 `forwardRef` 模式、`generating` 状态管理、弹窗 UI、移动端分享降级逻辑 |
| `XptiShareImageGenerator.tsx` | **风格参考**：学习其 preset 系统（`resolveXptiShareCardPreset`）、暗调渐变技法、双层边框裁剪逻辑 |

**建议复用逻辑**：
- 复用 `imageCache` 与 `getCachedImage` 的图片预加载机制。
- 复用 `toQrDataUrl` 生成二维码。
- 复用 `isMobile()`、`isWeChatBrowser()` 等环境判断。
- 复用弹窗的 HTML 结构与交互（关闭按钮、保存/分享双 CTA、saveHint 提示）。

**不建议复用**：
- 不直接继承 WTFTI / XPTI 的 Canvas 渲染函数（视觉风格差异过大）。
- 独立编写 `renderMystiShareImage()`，保持神秘学风格的绘制自由度。

### 3.4 组件内部结构草图

```tsx
export const MystiShareImageGenerator = forwardRef<MystiShareImageHandle, MystiShareImageGeneratorProps>(
  function MystiShareImageGenerator({ personality, theme = 'celestial', partner, bondTagline }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderMystiShareImage({
          personality,
          theme,
          partner,
          bondTagline,
        });
        setPreviewUrl(dataUrl);
      } catch (e) {
        console.error('Mysti card generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, personality, theme, partner, bondTagline]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    // ... 弹窗 UI 与 WTFTI/XPTI 保持一致 ...
  }
);
```

---

## 四、双人合盘版灵鉴卡变体

### 4.1 设计目标
在同一张卡片上展示两人信息，强调「**命运交织**」的仪式感，避免信息拥挤。

### 4.2 布局变体

**方案：左右双牌 · 中央合盘**

```
┌─────────────────────────────┐
│      ✦  灵鉴 · 合盘  ✦      │
├─────────────────────────────┤
│  ┌─────┐         ┌─────┐    │
│  │牌面A│  ⟡  ⟡  ⟡  │牌面B│    │  ← 两张牌缩小并列
│  └─────┘         └─────┘    │    中间用合盘符号连接
│    称号A           称号B      │
│    CODE A          CODE B     │
├─────────────────────────────┤
│   "关系神谕 / bondTagline"    │  ← 核心金句
│      关系关键词标签云          │
├─────────────────────────────┤
│   品牌水印 · 二维码           │
└─────────────────────────────┘
```

### 4.3 尺寸调整（基于 540px 画布）

| 元素 | 单人版 | 双人合盘版 |
|------|--------|------------|
| 牌面容器宽度 | 428px | 198px（每张） |
| 牌面容器高度 | 642px | 297px（每张，保持 2:3） |
| 两张牌间距 | — | 32px |
| 牌面左右边距 | 56px | 56px（整体容器居中） |
| 称号字号 | 36px | 22px |
| CODE 字号 | 18px | 13px |
| 关系神谕 quote card | 全宽 - 72px | 全宽 - 72px（不变） |

### 4.4 色彩区分（双人格）

- **牌面 A 边框**：使用主题主色（如 `accent-gold` / `accent-rose`）。
- **牌面 B 边框**：使用主题辅色（如 `accent-aura` / `accent-sage`），或直接使用 `partner.color`。
- **中央连接符号**：使用渐变或双色叠加（如左半边 gold、右半边 aura），增强「融合」意象。

### 4.5 实现策略

在 `renderMystiShareImage` 中通过 `partner` 参数做分支：

```ts
async function renderMystiShareImage(options: RenderOptions) {
  const { personality, partner, theme } = options;
  const isDuo = !!partner;

  // ... 预加载图片（可能同时加载 A/B 两张牌面图）

  // ... 绘制背景（与单人版相同）

  if (isDuo) {
    // 绘制左牌
    drawCardFrame(ctx, 56, y, 198, 297, personality.color);
    drawCardImage(ctx, cardImageA, 66, y+10, 178, 277);
    // 绘制右牌
    drawCardFrame(ctx, 286, y, 198, 297, partner.color);
    drawCardImage(ctx, cardImageB, 296, y+10, 178, 277);
    // 绘制中央连接符号
    // 绘制双称号
  } else {
    // 单人版逻辑
  }
}
```

---

## 五、动效/交互建议

### 5.1 抽牌动画（结果页入场）

**目标**：模拟真实塔罗抽牌，强化仪式感。

**实现方案（CSS/React）**：

```tsx
// 结果页中，塔罗牌面区域使用 3D flip
<motion.div
  initial={{ rotateY: 180, opacity: 0 }}
  animate={{ rotateY: 0, opacity: 1 }}
  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
>
  {/* 牌背（可放神秘学图案 SVG）→ 翻转后显示牌面图 */}
</motion.div>
```

**细节**：
- 翻转过程中加入轻微 `scale(1.05)` 再回落到 `scale(1)`，模拟「抽起-落下」的物理感。
- 翻转结束后，从牌面中心向外扩散一个 `box-shadow` 脉冲光环（`animate-ping` 或 framer-motion）。

### 5.2 生成卡片时的过渡效果

在 `MystiShareImageGenerator` 的弹窗中：

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
  transition={{ duration: 0.35, ease: 'easeOut' }}
>
  <img src={previewUrl} alt="灵鉴卡" />
</motion.div>
```

- 生成按钮点击后，先显示 Loading spinner，再淡入高清图。
- 图片加载完成后，可叠加一个极短的 `brightness` 闪烁（从 `brightness(1.1)` 回落至 `1`），暗示「灵光一现」。

### 5.3 分享按钮悬停动效

- 保存按钮：hover 时边框亮度提升 `border-white/30` → `border-white/60`。
- 分享按钮：hover 时添加 `box-shadow: 0 0 20px rgba(accent, 0.4)`，模拟「能量涌动」。

### 5.4 结果页文字入场 stagger

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  }}
>
  {/* 编号、CODE、称号、神谕依次淡入上移 */}
</motion.div>
```

---

## 六、附录：快速开发 Checklist

- [ ] 创建 `docs/mysti-card-ui-spec.md`（本文档）
- [ ] 创建 `src/lib/mysti/themes.ts`，导出两个完整 preset 对象
- [ ] 创建 `src/lib/mysti/types.ts`，定义 `MystiPersonality` 等类型
- [ ] 创建 `src/components/MystiShareImageGenerator.tsx`
  - [ ] 复用 `imageCache` / `getCachedImage`
  - [ ] 复用弹窗 UI 结构
  - [ ] 编写 `renderMystiShareImage()` 核心渲染函数
  - [ ] 支持 `partner` 双人合盘分支
- [ ] 在结果页引入 `MystiShareImageGenerator` 并绑定 `ref`
- [ ] 为结果页塔罗牌区域添加 3D flip 抽牌动画
- [ ] 设计验收：导出 PNG 后在手机上检查清晰度、色彩、文字可读性
- [ ] 小红书测试：分享到小红书，检查竖版构图在手机 feed 流中的视觉冲击力

---

## 七、参考文件索引

| 文件 | 说明 |
|------|------|
| `src/components/WtftiShareImageGenerator.tsx` | Canvas 渲染基础架构、弹窗交互、下载分享逻辑 |
| `src/components/XptiShareImageGenerator.tsx` | 暗调风格绘制技法、preset 系统、双层边框裁剪 |
| `src/app/wtfti/result/[type]/WtftiResultContent.tsx` | 结果页结构、分享按钮集成方式、动画入场参考 |
