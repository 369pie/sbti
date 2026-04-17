#!/usr/bin/env node
// One-shot wiring of useShareTier hook into legacy share image generators.
// After running, run `pnpm exec tsc --noEmit` and review per-file edits.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src/components');

// [filename, universe slug, brand label, bg color (light bg or dark for variant=dark), variant]
const FILES = [
  ['BirdShareImageGenerator.tsx', 'bird', 'BIRD', '#FFF9F2', 'light'],
  ['ComboShareImageGenerator.tsx', 'combo', 'COMBO', '#FFF9F2', 'light'],
  ['CPShareImageGenerator.tsx', 'cp', 'CP', '#FFF9F2', 'light'],
  ['CptiRelationshipShareImageGenerator.tsx', 'cpti-relationship', 'CPTI', '#FFF9F2', 'light'],
  ['DailyShareImageGenerator.tsx', 'daily', 'DAILY', '#FFF9F2', 'light'],
  ['DeltaShareImageGenerator.tsx', 'delta', 'DELTA', '#FFF9F2', 'light'],
  ['FengShareImageGenerator.tsx', 'feng', 'FENG', '#050505', 'dark'],
  ['FlowerShareImageGenerator.tsx', 'flower', 'FLOWER', '#FFF9F2', 'light'],
  ['KingsShareImageGenerator.tsx', 'kings', 'KINGS', '#FFF9F2', 'light'],
  ['LoveShareImageGenerator.tsx', 'love', 'LOVE', '#FFF9F2', 'light'],
  ['MystiDailyShareImageGenerator.tsx', 'mysti-daily', 'MYSTI', '#0A0612', 'dark'],
  ['MystiGachaShareImageGenerator.tsx', 'mysti-gacha', 'MYSTI', '#0A0612', 'dark'],
  ['WtfCardShareImageGenerator.tsx', 'wtf-card', 'WTF', '#FFF9F2', 'light'],
  ['WorkShareImageGenerator.tsx', 'work', 'WORK', '#FFF9F2', 'light'],
];

let totalPatched = 0;
let totalSkipped = 0;

for (const [fname, universe, brand, bg, variant] of FILES) {
  const p = path.join(ROOT, fname);
  let src = fs.readFileSync(p, 'utf-8');

  if (src.includes('useShareTier')) {
    console.log(`SKIP (already wired): ${fname}`);
    totalSkipped += 1;
    continue;
  }

  let n;

  // 1. Insert import line after qr-code
  n = src;
  src = src.replace(
    "import { toQrDataUrl } from '@/lib/qr-code';",
    "import { toQrDataUrl } from '@/lib/qr-code';\nimport { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';",
  );
  if (src === n) console.warn(`  WARN ${fname}: no toQrDataUrl import`);

  // 2. Insert tierCtl declaration after saveHint useState
  n = src;
  src = src.replace(
    "    const [saveHint, setSaveHint] = useState<string | null>(null);",
    `    const [saveHint, setSaveHint] = useState<string | null>(null);\n    const tierCtl = useShareTier({ resourceId: '${universe}:share', universe: '${universe}' });`,
  );
  if (src === n) console.warn(`  WARN ${fname}: no saveHint useState`);

  // 3. Insert ensurePaid gate before setGenerating(true)
  n = src;
  src = src.replace(
    "      if (generating) return;\n      setGenerating(true);",
    "      if (generating) return;\n      if (await tierCtl.ensurePaid()) return;\n      setGenerating(true);",
  );
  if (src === n) console.warn(`  WARN ${fname}: no generating guard`);

  // 4. Wrap setPreviewUrl(dataUrl) with applyOverlay
  n = src;
  src = src.replace(
    "        setPreviewUrl(dataUrl);",
    `        const finalUrl = await tierCtl.applyOverlay(dataUrl, '${bg}', '${brand}');\n        setPreviewUrl(finalUrl);`,
  );
  if (src === n) console.warn(`  WARN ${fname}: no setPreviewUrl(dataUrl)`);

  // 5. Append fileSuffix into File constructor (return new File([blob], `…`, { type … }))
  src = src.replace(
    /return new File\(\[blob\], `([^`]*?)\.png`,/g,
    (_, base) => `return new File([blob], \`${base}\${tierCtl.fileSuffix}.png\`,`,
  );

  // 6. Append fileSuffix into link.download
  src = src.replace(
    /link\.download = `([^`]*?)\.png`;/g,
    (_, base) => `link.download = \`${base}\${tierCtl.fileSuffix}.png\`;`,
  );

  // 7. Insert ShareTierPicker before the first <button> after `return ( <div…>`
  n = src;
  src = src.replace(
    /(return \(\n\s*<div[^>]*>\n)(\s*<button)/,
    `$1        <ShareTierPicker\n          tier={tierCtl.tier}\n          setTier={tierCtl.setTier}\n          tierUnlocked={tierCtl.tierUnlocked}\n          variant="${variant}"\n          className="mb-3"\n        />\n$2`,
  );
  if (src === n) console.warn(`  WARN ${fname}: could not find <div><button anchor for picker`);

  fs.writeFileSync(p, src, 'utf-8');
  console.log(`PATCHED ${fname}`);
  totalPatched += 1;
}

console.log(`\nDone. Patched ${totalPatched}, skipped ${totalSkipped}.`);
