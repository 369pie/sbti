-- Expand mysti order SKU compatibility to cover the current live paywall catalog.

ALTER TABLE IF EXISTS public.mysti_orders DROP CONSTRAINT IF EXISTS mysti_orders_sku_check;

ALTER TABLE IF EXISTS public.mysti_orders ADD CONSTRAINT mysti_orders_sku_check CHECK (sku IN (
  'soul-letter',
  'dual-report',
  'monthly-report',
  'gift-card',
  'festival-gift-card',
  'besties-bundle',
  'share-plus',
  'share-atelier',
  'wtfti-deep-pantheon',
  'soulti-deep-mirror',
  'cpti-deep-relationship',
  'xpti-deep-xp',
  'xpti-couple-report',
  'xpti-couple-half',
  'xpti-archive-yearly',
  'wtfcard-collector',
  'monthly-pass',
  'quarterly-pass',
  'yearly-pass',
  'creator-pass'
));