import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const REQUIRED_ROLES = ['anon', 'authenticated', 'service_role'];

const REQUIRED_TABLES = [
  'creator_orders',
  'creator_test_results',
  'identify_assessments',
  'mysti_orders',
  'mysti_subscriptions',
];

const REQUIRED_COLUMNS = {
  identify_assessments: [
    'actor_user_id',
    'subject_user_id',
    'share_token',
    'actor_display_name',
    'subject_display_name',
    'persona_slug',
    'dimension_scores',
    'result_diagnostics',
    'client_mutation_id',
    'challenge_opened_at',
    'subject_claimed_at',
    'subject_viewed_at',
    'created_at',
    'updated_at',
  ],
  creator_orders: ['updated_at'],
  mysti_orders: ['device_id'],
  mysti_subscriptions: [
    'device_id',
    'sku',
    'starts_at',
    'expires_at',
    'status',
    'source_order_id',
    'created_at',
    'updated_at',
  ],
};

const REQUIRED_RLS_TABLES = [
  'creator_orders',
  'creator_test_results',
  'identify_assessments',
  'mysti_subscriptions',
];

const REQUIRED_POLICIES = [
  {
    table: 'identify_assessments',
    name: 'identify_assessments_select_involved',
    cmd: 'SELECT',
    roles: ['authenticated'],
  },
  {
    table: 'identify_assessments',
    name: 'identify_assessments_update_involved',
    cmd: 'UPDATE',
    roles: ['authenticated'],
  },
  {
    table: 'creator_test_results',
    name: 'results_service_insert',
    cmd: 'INSERT',
    roles: ['service_role'],
  },
  {
    table: 'creator_orders',
    name: 'orders_service_insert',
    cmd: 'INSERT',
    roles: ['service_role'],
  },
  {
    table: 'mysti_subscriptions',
    name: 'mysti_subscriptions_service_role_all',
    cmd: 'ALL',
    roles: ['service_role'],
  },
];

const FORBIDDEN_POLICIES = [
  { table: 'creator_test_results', name: 'results_insert' },
  { table: 'creator_orders', name: 'orders_insert' },
  { table: 'mysti_subscriptions', name: 'mysti_subscriptions_service_all' },
];

const TABLE_PRIVILEGE_CHECKS = [
  { object: 'public.identify_assessments', role: 'authenticated', privilege: 'SELECT', expected: true },
  { object: 'public.identify_assessments', role: 'authenticated', privilege: 'UPDATE', expected: true },
  { object: 'public.identify_assessments', role: 'authenticated', privilege: 'INSERT', expected: false },
  { object: 'public.identify_assessments', role: 'anon', privilege: 'SELECT', expected: false },
  { object: 'public.identify_assessments', role: 'anon', privilege: 'INSERT', expected: false },
  { object: 'public.identify_assessments', role: 'service_role', privilege: 'INSERT', expected: true },
  { object: 'public.identify_assessments', role: 'service_role', privilege: 'DELETE', expected: true },
  { object: 'public.creator_test_results', role: 'anon', privilege: 'INSERT', expected: false },
  { object: 'public.creator_test_results', role: 'authenticated', privilege: 'INSERT', expected: false },
  { object: 'public.creator_test_results', role: 'service_role', privilege: 'INSERT', expected: true },
  { object: 'public.creator_test_results', role: 'service_role', privilege: 'UPDATE', expected: true },
  { object: 'public.creator_orders', role: 'anon', privilege: 'INSERT', expected: false },
  { object: 'public.creator_orders', role: 'authenticated', privilege: 'INSERT', expected: false },
  { object: 'public.creator_orders', role: 'service_role', privilege: 'INSERT', expected: true },
  { object: 'public.creator_orders', role: 'service_role', privilege: 'UPDATE', expected: true },
  { object: 'public.mysti_subscriptions', role: 'anon', privilege: 'SELECT', expected: false },
  { object: 'public.mysti_subscriptions', role: 'authenticated', privilege: 'SELECT', expected: false },
  { object: 'public.mysti_subscriptions', role: 'service_role', privilege: 'SELECT', expected: true },
  { object: 'public.mysti_subscriptions', role: 'service_role', privilege: 'INSERT', expected: true },
  { object: 'public.mysti_subscriptions', role: 'service_role', privilege: 'UPDATE', expected: true },
];

const FUNCTION_SIGNATURES = [
  'public.increment_universe_tests(uuid)',
  'public.increment_universe_shares(uuid)',
];

const FUNCTION_EXECUTE_CHECKS = [
  { signature: 'public.increment_universe_tests(uuid)', role: 'anon', expected: false },
  { signature: 'public.increment_universe_tests(uuid)', role: 'authenticated', expected: false },
  { signature: 'public.increment_universe_tests(uuid)', role: 'service_role', expected: true },
  { signature: 'public.increment_universe_shares(uuid)', role: 'anon', expected: false },
  { signature: 'public.increment_universe_shares(uuid)', role: 'authenticated', expected: false },
  { signature: 'public.increment_universe_shares(uuid)', role: 'service_role', expected: true },
];

function parseArgs(argv) {
  const options = {
    databaseUrl: null,
    envFile: null,
    json: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--database-url') {
      options.databaseUrl = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--env-file') {
      options.envFile = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/check-supabase-schema.mjs [options]\n\nOptions:\n  --env-file <path>      Load POSTGRES_URL_NON_POOLING / POSTGRES_URL from a specific env file\n  --database-url <url>   Use an explicit database URL\n  --json                 Emit machine-readable JSON output\n  --help                 Show this help message`);
}

function parseEnvText(text) {
  const env = {};

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('export ')) {
      line = line.slice(7).trim();
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  return parseEnvText(fs.readFileSync(filePath, 'utf8'));
}

function formatPathForSource(filePath) {
  const relative = path.relative(repoRoot, filePath);
  return relative || path.basename(filePath);
}

function resolveDatabaseUrl(options) {
  if (options.databaseUrl) {
    return { value: options.databaseUrl, source: '--database-url' };
  }

  for (const key of ['DATABASE_URL', 'POSTGRES_URL_NON_POOLING', 'POSTGRES_URL']) {
    if (process.env[key]) {
      return { value: process.env[key], source: `process.env.${key}` };
    }
  }

  const envCandidates = [];
  if (options.envFile) {
    envCandidates.push(path.resolve(process.cwd(), options.envFile));
  }

  envCandidates.push(
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.env.production'),
    path.join(repoRoot, '.env.development'),
  );

  const seen = new Set();
  for (const candidate of envCandidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);

    const env = loadEnvFile(candidate);
    for (const key of ['POSTGRES_URL_NON_POOLING', 'POSTGRES_URL']) {
      if (env[key]) {
        return {
          value: env[key],
          source: `${formatPathForSource(candidate)}:${key}`,
        };
      }
    }
  }

  throw new Error(
    'Missing database URL. Set DATABASE_URL or POSTGRES_URL_NON_POOLING in the environment, or pass --env-file / --database-url.',
  );
}

function runPsql(databaseUrl, sql) {
  const result = spawnSync(
    'psql',
    ['--no-psqlrc', '-X', '-v', 'ON_ERROR_STOP=1', '-d', databaseUrl, '-tA', '-c', sql],
    { encoding: 'utf8' },
  );

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error('psql is not installed or not in PATH. Install the PostgreSQL CLI before running this smoke-check.');
    }
    throw result.error;
  }

  if (result.status !== 0) {
    const message = [result.stderr, result.stdout]
      .map((part) => part.trim())
      .filter(Boolean)
      .join('\n');
    throw new Error(message || 'psql query failed');
  }

  return result.stdout.trim();
}

function queryJson(databaseUrl, sql) {
  const output = runPsql(databaseUrl, sql);
  return output ? JSON.parse(output) : [];
}

function pushResult(results, options, pass, label, detail) {
  results.push({ pass, label, detail });
  if (!options.json) {
    const prefix = pass ? 'OK  ' : 'FAIL';
    const suffix = detail ? ` - ${detail}` : '';
    console.log(`${prefix} ${label}${suffix}`);
  }
}

function collectMetadata(databaseUrl) {
  const roles = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(json_agg(rolname ORDER BY rolname), '[]'::json)::text
      FROM pg_roles
      WHERE rolname = ANY (ARRAY['anon', 'authenticated', 'service_role']);
    `,
  );

  const tables = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(
        json_agg(table_name ORDER BY table_name),
        '[]'::json
      )::text
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY (ARRAY['creator_orders', 'creator_test_results', 'identify_assessments', 'mysti_orders', 'mysti_subscriptions']);
    `,
  );

  const columns = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(
        json_agg(
          json_build_object('table', table_name, 'column', column_name)
          ORDER BY table_name, column_name
        ),
        '[]'::json
      )::text
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'identify_assessments' AND column_name = ANY (ARRAY[
            'actor_user_id',
            'subject_user_id',
            'share_token',
            'actor_display_name',
            'subject_display_name',
            'persona_slug',
            'dimension_scores',
            'result_diagnostics',
            'client_mutation_id',
            'challenge_opened_at',
            'subject_claimed_at',
            'subject_viewed_at',
            'created_at',
            'updated_at'
          ]))
          OR (table_name = 'creator_orders' AND column_name = 'updated_at')
          OR (table_name = 'mysti_orders' AND column_name = 'device_id')
          OR (table_name = 'mysti_subscriptions' AND column_name = ANY (ARRAY[
            'device_id',
            'sku',
            'starts_at',
            'expires_at',
            'status',
            'source_order_id',
            'created_at',
            'updated_at'
          ]))
        );
    `,
  );

  const rls = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(
        json_agg(
          json_build_object('table', c.relname, 'enabled', c.relrowsecurity)
          ORDER BY c.relname
        ),
        '[]'::json
      )::text
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname = ANY (ARRAY['creator_orders', 'creator_test_results', 'identify_assessments', 'mysti_subscriptions']);
    `,
  );

  const policies = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'table', tablename,
            'name', policyname,
            'cmd', cmd,
            'roles', roles,
            'qual', qual,
            'with_check', with_check
          )
          ORDER BY tablename, policyname
        ),
        '[]'::json
      )::text
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = ANY (ARRAY['creator_orders', 'creator_test_results', 'identify_assessments', 'mysti_subscriptions']);
    `,
  );

  const tablePrivileges = queryJson(
    databaseUrl,
    `
      WITH checks(object_name, role_name, privilege) AS (
        VALUES
          ('public.identify_assessments', 'authenticated', 'SELECT'),
          ('public.identify_assessments', 'authenticated', 'UPDATE'),
          ('public.identify_assessments', 'authenticated', 'INSERT'),
          ('public.identify_assessments', 'anon', 'SELECT'),
          ('public.identify_assessments', 'anon', 'INSERT'),
          ('public.identify_assessments', 'service_role', 'INSERT'),
          ('public.identify_assessments', 'service_role', 'DELETE'),
          ('public.creator_test_results', 'anon', 'INSERT'),
          ('public.creator_test_results', 'authenticated', 'INSERT'),
          ('public.creator_test_results', 'service_role', 'INSERT'),
          ('public.creator_test_results', 'service_role', 'UPDATE'),
          ('public.creator_orders', 'anon', 'INSERT'),
          ('public.creator_orders', 'authenticated', 'INSERT'),
          ('public.creator_orders', 'service_role', 'INSERT'),
          ('public.creator_orders', 'service_role', 'UPDATE'),
          ('public.mysti_subscriptions', 'anon', 'SELECT'),
          ('public.mysti_subscriptions', 'authenticated', 'SELECT'),
          ('public.mysti_subscriptions', 'service_role', 'SELECT'),
          ('public.mysti_subscriptions', 'service_role', 'INSERT'),
          ('public.mysti_subscriptions', 'service_role', 'UPDATE')
      )
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'object', object_name,
            'role', role_name,
            'privilege', privilege,
            'role_exists', to_regrole(role_name) IS NOT NULL,
            'object_exists', to_regclass(object_name) IS NOT NULL,
            'granted', CASE
              WHEN to_regrole(role_name) IS NULL OR to_regclass(object_name) IS NULL THEN false
              ELSE has_table_privilege(role_name, object_name, privilege)
            END
          )
          ORDER BY object_name, role_name, privilege
        ),
        '[]'::json
      )::text
      FROM checks;
    `,
  );

  const functions = queryJson(
    databaseUrl,
    `
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'signature', format('public.%s(%s)', p.proname, oidvectortypes(p.proargtypes)),
            'security_definer', p.prosecdef,
            'config', COALESCE(p.proconfig, ARRAY[]::text[])
          )
          ORDER BY p.proname
        ),
        '[]'::json
      )::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = ANY (ARRAY['increment_universe_tests', 'increment_universe_shares'])
        AND oidvectortypes(p.proargtypes) = 'uuid';
    `,
  );

  const functionPrivileges = queryJson(
    databaseUrl,
    `
      WITH checks(signature, role_name) AS (
        VALUES
          ('public.increment_universe_tests(uuid)', 'anon'),
          ('public.increment_universe_tests(uuid)', 'authenticated'),
          ('public.increment_universe_tests(uuid)', 'service_role'),
          ('public.increment_universe_shares(uuid)', 'anon'),
          ('public.increment_universe_shares(uuid)', 'authenticated'),
          ('public.increment_universe_shares(uuid)', 'service_role')
      )
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'signature', signature,
            'role', role_name,
            'role_exists', to_regrole(role_name) IS NOT NULL,
            'function_exists', to_regprocedure(signature) IS NOT NULL,
            'granted', CASE
              WHEN to_regrole(role_name) IS NULL OR to_regprocedure(signature) IS NULL THEN false
              ELSE has_function_privilege(role_name, signature, 'EXECUTE')
            END
          )
          ORDER BY signature, role_name
        ),
        '[]'::json
      )::text
      FROM checks;
    `,
  );

  return { roles, tables, columns, rls, policies, tablePrivileges, functions, functionPrivileges };
}

function buildPolicyMap(policies) {
  const map = new Map();
  for (const policy of policies) {
    map.set(`${policy.table}:${policy.name}`, policy);
  }
  return map;
}

function buildSet(rows, keyFn) {
  return new Set(rows.map(keyFn));
}

function validate(metadata, options, databaseSource) {
  const results = [];

  if (!options.json) {
    console.log(`[schema-smoke] Database source: ${databaseSource}`);
  }

  const roleSet = new Set(metadata.roles);
  for (const role of REQUIRED_ROLES) {
    pushResult(results, options, roleSet.has(role), `role ${role} exists`, roleSet.has(role) ? '' : 'missing Supabase role');
  }

  const tableSet = new Set(metadata.tables);
  for (const table of REQUIRED_TABLES) {
    pushResult(results, options, tableSet.has(table), `table public.${table} exists`, tableSet.has(table) ? '' : 'table missing');
  }

  const columnSet = buildSet(metadata.columns, (row) => `${row.table}.${row.column}`);
  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    for (const column of columns) {
      const key = `${table}.${column}`;
      pushResult(results, options, columnSet.has(key), `column public.${key} exists`, columnSet.has(key) ? '' : 'column missing');
    }
  }

  const rlsMap = new Map(metadata.rls.map((row) => [row.table, row.enabled]));
  for (const table of REQUIRED_RLS_TABLES) {
    const enabled = rlsMap.get(table) === true;
    pushResult(results, options, enabled, `RLS enabled on public.${table}`, enabled ? '' : 'row level security disabled');
  }

  const policyMap = buildPolicyMap(metadata.policies);
  for (const expected of REQUIRED_POLICIES) {
    const actual = policyMap.get(`${expected.table}:${expected.name}`);
    const hasRoles = actual && expected.roles.every((role) => actual.roles.includes(role));
    const pass = !!actual && actual.cmd === expected.cmd && hasRoles;
    const detail = actual
      ? `cmd=${actual.cmd}, roles=${actual.roles.join(',')}`
      : 'policy missing';
    pushResult(results, options, pass, `policy ${expected.table}.${expected.name}`, detail);
  }

  for (const forbidden of FORBIDDEN_POLICIES) {
    const present = policyMap.has(`${forbidden.table}:${forbidden.name}`);
    pushResult(
      results,
      options,
      !present,
      `policy ${forbidden.table}.${forbidden.name} absent`,
      present ? 'legacy policy still present' : '',
    );
  }

  const tablePrivilegeMap = new Map(
    metadata.tablePrivileges.map((row) => [`${row.object}:${row.role}:${row.privilege}`, row]),
  );
  for (const check of TABLE_PRIVILEGE_CHECKS) {
    const row = tablePrivilegeMap.get(`${check.object}:${check.role}:${check.privilege}`);
    const pass = !!row && row.role_exists && row.object_exists && row.granted === check.expected;
    const detail = row
      ? `expected=${check.expected}, actual=${row.granted}`
      : 'privilege check missing';
    pushResult(results, options, pass, `${check.role} ${check.privilege} on ${check.object}`, detail);
  }

  const functionMap = new Map(metadata.functions.map((row) => [row.signature, row]));
  for (const signature of FUNCTION_SIGNATURES) {
    const row = functionMap.get(signature);
    const hasSearchPath = row?.config?.includes('search_path=public') ?? false;
    pushResult(results, options, !!row, `RPC ${signature} exists`, row ? '' : 'function missing');
    pushResult(
      results,
      options,
      row?.security_definer === true,
      `RPC ${signature} is SECURITY DEFINER`,
      row ? `security_definer=${row.security_definer}` : 'function missing',
    );
    pushResult(
      results,
      options,
      hasSearchPath,
      `RPC ${signature} sets search_path=public`,
      row ? `config=${(row.config ?? []).join(',')}` : 'function missing',
    );
  }

  const functionPrivilegeMap = new Map(
    metadata.functionPrivileges.map((row) => [`${row.signature}:${row.role}`, row]),
  );
  for (const check of FUNCTION_EXECUTE_CHECKS) {
    const row = functionPrivilegeMap.get(`${check.signature}:${check.role}`);
    const pass = !!row && row.role_exists && row.function_exists && row.granted === check.expected;
    const detail = row
      ? `expected=${check.expected}, actual=${row.granted}`
      : 'function privilege check missing';
    pushResult(results, options, pass, `${check.role} EXECUTE on ${check.signature}`, detail);
  }

  return results;
}

function renderSummary(results, options, databaseSource) {
  const failed = results.filter((result) => !result.pass).length;
  const passed = results.length - failed;
  const ok = failed === 0;

  if (options.json) {
    process.stdout.write(
      JSON.stringify(
        {
          ok,
          databaseSource,
          passed,
          failed,
          checks: results,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`[schema-smoke] Summary: ${passed} passed, ${failed} failed.`);
  }

  if (!ok) {
    process.exitCode = 1;
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const { value: databaseUrl, source: databaseSource } = resolveDatabaseUrl(options);
  const metadata = collectMetadata(databaseUrl);
  const results = validate(metadata, options, databaseSource);
  renderSummary(results, options, databaseSource);
}

try {
  main();
} catch (error) {
  console.error(`[schema-smoke] ${error.message}`);
  process.exitCode = 1;
}