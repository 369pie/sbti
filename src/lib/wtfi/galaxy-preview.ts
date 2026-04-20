/**
 * Build a deterministic preview GalaxyResult from a home planet slug,
 * for landing pages / share previews where we don't have a real test result.
 *
 * Reuses `defaultAxesVector` + first 3 moons + bucket NEUTRAL shadow.
 */

import {
  HOME_PLANET_CATALOG,
  MOON_PLANET_CATALOG,
  SHADOW_PLANET_CATALOG,
  getHomePlanet,
} from './galaxy-planets';
import type {
  GalaxyHomePlanet,
  GalaxyMoon,
  GalaxyResult,
  GalaxyShadow,
} from './galaxy-types';

export function mockGalaxyFromHome(slug: string): GalaxyResult | null {
  const home = getHomePlanet(slug);
  if (!home) return null;

  const homePlanet: GalaxyHomePlanet = {
    code: home.code,
    name: home.name,
    slug: home.slug,
    axesVector: home.defaultAxesVector,
    headline: home.headline,
    body: home.body,
    cardImageUrl: home.cardImageUrl,
  };

  // pick first 3 moons across universes
  const moons: GalaxyMoon[] = MOON_PLANET_CATALOG.slice(0, 3).map((m) => ({
    universeId: m.universeId,
    code: m.code,
    name: m.name,
    slug: m.slug,
    headline: m.headline,
    body: m.body,
    cardImageUrl: m.cardImageUrl,
  }));

  // pick neutral shadow as default placeholder
  const neutral =
    SHADOW_PLANET_CATALOG.find((s) => s.bucket === 'SHADOW-NEUTRAL') ??
    SHADOW_PLANET_CATALOG[0];
  const shadow: GalaxyShadow = {
    axisScore: 0,
    bucket: neutral.bucket,
    slug: neutral.slug,
    name: neutral.name,
    headline: neutral.headline,
    body: neutral.body,
    tooltip: neutral.tooltip,
    cardImageUrl: neutral.cardImageUrl,
  };

  return {
    homePlanet,
    moons,
    shadow,
    orbit: [],
    meta: {
      resultId: `preview-${slug}`,
      createdAt: new Date().toISOString(),
      testVersion: 'preview',
    },
  };
}

export function listAllHomeSlugs(): string[] {
  return HOME_PLANET_CATALOG.map((p) => p.slug);
}
