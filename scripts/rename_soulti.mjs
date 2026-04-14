import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1. Rename directories and files
const renames = [
  ['src/app/jueti', 'src/app/soulti'],
  ['src/lib/jueti', 'src/lib/soulti'],
  ['src/app/soulti/JuetiLandingContent.tsx', 'src/app/soulti/SoultiLandingContent.tsx'],
  ['src/app/soulti/JuetiLandingContent.tsx.bak', 'src/app/soulti/SoultiLandingContent.tsx.bak'],
  ['src/app/soulti/result/[type]/JuetiResultContent.tsx', 'src/app/soulti/result/[type]/SoultiResultContent.tsx'],
  ['src/components/JuetiShareImageGenerator.tsx', 'src/components/SoultiShareImageGenerator.tsx']
];

for (const [oldPath, newPath] of renames) {
  const fullOld = path.join(ROOT, oldPath);
  const fullNew = path.join(ROOT, newPath);
  if (fs.existsSync(fullOld)) {
    fs.renameSync(fullOld, fullNew);
    console.log(`Renamed ${oldPath} to ${newPath}`);
  }
}

// 2. Recursive text replace function
function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.next', 'out', '.git'].includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const orig = content;
      
      // Case-sensitive replacements
      content = content.replace(/觉 T I/g, 'SoulTI');
      content = content.replace(/觉TI/g, 'SoulTI');
      content = content.replace(/Jueti/g, 'Soulti');
      content = content.replace(/JUETI/g, 'SOULTI');
      content = content.replace(/jueti/g, 'soulti');

      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated content: ${path.relative(ROOT, fullPath)}`);
      }
    }
  }
}

processDir(path.join(ROOT, 'src'));
processDir(path.join(ROOT, 'docs'));
