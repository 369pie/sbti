#!/usr/bin/env node
/**
 * Mobile Lighthouse runner for the 5 core WTFTI routes.
 *
 * Usage:
 *   node scripts/perf-lighthouse.mjs            # against http://localhost:3000
 *   PERF_BASE=https://staging.wtfti.com node scripts/perf-lighthouse.mjs
 *
 * Requires `lighthouse` + `chrome-launcher` to be available. They are
 * intentionally NOT in package.json deps; install ad-hoc when you need
 * to take a baseline:
 *   pnpm dlx lighthouse@12 --version
 *
 * Output: writes per-route JSON + a summary table to docs/01-strategy/_perf/
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs/01-strategy/_perf');

const BASE = process.env.PERF_BASE || 'http://localhost:3000';
const ROUTES = [
  ['home', '/'],
  ['result-ctrl', '/result/ctrl/'],
  ['banti-result', '/wtfti/work/result/juan/'],
  ['mysti-result', '/mysti/result/drama/'],
  ['xpti-result', '/xpti/result/elastic/'],
];

const LH_FLAGS = [
  '--quiet',
  '--chrome-flags=--headless=new --no-sandbox',
  '--preset=mobile',
  '--only-categories=performance',
  '--throttling-method=simulate',
  '--output=json',
];

async function run(label, route) {
  const url = `${BASE}${route}`;
  const out = join(OUT_DIR, `${label}.json`);
  console.log(`\n→ Lighthouse ${label} ${url}`);
  await new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['dlx', 'lighthouse@12', url, ...LH_FLAGS, '--output-path', out],
      { stdio: 'inherit', cwd: ROOT },
    );
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
  const json = JSON.parse(await import('node:fs').then((fs) => fs.promises.readFile(out, 'utf8')));
  return {
    label,
    route,
    perf: Math.round((json.categories.performance.score ?? 0) * 100),
    lcp: json.audits['largest-contentful-paint']?.numericValue,
    tbt: json.audits['total-blocking-time']?.numericValue,
    cls: json.audits['cumulative-layout-shift']?.numericValue,
    transferKb: Math.round((json.audits['total-byte-weight']?.numericValue ?? 0) / 1024),
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const rows = [];
  for (const [label, route] of ROUTES) {
    try {
      rows.push(await run(label, route));
    } catch (err) {
      console.error(`✗ ${label} failed:`, err.message);
      rows.push({ label, route, error: err.message });
    }
  }
  const md = [
    `# Lighthouse baseline · ${new Date().toISOString().slice(0, 10)}`,
    `Base URL: \`${BASE}\``,
    '',
    '| route | perf | LCP (ms) | TBT (ms) | CLS | bytes (KiB) |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map((r) =>
      r.error
        ? `| ${r.route} | ERR | — | — | — | — |`
        : `| ${r.route} | ${r.perf} | ${Math.round(r.lcp)} | ${Math.round(r.tbt)} | ${r.cls?.toFixed(3) ?? '—'} | ${r.transferKb} |`,
    ),
    '',
  ].join('\n');
  const summary = join(OUT_DIR, `summary-${new Date().toISOString().slice(0, 10)}.md`);
  await writeFile(summary, md);
  console.log(`\nWrote summary → ${summary}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
