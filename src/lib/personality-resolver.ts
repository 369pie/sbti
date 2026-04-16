/**
 * Unified personality resolver — maps (universeId, slug) → display info.
 * Used by WTF Card to show personality names from any universe.
 */

import { getPersonalityBySlug } from './personalities';
import { getWtftiPersonality } from './wtfti-personalities';
import { getXiuxianV2Skin } from './xiuxian-v2';
import { getBantiPersonality } from './banti/personalities';
import { getKingsPersonality } from './kings/personalities';
import { getDeltaPersonality } from './delta/personalities';
import { BIRD_PERSONALITIES } from './bird/personalities';
import { getFlowerPersonalityBySlug } from './flower/personalities';
import { getSoultiPersonalityBySlug } from './soulti/personalities';
import { getXptiPersonalityBySlug } from './xpti/personalities';
import { getFengPersonality } from './feng/personalities';
import { getCptiPersonalityBySlug } from './cpti/personalities';
import { getMystiTarotData } from './mysti/tarot-mapping';
import { getUgcPersonality } from './ugc/registry';

export interface ResolvedPersonality {
  name: string;
  emoji: string;
}

const BIRD_MAP = new Map(BIRD_PERSONALITIES.map(b => [b.slug, b]));

export function resolvePersonality(universeId: string, slug: string): ResolvedPersonality | null {
  switch (universeId) {
    case 'standard': {
      const p = getPersonalityBySlug(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'xiuxian': {
      const p = getXiuxianV2Skin(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'wtfti': {
      const p = getWtftiPersonality(slug);
      return p ? { name: p.wtftiName, emoji: p.emoji } : null;
    }
    case 'banti': {
      const p = getBantiPersonality(slug);
      return p ? { name: p.workName, emoji: p.emoji } : null;
    }
    case 'feng': {
      const p = getFengPersonality(slug);
      return p ? { name: p.fengName, emoji: p.emoji } : null;
    }
    case 'kings': {
      const p = getKingsPersonality(slug);
      return p ? { name: p.heroName, emoji: p.emoji } : null;
    }
    case 'delta': {
      const p = getDeltaPersonality(slug);
      return p ? { name: p.heroName, emoji: p.emoji } : null;
    }
    case 'bird': {
      const b = BIRD_MAP.get(slug);
      return b ? { name: b.birdName, emoji: b.emoji } : null;
    }
    case 'flower': {
      const p = getFlowerPersonalityBySlug(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'soulti': {
      const p = getSoultiPersonalityBySlug(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'xpti': {
      const p = getXptiPersonalityBySlug(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'cpti': {
      const p = getCptiPersonalityBySlug(slug);
      return p ? { name: p.name, emoji: p.emoji } : null;
    }
    case 'mysti': {
      const p = getWtftiPersonality(slug);
      const tarot = getMystiTarotData(slug);
      if (!p || !tarot) return null;
      return { name: `${tarot.majorArcana.name} · ${p.wtftiName}`, emoji: p.emoji };
    }
    default: {
      // Handle UGC universes (id format: 'ugc-{slug}')
      if (universeId.startsWith('ugc-')) {
        const ugcId = universeId.slice(4);
        const p = getUgcPersonality(ugcId, slug);
        return p ? { name: p.name, emoji: p.emoji } : null;
      }
      return null;
    }
  }
}
