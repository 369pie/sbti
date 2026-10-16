/**
 * <VoiceSigil /> · W3 · E3.3
 *
 * 渲染单条 sigil 印记。无 hydration 风险（纯 SVG）。
 * 同时导出 `levelFromCount(n)`，把"累计句数"映射到 0..4。
 */

import {
  buildSigilDecorationGeometry,
  buildSigilGeometry,
  SIGIL_PALETTE_TOKENS,
  type SigilParams,
} from '@/lib/sigil/generate';

export function levelFromCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 243) return 4;
  if (count >= 81) return 3;
  if (count >= 27) return 2;
  if (count >= 7) return 1;
  return 0;
}

interface Props extends Omit<SigilParams, 'level' | 'size'> {
  level: 0 | 1 | 2 | 3 | 4;
  size?: number;
  className?: string;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export function VoiceSigil({ hash, level, size = 56, className }: Props) {
  const g = buildSigilGeometry({ hash, level, size });
  const palette = SIGIL_PALETTE_TOKENS[g.paletteIndex];
  const decoration = buildSigilDecorationGeometry(g);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${g.size} ${g.size}`}
      width={g.size}
      height={g.size}
      role="img"
      aria-label={`Voice Sigil · level ${ROMAN[Math.min(level, ROMAN.length - 1)]}`}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id={`vs-halo-${g.paletteIndex}-${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.halo} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx={g.cx} cy={g.cy} r={g.size * 0.46} fill={`url(#vs-halo-${g.paletteIndex}-${level})`} />
      {g.orbits.map((o, i) => {
        const dotX = g.cx + o.rx * Math.cos(o.dotPhase * Math.PI * 2);
        const dotY = g.cy + o.ry * Math.sin(o.dotPhase * Math.PI * 2);
        return (
          <g key={i} transform={`rotate(${o.rotate.toFixed(2)} ${g.cx} ${g.cy})`}>
            <ellipse
              cx={g.cx}
              cy={g.cy}
              rx={o.rx}
              ry={o.ry}
              fill="none"
              stroke={palette.orbit}
              strokeWidth={0.8}
            />
            <circle cx={dotX} cy={dotY} r={1.6} fill={palette.stroke} />
          </g>
        );
      })}
      {g.motifs.includes('seasonal_ring') ? (
        <circle
          cx={g.cx}
          cy={g.cy}
          r={decoration.seasonalRadius}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={0.9}
          strokeDasharray="2.4 4.6"
          opacity={0.62}
        />
      ) : null}
      {g.motifs.includes('resonance_mark') ? (
        <path
          d={`M ${decoration.resonanceArc.x1.toFixed(2)} ${decoration.resonanceArc.y1.toFixed(2)} A ${decoration.resonanceArc.r.toFixed(2)} ${decoration.resonanceArc.r.toFixed(2)} 0 0 1 ${decoration.resonanceArc.x2.toFixed(2)} ${decoration.resonanceArc.y2.toFixed(2)}`}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
      ) : null}
      {g.motifs.includes('editorial_seal') ? (
        <g opacity={0.96}>
          <circle cx={decoration.seal.cx} cy={decoration.seal.cy} r={decoration.seal.r} fill={palette.stroke} />
          <circle cx={decoration.seal.cx} cy={decoration.seal.cy} r={decoration.seal.r * 0.42} fill="#F5F0E8" />
        </g>
      ) : null}
      {g.motifs.includes('curator_mark') ? (
        <path
          d={`M ${decoration.curator.cx.toFixed(2)} ${(decoration.curator.cy - decoration.curator.outer).toFixed(2)} L ${(decoration.curator.cx + decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy - decoration.curator.inner).toFixed(2)} L ${(decoration.curator.cx + decoration.curator.outer).toFixed(2)} ${decoration.curator.cy.toFixed(2)} L ${(decoration.curator.cx + decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy + decoration.curator.inner).toFixed(2)} L ${decoration.curator.cx.toFixed(2)} ${(decoration.curator.cy + decoration.curator.outer).toFixed(2)} L ${(decoration.curator.cx - decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy + decoration.curator.inner).toFixed(2)} L ${(decoration.curator.cx - decoration.curator.outer).toFixed(2)} ${decoration.curator.cy.toFixed(2)} L ${(decoration.curator.cx - decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy - decoration.curator.inner).toFixed(2)} Z`}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={1.1}
          opacity={0.9}
        />
      ) : null}
      <circle cx={g.cx} cy={g.cy} r={g.coreRadius} fill={palette.stroke} opacity={0.92} />
      <text
        x={g.cx}
        y={g.cy + g.size * 0.025}
        fontFamily="serif"
        fontStyle="italic"
        fontSize={g.size * 0.18}
        fill="#F5F0E8"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {g.romanNumeral}
      </text>
    </svg>
  );
}
