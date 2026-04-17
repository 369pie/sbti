/**
 * <Glyph /> — v4 "Editorial Atelier" 单色手绘 glyph 系统
 *
 * 替代 UI chrome 里的 emoji (💥 🧠 📋 ✨ 🌙 🔮 等)，只用在容器/section-header/button，
 * **不替代** 人格图鉴数据里的 emoji (那是人格身份的一部分)。
 *
 * 全部 24×24，单色 stroke 为主 + gold hairline 细节；色彩遵循 `currentColor`。
 * 设计语言：铜版画感，1.25px stroke，stroke-linecap: round，细节克制。
 */

import type { SVGProps } from 'react';

export type GlyphName =
  | 'strike'     // 一击 — 羽毛笔尖
  | 'mind'       // OS 解读 — 半开的眼睛
  | 'list'       // 症状清单 — 处方笺
  | 'copy'       // 复制 — 双页
  | 'star'       // ✨ 四角星点
  | 'moon'       // 🌙 月相
  | 'tarot'      // 🔮 塔罗牌背
  | 'feather'    // 羽毛
  | 'bookmark'   // 收藏 / 加入图鉴
  | 'lotus'      // 🌹/✿ 花
  | 'diamond'    // ◆ 宝石（Gem）
  | 'heart'      // ♡ 轻心
  | 'spark'      // 💫 单星点
  | 'bolt'       // ⚡ 细闪电
  | 'flame';     // 🔥 细火苗

type GlyphProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: GlyphName;
  size?: number | string;
  /** stroke-width, defaults to 1.25px for editorial hairline */
  weight?: number;
  /** 是否使用 gold hairline 作为点缀色 */
  tone?: 'ink' | 'gold' | 'rose';
};

const TONE_CLASSNAME: Record<NonNullable<GlyphProps['tone']>, string> = {
  ink: 'text-[var(--color-ink-soft)]',
  gold: 'text-[var(--color-gold)]',
  rose: 'text-[var(--color-rose)]',
};

/**
 * Single-source 24×24 paths. All coordinates assume a 24 viewBox.
 * 保持手绘感：避免完美几何，偶尔不对称。
 */
const PATHS: Record<GlyphName, (weight: number) => React.ReactNode> = {
  strike: (w) => (
    <>
      {/* 羽毛笔尖 — 斜向下的细长笔尖 */}
      <path
        d="M5 19 L15 7 M15 7 L19 5 L18 9 L15 7 Z M8 16 L10 14"
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="19" r="0.8" fill="currentColor" />
    </>
  ),
  mind: (w) => (
    <>
      {/* 半开的眼睛 — 上睫毛曲线 + 虹膜 */}
      <path
        d="M3 13 Q12 6 21 13"
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M3 13 Q12 18 21 13"
        strokeWidth={w * 0.7}
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="12" cy="13" r="2.2" strokeWidth={w} fill="none" />
      <circle cx="12" cy="13" r="0.7" fill="currentColor" />
    </>
  ),
  list: (w) => (
    <>
      {/* 处方笺 — 带凹角的纸张 + 三条横线 */}
      <path
        d="M6 4 H15 L18 7 V20 H6 Z M15 4 V7 H18"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M9 11 H15 M9 14 H15 M9 17 H13" strokeWidth={w * 0.85} strokeLinecap="round" />
    </>
  ),
  copy: (w) => (
    <>
      {/* 双页 — 后页 + 前页 */}
      <rect x="8" y="7" width="11" height="13" rx="1" strokeWidth={w} fill="none" />
      <path
        d="M5 16 V5 a1 1 0 0 1 1-1 H14"
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  star: (w) => (
    <>
      {/* 四角星 — 手绘感尖细 */}
      <path
        d="M12 3 Q12.4 11.6 21 12 Q12.4 12.4 12 21 Q11.6 12.4 3 12 Q11.6 11.6 12 3 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  moon: (w) => (
    <>
      {/* 新月 — 克制的 D 形 */}
      <path
        d="M17 4 a8 8 0 1 0 3 13 a7 7 0 0 1 -3 -13 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  tarot: (w) => (
    <>
      {/* 塔罗牌背 — 长方形 + 内框 + 菱形 */}
      <rect x="6" y="3" width="12" height="18" rx="1.2" strokeWidth={w} fill="none" />
      <rect x="8" y="5" width="8" height="14" rx="0.5" strokeWidth={w * 0.6} fill="none" opacity="0.55" />
      <path
        d="M12 9 L15 12 L12 15 L9 12 Z"
        strokeWidth={w * 0.85}
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  feather: (w) => (
    <>
      <path
        d="M6 20 L18 8 M18 8 Q20 6 19 4 Q17 3 15 5 L7 13 Q6 14 6 15 L6 17 L9 17 Q10 17 11 16 L19 8"
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  bookmark: (w) => (
    <>
      <path
        d="M7 4 H17 V20 L12 16 L7 20 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  lotus: (w) => (
    <>
      {/* 简化的三瓣花 */}
      <path
        d="M12 4 Q9 10 12 13 Q15 10 12 4 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M5 10 Q9 13 12 13 Q9 18 5 16 Q4 13 5 10 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M19 10 Q15 13 12 13 Q15 18 19 16 Q20 13 19 10 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="0.9" fill="currentColor" />
    </>
  ),
  diamond: (w) => (
    <>
      <path
        d="M12 3 L20 12 L12 21 L4 12 Z M4 12 H20 M12 3 L8 12 L12 21 M12 3 L16 12 L12 21"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  heart: (w) => (
    <>
      <path
        d="M12 20 C 4 14 4 7 8 6 Q 11 5 12 9 Q 13 5 16 6 C 20 7 20 14 12 20 Z"
        strokeWidth={w}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  spark: (w) => (
    <>
      <path
        d="M12 4 V20 M4 12 H20 M7 7 L17 17 M17 7 L7 17"
        strokeWidth={w * 0.7}
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  bolt: (w) => (
    <path
      d="M13 3 L6 13 H11 L10 21 L17 10 H12 Z"
      strokeWidth={w}
      fill="none"
      strokeLinejoin="round"
    />
  ),
  flame: (w) => (
    <path
      d="M12 3 Q14 8 17 11 Q19 14 17 17 Q15 21 12 21 Q9 21 7 17 Q5 14 7 11 Q9 9 10 6 Q11 8 12 3 Z"
      strokeWidth={w}
      fill="none"
      strokeLinejoin="round"
    />
  ),
};

export function Glyph({
  name,
  size = 18,
  weight = 1.25,
  tone,
  className,
  style,
  ...rest
}: GlyphProps) {
  const render = PATHS[name];
  const toneClass = tone ? TONE_CLASSNAME[tone] : '';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[toneClass, className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-block',
        verticalAlign: '-0.18em',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {render(weight)}
    </svg>
  );
}

export default Glyph;
