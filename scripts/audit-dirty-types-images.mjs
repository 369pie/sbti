#!/usr/bin/env node
/**
 * Dirty image auditor for /types gallery.
 *
 * The gallery displays pre-generated webp thumbnails under
 * `public/images/types/**\/thumbs/*.webp`. This script scans *only those*
 * and flags files that are likely text-overlay / result-screen composites
 * rather than clean low-poly character art.
 *
 * Heuristics (not OCR):
 *   1. Path contains a known composite-card marker (`/cards/`, `/relationships/`,
 *      `-card.webp`)
 *   2. Thumbnail size > 120 KB — clean low-poly character thumbs are 20-90 KB;
 *      composites with UI chrome + text are usually >120 KB
 *
 * Output: docs/01-strategy/_audit/dirty-images-YYYY-MM-DD.{json,md}
 *
 * Run:  node scripts/audit-dirty-types-images.mjs
 */
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('../public/images/types/', import.meta.url).pathname;
const OUT_DIR = new URL('../docs/01-strategy/_audit/', import.meta.url).pathname;
const REPORT_DATE = new Date().toISOString().slice(0, 10);

const COMPOSITE_MARKERS = [
  /\/cards\//,
  /\/relationships\//,
  /-card\.webp$/,
];

const THUMB_PATH_RE = /(^|\/)thumbs\//;
const SUSPECT_EXT = new Set(['.webp']);
const THUMB_SIZE_THRESHOLD = 120 * 1024; // 120 KB

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && SUSPECT_EXT.has(extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

function classify(rel, sizeBytes) {
  const reasons = [];
  for (const re of COMPOSITE_MARKERS) {
    if (re.test(rel)) {
      reasons.push(`matches composite marker ${re}`);
      break;
    }
  }
  if (sizeBytes > THUMB_SIZE_THRESHOLD) {
    reasons.push(`thumb > 120 KB (${(sizeBytes / 1024).toFixed(0)} KB)`);
  }
  return reasons;
}

async function main() {
  const all = [];
  for await (const file of walk(ROOT)) {
    const rel = relative(ROOT, file);
    if (!THUMB_PATH_RE.test(rel)) continue; // only audit thumbnails shown in gallery
    const s = await stat(file);
    const reasons = classify(rel, s.size);
    if (reasons.length > 0) {
      all.push({ path: `public/images/types/${rel}`, sizeKB: Math.round(s.size / 1024), reasons });
    }
  }

  all.sort((a, b) => b.sizeKB - a.sizeKB);

  await mkdir(OUT_DIR, { recursive: true });
  const jsonPath = join(OUT_DIR, `dirty-images-${REPORT_DATE}.json`);
  await writeFile(jsonPath, JSON.stringify({ generatedAt: REPORT_DATE, total: all.length, items: all }, null, 2));

  const lines = [];
  lines.push(`# Dirty Image Audit \u2014 ${REPORT_DATE}`);
  lines.push('');
  lines.push(`**${all.length}** thumbnails flagged for content-side review.`);
  lines.push('');
  lines.push('Heuristics (not OCR):');
  lines.push('1. Path contains a composite-card marker (`/cards/`, `/relationships/`, `-card.webp`)');
  lines.push('2. Thumbnail size > 120 KB (clean character thumbs typically 20-90 KB)');
  lines.push('');
  lines.push('**Action for content team**: open each flagged thumb; if it contains rendered Chinese title text, UI chrome, or screenshot of a result page, regenerate a clean character-only thumb and replace.');
  lines.push('');
  lines.push('| Path | Size (KB) | Why flagged |');
  lines.push('|---|---:|---|');
  for (const item of all) {
    lines.push(`| \`${item.path}\` | ${item.sizeKB} | ${item.reasons.join('; ')} |`);
  }

  const mdPath = join(OUT_DIR, `dirty-images-${REPORT_DATE}.md`);
  await writeFile(mdPath, lines.join('\n'));

  console.log(`✓ Audit complete: ${all.length} flagged files`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
