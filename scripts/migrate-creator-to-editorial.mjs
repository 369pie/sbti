#!/usr/bin/env node
/**
 * Migrate creator/* dark-mode UI to L1 Editorial Atelier tokens.
 * Per docs/01-strategy/visual-unification-and-tiered-share-cards-2026-04-18.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Files to migrate (exclude admin/ops — already L1 with own slate/amber pattern)
const FILES = [
  'src/app/creator/earnings/page.tsx',
  'src/app/creator/profile/[id]/page.tsx',
  'src/app/creator/profile/[id]/ProfileShareButton.tsx',
  'src/app/creator/leaderboard/LeaderboardContent.tsx',
  'src/app/creator/studio/page.tsx',
  'src/app/creator/studio/[id]/page.tsx',
  'src/app/creator/studio/[id]/stats/page.tsx',
  'src/app/creator/studio/[id]/QuestionsEditor.tsx',
  'src/app/creator/studio/[id]/ComplianceGate.tsx',
  'src/app/creator/studio/[id]/PersonalitiesEditor.tsx',
  'src/app/creator/studio/[id]/UniverseSettings.tsx',
  'src/app/creator/studio/[id]/AxesEditor.tsx',
];

// Order matters: longest/most-specific first.
// Use literal strings (not regex) to avoid bracket-escape issues.
const REPLACEMENTS = [
  // page-root dark
  ['bg-[#0a0a0a]', 'bg-bg-primary'],

  // text-white opacity scale (high → low so longer keys match first)
  ['text-white/[0.04]', 'text-text-muted'],
  ['text-white/[0.06]', 'text-text-muted'],
  ['text-white/[0.08]', 'text-text-muted'],
  ['text-white/95', 'text-text-primary'],
  ['text-white/90', 'text-text-primary'],
  ['text-white/85', 'text-text-primary'],
  ['text-white/80', 'text-text-secondary'],
  ['text-white/75', 'text-text-secondary'],
  ['text-white/70', 'text-text-secondary'],
  ['text-white/65', 'text-text-secondary'],
  ['text-white/60', 'text-text-secondary'],
  ['text-white/55', 'text-text-secondary'],
  ['text-white/50', 'text-text-secondary'],
  ['text-white/45', 'text-text-secondary'],
  ['text-white/40', 'text-text-muted'],
  ['text-white/35', 'text-text-muted'],
  ['text-white/30', 'text-text-muted'],
  ['text-white/25', 'text-text-muted'],
  ['text-white/20', 'text-text-muted'],

  // hover:text-white/X
  ['hover:text-white/95', 'hover:text-text-primary'],
  ['hover:text-white/90', 'hover:text-text-primary'],
  ['hover:text-white/80', 'hover:text-text-secondary'],
  ['hover:text-white/70', 'hover:text-text-secondary'],
  ['hover:text-white/60', 'hover:text-text-secondary'],
  ['hover:text-white/50', 'hover:text-text-secondary'],

  // bg-white opacity scale
  ['bg-white/[0.03]', 'bg-bg-secondary/60'],
  ['bg-white/[0.04]', 'bg-bg-secondary/60'],
  ['bg-white/[0.06]', 'bg-bg-secondary'],
  ['bg-white/[0.08]', 'bg-bg-tertiary'],
  ['bg-white/15', 'bg-bg-tertiary'],
  ['bg-white/12', 'bg-bg-tertiary'],
  ['bg-white/10', 'bg-bg-tertiary'],
  ['bg-white/8', 'bg-bg-secondary'],
  ['bg-white/5', 'bg-bg-secondary'],
  ['hover:bg-white/90', 'hover:bg-text-primary/85'],
  ['hover:bg-white/40', 'hover:bg-bg-tertiary'],
  ['hover:bg-white/20', 'hover:bg-bg-tertiary'],
  ['hover:bg-white/15', 'hover:bg-bg-tertiary'],
  ['hover:bg-white/10', 'hover:bg-bg-tertiary'],
  ['hover:bg-white/[0.06]', 'hover:bg-bg-secondary'],
  ['hover:bg-white/5', 'hover:bg-bg-secondary'],
  ['group-hover:bg-white/40', 'group-hover:bg-text-primary/40'],
  // Solid white CTA → ink button (high-contrast on cream)
  ['bg-white text-black', 'bg-text-primary text-bg-primary'],
  ['bg-white/90', 'bg-bg-elevated'],
  ['bg-white/70', 'bg-bg-elevated/80'],
  ['bg-white/40', 'bg-bg-tertiary'],
  ['bg-white/20', 'bg-bg-tertiary'],

  // border-white opacity scale
  ['border-white/[0.06]', 'border-border-subtle'],
  ['border-white/[0.08]', 'border-border-subtle'],
  ['border-white/30', 'border-border'],
  ['border-white/20', 'border-border'],
  ['border-white/15', 'border-border'],
  ['border-white/12', 'border-border-subtle'],
  ['border-white/10', 'border-border-subtle'],
  ['border-white/8', 'border-border-subtle'],
  ['border-white/5', 'border-border-subtle'],
  ['hover:border-white/30', 'hover:border-border'],
  ['hover:border-white/20', 'hover:border-border'],
  ['hover:border-white/15', 'hover:border-border'],

  // ring-white
  ['ring-white/10', 'ring-border-subtle'],
  ['ring-white/15', 'ring-border'],
  ['ring-white/20', 'ring-border'],

  // bg-black opacity scale (acts like darker neutral)
  ['bg-black/10', 'bg-bg-secondary/50'],
  ['bg-black/20', 'bg-bg-tertiary'],
  ['bg-black/30', 'bg-bg-tertiary'],
  ['bg-black/40', 'bg-bg-tertiary/80'],
  ['bg-black/60', 'bg-text-primary/80'],

  // status colors (400 → 600 for legibility on cream)
  ['text-green-400', 'text-green-600'],
  ['text-yellow-400', 'text-amber-600'],
  ['text-red-400', 'text-red-600'],
  ['text-blue-400', 'text-blue-600'],
  ['text-orange-400', 'text-orange-600'],
  ['text-amber-400', 'text-amber-600'],
  ['text-purple-400', 'text-purple-600'],
  ['text-rose-400', 'text-rose-600'],
  ['text-pink-400', 'text-pink-600'],
  ['text-emerald-400', 'text-emerald-600'],
  ['text-green-300', 'text-green-700'],
  ['text-amber-300', 'text-amber-700'],

  // colored chip backgrounds (over-bright on cream)
  ['bg-green-600/20', 'bg-green-600/12'],
  ['bg-green-600/30', 'bg-green-600/18'],
  ['hover:bg-green-600/30', 'hover:bg-green-600/18'],
  ['bg-green-500/20', 'bg-green-500/12'],
  ['bg-green-500/10', 'bg-green-500/10'],
  ['bg-amber-500/20', 'bg-amber-500/12'],
  ['bg-amber-500/10', 'bg-amber-500/10'],
  ['bg-red-500/20', 'bg-red-500/12'],
  ['bg-blue-500/20', 'bg-blue-500/12'],
  ['bg-purple-500/20', 'bg-purple-500/12'],

  // standalone `text-white` (root containers and headings) — keep last so opacity variants are processed first
  // We do this by safe boundary: only in attribute substring with space delimiter
];

// Standalone `text-white` (no `/`): replace with text-text-primary, but ONLY when in className context.
// Safe heuristic: replace `text-white"` / `text-white ` / `text-white\n` (i.e. no trailing slash digit/[).
// Use a regex with a negative lookahead.
function replaceStandaloneTextWhite(src) {
  return src.replace(/text-white(?![\w/[\]-])/g, 'text-text-primary');
}

let total = 0;
const summary = [];
for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    summary.push(`SKIP (missing): ${rel}`);
    continue;
  }
  const before = fs.readFileSync(abs, 'utf8');
  let out = before;
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (out.includes(from)) {
      const occ = out.split(from).length - 1;
      out = out.split(from).join(to);
      count += occ;
    }
  }
  const stage = out;
  out = replaceStandaloneTextWhite(out);
  count += stage.split(out).length - 1; // approx
  if (out !== before) {
    fs.writeFileSync(abs, out);
    summary.push(`✓ ${rel}: ${count} replacements`);
    total += count;
  } else {
    summary.push(`· ${rel}: no change`);
  }
}

console.log(summary.join('\n'));
console.log(`\nTotal: ${total} replacements across ${FILES.length} files.`);
