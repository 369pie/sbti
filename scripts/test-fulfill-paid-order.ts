import assert from 'node:assert/strict';
import { fulfillPaidOrder, __setFulfillDepsForTests } from '../src/lib/mysti/fulfill-paid-order';
import type { MystiOrderRow } from '../src/lib/mysti/payment-store';
(async () => {
  const DAY = 86_400_000; const now = Date.now();
  const subs = new Map<string, number>(); let herExp = 0; let unlocks = 0; let devExp = 0;
  __setFulfillDepsForTests({
    getSku: (o) => (o as unknown as { sku: string }).sku, getDeviceId: () => 'dev1',
    async ensureSubscriptionFromOrder(o) { // mirrors real: idempotent by source_order_id, extends active device sub
      if (subs.has(o.id)) return { expiresAt: subs.get(o.id)! };
      devExp = Math.max(now, devExp) + 30 * DAY; subs.set(o.id, devExp); return { expiresAt: devExp };
    },
    async syncHerMembership(o) { herExp = Math.max(herExp, now, o.expiresAtMs); }, // mirrors activateHerMembership max()
    async markCoupleUnlocked() { unlocks++; return { ok: 1 }; },
  });
  const pass = { id: 'o1', status: 'paid', sku: 'monthly-pass', user_id: 'u', resource_id: 'subscription' } as unknown as MystiOrderRow;
  const r1 = await fulfillPaidOrder(pass); const r2 = await fulfillPaidOrder(pass);
  assert.equal(r1.subscriptionExpiresAt, r2.subscriptionExpiresAt, 'sub not double-extended');
  assert.equal(herExp, r1.subscriptionExpiresAt, 'her not double-extended');
  assert.ok(Math.abs(herExp - (now + 30 * DAY)) < 5000);
  const couple = { id: 'o2', status: 'paid', sku: 'xpti-couple-report', resource_id: 'couple:TOK' } as unknown as MystiOrderRow;
  const c1 = await fulfillPaidOrder(couple); await fulfillPaidOrder(couple);
  assert.ok(c1.coupleUnlocked); assert.equal(unlocks, 2);
  const old = { id: 'o3', status: 'paid', sku: 'xpti-couple-half', resource_id: 'xpti:couple-report' } as unknown as MystiOrderRow;
  assert.deepEqual((await fulfillPaidOrder(old)).notes, ['couple_no_token']);
  const pending = { ...pass, id: 'o4', status: 'pending' } as unknown as MystiOrderRow;
  assert.deepEqual((await fulfillPaidOrder(pending)).notes, ['not_paid']); assert.equal(subs.has('o4'), false);
  console.log('fulfill-paid-order: 4 scenarios passed');
})();
