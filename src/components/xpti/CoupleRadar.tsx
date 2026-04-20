'use client';

/**
 * CoupleRadar — dual-overlay 9-axis radar comparing two XPTI sides.
 *
 * Used by /xpti/couple/ merged view (Sprint 2 of v3.0).
 *
 * Visual brand: editorial wine palette — A side in 枯玫瑰 (#A85A6E),
 * B side in 深酒红 (#6A2A3E), gold-leaf grid lines.
 */

import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';

interface Side {
  archetype: { name: string; slug: string; color: string };
  dims: number[]; // 9 values, 1-3
}

interface Props {
  inviter: Side;
  partner: Side;
  size?: number;
}

const A_COLOR = '#A85A6E';
const B_COLOR = '#6A2A3E';
const GRID = 'rgba(31, 26, 22, 0.16)';
const GRID_SOFT = 'rgba(31, 26, 22, 0.08)';
const LABEL = 'rgba(31, 26, 22, 0.72)';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';
const display = '"Cormorant Garamond", "Noto Serif SC", serif';

export function CoupleRadar({ inviter, partner, size = 320 }: Props) {
  const center = size / 2;
  const radius = size * 0.36;
  const labelR = size * 0.46;
  const dims = XPTI_DIMENSIONS;
  const n = dims.length;

  function nodeFor(score: number, idx: number) {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
    const r = (Math.max(1, Math.min(3, score)) / 3) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      lx: center + Math.cos(angle) * labelR,
      ly: center + Math.sin(angle) * labelR,
      angle,
    };
  }

  const aPoints = inviter.dims.map((s, i) => nodeFor(s, i));
  const bPoints = partner.dims.map((s, i) => nodeFor(s, i));

  const aPolygon = aPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const bPolygon = bPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 14, fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: A_COLOR }}>
          <span style={{ width: 14, height: 2, background: A_COLOR, display: 'inline-block' }} />
          A · {inviter.archetype.name}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: B_COLOR }}>
          <span style={{ width: 14, height: 2, background: B_COLOR, display: 'inline-block' }} />
          B · ta
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, height: 'auto' }} role="img" aria-label="双人九维张力雷达对比图">
          {/* Concentric grid */}
          {[0.33, 0.66, 1].map((level) => {
            const points = dims
              .map((_, idx) => {
                const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
                const x = center + Math.cos(angle) * radius * level;
                const y = center + Math.sin(angle) * radius * level;
                return `${x},${y}`;
              })
              .join(' ');
            return <polygon key={level} points={points} fill="none" stroke={level === 1 ? GRID : GRID_SOFT} strokeWidth="1" />;
          })}

          {/* Axes */}
          {dims.map((_, idx) => {
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return <line key={idx} x1={center} y1={center} x2={x} y2={y} stroke={GRID_SOFT} strokeWidth="1" />;
          })}

          {/* Inviter polygon (filled, A) */}
          <polygon points={aPolygon} fill={`${A_COLOR}22`} stroke={A_COLOR} strokeWidth="1.6" />

          {/* Partner polygon (dashed, B) */}
          <polygon points={bPolygon} fill={`${B_COLOR}18`} stroke={B_COLOR} strokeWidth="1.8" strokeDasharray="4 3" />

          {/* Vertex dots */}
          {aPoints.map((p, i) => (
            <circle key={`a-${i}`} cx={p.x} cy={p.y} r="3" fill={A_COLOR} stroke="#FFFDF9" strokeWidth="1.2" />
          ))}
          {bPoints.map((p, i) => (
            <circle key={`b-${i}`} cx={p.x} cy={p.y} r="3" fill={B_COLOR} stroke="#FFFDF9" strokeWidth="1.2" />
          ))}

          {/* Labels */}
          {dims.map((d, idx) => {
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
            const lx = center + Math.cos(angle) * labelR;
            const ly = center + Math.sin(angle) * labelR;
            const anchor = Math.cos(angle) > 0.2 ? 'start' : Math.cos(angle) < -0.2 ? 'end' : 'middle';
            return (
              <g key={d.id}>
                <text
                  x={lx}
                  y={ly}
                  fontFamily={display}
                  fontSize={11}
                  fontStyle="italic"
                  fill={LABEL}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                >
                  {d.name}
                </text>
                <text
                  x={lx}
                  y={ly + 12}
                  fontFamily={mono}
                  fontSize={9}
                  fill={LABEL}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  letterSpacing="0.18em"
                  opacity={0.6}
                >
                  {d.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
