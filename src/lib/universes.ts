/**
 * Universe registry — single source of truth for all test universes / skin variants.
 *
 * Adding a new IP universe:
 *  1. Add an entry here.
 *  2. Create personality data under src/lib/{slug}/ (or reuse existing).
 *  3. Place images under public/images/types/{imagePath}/.
 *  4. Create route pages under src/app/wtfti/{slug}/ (or equivalent).
 */

export interface Universe {
  /** Unique id: 'standard', 'xiuxian', 'wtfti', 'banti', … */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Short 2-3 char label for pill buttons */
  shortName: string;
  /** Leading emoji */
  emoji: string;
  /** Current availability */
  status: 'live' | 'coming-soon';
  /** Theme accent colour (hex) */
  accent: string;
  /** URL path for the test page */
  testPath: string;
  /** URL path prefix for result pages (before /result/) */
  resultPrefix: string;
  /** Gallery tab id in TypesContent (matches gallery-data.ts tab.id) */
  galleryTabId?: string;
  /** Active class applied when this universe is selected in a pill bar */
  activeClass: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const UNIVERSES: Universe[] = [
  {
    id: 'standard',
    name: '标准版',
    shortName: '标准',
    emoji: '',
    status: 'live',
    accent: '#e8729c',
    testPath: '/test/',
    resultPrefix: '',
    galleryTabId: 'sbti',
    activeClass: 'bg-bg-elevated text-text-primary shadow-sm font-medium',
  },
  {
    id: 'xiuxian',
    name: '修仙 2.0',
    shortName: '修仙',
    emoji: '🔮',
    status: 'live',
    accent: '#a855f7',
    testPath: '/test/?skin=xiuxian',
    resultPrefix: '',
    galleryTabId: 'sbti',
    activeClass: 'bg-purple-100 text-purple-700 shadow-sm font-medium',
  },
  {
    id: 'wtfti',
    name: 'WTF 毒舌版',
    shortName: 'WTF',
    emoji: '🤯',
    status: 'live',
    accent: '#ef4444',
    testPath: '/wtfti/test/',
    resultPrefix: '/wtfti',
    galleryTabId: 'wtfti',
    activeClass: 'bg-rose-100 text-rose-700 shadow-sm font-medium',
  },
  {
    id: 'banti',
    name: '班TI',
    shortName: '班TI',
    emoji: '💼',
    status: 'live',
    accent: '#0ea5e9',
    testPath: '/wtfti/work/test/',
    resultPrefix: '/wtfti/work',
    galleryTabId: 'banti',
    activeClass: 'bg-sky-100 text-sky-700 shadow-sm font-medium',
  },
  // ── 后续 IP 宇宙在此追加 ──
  // {
  //   id: 'delta',
  //   name: '三角洲行动',
  //   shortName: '三角洲',
  //   emoji: '🔫',
  //   status: 'coming-soon',
  //   accent: '#84cc16',
  //   testPath: '/wtfti/delta/test/',
  //   resultPrefix: '/wtfti/delta',
  //   galleryTabId: 'delta',
  //   activeClass: 'bg-lime-100 text-lime-700 shadow-sm font-medium',
  // },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getUniverse(id: string): Universe | undefined {
  return UNIVERSES.find(u => u.id === id);
}

export function getLiveUniverses(): Universe[] {
  return UNIVERSES.filter(u => u.status === 'live');
}

const INACTIVE_CLASS = 'text-text-muted hover:text-text-secondary';

export function getUniverseButtonClass(universe: Universe, isActive: boolean): string {
  return isActive ? universe.activeClass : INACTIVE_CLASS;
}
