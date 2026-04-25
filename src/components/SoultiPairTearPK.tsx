/**
 * SoulTI Pair Tear PK · 双人撕裂度对照
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E8)
 *
 * Server component. Computes a code-distance based tear rate between two
 * personality types (each has a 5-letter code on axes T/S, R/W, O/B, F/E, G/K).
 * The PK score = number of differing axis letters / 5 → 0–100 percent.
 * This is the *between-people* analogue of the *within-person* tear rate
 * shown on the result page, and gives users a one-line shareable hook:
 *
 *     "我和 TA 的撕裂度是 60%"
 */

import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES } from '@/lib/soulti/dimensions';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

interface Props {
  a: SoultiPersonalityType;
  b: SoultiPersonalityType;
}

interface AxisDiff {
  id: string;
  name: string;
  aLetter: string;
  bLetter: string;
  same: boolean;
}

function computeDiffs(aCode: string, bCode: string): AxisDiff[] {
  return SOULTI_DIMENSIONS.map((dim, i) => {
    const aLetter = aCode[i] ?? '?';
    const bLetter = bCode[i] ?? '?';
    return {
      id: dim.id,
      name: SOULTI_MODEL_NAMES[dim.model] ?? dim.id,
      aLetter,
      bLetter,
      same: aLetter === bLetter,
    };
  });
}

function pickNarrative(percent: number): { label: string; line: string } {
  if (percent <= 20) {
    return {
      label: '同频共振',
      line: '你们几乎走在同一条节奏里。这种关系最大的风险，是失去差异。',
    };
  }
  if (percent <= 40) {
    return {
      label: '近邻同行',
      line: '大方向一致，小处会偶尔刮蹭。这是最稳定也最容易长久的距离。',
    };
  }
  if (percent <= 60) {
    return {
      label: '互相照见',
      line: '一半相同，一半相反。彼此既是彼此的镜子，也是彼此的边界。',
    };
  }
  if (percent <= 80) {
    return {
      label: '高度撕裂',
      line: '你们容易彼此吸引，也容易彼此耗尽。这种关系需要真正的语言。',
    };
  }
  return {
    label: '极性相对',
    line: '几乎全部相反。要么是命定的对照，要么是注定的远离。',
  };
}

export function SoultiPairTearPK({ a, b }: Props) {
  const diffs = computeDiffs(a.code, b.code);
  const diffCount = diffs.filter((d) => !d.same).length;
  const percent = Math.round((diffCount / SOULTI_DIMENSIONS.length) * 100);
  const { label, line } = pickNarrative(percent);

  const ringColor =
    percent <= 20
      ? '#5b8a72'
      : percent <= 60
        ? '#8b7355'
        : percent <= 80
          ? '#b07850'
          : '#7a6b8a';

  const circ = 2 * Math.PI * 44;
  const offset = circ * (1 - percent / 100);

  return (
    <section
      className="rounded-3xl p-6 sm:p-8 text-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, #FDFCFA 100%)',
        border: `1px solid ${ringColor}25`,
      }}
      aria-label="双人撕裂度"
    >
      <p
        className="text-[10px] tracking-[0.4em] uppercase mb-1"
        style={{ fontFamily: monoFont, color: ringColor, opacity: 0.8 }}
      >
        Pair Tear Rate · 双人撕裂度
      </p>
      <p
        className="text-[11px] tracking-[0.18em] mb-5"
        style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
      >
        你们的灵魂之间 · 隔了多远
      </p>

      <div className="relative inline-block">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r="44" fill="none" stroke="#EDE8E2" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color: ringColor }}
        >
          <span
            style={{
              fontFamily: serifFont,
              fontSize: '34px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            {percent}
            <span style={{ fontSize: '16px', marginLeft: 2, opacity: 0.7 }}>%</span>
          </span>
          <span
            className="mt-1 text-[10px] tracking-[0.25em] uppercase"
            style={{ fontFamily: serifFont, opacity: 0.7 }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Per-axis dot map */}
      <ul className="mt-6 grid grid-cols-5 gap-2 max-w-md mx-auto">
        {diffs.map((d) => (
          <li
            key={d.id}
            className="rounded-xl py-2 px-1"
            style={{
              background: d.same ? 'rgba(91,138,114,0.06)' : 'rgba(176,120,80,0.06)',
              border: `1px solid ${d.same ? 'rgba(91,138,114,0.2)' : 'rgba(176,120,80,0.2)'}`,
            }}
          >
            <p
              className="text-[10px] tracking-[0.15em]"
              style={{ fontFamily: monoFont, color: d.same ? 'var(--color-sage)' : 'var(--color-text-muted)' }}
            >
              {d.id}
            </p>
            <p
              className="text-[11px]"
              style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}
            >
              {d.aLetter}
              <span style={{ opacity: 0.4, margin: '0 2px' }}>/</span>
              {d.bLetter}
            </p>
            <p className="text-[9px]" style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}>
              {d.name}
            </p>
          </li>
        ))}
      </ul>

      <p
        className="mt-5 text-[13px] leading-[1.95] max-w-md mx-auto"
        style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}
      >
        {line}
      </p>

      <p
        className="mt-5 text-[10px] tracking-[0.18em]"
        style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
      >
        · 撕裂度高，不一定是坏事；同频低，不一定是好事 ·
      </p>
    </section>
  );
}
