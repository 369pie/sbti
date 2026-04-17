#!/usr/bin/env node
// Fix react-hooks dep arrays in the auto-wired share generators.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src/components');

const FILES = [
  'BirdShareImageGenerator.tsx',
  'ComboShareImageGenerator.tsx',
  'CPShareImageGenerator.tsx',
  'CptiRelationshipShareImageGenerator.tsx',
  'DailyShareImageGenerator.tsx',
  'DeltaShareImageGenerator.tsx',
  'FengShareImageGenerator.tsx',
  'FlowerShareImageGenerator.tsx',
  'KingsShareImageGenerator.tsx',
  'LoveShareImageGenerator.tsx',
  'MystiDailyShareImageGenerator.tsx',
  'MystiGachaShareImageGenerator.tsx',
  'WorkShareImageGenerator.tsx',
  'WtfCardShareImageGenerator.tsx',
];

for (const fname of FILES) {
  const p = path.join(ROOT, fname);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // For useCallback bodies that contain `tierCtl.ensurePaid` or `tierCtl.applyOverlay`,
  // ensure their dep array (the closing `}, [...]);` after the body) includes `tierCtl`.
  // Pattern: locate `tierCtl.ensurePaid` or `tierCtl.applyOverlay` then look forward
  // for `\n    }, [...);` and insert `, tierCtl` before `])` if not present.
  src = src.replace(
    /(tierCtl\.(ensurePaid|applyOverlay)\([\s\S]*?\n    \}, \[)([^\]]*?)(\]\);)/g,
    (_, head, _kind, deps, tail) => {
      if (deps.includes('tierCtl')) return head + deps + tail;
      const trimmed = deps.trimEnd();
      const sep = trimmed.length > 0 && !trimmed.endsWith(',') ? ', ' : '';
      return head + trimmed + sep + 'tierCtl' + tail;
    },
  );

  // For useCallback bodies that reference `tierCtl.fileSuffix` (in template strings),
  // ensure their dep array includes `tierCtl.fileSuffix`.
  src = src.replace(
    /(tierCtl\.fileSuffix[\s\S]*?\n    \}, \[)([^\]]*?)(\]\);)/g,
    (_, head, deps, tail) => {
      if (deps.includes('tierCtl.fileSuffix') || deps.includes('tierCtl,') || /\btierCtl\b\s*$/.test(deps)) {
        return head + deps + tail;
      }
      const trimmed = deps.trimEnd();
      const sep = trimmed.length > 0 && !trimmed.endsWith(',') ? ', ' : '';
      return head + trimmed + sep + 'tierCtl.fileSuffix' + tail;
    },
  );

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    console.log('FIXED', fname);
  } else {
    console.log('unchanged', fname);
  }
}
