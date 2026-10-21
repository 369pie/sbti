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

  // 5. 「我和他」 report gating (src/lib/xpti/couple-view.ts)
  const { buildCoupleMerge } = await import('@/lib/xpti/couple-merge');
  const { buildCoupleView, PAID_PAIRING_KEYS } = await import('@/lib/xpti/couple-view');
  const merged = buildCoupleMerge({ slug: 'architect', dims: [3, 3, 3, 1, 1, 1, 3, 3, 3] }, { slug: 'architect', dims: [1, 1, 1, 3, 3, 3, 1, 1, 1] });
  const row = (unlocked_at: string | null) => ({
    id: 'c1', pair_code: 'P', share_token: 'tok', status: 'completed' as const,
    inviter_user_id: null, inviter_device_id: null, inviter_slug: 'architect', inviter_dims: merged.inviter.dims, inviter_nickname: null,
    partner_user_id: null, partner_device_id: null, partner_slug: 'architect', partner_dims: merged.partner.dims, partner_nickname: null,
    merged_payload: merged, unlocked_sku: unlocked_at ? 'xpti-couple-report' : null, unlocked_at,
    unlocked_by_user_id: null, unlocked_by_device_id: null, completed_at: PAST, expires_at: FUTURE,
    created_at: PAST, updated_at: PAST, practice_checklist: {}, history: [],
  });
  const PAID_TEXT = [merged.pairing.longDescription, merged.pairing.notes.fit, merged.pairing.notes.risk, merged.pairing.notes.longTerm];
  const assertNoPaid = (view: unknown) => {
    const json = JSON.stringify(view);
    for (const t of PAID_TEXT) assert.ok(!json.includes(t), `locked view leaked: ${t.slice(0, 20)}`);
    const v = view as { merged: { pairing: Record<string, unknown> }; deep: unknown };
    for (const k of PAID_PAIRING_KEYS) assert.ok(!(k in v.merged.pairing), `locked pairing has ${k}`);
    assert.equal(v.deep, null);
  };
  const assertFull = (view: { unlocked: boolean; merged: { pairing: { notes?: unknown; longDescription?: unknown } } | null; deep?: { dialogues: unknown[]; practice: unknown[]; conflicts: unknown[]; letter: unknown } | null }) => {
    assert.equal(view.unlocked, true);
    assert.ok(view.merged?.pairing.notes && view.merged.pairing.longDescription);
    assert.ok(view.deep && view.deep.dialogues.length > 0 && view.deep.practice.length > 0 && view.deep.letter);
  };

  __setMemberAccessDepsForTests(ANON_NONMEMBER);
  await t('couple view: non-member, unpaid → locked, no paid fields', async () => {
    const v = await buildCoupleView(row(null) as never);
    assert.equal(v.unlocked, false);
    assertNoPaid(v);
    // free preview fields still present
    assert.ok(v.merged?.pairing.label && v.merged.pairing.oneLine && v.merged.inviter.axes.length && v.merged.partner.signature.label);
  });
  __setMemberAccessDepsForTests(NO_SESSION);
  await t('couple view: no session → locked', async () => assertNoPaid(await buildCoupleView(row(null) as never)));
  __setMemberAccessDepsForTests(EXPIRED);
  await t('couple view: expired member → locked', async () => assertNoPaid(await buildCoupleView(row(null) as never)));
  __setMemberAccessDepsForTests(MEMBER);
  await t('couple view: member → full (no order)', async () => {
    const v = await buildCoupleView(row(null) as never);
    assertFull(v);
    assert.equal(v.unlockedVia, 'member');
  });
  __setMemberAccessDepsForTests(ANON_NONMEMBER);
  await t('couple view: paid order → full', async () => {
    const v = await buildCoupleView(row(PAST) as never);
    assertFull(v);
    assert.equal(v.unlockedVia, 'order');
  });


  // 6. Server-gated deep reports (/api/deep/<kind>/, src/lib/deep/entitlement.ts)
  const { POST: deep } = await import('@/app/api/deep/[kind]/route');
  const { __setDeepEntitlementDepsForTests, checkDeepEntitlement } = await import('@/lib/deep/entitlement');
  const { DIALOGUE_SCRIPTS } = await import('@/lib/xpti/dialogue-scripts');
  const { LANDMINE_POOL_V2 } = await import('@/lib/cpti/deep-pools');
  const { getSoulLetter } = await import('@/lib/mysti/soul-letters');
  const { getAllSoultiSlugs } = await import('@/lib/soulti/personalities');
  const { getAllXptiSlugs } = await import('@/lib/xpti/personalities');
  const { getAllRelationshipSlugs } = await import('@/lib/cpti/relationships');
  const { listSoulLetterSlugs } = await import('@/lib/mysti/soul-letters');
  const { buildResourceId: buildResourceIdT } = await import('@/lib/payments/skus');
  const xSlug = getAllXptiSlugs()[0];
  const cSlug = getAllRelationshipSlugs()[0];
  const sSlug = getAllSoultiSlugs()[0];
  const mSlug = listSoulLetterSlugs()[0];
  const deepPost = (kind: string, body: unknown) => deep(post(`http://x/api/deep/${kind}/`, body), { params: Promise.resolve({ kind }) });
  const NONE = { memberUnlocks: async () => false, paidOrder: async () => false };
  const AS_MEMBER = { memberUnlocks: async () => true, paidOrder: async () => false };
  const AS_BUYER = { memberUnlocks: async () => false, paidOrder: async (sku: string, rid: string, dev: string) => sku === 'xpti-deep-xp' && rid === buildResourceIdT("xpti", xSlug) && dev === 'dev-buyer' };
  const paidSamples: Record<string, string[]> = {
    xpti: DIALOGUE_SCRIPTS.slice(0, 40).map((d) => d.goal),
    cpti: LANDMINE_POOL_V2.slice(0, 60) as string[],
    'mysti-letter': [getSoulLetter(mSlug)!.neuro.slice(0, 30)],
  };

  __setDeepEntitlementDepsForTests(NONE);
  for (const [kind, slug] of [['xpti', xSlug], ['cpti', cSlug], ['soulti', sSlug], ['mysti-letter', mSlug]] as const) {
    await t(`deep ${kind}: unentitled → 403, no paid text`, async () => {
      const r = await deepPost(kind, { slug, deviceId: 'dev-x' });
      assert.equal(r.status, 403);
      const txt = await r.text();
      for (const p of paidSamples[kind] ?? []) assert.ok(!txt.includes(p));
    });
  }
  __setDeepEntitlementDepsForTests(AS_MEMBER);
  for (const [kind, slug] of [['xpti', xSlug], ['cpti', cSlug], ['soulti', sSlug], ['mysti-letter', mSlug]] as const) {
    await t(`deep ${kind}: member → 200 with payload`, async () => {
      const r = await deepPost(kind, { slug, deviceId: 'dev-x' });
      assert.equal(r.status, 200);
      const j = await r.json();
      assert.ok(j.data);
      assert.equal(j.via, 'member');
    });
  }
  await t('deep xpti: member payload contains paid dialogues', async () => {
    const j = await (await deepPost('xpti', { slug: xSlug })).json();
    assert.equal(j.data.dialogues.length, 6);
    assert.equal(j.data.landmines.length, 8);
  });
  __setDeepEntitlementDepsForTests(AS_BUYER);
  await t('deep xpti: paid order on same device → 200 via order', async () => {
    const r = await deepPost('xpti', { slug: xSlug, deviceId: 'dev-buyer' });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).via, 'order');
  });
  await t('deep xpti: same buyer, other device → 403', async () => {
    assert.equal((await deepPost('xpti', { slug: xSlug, deviceId: 'dev-other' })).status, 403);
  });
  await t('deep cpti: xpti purchase does not unlock cpti', async () => {
    assert.equal((await deepPost('cpti', { slug: cSlug, deviceId: 'dev-buyer' })).status, 403);
  });
  __setDeepEntitlementDepsForTests({ memberUnlocks: async () => false, paidOrder: async (sku: string, rid: string, dev: string) => sku === 'xpti-couple-report' && rid === buildResourceIdT('cpti', cSlug) && dev === 'dev-c' });
  await t('deep cpti: unified 我和他 sku (xpti-couple-report) on same resource unlocks', async () => {
    assert.equal((await deepPost('cpti', { slug: cSlug, deviceId: 'dev-c' })).status, 200);
  });
  __setDeepEntitlementDepsForTests({ memberUnlocks: async () => false, paidOrder: async (sku: string, rid: string, dev: string) => sku === 'cpti-deep-relationship' && rid === buildResourceIdT('cpti', cSlug) && dev === 'dev-legacy' });
  await t('deep cpti: legacy cpti-deep-relationship buyer still unlocks', async () => {
    assert.equal((await deepPost('cpti', { slug: cSlug, deviceId: 'dev-legacy' })).status, 200);
  });
  await t('deep: unknown kind → 404', async () => assert.equal((await deepPost('nope', { slug: 'x' })).status, 404));
  // real member-access wiring: member deps flow through checkDeepEntitlement defaults
  __setDeepEntitlementDepsForTests(null);
  __setMemberAccessDepsForTests(MEMBER);
  await t('deep entitlement: member-access member unlocks xpti-deep-xp (default deps)', async () =>
    assert.deepEqual(await checkDeepEntitlement({ sku: 'xpti-deep-xp', resourceId: 'r', deviceId: null }), { unlocked: true, via: 'member' }));
  __setMemberAccessDepsForTests(ANON_NONMEMBER);
  await t('deep entitlement: non-member, no device → locked (no DB call)', async () =>
    assert.deepEqual(await checkDeepEntitlement({ sku: 'xpti-deep-xp', resourceId: 'r', deviceId: null }), { unlocked: false, via: null }));

  __setMemberAccessDepsForTests(null);
  console.log(`\n${pass} passed`);
}

main().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
