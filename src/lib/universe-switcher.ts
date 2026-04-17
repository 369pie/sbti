/**
 * Universe Switcher — Cross-universe personality preview data layer
 * 
 * Provides a function to get previews of how a personality appears across
 * different universes (WTFTI, 班TI, 鸟TI, 三角TI, 疯TI, 王者TI, 灵鉴).
 */

import { UNIVERSES } from './universes';
import { WTFTI_PERSONALITIES } from './wtfti-personalities';
import { BANTI_PERSONALITIES } from './banti/personalities';
import { BIRD_PERSONALITIES } from './bird/personalities';
import { DELTA_PERSONALITIES } from './delta/personalities';
import { FENG_PERSONALITIES } from './feng/personalities';
import { KINGS_PERSONALITIES } from './kings/personalities';
import { getMystiTarotData } from './mysti/tarot-mapping';

export interface UniversePreview {
  universeId: string;
  emoji: string;
  name: string;           // universe display name
  personalityName: string; // what your type is called in this universe
  path: string;           // link to result page
  isCurrentUniverse: boolean;
  status: 'live' | 'coming-soon' | 'limited';
}

// Map of universe IDs to their result prefixes and personality lookups
const UNIVERSE_CONFIGS = [
  {
    id: 'wtfti',
    resultPrefix: '/wtfti',
    getName: (slug: string) => {
      const p = WTFTI_PERSONALITIES.find(p => p.slug === slug);
      return p?.wtftiName;
    },
  },
  {
    id: 'banti',
    resultPrefix: '/wtfti/work',
    getName: (slug: string) => {
      const p = BANTI_PERSONALITIES.find(p => p.slug === slug);
      return p?.workName;
    },
  },
  {
    id: 'bird',
    resultPrefix: '/bird',
    getName: (slug: string) => {
      const p = BIRD_PERSONALITIES.find(p => p.slug === slug);
      return p?.birdName;
    },
  },
  {
    id: 'delta',
    resultPrefix: '/wtfti/delta',
    getName: (slug: string) => {
      const p = DELTA_PERSONALITIES.find(p => p.slug === slug);
      return p?.heroName;
    },
  },
  {
    id: 'feng',
    resultPrefix: '/wtfti/feng',
    getName: (slug: string) => {
      const p = FENG_PERSONALITIES.find(p => p.slug === slug);
      return p?.fengName;
    },
  },
  {
    id: 'kings',
    resultPrefix: '/wtfti/kings',
    getName: (slug: string) => {
      const p = KINGS_PERSONALITIES.find(p => p.slug === slug);
      return p?.heroName;
    },
  },
  {
    id: 'mysti',
    resultPrefix: '/mysti',
    getName: (slug: string) => {
      const data = getMystiTarotData(slug);
      return data?.majorArcana.name;
    },
  },
];

/**
 * Get previews of how a personality appears across all universes
 * @param slug - The personality slug (e.g., 'boss', 'nerd')
 * @param currentUniverseId - The ID of the universe currently being viewed
 * @returns Array of UniversePreview objects
 */
export function getUniversePreviews(slug: string, currentUniverseId: string): UniversePreview[] {
  const previews: UniversePreview[] = [];

  for (const config of UNIVERSE_CONFIGS) {
    const universe = UNIVERSES.find(u => u.id === config.id);
    if (!universe) continue;

    const personalityName = config.getName(slug);
    if (!personalityName) continue;

    previews.push({
      universeId: config.id,
      emoji: universe.emoji,
      name: universe.name,
      personalityName,
      path: `${config.resultPrefix}/result/${slug}/`,
      isCurrentUniverse: config.id === currentUniverseId,
      status: universe.status,
    });
  }

  return previews;
}

/**
 * Get all available universe slugs for a personality
 * @param slug - The personality slug
 * @returns Array of universe IDs that have this personality
 */
export function getAvailableUniverses(slug: string): string[] {
  return UNIVERSE_CONFIGS
    .filter(config => config.getName(slug) !== undefined)
    .map(config => config.id);
}