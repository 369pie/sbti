'use client';

/**
 * 简易打字机（W2 心流戏剧化）— 神谕段落逐行/逐字呈现。
 *
 * 用法：
 *   <Typewriter text={data.whyThisCard} speedMs={28} startDelayMs={300} onDone={...} />
 *
 * 特性：
 * - 进入 viewport 后才开始（lightweight IntersectionObserver）
 * - 完成后 `onDone` 触发，可控制后续元素揭晓（如分享按钮）
 * - 用户可点击文本跳过到末尾
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** 是否带光标 */
  cursor?: boolean;
  /** 是否允许点击跳过 */
  skippable?: boolean;
}

export function Typewriter({
  text,
  speedMs = 30,
  startDelayMs = 200,
  onDone,
  className,
  style,
  cursor = true,
  skippable = true,
}: Props) {
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // 进入视口后启动
  useEffect(() => {
    if (started) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  // 启动后开始打字
  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let timer: number | undefined;

    const tick = (i: number) => {
      if (cancelled) return;
      setShown(i);
      if (i >= text.length) {
        setDone(true);
        onDoneRef.current?.();
        return;
      }
      timer = window.setTimeout(() => tick(i + 1), speedMs);
    };

    timer = window.setTimeout(() => tick(1), startDelayMs);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [started, text, speedMs, startDelayMs]);

  const handleSkip = () => {
    if (!skippable || done) return;
    setShown(text.length);
    setDone(true);
    onDoneRef.current?.();
  };

  return (
    <span
      ref={ref}
      className={className}
      style={style}
      onClick={handleSkip}
      role={skippable && !done ? 'button' : undefined}
      title={skippable && !done ? '点击跳过' : undefined}
    >
      {text.slice(0, shown)}
      {cursor && !done && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: '0.5ch',
            marginLeft: '1px',
            opacity: 0.7,
            animation: 'mysti-cursor-blink 0.9s steps(2, start) infinite',
          }}
        >
          ▍
        </span>
      )}
      <style jsx>{`
        @keyframes mysti-cursor-blink {
          to { visibility: hidden; }
        }
      `}</style>
    </span>
  );
}
