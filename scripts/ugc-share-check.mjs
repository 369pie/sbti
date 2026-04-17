import assert from 'node:assert/strict';
import fs from 'node:fs';

const DEFAULT_APP_URL = 'http://localhost:3000';
const DEFAULT_UNIVERSE_ID = 'da26127a-7fea-498d-9d10-15a2ff5aabac';
const DEFAULT_PERSONALITY_SLUG = 'sigil-keeper';

function loadEnv() {
  const text = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    env[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
  }

  return env;
}

const env = loadEnv();
const appUrl = process.env.WTFTI_BASE_URL || env.WTFTI_BASE_URL || DEFAULT_APP_URL;
const universeId = process.env.UGC_SHARE_CHECK_UNIVERSE_ID || DEFAULT_UNIVERSE_ID;
const personalitySlug = process.env.UGC_SHARE_CHECK_PERSONALITY_SLUG || DEFAULT_PERSONALITY_SLUG;
const sessionId = `ugc-share-check-${Date.now()}`;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase env vars. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in .env.local.');
}

const supabaseHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

function buildRestUrl(path) {
  return `${supabaseUrl}/rest/v1/${path}`;
}

async function restRequest(path, init = {}) {
  const response = await fetch(buildRestUrl(path), {
    ...init,
    headers: {
      ...supabaseHeaders,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function appRequest(path, init = {}) {
  const response = await fetch(new URL(path, appUrl), init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { status: response.status, body };
}

async function getUniverseStats() {
  const rows = await restRequest(
    `creator_universes?select=id,total_tests,total_shares&id=eq.${encodeURIComponent(universeId)}`,
  );
  return rows?.[0] ?? null;
}

async function getResultRow() {
  const rows = await restRequest(
    `creator_test_results?select=id,shared,personality_slug,session_id&universe_id=eq.${encodeURIComponent(universeId)}&personality_slug=eq.${encodeURIComponent(personalitySlug)}&session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.desc&limit=1`,
  );
  return rows?.[0] ?? null;
}

async function waitForResultRow() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const row = await getResultRow();
    if (row) return row;
    await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
  }

  return null;
}

async function cleanup(originalUniverseStats) {
  await restRequest(
    `creator_test_results?universe_id=eq.${encodeURIComponent(universeId)}&session_id=eq.${encodeURIComponent(sessionId)}`,
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    },
  );

  await restRequest(`creator_universes?id=eq.${encodeURIComponent(universeId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      total_tests: originalUniverseStats.total_tests,
      total_shares: originalUniverseStats.total_shares,
    }),
  });
}

const originalUniverseStats = await getUniverseStats();
assert(originalUniverseStats, `Universe ${universeId} was not found.`);

console.log('[ugc-share-check] Using universe', universeId, 'against', appUrl);

try {
  const pendingShare = await appRequest('/api/ugc/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universeId, personalitySlug, sessionId }),
  });

  assert.equal(pendingShare.status, 200, 'share-before-result should return 200');
  assert.equal(pendingShare.body?.pendingResult, true, 'share-before-result should return pendingResult=true');
  console.log('[ugc-share-check] pendingResult response verified');

  const resultResponse = await appRequest('/api/ugc/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      universeId,
      personalitySlug,
      sessionId,
      scores: { mystic: 1 },
      referrer: 'ugc-share-check',
    }),
  });

  assert.equal(resultResponse.status, 201, 'result route should create a row');
  assert.equal(resultResponse.body?.ok, true, 'result route should return ok=true');
  console.log('[ugc-share-check] result creation verified');

  const createdRow = await waitForResultRow();
  assert(createdRow, 'result row was not written to creator_test_results');
  assert.equal(createdRow.shared, false, 'new result row should start with shared=false');
  console.log('[ugc-share-check] result row lookup verified');

  const firstShare = await appRequest('/api/ugc/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universeId, personalitySlug, sessionId }),
  });

  assert.equal(firstShare.status, 200, 'share-after-result should return 200');
  assert.equal(firstShare.body?.updated, true, 'share-after-result should return updated=true');
  console.log('[ugc-share-check] first share update verified');

  const sharedRow = await waitForResultRow();
  assert(sharedRow, 'shared row should still exist after update');
  assert.equal(sharedRow.shared, true, 'shared row should be marked shared=true');

  const repeatShare = await appRequest('/api/ugc/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universeId, personalitySlug, sessionId }),
  });

  assert.equal(repeatShare.status, 200, 'repeat share should return 200');
  assert.equal(repeatShare.body?.alreadyShared, true, 'repeat share should report alreadyShared=true');
  console.log('[ugc-share-check] duplicate share idempotency verified');

  const updatedUniverseStats = await getUniverseStats();
  assert(updatedUniverseStats, 'universe metrics should still be readable after share flow');
  assert.equal(
    updatedUniverseStats.total_tests,
    originalUniverseStats.total_tests + 1,
    'total_tests should increment by 1',
  );
  assert.equal(
    updatedUniverseStats.total_shares,
    originalUniverseStats.total_shares + 1,
    'total_shares should increment by 1',
  );
  console.log('[ugc-share-check] universe counters verified');

  console.log('[ugc-share-check] OK');
} finally {
  await cleanup(originalUniverseStats);
}