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
  /** Current availability. `limited` = event-window universe (see lib/limited-universe.ts) */
  status: 'live' | 'coming-soon' | 'limited';
  /** Theme accent colour (hex) */
  accent: string;
  /** URL path for the test page (quiz directly) */
  testPath: string;
  /** URL path for the landing / intro page (before test) */
  landingPath: string;
  /** URL path prefix for result pages (before /result/) */
  resultPrefix: string;
  /** Gallery tab id in TypesContent (matches gallery-data.ts tab.id) */
  galleryTabId?: string;
  /** Active class applied when this universe is selected in a pill bar */
  activeClass: string;
  /** Whether this is a UGC (creator-built) universe */
  isUgc?: boolean;
  /** Creator display name (UGC only) */
  creatorName?: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────

import { UGC_UNIVERSES } from './ugc/registry';

/** Convert UGC universe configs to Universe entries automatically. */
function buildUgcUniverseEntries(): Universe[] {
  return UGC_UNIVERSES.map(u => ({
    id: `ugc-${u.id}`,
    name: u.name,
    shortName: u.shortName,
    emoji: u.emoji,
    status: 'live' as const,
    accent: u.theme.primaryColor,
    testPath: `/ugc/${u.id}/test/`,
    landingPath: `/ugc/${u.id}/test/`,
    resultPrefix: `/ugc/${u.id}`,
    galleryTabId: undefined,
    activeClass: 'bg-bg-elevated text-text-primary shadow-sm font-medium',
    isUgc: true,
    creatorName: u.creatorName,
  }));
}

export const UNIVERSES: Universe[] = [
  {
    id: 'first-look',
    name: '初见',
    shortName: '初见',
    emoji: '☾',
    status: 'live',
    accent: '#C07A8E',
    testPath: '/test/',
    landingPath: '/test/',
    resultPrefix: '/test',
    galleryTabId: undefined,
    activeClass: 'bg-bg-elevated text-text-primary shadow-sm font-medium',
  },
  {
    id: 'standard',
    name: '标准版',
    shortName: '标准',
    emoji: '',
    status: 'live',
    accent: '#e8729c',
    testPath: '/test/classic/',
    landingPath: '/',
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
    testPath: '/test/classic/?skin=xiuxian',
    landingPath: '/?skin=xiuxian',
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
    landingPath: '/wtfti/',
    resultPrefix: '/wtfti',
    galleryTabId: 'wtfti',
    activeClass: 'bg-rose-100 text-rose-700 shadow-sm font-medium',
  },
  {
    id: 'banti',
    name: '班TI（打工人）',
    shortName: '班TI',
    emoji: '💼',
    status: 'live',
    accent: '#0ea5e9',
    testPath: '/wtfti/work/test/',
    landingPath: '/wtfti/work/',
    resultPrefix: '/wtfti/work',
    galleryTabId: 'banti',
    activeClass: 'bg-sky-100 text-sky-700 shadow-sm font-medium',
  },
  {
    id: 'feng',
    name: '疯TI',
    shortName: '疯TI',
    emoji: '😈',
    status: 'live',
    accent: '#39ff14',
    testPath: '/wtfti/feng/test/',
    landingPath: '/wtfti/feng/',
    resultPrefix: '/wtfti/feng',
    galleryTabId: undefined,
    activeClass: 'bg-[#0a0a0a] text-[#39ff14] border border-[#39ff14]/40 shadow-sm font-medium',
  },
  {
    id: 'kings',
    name: '王者TI',
    shortName: '王者',
    emoji: '⚔️',
    status: 'live',
    accent: '#f59e0b',
    testPath: '/wtfti/kings/test/',
    landingPath: '/wtfti/kings/',
    resultPrefix: '/wtfti/kings',
    galleryTabId: 'kings',
    activeClass: 'bg-amber-100 text-amber-700 shadow-sm font-medium',
  },
  {
    id: 'bird',
    name: '鸟TI',
    shortName: '鸟TI',
    emoji: '🐦',
    status: 'live',
    accent: '#38bdf8',
    testPath: '/bird/test/',
    landingPath: '/bird/',
    resultPrefix: '/bird',
    galleryTabId: 'bird',
    activeClass: 'bg-sky-50 text-sky-600 shadow-sm font-medium',
  },
  {
    id: 'flower',
    name: '花TI',
    shortName: '花TI',
    emoji: '🌸',
    status: 'live',
    accent: '#e11d48',
    testPath: '/flower/test/',
    landingPath: '/flower/',
    resultPrefix: '/flower',
    galleryTabId: undefined,
    activeClass: 'bg-rose-50 text-rose-600 shadow-sm font-medium',
  },
  // ── 后续 IP 宇宙在此追加 ──
  {
    id: 'hogti',
    name: '霍格沃茨TI',
    shortName: '霍格',
    emoji: '⚡',
    status: 'live',
    accent: '#3a2f6b',
    testPath: '/hogti/test/',
    landingPath: '/hogti/',
    resultPrefix: '/hogti',
    galleryTabId: 'hogti',
    activeClass: 'bg-amber-100 text-amber-800 shadow-sm font-medium',
  },
  {
    id: 'fanrenti',
    name: '凡人TI · 修仙',
    shortName: '凡修',
    emoji: '🪷',
    status: 'live',
    accent: '#2a4d4f',
    testPath: '/fanrenti/test/',
    landingPath: '/fanrenti/',
    resultPrefix: '/fanrenti',
    galleryTabId: 'fanrenti',
    activeClass: 'bg-teal-50 text-teal-800 shadow-sm font-medium',
  },
  {
    id: 'delta',
    name: '三角TI',
    shortName: '三角',
    emoji: '🎯',
    status: 'live',
    accent: '#84cc16',
    testPath: '/wtfti/delta/test/',
    landingPath: '/wtfti/delta/',
    resultPrefix: '/wtfti/delta',
    galleryTabId: 'delta',
    activeClass: 'bg-lime-100 text-lime-700 shadow-sm font-medium',
  },
  {
    id: 'soulti',
    name: 'SoulTI',
    shortName: 'SoulTI',
    emoji: '🌙',
    status: 'live',
    accent: '#8b7355',
    testPath: '/soulti/test/',
    landingPath: '/soulti/',
    resultPrefix: '/soulti',
    galleryTabId: 'soulti',
    activeClass: 'bg-stone-100 text-stone-700 shadow-sm font-medium',
  },
  {
    id: 'xpti',
    name: '恋爱XP',
    shortName: 'XP',
    emoji: '💜',
    status: 'live',
    accent: '#a855f7',
    testPath: '/xpti/test/',
    landingPath: '/xpti/',
    resultPrefix: '/xpti',
    galleryTabId: undefined,
    activeClass: 'bg-purple-50 text-purple-600 shadow-sm font-medium',
  },
  {
    id: 'cpti',
    name: 'CPTI',
    shortName: 'CPTI',
    emoji: '💕',
    status: 'live',
    accent: '#e11d48',
    testPath: '/cpti/test/',
    landingPath: '/cpti/',
    resultPrefix: '/cpti',
    galleryTabId: 'cpti',
    activeClass: 'bg-rose-50 text-rose-600 shadow-sm font-medium',
  },
  {
    id: 'mysti',
    name: '灵鉴',
    shortName: '灵鉴',
    emoji: '🔮',
    status: 'live',
    accent: '#8b5cf6',
    testPath: '/wtfti/test/?mode=mysti',
    landingPath: '/mysti/',
    resultPrefix: '/mysti',
    galleryTabId: undefined,
    activeClass: 'bg-violet-100 text-violet-700 shadow-sm font-medium',
  },
  // ── UGC 宇宙（自动从 ugc/registry 加载）──
  ...buildUgcUniverseEntries(),
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
