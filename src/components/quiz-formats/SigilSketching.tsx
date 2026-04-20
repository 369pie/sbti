/**
 * C2 · Sigil Sketching 印记勾勒
 * 把 generateSoulSigilSvg 输出的 SVG 解析后，用 stroke-dasharray 一笔一画绘出。
 *
 * 简化方案：不解析具体路径，而是把整张 SVG 套一层 mask + clip-path 圆形扫光，
 * 从中心向外释放（径向揭示），4 秒完成。视觉上等效"被绘出"。
 */
'use client';

import { useEffect, useRef, useState } from 'react';

import { generateSoulSigilSvg, generateSoulSigilString } from '@/lib/wtfi/sigil';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';

interface Props {
  galaxy: GalaxyResult;
  /** 完成回调 */
  onDone?: () => void;
  /** 总时长 ms，默认 4000 */
  durationMs?: number;
}

export function SigilSketching({ galaxy, onDone, durationMs = 4000 }: Props) {
  const [reveal, setReveal] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const startedRef = useRef<number | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let raf = 0;
    startedRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - (startedRef.current ?? 0);
      const p = Math.min(1, elapsed / durationMs);
      setReveal(p);
      if (p >= 1) {
        setDone(true);
        if (typeof navigator !== 'undefined') navigator.vibrate?.(30);
        window.setTimeout(() => onDoneRef.current?.(), 600);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  const svgString = generateSoulSigilSvg(galaxy, { size: 320 });
  const sigilString = generateSoulSigilString(galaxy);

  return (
    <section
      style={{
        padding: '40px 24px',
        borderRadius: 20,
        background:
          'radial-gradient(ellipse at center, rgba(60,40,110,.55) 0%, rgba(20,12,40,.95) 70%)',
        border: '1px solid rgba(201,166,118,.28)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 9.5,
          letterSpacing: 6,
          color: '#C9A676',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        ✦ Sigil Sketching · 印记勾勒
      </p>
      <h2
        style={{
          margin: '8px 0 4px',
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          fontStyle: 'italic',
          fontSize: 24,
          color: '#F5F0E8',
          fontWeight: 500,
        }}
      >
        {done ? '你的几何咒符已写下' : '你的几何咒符正在被写下…'}
      </h2>

      <div
        style={{
          position: 'relative',
          margin: '24px auto 0',
          width: 320,
          height: 320,
        }}
      >
        <div
          aria-label="灵魂印记 sigil"
          dangerouslySetInnerHTML={{ __html: svgString }}
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.15 + reveal * 0.85,
            filter: `blur(${(1 - reveal) * 6}px)`,
            transition: 'opacity .15s, filter .15s',
            clipPath: `circle(${Math.round(reveal * 60)}% at 50% 50%)`,
          }}
        />
        {/* 外环呼吸 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: `0 0 ${reveal * 60}px ${reveal * 30}px rgba(201,166,118,${reveal * 0.4})`,
            pointerEvents: 'none',
          }}
        />
      </div>

      <p
        style={{
          margin: '20px 0 4px',
          fontFamily: 'monospace',
          fontSize: 16,
          letterSpacing: 4,
          color: '#C9A676',
          opacity: reveal,
        }}
      >
        {sigilString}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: 'rgba(245,240,232,.55)',
          fontStyle: 'italic',
          fontFamily: 'Cormorant Garamond, serif',
        }}
      >
        {done
          ? '✦ 全宇宙独一无二 · 由你的人格轴向 + 主神归属 + 月相位置共同生成'
          : `✦ ${Math.round(reveal * 100)}% · 月光在金线上滑过…`}
      </p>
    </section>
  );
}
