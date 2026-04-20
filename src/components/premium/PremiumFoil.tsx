/**
 * Premium Foil — paid-tier visual signature used across all deep-档 surfaces.
 *
 * Provides:
 *   - <PremiumFoilStyles />      → injects shared keyframes + .premium-foil class once.
 *   - <PremiumNumeral />         → italic display numeral with gold-foil sweep.
 *   - <PremiumEditionStamp />    → editioned pill with pulsing glow + foil number.
 *   - hashEditionNumber(seed)    → deterministic №xxxx within 1000-9999.
 *
 * NOTE: the <style> block is identical to the original WTFTI inline injection.
 * If multiple deep clients mount on one page (won't happen in practice — each
 * is its own route) the duplicate keyframes are harmless.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

/** Inject foil + stamp keyframes. Mount once near the root of the deep page. */
export function PremiumFoilStyles() {
  return (
    <style>{`
      @keyframes premium-foil-sweep {
        0% { background-position: -180% 0; }
        100% { background-position: 280% 0; }
      }
      .premium-foil {
        background-image: linear-gradient(
          100deg,
          #8B6A3A 0%,
          #C9A676 22%,
          #F4DDA0 38%,
          #FFF1C2 50%,
          #F4DDA0 62%,
          #C9A676 78%,
          #8B6A3A 100%
        );
        background-size: 280% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: premium-foil-sweep 6.5s linear infinite;
        font-feature-settings: "lnum", "tnum";
      }
      @keyframes premium-stamp-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(201,166,118,0), inset 0 0 18px rgba(192,122,142,0.16); }
        50% { box-shadow: 0 0 24px 0 rgba(201,166,118,0.18), inset 0 0 18px rgba(192,122,142,0.22); }
      }
    `}</style>
  );
}

/** Italic display numeral with the paid-only foil shimmer. */
export function PremiumNumeral({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className="premium-foil"
      style={{
        fontFamily: display,
        fontStyle: 'italic',
        fontSize: 34,
        letterSpacing: '0.06em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Edition stamp pill — gold orb + foil-numbered edition + ISSUED date. */
export function PremiumEditionStamp({
  editionNo,
  issuedDate,
  totalEditions = 9999,
}: {
  editionNo: string | number;
  issuedDate: string;
  totalEditions?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0 auto 22px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 22px',
          borderRadius: 999,
          border: '1px solid rgba(201,166,118,0.45)',
          background:
            'linear-gradient(135deg, rgba(192,122,142,0.10), rgba(201,166,118,0.06))',
          animation: 'premium-stamp-pulse 4.5s ease-in-out infinite',
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, #FFE6A3, #C9A676 60%, #8B6A3A)',
            boxShadow: '0 0 8px rgba(201,166,118,0.5)',
          }}
        />
        <span
          className="premium-foil"
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.36em',
            fontWeight: 600,
          }}
        >
          EDITION №{editionNo} / {totalEditions}
        </span>
        <span
          aria-hidden
          style={{
            width: 1,
            height: 14,
            background: 'rgba(201,166,118,0.4)',
          }}
        />
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            color: 'rgba(245,240,232,0.7)',
          }}
        >
          ISSUED {issuedDate}
        </span>
      </div>
    </div>
  );
}

/** FNV-1a hash → padded edition number 1000-9999 (4 digits). */
export function hashEditionNumber(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (Math.abs(h) % 9000) + 1000;
  return String(n);
}

/** YYYY.MM.DD for the stamp's ISSUED line. */
export function formatIssuedDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
