#!/usr/bin/env node
/**
 * One-shot codemod: convert static `import { XxxShareImageGenerator }` lines
 * in result-page client components into `next/dynamic` calls so the heavy
 * canvas / html-to-image / qrcode bundles get code-split out of the first
 * load JS for each result route.
 *
 * Idempotent: skips files already migrated.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FILES = execSync(
  `grep -rln "import { [A-Za-z]*ShareImageGenerator } from '@/components/[A-Za-z]*ShareImageGenerator'" src/app src/components --include="*.tsx"`,
  { encoding: 'utf8' },
)
  .split('\n')
  .filter(Boolean);

const IMPORT_RE =
  /^import \{ ([A-Za-z]+ShareImageGenerator) \} from '(@\/components\/[A-Za-z]+ShareImageGenerator)';\s*$/m;
const NEXT_DYNAMIC_RE = /from 'next\/dynamic'/;

let touched = 0;
for (const file of FILES) {
  const src = readFileSync(file, 'utf8');
  const match = IMPORT_RE.exec(src);
  if (!match) continue;
  const [line, name, mod] = match;
  let next = src;

  // Ensure `import dynamic from 'next/dynamic';` exists.
  if (!NEXT_DYNAMIC_RE.test(next)) {
    // Insert after the first import statement.
    next = next.replace(
      /^(import [^\n]+\n)/,
      `$1import dynamic from 'next/dynamic';\n`,
    );
  }

  const replacement = `const ${name} = dynamic(\n  () => import('${mod}').then((m) => m.${name}),\n  { ssr: false },\n);`;
  next = next.replace(line, replacement);

  if (next !== src) {
    writeFileSync(file, next);
    console.log(`✓ ${file}`);
    touched += 1;
  }
}
console.log(`\nMigrated ${touched} file(s).`);
