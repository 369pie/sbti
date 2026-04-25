# WTFTI Site · Brand Spec
> 采集日期：2026-04-23
> 资产来源：用户提供的两张品牌色板参考图
>   · Light（默认）= **Summer Blush · 夏日奶茶系**（用户最新指定，覆盖之前所有声明）
>   · Dark         = **LUMINA RITUAL**（之前已落地）
> 应用方法论：huashu-design Skill · §1.a 核心资产协议 · 颜色严格按图卡

---

## 字型（Display × Body）

- Display 中文：Noto Serif SC（站点变量 `--font-serif-sc`）
- Display 英文：Cormorant Garamond（站点变量 `--font-cormorant`）
  · 参考图标的 Playfair Display 与 Cormorant 同属 high-contrast didone serif；中文站点统一用 Cormorant 与 Noto Serif SC 配对。
- Editorial 长文：Fraunces（`--font-fraunces`）
- Body：Noto Sans SC + PingFang SC + system sans
- 手写副标（可选）：Dancing Script — 仅用于 hero 装饰
- Mono / 标签：JetBrains Mono / SF Mono — eyebrow / 数据 HUD
- 反 slop 守则：禁止 Inter / Roboto / Arial 当 display

---

## Theme A · SUMMER BLUSH（light · 默认 · 严格按参考图）

| 角色 | 名称 | hex | 用途 |
|---|---|---|---|
| Primary | Strawberry Pink | `#F59BB8` | 唯一主 accent · CTA / link / focus |
| Secondary | Peach Milk | `#F7C7B8` | 暖色辅 accent · tag / hover |
| Accent | Rose Mist | `#FAD6E0` | 卡片浮层 · 软徽章 · 装饰边线 |
| Background | Milk Cream | `#FFF7F8` | 主背景 · body · section |
| Highlight | Ice Blush | `#FCE9F0` | 二级背景 · subtle hover |
| Accent 2 | Matcha Leaf | `#C7D7A2` | 清新对位 · 成功色 / CTA-2 |
| Text | Pearl Cocoa | `#4D2C2F` | 主文字 · 主标题 |

### 派生（基色 mix · 不引入新色相）

| token | 值 | 用途 |
|---|---|---|
| `--color-text-secondary` | `#6E4549` | 副文字（5.6:1 → AA） |
| `--color-text-muted`     | `#9C7178` | 仅限 ≥18px caption（3.2:1） |
| `--color-stone`          | `#B89098` | 装饰线 / 时间戳 |
| `--color-border`         | `#F2C0CE` | 主边线 |
| `--color-rose-deep`      | `#E07AA0` | hover / pressed |
| `--color-ember`          | `#C2596F` | 警告 / 删除 |
| `--color-gem`            | `#A6BB78` | 强调成功 |
| `--color-paper-warm`     | `#FFF1EE` | 暖区 hero |

### 对比度（WCAG）

| 前景 | 背景 | 比 | 等级 |
|---|---|---|---|
| Pearl Cocoa `#4D2C2F` | Milk Cream `#FFF7F8` | **12.8 : 1** | AAA · body |
| `#6E4549` | Milk Cream | **5.6 : 1** | AA |
| `#9C7178` | Milk Cream | 3.2 : 1 | AA Large only |
| Strawberry `#F59BB8` | Milk Cream | 2.0 : 1 | 仅色块/边框/icon · **不当文字色** |
| Pearl Cocoa | Strawberry `#F59BB8` | **5.6 : 1** | AA · 按钮文字 |
| Matcha `#C7D7A2` | Pearl Cocoa | **9.4 : 1** | AAA · 反白绿底 |

### 视觉签名（一个细节做到 120%）

- **奶霜光带** · hero 用 `radial-gradient` Ice Blush → Milk Cream → 真白
- **粉色发丝线** · 所有 hairline 用 `rgba(245,155,184,0.55)` 单色细线
- **桃乳描金** · `.gold-leaf-text` 走 Rose Mist → Peach Milk → Strawberry，不再用真金
- **Matcha 对位** · 唯一允许的对比色，仅 success / CTA-2，频次 ≤ 5%

---

## Theme B · LUMINA RITUAL（dark · 不变）

| 角色 | hex |
|---|---|
| Midnight Indigo | `#0C0A22` |
| Cosmos Plum | `#1C1338` |
| Velvet Violet | `#3B2A63` |
| Rose Glow | `#D9A0B6` |
| Soft Gold Pink | `#E7C5B5` |
| Misty Lilac | `#B7A3C9` |
| Moon Cream | `#F5EEE9` |

---

## 禁区（huashu-design 反 slop · 强制）

- ❌ 紫蓝科技渐变（dark 紫是品牌签名 ≠ slop）
- ❌ Emoji 当 icon（仅 UGC）
- ❌ 圆角卡片 + 左侧彩色 border accent
- ❌ Inter / Roboto / Arial 用作 display
- ❌ 临时新增 hex — **任何颜色必须来自上表或派生表**
- ❌ light 主题出现紫 / 蓝 / 真金箔
- ❌ CSS 剪影替代真实素材

---

## token 映射

写入 `src/app/globals.css`：
- `:root` + `body[data-theme='wtfti-light']` → SUMMER BLUSH
- `body[data-theme='galaxy']` + `body[data-theme='wtfti-dark']` → LUMINA RITUAL

组件必须用 token；遗留 `bg-white(/数字)?` 在 dark 主题由 rescue 层自动重映射；
功能性白底（QR 等）打 `data-keep-white` 跳过映射。
