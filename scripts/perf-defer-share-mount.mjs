#!/usr/bin/env node
/**
 * Codemod 2026-04-18: defer share-generator mount until first user intent.
 *
 * For each result/share page that:
 *   - imports a `*ShareImageGenerator` via `next/dynamic`
 *   - declares `const shareRef = useRef<*Handle>(null)`
 *   - calls `() => shareRef.current?.generate()` from a button onClick
 *   - renders `<*ShareImageGenerator ref={shareRef} ... />` somewhere
 *
 * Apply:
 *   - inject `import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate'`
 *   - inject `const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);`
 *     immediately after the `shareRef` declaration
 *   - replace `() => shareRef.current?.generate()` with `triggerShareGenerate`
 *   - wrap the JSX render `<XxxShareImageGenerator ref={shareRef} ... />` with
 *     `{shareMounted ? <XxxShareImageGenerator ref={shareRef} ... /> : null}`
 *
 * Idempotent: skips files that already import `useDeferredShareGenerate`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_ROOT = path.join(ROOT, 'src/app');

const HOOK_IMPORT = `import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';`;

function listTsxFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listTsxFiles(full));
    else if (ent.isFile() && ent.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function transform(src) {
  if (src.includes('useDeferredShareGenerate')) return null; // already migrated
  const refMatch = src.match(/const\s+shareRef\s*=\s*useRef<([A-Za-z0-9_]+)>\s*\(\s*null\s*\)\s*;/);
  if (!refMatch) return null;

  // Must have at least one `() => shareRef.current?.generate()` callsite.
  const arrowCallRe = /\(\s*\)\s*=>\s*shareRef\.current\?\.generate\s*\(\s*\)/g;
  if (!arrowCallRe.test(src)) return null;
  arrowCallRe.lastIndex = 0;

  let next = src;

  // 1) Insert hook usage right after shareRef declaration.
  const declSnippet = refMatch[0];
  const hookUsage =
    declSnippet +
    `\n  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);`;
  next = next.replace(declSnippet, hookUsage);

  // 2) Replace arrow callsite with the trigger fn.
  next = next.replace(arrowCallRe, `triggerShareGenerate`);

  // 3) Wrap any `<XxxShareImageGenerator ref={shareRef} ... />` self-closing tag.
  //    Uses a fault-tolerant regex that captures the full tag.
  const tagRe = /<([A-Z][A-Za-z0-9_]*ShareImage[A-Za-z0-9_]*)\s+ref=\{shareRef\}([^>]*?)\/>/g;
  next = next.replace(tagRe, (_match, comp, rest) => {
    const tag = `<${comp} ref={shareRef}${rest}/>`;
    return `{shareMounted ? ${tag} : null}`;
  });

  // 4) Add `onPointerEnter={ensureShareMounted}` to the share button so the
  //    chunk warms before the click. We look for an `onClick={triggerShareGenerate}`
  //    and prepend the pointer-enter handler if not already present.
  const btnRe = /onClick=\{triggerShareGenerate\}/g;
  next = next.replace(btnRe, (m) => {
    return `onPointerEnter={ensureShareMounted} ${m}`;
  });

  // 5) Inject the hook import. Place after the last import statement.
  const lastImportMatch = [...next.matchAll(/^import .*?;$/gm)].pop();
  if (lastImportMatch) {
    const idx = lastImportMatch.index + lastImportMatch[0].length;
    next = next.slice(0, idx) + `\n${HOOK_IMPORT}` + next.slice(idx);
  } else {
    next = `${HOOK_IMPORT}\n${next}`;
  }

  return next;
}

const files = listTsxFiles(APP_ROOT);
let touched = 0;
const skipped = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('shareRef')) continue;
  if (!/useRef<[A-Za-z0-9_]+>\(null\)/.test(src)) continue;
  const next = transform(src);
  if (!next || next === src) {
    if (src.includes('shareRef.current?.generate(')) skipped.push(file);
    continue;
  }
  fs.writeFileSync(file, next, 'utf8');
  touched += 1;
  console.log(`patched: ${path.relative(ROOT, file)}`);
}

console.log(`\n${touched} files patched.`);
if (skipped.length) {
  console.log(`\nSkipped (manual review needed):`);
  for (const f of skipped) console.log(`  ${path.relative(ROOT, f)}`);
}
