/**
 * Dynamic UGC Universe Registry — loads published universes from Supabase.
 *
 * Phase 1: Replaces static-only loading with Supabase-first approach.
 * Falls back to static imports for offline/build scenarios.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { UgcUniverseConfig, UgcPersonality, UgcTheme } from './types';
import type { UniverseBundle, PersonalityRow, UniverseRow } from './db';
import { fetchPublishedUniverse } from './db';
import { UGC_UNIVERSES } from './registry';

// ─── Convert DB rows to UgcUniverseConfig ────────────────────────────────────

function dbPersonalityToUgc(row: PersonalityRow): UgcPersonality {
  return {
    slug: row.slug,
    number: row.number ?? '',
    name: row.name,
    code: row.code ?? row.slug.toUpperCase().slice(0, 4),
    emoji: row.emoji,
    tagline: row.tagline ?? '',
    color: row.color,
    quote: row.quote ?? '',
    copy: {
      hit: row.copy_hit ?? '',
      os: row.copy_os ?? '',
      symptoms: row.copy_symptoms ?? [],
      closer: row.copy_closer ?? '',
    },
  };
}

function bundleToConfig(bundle: UniverseBundle): UgcUniverseConfig {
  const u = bundle.universe;
  return {
    id: u.slug,
    name: u.name,
    shortName: u.short_name ?? u.name.slice(0, 4),
    emoji: u.emoji,
    theme: {
      primaryColor: u.primary_color,
      cardStyle: u.card_style as UgcTheme['cardStyle'],
    },
    creatorName: bundle.creator.name,
    creatorAvatar: bundle.creator.avatar_url ?? undefined,
    creatorLink: bundle.creator.social_link ?? undefined,
    hitLabel: u.hit_label,
    osLabel: u.os_label,
    symptomsLabel: u.symptoms_label,
    personalities: bundle.personalities.map(dbPersonalityToUgc),
  };
}

// ─── Dynamic loader ──────────────────────────────────────────────────────────

/**
 * Load a UGC universe by slug — tries Supabase first, falls back to static registry.
 */
export async function loadUgcUniverse(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ config: UgcUniverseConfig; bundle: UniverseBundle | null } | null> {
  // 1. Check static registry first (faster, no network)
  const staticConfig = UGC_UNIVERSES.find(u => u.id === slug);
  if (staticConfig) {
    return { config: staticConfig, bundle: null };
  }

  // 2. Load from Supabase
  const bundle = await fetchPublishedUniverse(supabase, slug);
  if (!bundle) return null;

  return { config: bundleToConfig(bundle), bundle };
}

/**
 * Load ALL published UGC universe slugs — for generateStaticParams and sitemap.
 */
export async function loadAllUgcSlugs(
  supabase: SupabaseClient,
): Promise<string[]> {
  const staticSlugs = UGC_UNIVERSES.map(u => u.id);

  const { data } = await supabase
    .from('creator_universes')
    .select('slug')
    .eq('status', 'published');

  const dbSlugs = (data ?? []).map((r: { slug: string }) => r.slug);
  const allSlugs = new Set([...staticSlugs, ...dbSlugs]);
  return [...allSlugs];
}

/**
 * Load all published universe configs for listing pages.
 */
export async function loadAllPublishedUniverses(
  supabase: SupabaseClient,
): Promise<{ slug: string; name: string; emoji: string; creatorName: string; totalTests: number }[]> {
  // Static
  const results = UGC_UNIVERSES.map(u => ({
    slug: u.id,
    name: u.name,
    emoji: u.emoji,
    creatorName: u.creatorName,
    totalTests: 0,
  }));

  // Supabase
  const { data } = await supabase
    .from('creator_universes')
    .select('slug, name, emoji, total_tests, creators!inner(name)')
    .eq('status', 'published')
    .order('total_tests', { ascending: false });

  for (const row of (data ?? [])) {
    const slug = row.slug as string;
    if (results.some(r => r.slug === slug)) continue;
    const creatorObj = row.creators as unknown as { name: string };
    results.push({
      slug,
      name: row.name as string,
      emoji: row.emoji as string,
      creatorName: creatorObj.name,
      totalTests: row.total_tests as number,
    });
  }

  return results;
}

// ─── Full bundle loader (for test/result pages) ──────────────────────────────

export interface DynamicUniverseData {
  config: UgcUniverseConfig;
  bundle: UniverseBundle | null;
  scoringMode: 'dimension' | 'direct';
  questionsPerTest: number | null;
}

/**
 * Full loader for test and result pages — returns everything needed to run a quiz.
 */
export async function loadUgcUniverseFull(
  supabase: SupabaseClient,
  slug: string,
): Promise<DynamicUniverseData | null> {
  // Static
  const staticConfig = UGC_UNIVERSES.find(u => u.id === slug);
  if (staticConfig) {
    return {
      config: staticConfig,
      bundle: null,
      scoringMode: 'dimension',
      questionsPerTest: null,
    };
  }

  // Supabase
  const bundle = await fetchPublishedUniverse(supabase, slug);
  if (!bundle) return null;

  return {
    config: bundleToConfig(bundle),
    bundle,
    scoringMode: bundle.universe.scoring_mode as 'dimension' | 'direct',
    questionsPerTest: bundle.universe.questions_per_test,
  };
}
