/**
 * PantheonBadge · 把 home slug 渲染成「主神化身」三联标签
 *
 * 用在 PlanetCard / planet landing / pair card 顶部，
 * 替换原 "本星归属 · 织女座" 一行。
 *
 * Server-renderable.
 */

import { getDeity } from '@/lib/wtfi/pantheon';

interface Props {
  slug: string;
  /** 紧凑模式（只显示 中神/西神，省略异能者） */
  compact?: boolean;
  /** 是否反色（在浅色卡上） */
  inverted?: boolean;
}

export function PantheonBadge({ slug, compact = false, inverted = false }: Props) {
  const deity = getDeity(slug);
  if (!deity) return null;

  const inkPrimary = inverted ? '#1a1530' : '#F5F0E8';
  const inkMuted = inverted ? 'rgba(26,21,48,0.72)' : 'rgba(245,240,232,0.74)';
  const accent = '#C9A676';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        width: 'min(92vw, 430px)',
        padding: '12px 20px 16px',
        borderRadius: 32,
        border: `1px solid ${
          inverted ? 'rgba(201,166,118,0.5)' : 'rgba(201,166,118,0.38)'
        }`,
        background: inverted
          ? 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.58))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        boxShadow: inverted
          ? '0 12px 28px rgba(26,21,48,0.08)'
          : '0 18px 40px -24px rgba(201,166,118,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color: accent,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        ✦ Tutelary Deity · {deity.sigilGlyph}
      </span>
      <div
        style={{
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          color: inkPrimary,
          lineHeight: 1.04,
          textShadow: inverted ? 'none' : '0 1px 16px rgba(10,8,32,0.42)',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(26px, 2.8vw, 34px)',
            letterSpacing: '0.03em',
            fontStyle: 'italic',
          }}
        >
          {deity.eastern.name}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 'clamp(13px, 1.3vw, 16px)',
            color: inkMuted,
            letterSpacing: '0.05em',
          }}
        >
          {deity.western.name}
          {!compact ? ` · ${deity.occult.name}` : ''}
        </div>
      </div>
      <span
        aria-hidden
        style={{
          width: 72,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,166,118,0.85), transparent)',
        }}
      />
      <span
        style={{
          fontSize: 11.5,
          color: inkMuted,
          letterSpacing: '0.05em',
          lineHeight: 1.5,
          maxWidth: 360,
        }}
      >
        {deity.domain}
      </span>
    </div>
  );
}

/** 一行紧凑版，用于 OG 卡 / share copy */
export function pantheonShareLine(slug: string): string {
  const deity = getDeity(slug);
  if (!deity) return '';
  return `${deity.eastern.name}化身 · ${deity.western.latin} · ${deity.occult.archetype}`;
}
