/**
 * UGC Universe types — schema for creator-built personality universes.
 *
 * Phase 0: KOL universes are authored as static TypeScript config files.
 * Phase 1+: Configs will be stored in Supabase and loaded dynamically.
 *
 * The 29 standard slugs form the "personality chassis" — creators only
 * provide the thematic skin (name, emoji, tagline, copy) for each slug.
 */

// ─── Core personality mapping ────────────────────────────────────────────────

/** One personality entry in a UGC universe. */
export interface UgcPersonality {
  /** Must match one of the 29 standard slugs (e.g. 'boss', 'emo', 'drunk') */
  slug: string;
  /** Sequential number within this universe (e.g. '#001') */
  number: string;
  /** Creator-chosen display name for this personality */
  name: string;
  /** 4-letter display code */
  code: string;
  /** Representative emoji */
  emoji: string;
  /** One-line tagline / catchphrase */
  tagline: string;
  /** Accent colour (hex) for this personality card */
  color: string;
  /** Quote shown at bottom of result card */
  quote: string;
  /** Structured copy for the result page */
  copy: {
    /** Opening punch line */
    hit: string;
    /** Multi-paragraph character description */
    os: string;
    /** Symptom / trait checklist (3-6 items) */
    symptoms: string[];
    /** Closing paragraph */
    closer: string;
  };
}

// ─── Universe config ─────────────────────────────────────────────────────────

/** Theme / visual style for a UGC universe. */
export interface UgcTheme {
  /** Primary accent colour (hex) */
  primaryColor: string;
  /** Card style preset — determines share image template */
  cardStyle: 'default' | 'dark' | 'neon' | 'pastel';
}

/** Complete UGC universe configuration. */
export interface UgcUniverseConfig {
  /** Unique id — used as URL slug and universe registry key (e.g. 'zhenhuan') */
  id: string;
  /** Display name (e.g. '甄嬛TI') */
  name: string;
  /** Short name for pill buttons (e.g. '甄嬛') */
  shortName: string;
  /** Leading emoji */
  emoji: string;
  /** Theme / visual settings */
  theme: UgcTheme;

  // ─── Creator info ──────────────────────────────────────────────────────
  /** Creator display name */
  creatorName: string;
  /** Creator avatar URL (optional) */
  creatorAvatar?: string;
  /** Creator social link (e.g. Xiaohongshu profile URL) */
  creatorLink?: string;

  // ─── Content ───────────────────────────────────────────────────────────
  /** Section label shown above "hit" copy (e.g. '甄嬛一击', '战区一击') */
  hitLabel: string;
  /** Section label shown above "os" copy */
  osLabel: string;
  /** Section label shown above symptoms */
  symptomsLabel: string;

  /** The 29 personality mappings */
  personalities: UgcPersonality[];
}
