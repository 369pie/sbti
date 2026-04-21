-- Align mysti_orders.sku whitelist with the live CPTI catalog.
--
-- Adds CPTI annual codex / cosign / squad / seasonal SKUs so new orders can
-- persist the real business SKU instead of falling back to monthly-report.

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
  'cpti-codex-pass-yearly',
  'cpti-cosign-edition',
  'cpti-squad-pack',
  'cpti-seasonal-pack',
  'cpti-seasonal-qixi-2026',
  'cpti-seasonal-valentines-2026',
  'cpti-seasonal-lunar-newyear-2026',
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