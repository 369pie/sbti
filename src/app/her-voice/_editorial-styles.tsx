/**
 * Shared editorial style tokens for /her-voice/* sub-pages.
 * Vocabulary: warm-editorial (Open Design) × magazine-poster.
 * Mobile-first: tight padding, clamp() type, single-column grids on small screens.
 */
import type { CSSProperties } from 'react';

// === Tokens ===
export const PAPER = '#F5F0E8';
export const PAPER_RAISED = '#FAF7F2';
export const INK = '#1A1530';
export const INK_MUTED = '#8A817A';
export const ACCENT = '#C0512F';
export const HAIRLINE = 'rgba(26, 21, 48, 0.14)';

const SERIF = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';
const MONO = 'ui-monospace, "SF Mono", monospace';

// === Page chrome ===
export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: PAPER,
  color: INK,
  padding: '40px 18px 120px',
  fontFamily: SERIF,
};

export const shellStyle: CSSProperties = {
  maxWidth: 980,
  margin: '0 auto',
};

// Top dateline rule
export const datelineStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 8,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  marginBottom: 14,
};

export const datelineRuleStyle: CSSProperties = {
  height: 1,
  background: INK,
  opacity: 0.85,
  marginBottom: 32,
};

// === Header ===
export const eyebrowStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  color: ACCENT,
  marginBottom: 16,
  fontWeight: 400,
  textTransform: 'uppercase',
};

export const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(40px, 9vw, 76px)',
  lineHeight: 0.95,
  fontStyle: 'italic',
  letterSpacing: '-0.02em',
  color: INK,
  fontWeight: 500,
};

export const accentRuleStyle: CSSProperties = {
  width: 64,
  height: 3,
  background: ACCENT,
  margin: '24px 0 0',
};

export const ledeStyle: CSSProperties = {
  maxWidth: 620,
  margin: '22px 0 0',
  fontSize: 'clamp(15px, 1.6vw, 17px)',
  lineHeight: 1.85,
  color: INK,
  opacity: 0.78,
  fontStyle: 'italic',
};

export const summaryStyle: CSSProperties = {
  marginTop: 18,
  fontFamily: MONO,
  color: ACCENT,
  fontSize: 11,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

// === Buttons / Links (editorial slim, no rounded pill) ===
export const primaryLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '12px 22px',
  borderRadius: 0,
  background: INK,
  color: PAPER,
  textDecoration: 'none',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  fontWeight: 500,
  textTransform: 'uppercase',
  border: `1px solid ${INK}`,
};

export const secondaryLinkStyle: CSSProperties = {
  ...primaryLinkStyle,
  background: 'transparent',
  color: INK,
  border: `1px solid ${HAIRLINE}`,
};

// === Card (hairline editorial, no rounded chrome) ===
export const cardStyle: CSSProperties = {
  padding: '22px 0 24px',
  borderRadius: 0,
  background: 'transparent',
  border: 'none',
  borderTop: `1px solid ${INK}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const badgeStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  padding: 0,
  borderRadius: 0,
  border: 'none',
  color: ACCENT,
  textTransform: 'uppercase',
};

export const chipStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.28em',
  padding: '3px 0',
  borderRadius: 0,
  border: 'none',
  color: INK_MUTED,
  textTransform: 'uppercase',
};

export const itemTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.25,
  fontStyle: 'italic',
  fontWeight: 500,
  color: INK,
  letterSpacing: '-0.005em',
};

export const quoteStyle: CSSProperties = {
  margin: '6px 0 0',
  paddingLeft: 14,
  borderLeft: `3px solid ${ACCENT}`,
  color: INK,
  fontSize: 16,
  lineHeight: 1.75,
  fontStyle: 'italic',
  fontFamily: SERIF,
};

export const bodyStyle: CSSProperties = {
  margin: 0,
  color: INK,
  opacity: 0.78,
  fontSize: 14,
  lineHeight: 1.85,
  fontFamily: '"Noto Serif SC", serif',
};

export const metaStyle: CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  color: INK_MUTED,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.28em',
  paddingTop: 8,
  borderTop: `1px dotted ${HAIRLINE}`,
};

export const emptyStyle: CSSProperties = {
  textAlign: 'center',
  padding: '80px 20px',
  borderRadius: 0,
  background: 'transparent',
  border: `1px dashed ${HAIRLINE}`,
  fontStyle: 'italic',
  color: INK_MUTED,
};

export const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 0,
  borderTop: `1px solid ${INK}`,
};

/**
 * Mobile-first responsive overrides.
 * Render once per page (server-component safe; emits an inline <style> tag).
 */
export function HerVoiceMobileStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 720px) {
            .hv-page { padding: 28px 16px 100px !important; }
            .hv-dateline-r { display: none; }
            .hv-actions { flex-direction: column; align-items: stretch !important; }
            .hv-actions a { width: 100%; }
            .hv-grid { grid-template-columns: 1fr !important; border-top: 1px solid ${INK}; }
            .hv-grid > article { padding-left: 0 !important; padding-right: 0 !important; }
            .hv-grid > article + article { border-top: 1px solid ${HAIRLINE} !important; }
            .hv-card-title { font-size: 20px !important; }
            .hv-quote { font-size: 15px !important; padding-left: 12px !important; }
          }
          .hv-grid > article {
            padding-left: 24px;
            padding-right: 24px;
            border-right: 1px solid ${HAIRLINE};
          }
          .hv-grid > article:nth-child(3n) { border-right: none; }
          @media (max-width: 980px) {
            .hv-grid > article:nth-child(2n) { border-right: none; }
            .hv-grid > article:nth-child(3n) { border-right: 1px solid ${HAIRLINE}; }
          }
        `,
      }}
    />
  );
}
