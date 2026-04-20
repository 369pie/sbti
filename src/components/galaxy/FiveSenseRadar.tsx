'use client';

/**
 * FiveSenseRadar · 5 维灵魂频率雷达图（SVG）
 * 5 轴：听 / 视 / 嗅 / 触 / 直觉，半径 = profile 值 (0-1)
 */
import type { FiveSenseProfile } from '@/lib/wtfi/sense-profile';

interface Props {
  profile: FiveSenseProfile;
  size?: number;
  accent?: string;
}

const AXES: Array<{ key: keyof FiveSenseProfile; label: string }> = [
  { key: 'hearing', label: '听' },
  { key: 'vision', label: '视' },
  { key: 'smell', label: '嗅' },
  { key: 'touch', label: '触' },
  { key: 'intuition', label: '直觉' },
];

export function FiveSenseRadar({ profile, size = 280, accent = '#C9A676' }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const N = AXES.length;
  // angle: start at top (-90deg), go clockwise
  const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / N;

  // background concentric pentagons (5 levels)
  const ringPoints = (level: number) =>
    AXES.map((_, i) => {
      const a = angle(i);
      const r = radius * level;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    }).join(' ');

  // value polygon
  const valuePoints = AXES.map((ax, i) => {
    const a = angle(i);
    const v = Math.max(0.08, Math.min(1, profile[ax.key]));
    const r = radius * v;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="五感档案雷达图"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="senseFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.18" />
        </radialGradient>
      </defs>
      {/* concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={ringPoints(level)}
          fill="none"
          stroke="rgba(245,240,232,0.12)"
          strokeWidth={level === 1 ? 1 : 0.6}
        />
      ))}
      {/* axes */}
      {AXES.map((_, i) => {
        const a = angle(i);
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(245,240,232,0.1)"
            strokeWidth={0.6}
          />
        );
      })}
      {/* value polygon */}
      <polygon
        points={valuePoints}
        fill="url(#senseFill)"
        stroke={accent}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* value dots */}
      {AXES.map((ax, i) => {
        const a = angle(i);
        const v = Math.max(0.08, Math.min(1, profile[ax.key]));
        const r = radius * v;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        return (
          <circle
            key={ax.key}
            cx={x}
            cy={y}
            r={3}
            fill={accent}
            stroke="#1a1530"
            strokeWidth={1}
          />
        );
      })}
      {/* axis labels */}
      {AXES.map((ax, i) => {
        const a = angle(i);
        const lr = radius + 18;
        const x = cx + Math.cos(a) * lr;
        const y = cy + Math.sin(a) * lr + 4;
        return (
          <text
            key={ax.key}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="11"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            letterSpacing="2"
            fill="#F5F0E8"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
