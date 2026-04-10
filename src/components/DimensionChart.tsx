'use client';

import { useMemo } from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts';
import { DIMENSIONS, MODEL_COLORS } from '@/lib/dimensions';
import type { DimensionLevel } from '@/lib/dimensions';
import { normalizeScore } from '@/lib/scoring';
import type { DimensionScore } from '@/lib/scoring';

interface Props {
  dimensions: DimensionScore[];
  size?: number;
}

function levelToScore(level: DimensionLevel): number {
  if (level === 'H') return 3;
  if (level === 'M') return 2;
  return 1;
}

export function DimensionRadar({ dimensions, size = 360 }: Props) {
  const data = useMemo(() => {
    return DIMENSIONS.map(dim => {
      const score = dimensions.find(d => d.id === dim.id);
      const rawScore = score ? score.score : 2;
      return {
        dimension: dim.id,
        label: dim.name,
        value: normalizeScore(rawScore),
        model: dim.model,
        fullMark: 100,
      };
    });
  }, [dimensions]);

  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <ResponsiveContainer width={size} height={size} minWidth={0} minHeight={0}>
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="rgba(68,64,60,0.4)"
            strokeDasharray="2 4"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <PolarAngleAxis
            dataKey="label"
            tick={({ x, y, payload }) => {
              const dim = DIMENSIONS.find(d => d.name === payload.value);
              const color = dim ? MODEL_COLORS[dim.model].base : '#78716c';
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={11}
                  fontFamily="var(--font-sans)"
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <Radar
            name="你的维度"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#radarGradient)"
            fillOpacity={0.3}
            dot={{
              r: 3,
              fill: '#f97316',
              stroke: '#0c0a09',
              strokeWidth: 1.5,
            }}
          />
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.1} />
            </radialGradient>
          </defs>
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}

interface DimensionBarProps {
  dimensionScores: DimensionScore[];
}

export function DimensionBars({ dimensionScores }: DimensionBarProps) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map(dim => {
        const score = dimensionScores.find(d => d.id === dim.id);
        const level = score?.level ?? 'M';
        const rawScore = score?.score ?? 2;
        const percentage = normalizeScore(rawScore);
        const color = MODEL_COLORS[dim.model];

        return (
          <div key={dim.id} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: color.bg, color: color.base }}
                >
                  {dim.id}
                </span>
                <span className="text-sm text-text-secondary">{dim.name}</span>
              </div>
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: color.bg,
                  color: color.base,
                }}
              >
                {level}
              </span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${color.base}, ${color.light})`,
                }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {dim.levels[level]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
