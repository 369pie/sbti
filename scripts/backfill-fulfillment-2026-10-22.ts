/**
 * One-off, idempotent backfill (approved 2026-10-22): run fulfillPaidOrder for
 * orders that were marked paid by reconcile before it ran fulfillment.
 * Usage: npx tsx scripts/backfill-fulfillment-2026-10-22.ts [--apply]
 * Logs only order-id suffixes. Re-running is safe (subscription keyed by source_order_id).
 */
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { fulfillPaidOrder } from '@/lib/mysti/fulfill-paid-order';
import type { MystiOrderRow } from '@/lib/mysti/payment-store';

const SUFFIXES = ['44fw34', 'btq8n0', '9cel8n', '3xr25p', '2pci5a'];
(async () => {
  const apply = process.argv.includes('--apply');
  const db = createAdminSupabaseClient();
  for (const suf of SUFFIXES) {
    const { data, error } = await db.from('mysti_orders').select('*').eq('status', 'paid').like('trade_order_id', `%${suf}`);
    if (error || !data || data.length !== 1) { console.log(suf, 'SKIP lookup', error?.message ?? `rows=${data?.length}`); continue; }
    const order = data[0] as MystiOrderRow;
    if (!apply) { console.log(suf, 'dry: would fulfill'); continue; }
    const r = await fulfillPaidOrder(order);
    console.log(suf, JSON.stringify({ subExp: r.subscriptionExpiresAt ? new Date(r.subscriptionExpiresAt).toISOString() : null, her: r.membershipSynced, couple: r.coupleUnlocked, notes: r.notes }));
  }
})();
