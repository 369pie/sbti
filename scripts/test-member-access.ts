/**
 * Unit-level check of server-side member unlock paths (no network, no DB).
 * Run: npx tsx scripts/test-member-access.ts
 */
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

import {
  __setMemberAccessDepsForTests,
  coupleUnlockState,
  memberUnlocksSku,
  resolveRequestMember,
} from '@/lib/member-access';

const FUTURE = new Date(Date.now() + 7 * 86400e3).toISOString();
const PAST = new Date(Date.now() - 86400e3).toISOString();
const noop = { boundDeviceIds: async () => [], legacyPassExpiry: async () => null };

const MEMBER = { getSessionUserId: async () => 'u-member', herMemberExpiry: async () => FUTURE, ...noop };
const EXPIRED = { getSessionUserId: async () => 'u-old', herMemberExpiry: async () => PAST, ...noop };
const ANON_NONMEMBER = { getSessionUserId: async () => 'anon-1', herMemberExpiry: async () => null, ...noop };
const NO_SESSION = { getSessionUserId: async () => null, herMemberExpiry: async () => FUTURE, ...noop };
const LEGACY_BOUND = {
  getSessionUserId: async () => 'anon-2',
  herMemberExpiry: async () => null,
  boundDeviceIds: async () => ['dev-legacy'],
  legacyPassExpiry: async (d: string) => (d === 'dev-legacy' ? FUTURE : null),
};

let pass = 0;
async function t(name: string, fn: () => Promise<void>) {
  await fn();
  pass++;
  console.log('ok  -', name);
}

async function main() {
  // 1. resolver
  __setMemberAccessDepsForTests(MEMBER);
  await t('her_profiles member resolves', async () => assert.equal((await resolveRequestMember()).source, 'her_profiles'));
  __setMemberAccessDepsForTests(EXPIRED);
  await t('expired member blocked', async () => assert.equal((await resolveRequestMember()).isMember, false));
  __setMemberAccessDepsForTests(NO_SESSION);
  await t('no session → her_profiles never consulted', async () => assert.equal((await resolveRequestMember()).isMember, false));
  __setMemberAccessDepsForTests(LEGACY_BOUND);
  await t('anon session + bound legacy pass resolves', async () => assert.equal((await resolveRequestMember()).source, 'legacy_pass'));

  // 2. SKU coverage
  __setMemberAccessDepsForTests(MEMBER);
  await t('member unlocks soulti-deep-mirror', async () => assert.equal((await memberUnlocksSku('soulti-deep-mirror')).unlocked, true));
  await t('member does NOT unlock gift-card', async () => assert.equal((await memberUnlocksSku('gift-card')).unlocked, false));
  await t('member does NOT unlock besties-bundle', async () => assert.equal((await memberUnlocksSku('besties-bundle')).unlocked, false));

  // 3. couple report
  await t('couple: member free without order', async () => assert.deepEqual(await coupleUnlockState({ unlocked_at: null }), { unlocked: true, via: 'member' }));
  __setMemberAccessDepsForTests(ANON_NONMEMBER);
  await t('couple: non-member blocked', async () => assert.equal((await coupleUnlockState({ unlocked_at: null })).unlocked, false));
  await t('couple: paid order still unlocks', async () => assert.equal((await coupleUnlockState({ unlocked_at: PAST })).via, 'order'));

  // 4. route handlers
  const { GET: soultiVerify } = await import('@/app/api/soulti/verify/route');
  const { POST: entitlement } = await import('@/app/api/mysti/payment/entitlement/route');
  const { POST: create } = await import('@/app/api/mysti/payment/create/route');
  const post = (url: string, body: unknown) =>
    new NextRequest(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

  __setMemberAccessDepsForTests(MEMBER);
  await t('route soulti/verify: member → paid via member', async () => {
    const r = await soultiVerify(new NextRequest('http://x/api/soulti/verify?sku=full-report'));
    const j = await r.json();
    assert.equal(j.provider, 'member');
    assert.equal(j.unlocked, true);
  });
  await t('route payment/entitlement: member → unlocked via member', async () => {
    const r = await entitlement(post('http://x/api/mysti/payment/entitlement', { sku: 'xpti-deep-xp', resourceId: 'r1', deviceId: 'd1' }));
    const j = await r.json();
    assert.equal(j.unlocked, true);
    assert.equal(j.via, 'member');
  });
  await t('route payment/create: member → 409 member_covered (no order)', async () => {
    const r = await create(post('http://x/api/mysti/payment/create', { sku: 'xpti-couple-report', resourceId: 'tok', deviceId: 'd1', paymentType: 'wechat' }));
    assert.equal(r.status, 409);
    assert.equal((await r.json()).memberCovered, true);
  });

  __setMemberAccessDepsForTests(ANON_NONMEMBER);
  await t('route soulti/verify: non-member without order → 400 (blocked)', async () => {
    const r = await soultiVerify(new NextRequest('http://x/api/soulti/verify?sku=full-report'));
    assert.equal(r.status, 400);
  });
  await t('route payment/entitlement: non-member → not unlocked via member', async () => {
    const r = await entitlement(post('http://x/api/mysti/payment/entitlement', { sku: 'xpti-deep-xp', resourceId: 'r1', deviceId: 'd1' }));
    const j = await r.json();
    assert.notEqual(j.via, 'member');
    assert.notEqual(j.unlocked, true);
  });
  await t('route payment/create: non-member → not member_covered', async () => {
    // Passing the member gate means the handler proceeds to the normal paid flow
    // (session lookup / order creation), which needs a request scope + DB here.
    try {
      const r = await create(post('http://x/api/mysti/payment/create', { sku: 'xpti-couple-report', resourceId: 'tok', deviceId: 'd1', paymentType: 'wechat' }));
      assert.notEqual(r.status, 409);
    } catch (e) {
      assert.match(String(e), /request scope|cookies/);
    }
  });

  __setMemberAccessDepsForTests(null);
  console.log(`\n${pass} passed`);
}

main().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
