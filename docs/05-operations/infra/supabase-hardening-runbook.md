# Supabase Hardening Runbook

> Owner: Operations + QA
> Status: Active Operations Reference
> Priority: P1
> Last Updated: 2026-04-18
> Review Cadence: Before each production schema-sensitive deploy
> Next Decision: Decide whether this rollout-specific runbook should be folded into a generic Supabase release checklist

This runbook is for the rollout that introduces [src/lib/supabase/migrations/2026-04-18-production-hardening.sql](../../../src/lib/supabase/migrations/2026-04-18-production-hardening.sql) and the matching runtime changes.

## Scope

This rollout changes both schema and access control:

- creates `identify_assessments`
- adds `mysti_orders.device_id`
- creates `mysti_subscriptions`
- removes public write access for `creator_test_results`, `creator_orders`, and `increment_universe_*`
- requires the new API code paths that write through service-role clients

Because the database is tightened before the new app code takes over, do not leave a long gap between migration and deploy.

## Pre-Flight

1. Use a maintenance window or at least a low-traffic window.
2. Confirm the release commit contains:
   - [src/lib/supabase/migrations/2026-04-18-production-hardening.sql](../../../src/lib/supabase/migrations/2026-04-18-production-hardening.sql)
   - [src/app/api/ugc/result/route.ts](../../../src/app/api/ugc/result/route.ts)
   - [src/app/api/ugc/share/route.ts](../../../src/app/api/ugc/share/route.ts)
   - [src/app/api/creator/universes/[id]/purchase/route.ts](../../../src/app/api/creator/universes/[id]/purchase/route.ts)
   - [src/lib/supabase/client.ts](../../../src/lib/supabase/client.ts)
3. Confirm production env already has the correct Supabase keys, especially `SUPABASE_SERVICE_ROLE_KEY`.
4. Prefer a non-pooled Postgres URL for migration and smoke checks.
5. If you need a quick schema gate before touching production, run:

```bash
POSTGRES_URL_NON_POOLING='postgres://...' pnpm db:schema-smoke
```

## Step 1. Apply Migration

Run the migration first, using the same commit that will be deployed immediately after.

```bash
psql "$POSTGRES_URL_NON_POOLING" \
  -v ON_ERROR_STOP=1 \
  -f src/lib/supabase/migrations/2026-04-18-production-hardening.sql
```

Why this happens first:

- the new code expects `identify_assessments`
- the new code expects `mysti_orders.device_id`
- the new code expects `mysti_subscriptions`

## Step 2. Run Schema Smoke Check

Do this immediately after the migration, before sending traffic to the new app build.

```bash
pnpm db:schema-smoke
```

If your database URL is not already exported:

```bash
POSTGRES_URL_NON_POOLING='postgres://...' pnpm db:schema-smoke
```

What this script validates:

- required tables exist
- required columns exist
- RLS is enabled where expected
- the new policies exist and old public-write policies are gone
- table grants are tightened as expected
- `increment_universe_tests` and `increment_universe_shares` exist, are `SECURITY DEFINER`, set `search_path=public`, and only allow `service_role` execute

Stop here if the smoke check fails.

## Step 3. Deploy Code Immediately After

Trigger the normal production deploy path for the same commit.

Important:

- after Step 1, the old UGC result and purchase code paths are no longer safe to leave running for long
- keep the gap between Step 1 and Step 3 as short as possible

If your platform supports it, keep maintenance mode or release gating on until Step 4 passes.

## Step 4. Regression Validation

Run the following checks after the deploy is live.

### 4.1 Database Contract

Run the smoke check one more time against production:

```bash
pnpm db:schema-smoke
```

### 4.2 UGC Result + Share Flow

Run the existing API flow check:

```bash
pnpm ugc:share-check
```

This confirms:

- result creation still writes to `creator_test_results`
- share flow still updates the row
- `increment_universe_tests` and `increment_universe_shares` still work under the new grants

### 4.3 Creator Purchase Flow

Manual API validation is enough if there is no dedicated script yet:

- call the creator purchase route on a published paid universe
- confirm a `creator_orders` row is created
- confirm no permission error is returned

### 4.4 Identify Flow

Validate these route families:

- save: [src/app/api/identify/save/route.ts](../../../src/app/api/identify/save/route.ts)
- history: [src/app/api/identify/me/history/route.ts](../../../src/app/api/identify/me/history/route.ts)
- claim: [src/app/api/identify/claim-received/route.ts](../../../src/app/api/identify/claim-received/route.ts)
- merge-existing: [src/app/api/cpti/merge-existing/route.ts](../../../src/app/api/cpti/merge-existing/route.ts)

Expected result: no missing-table, missing-column, or permission-denied errors.

### 4.5 Mysti Subscription Lookup

Validate:

- [src/app/api/mysti/subscription/route.ts](../../../src/app/api/mysti/subscription/route.ts)
- [src/lib/mysti/payment-store.ts](../../../src/lib/mysti/payment-store.ts)

Expected result: subscription lookup works through the service-role path and no direct-client access is required.

## Failure Handling

### Migration fails

- stop the rollout
- fix SQL first
- do not deploy code

### Migration passes, smoke check fails

- stop the rollout
- do not deploy code
- inspect the failing grant, policy, or RPC before retrying

### Migration passes, code deploy is delayed or fails

- keep maintenance mode on for affected flows
- treat this as a live incompatibility window, because old code may still rely on now-removed public writes
- either complete the deploy quickly or ship a hotfix before reopening traffic

## Minimal Command Sequence

```bash
psql "$POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f src/lib/supabase/migrations/2026-04-18-production-hardening.sql
pnpm db:schema-smoke
# trigger production deploy for the same commit here
pnpm db:schema-smoke
pnpm ugc:share-check
```