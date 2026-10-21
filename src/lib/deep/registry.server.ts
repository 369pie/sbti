/**
 * SERVER ONLY. Maps /api/deep/<kind>/ to { sku, resourceId, build() }.
 * resourceId must match what the client paywall passes to PremiumPaywall so that
 * existing paid orders (keyed by sku + resource_id + device) keep unlocking.
 */
import { buildResourceId } from '@/lib/payments/skus';
import { buildXptiDeepPayload } from '@/lib/deep/xpti-deep.server';
import { buildCptiDeepPayload } from '@/lib/deep/cpti-deep.server';
import { buildSoultiDeepPayload } from '@/lib/deep/soulti-deep.server';
import { buildMystiLetterPayload } from '@/lib/deep/mysti-deep.server';

export type DeepTarget = { sku: string; resourceId: string; build: () => unknown | Promise<unknown> };
export type DeepKind = { resolve: (str: (k: string) => string | null) => DeepTarget | null };

export const DEEP_KINDS: Record<string, DeepKind> = {
  xpti: {
    resolve: (str) => {
      const slug = str('slug');
      if (!slug) return null;
      return {
        sku: 'xpti-deep-xp',
        resourceId: buildResourceId('xpti', slug),
        build: () => buildXptiDeepPayload(slug, str('partner')),
      };
    },
  },
  cpti: {
    resolve: (str) => {
      const slug = str('slug');
      if (!slug) return null;
      return { sku: 'cpti-deep-relationship', resourceId: buildResourceId('cpti', slug), build: () => buildCptiDeepPayload(slug) };
    },
  },
  soulti: {
    resolve: (str) => {
      const slug = str('slug');
      if (!slug) return null;
      return { sku: 'soulti-deep-mirror', resourceId: buildResourceId('soulti', slug), build: () => buildSoultiDeepPayload(slug) };
    },
  },
  'mysti-letter': {
    resolve: (str) => {
      const slug = str('slug');
      if (!slug) return null;
      // MystiSoulLetterSection passes resourceId={slug}.
      return { sku: 'soul-letter', resourceId: slug, build: () => buildMystiLetterPayload(slug) };
    },
  },
};
