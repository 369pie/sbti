'use client';

/**
 * WTF Card v2 Progress Ring (E-07)
 *
 * Renders "已解锁 X / N" with a circular SVG ring. Client component because it
 * reads localStorage via getLitCount/getTotalCount; accepts them as props for
 * SSR friendliness.
 */

interface Props {
  lit: number;
  total: number;
  size?: number;
  label?: string;
}

export default function WtfCardProgressRing({ lit, total, size = 96, label = '已点亮宇宙' }: Props) {
  const pct = total === 0 ? 0 : Math.min(1, lit / total);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - pct);

  return (
    <div className="inline-flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="url(#wtfCardRingGrad)" strokeWidth={stroke}
            strokeDasharray={c} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
          <defs>
            <linearGradient id="wtfCardRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text-primary leading-none">{lit}</span>
          <span className="text-[10px] font-mono text-text-muted mt-1">/ {total}</span>
        </div>
      </div>
      <div className="text-left">
        <div className="text-xs font-mono tracking-wider text-text-muted uppercase">{label}</div>
        <div className="text-sm text-text-secondary mt-1">
          {pct < 0.3 && '还在开场。'}
          {pct >= 0.3 && pct < 0.7 && '你的宇宙正在成形。'}
          {pct >= 0.7 && pct < 1 && '就快集齐了。'}
          {pct >= 1 && '你集齐了整片星空。'}
        </div>
      </div>
    </div>
  );
}
