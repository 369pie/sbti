/**
 * F3 · Mirror Slider 镜面滑杆
 * 上下两个对立陈述，中间一根金线 + 一颗发光球。
 * 输出 0-1 数值（也可在内部映射回 'A' | 'B' | 'C' 离散键）。
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

interface Props {
  prompt: string;
  /** 顶部陈述（对应 value=1） */
  topStatement: string;
  /** 底部陈述（对应 value=0） */
  bottomStatement: string;
  /** 初始值 0-1 */
  initial?: number;
  /** 离散输出 — 默认按 0/0.5/1 三档 → 'L'/'M'/'H' */
  discreteKeys?: ['L', 'M', 'H'];
  /** 滑动结束时回调 (value 0-1, key) */
  onPick: (value: number, key: string) => void;
  accent?: string;
}

function valueToKey(v: number, keys: ['L', 'M', 'H']): string {
  if (v >= 0.66) return keys[2];
  if (v >= 0.34) return keys[1];
  return keys[0];
}

export function MirrorSlider({
  prompt,
  topStatement,
  bottomStatement,
  initial,
  discreteKeys = ['L', 'M', 'H'],
  onPick,
  accent = '#C9A676',
}: Props) {
  const [value, setValue] = useState<number>(initial ?? 0.5);
  const [touched, setTouched] = useState<boolean>(initial !== undefined);

  useEffect(() => {
    if (initial !== undefined) {
      queueMicrotask(() => {
        setValue(initial);
        setTouched(true);
      });
    }
  }, [initial]);

  const commit = useCallback(
    (v: number) => {
      onPick(v, valueToKey(v, discreteKeys));
    },
    [onPick, discreteKeys],
  );

  const pct = Math.round(value * 100);

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ width: '100%' }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 15,
            color: '#F5F0E8',
            fontFamily: 'Noto Serif SC, serif',
            lineHeight: 1.55,
          }}
        >
          {prompt}
        </p>
      </legend>

      <div
        style={{
          marginTop: 22,
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          gap: 14,
          minHeight: 240,
        }}
      >
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 13.5,
            color: 'rgba(245,240,232,.85)',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            letterSpacing: 0.5,
            opacity: 0.4 + value * 0.6,
          }}
        >
          “{topStatement}”
        </p>

        <div
          style={{
            position: 'relative',
            margin: '0 auto',
            width: 4,
            background: `linear-gradient(180deg, ${accent}88 0%, ${accent}33 50%, ${accent}88 100%)`,
            boxShadow: touched ? `0 0 12px ${accent}66` : 'none',
            borderRadius: 4,
          }}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            aria-label={prompt}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              setValue(v);
              setTouched(true);
            }}
            onMouseUp={() => commit(value)}
            onTouchEnd={() => commit(value)}
            onKeyUp={() => commit(value)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'ns-resize',
              writingMode: 'vertical-lr' as never,
              transform: 'rotate(180deg)',
              WebkitAppearance: 'slider-vertical' as never,
            }}
          />
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: `${(1 - value) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: touched ? 28 : 22,
              height: touched ? 28 : 22,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, #F5F0E8 0%, ${accent} 60%, ${accent}66 100%)`,
              boxShadow: `0 0 14px ${accent}cc, 0 0 28px ${accent}66`,
              transition: 'top .25s cubic-bezier(.22,1,.36,1), width .2s, height .2s',
              pointerEvents: 'none',
            }}
          />
        </div>

        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 13.5,
            color: 'rgba(245,240,232,.85)',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            letterSpacing: 0.5,
            opacity: 0.4 + (1 - value) * 0.6,
          }}
        >
          “{bottomStatement}”
        </p>
      </div>

      <p
        aria-live="polite"
        style={{
          marginTop: 12,
          textAlign: 'center',
          fontSize: 10.5,
          letterSpacing: 4,
          color: touched ? accent : 'rgba(245,240,232,.4)',
          textTransform: 'uppercase',
        }}
      >
        {touched ? `✦ ${pct}% / ${100 - pct}%` : '✦ 拖动金球决定你的位置'}
      </p>
    </fieldset>
  );
}
