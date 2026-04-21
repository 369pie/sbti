import type { SinglePurchaseSku } from '@/lib/mysti/unlock';

export type CptiPricingIntent = 'deep' | 'cosign' | 'seasonal' | 'codex-pass' | 'upgrade' | 'squad';

const VALID_INTENTS = new Set<CptiPricingIntent>([
  'deep',
  'cosign',
  'seasonal',
  'codex-pass',
  'upgrade',
  'squad',
]);

export function parseCptiPricingIntent(value: string | null | undefined): CptiPricingIntent | undefined {
  if (!value) return undefined;
  return VALID_INTENTS.has(value as CptiPricingIntent) ? (value as CptiPricingIntent) : undefined;
}

export function cptiPricingIntentToTierSku(intent: CptiPricingIntent | undefined): SinglePurchaseSku | undefined {
  switch (intent) {
    case 'deep':
      return 'cpti-deep-relationship';
    case 'cosign':
      return 'cpti-cosign-edition';
    case 'seasonal':
      return 'cpti-seasonal-pack';
    case 'codex-pass':
    case 'upgrade':
      return 'cpti-codex-pass-yearly';
    case 'squad':
      return 'cpti-squad-pack';
    default:
      return undefined;
  }
}

export function isRelationshipResultIntent(
  intent: CptiPricingIntent | undefined,
): intent is 'deep' | 'cosign' | 'seasonal' {
  return intent === 'deep' || intent === 'cosign' || intent === 'seasonal';
}