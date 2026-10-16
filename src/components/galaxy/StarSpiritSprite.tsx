'use client';

/**
 * StarSpiritSprite · 参数化星灵萌宠（v2 · 2026-08-16 具象化重构）
 *
 * 形态由成长阶段决定（茧→幼灵→成灵→共生体），色相由人格哈希决定（rose/gold/violet），
 * 辉度由连续夜数决定。全部确定性渲染，无随机。
 *
 * v2：从抽象星云椭圆升级为具象萌宠——圆脸、大眼、腮红、头顶星芒、茧丝纹路。
 * props 接口不变，所有调用点（结果页星灵卡 / 首页 showcase / /today）自动升级。
 */

import type { SpiritHue, StarSpiritStage } from '@/lib/wtfi/star-spirit';

const HUE_VARS: Record<SpiritHue, { main: string; soft: string; glow: string }> = {
  rose: {
    main: 'var(--color-accent, #CD8299)',
    soft: 'var(--color-rose-dust, #F1D2DB)',
    glow: 'rgba(205,130,153,0.30)',
  },
  gold: {
    main: 'var(--color-gold, #D0AB7C)',
    soft: 'var(--color-gold-soft, #E9CDAE)',
    glow: 'rgba(208,171,124,0.30)',
  },
  violet: {
    main: 'var(--color-violet-text, #7A5CD6)',
    soft: 'var(--galaxy-violet-soft, #C9B6FF)',
    glow: 'rgba(156,124,255,0.28)',
  },
};

/** 五官用色：深浓缩棕（任何色相身体上都可读） */
const INK = 'var(--color-text-primary, #3D2C23)';
/** 腮红：统一初樱浅粉，所有色相适用 */
const BLUSH = 'var(--color-rose-dust, #F1D2DB)';

/** 确定性伪随机星屑（同 slug 永远同分布；分布在身体外圈，不盖脸） */
function dots(seedStr: string, count: number, radius: number): Array<{ cx: number; cy: number; r: number; o: number }> {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const rand = () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = 24 + rand() * (radius - 26);
    return {
      cx: 50 + Math.cos(angle) * dist,
      cy: 52 + Math.sin(angle) * dist * 0.8,
      r: 0.7 + rand() * 1.3,
      o: 0.35 + rand() * 0.55,
    };
  });
}

function seedNum(seedStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i += 1) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

/** 四芒星（原点居中，用 transform 定位/缩放/旋转） */
const SPARKLE = 'M0 -7 L1.9 -1.9 L7 0 L1.9 1.9 L0 7 L-1.9 1.9 L-7 0 L-1.9 -1.9 Z';

interface Props {
  stage: StarSpiritStage;
  hue: SpiritHue;
  brightness: number; // 0..1（连续夜数驱动）
  size?: number;
  seed?: string;
}

export function StarSpiritSprite({ stage, hue, brightness, size = 120, seed = 'wtfti' }: Props) {
  const c = HUE_VARS[hue];
  const b = brightness;
  const k = stage.key;
  const glowAlpha = 0.08 + b * 0.2;
  const starRot = (seedNum(seed) % 24) - 12;
  const dotCount = k === 'cocoon' ? 3 : k === 'juvenile' ? 6 : k === 'adult' ? 9 : 13;
  const pts = dots(`${seed}:${k}`, dotCount, 38);
  const isGrown = k !== 'cocoon';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* 光晕（亮度随连续夜数） */}
      <circle cx="50" cy="56" r={30 + b * 10} fill={c.glow} opacity={glowAlpha} />

      {/* 轨道环（成灵一圈 · 共生体两圈） */}
      {(k === 'adult' || k === 'symbiont') && (
        <ellipse
          cx="50" cy="58" rx="36" ry="11.5"
          fill="none" stroke={c.soft} strokeWidth={1}
          opacity={0.45 + b * 0.3}
          transform="rotate(-14 50 58)"
        />
      )}
      {k === 'symbiont' && (
        <ellipse
          cx="50" cy="58" rx="43" ry="14"
          fill="none" stroke={c.main} strokeWidth={0.8}
          opacity={0.3 + b * 0.25}
          transform="rotate(16 50 58)"
        />
      )}

      {/* 落影 */}
      <ellipse cx="50" cy="86" rx="18" ry="3.6" fill={INK} opacity={0.08} />

      {!isGrown ? (
        /* ── 星茧：沉睡的蛋形茧，闭眼 + 茧丝纹 + 顶部透光 ── */
        <g>
          <ellipse cx="50" cy="55" rx="21" ry="26" fill={c.main} opacity={0.55} />
          <path d="M33 47 Q50 40.5 67 47" fill="none" stroke={c.soft} strokeWidth={1.3} opacity={0.75} />
          <path d="M32 58 Q50 64.5 68 58" fill="none" stroke={c.soft} strokeWidth={1.3} opacity={0.75} />
          <path d="M35 68 Q50 73 65 68" fill="none" stroke={c.soft} strokeWidth={1.1} opacity={0.6} />
          <circle cx="50" cy="30" r={2.4 + b * 1.6} fill={c.soft} opacity={0.6 + b * 0.4} />
          <path d="M42 54 Q45 56.5 48 54" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
          <path d="M52 54 Q55 56.5 58 54" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
          <ellipse cx="37" cy="59.5" rx="3" ry="1.9" fill={BLUSH} opacity={0.7} />
          <ellipse cx="63" cy="59.5" rx="3" ry="1.9" fill={BLUSH} opacity={0.7} />
        </g>
      ) : (
        /* ── 幼灵 / 成灵 / 共生体：圆脸萌宠 ── */
        <g>
          {/* 星角耳朵（成灵起） */}
          {k !== 'juvenile' && (
            <>
              <path d="M31 42 L35 30 L41 40 Z" fill={c.main} opacity={0.92} />
              <path d="M59 40 L65 30 L69 42 Z" fill={c.main} opacity={0.92} />
            </>
          )}
          {/* 小手 */}
          <ellipse cx="27.5" cy="63" rx="4.2" ry="5.6" fill={c.main} opacity={0.9} transform="rotate(12 27.5 63)" />
          <ellipse cx="72.5" cy="63" rx="4.2" ry="5.6" fill={c.main} opacity={0.9} transform="rotate(-12 72.5 63)" />
          {/* 身体 */}
          <ellipse cx="50" cy="58" rx={k === 'juvenile' ? 23 : 25} ry={k === 'juvenile' ? 24 : 26} fill={c.main} opacity={0.94} />
          {/* 腹部高光 */}
          <ellipse cx="50" cy="66.5" rx="12" ry="10" fill={c.soft} opacity={0.55} />
          {/* 头顶星芒（共生体带光晕） */}
          {k === 'symbiont' && <circle cx="50" cy="26" r="9" fill={c.soft} opacity={0.3 + b * 0.2} />}
          <path
            d={SPARKLE}
            fill={c.soft}
            opacity={0.65 + b * 0.35}
            transform={`translate(50 ${k === 'juvenile' ? 29 : 26}) rotate(${starRot}) scale(${k === 'juvenile' ? 0.9 : 1.15})`}
          />
          {/* 眼睛 */}
          <circle cx="42.5" cy="52.5" r={k === 'juvenile' ? 3 : 3.4} fill={INK} />
          <circle cx="57.5" cy="52.5" r={k === 'juvenile' ? 3 : 3.4} fill={INK} />
          <circle cx="41.4" cy="51.3" r="1.1" fill="#FFFFFF" opacity={0.75 + b * 0.25} />
          <circle cx="56.4" cy="51.3" r="1.1" fill="#FFFFFF" opacity={0.75 + b * 0.25} />
          {/* 腮红 */}
          <ellipse cx="36.5" cy="58.5" rx="3.4" ry="2.1" fill={BLUSH} opacity={0.85} />
          <ellipse cx="63.5" cy="58.5" rx="3.4" ry="2.1" fill={BLUSH} opacity={0.85} />
          {/* 嘴 */}
          <path d="M47 60 Q50 62.5 53 60" fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" opacity={0.9} />
        </g>
      )}

      {/* 环绕星屑 */}
      <g>
        {pts.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={c.soft} opacity={p.o * (0.4 + b * 0.5)} />
        ))}
      </g>
    </svg>
  );
}
