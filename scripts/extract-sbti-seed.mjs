#!/usr/bin/env node
/**
 * 把 src/lib/questions.ts (90 道经典 SBTI 题) 提取成 audit 用的 JSON 种子。
 *
 * 写出 docs/01-strategy/_audit/sbti-source-questions.json
 *
 * 注意：questions.ts 是站内"原 SBTI 标准入口"题库本身，
 * 拿它当 ground truth 不是抄外部题库，而是用作"内部一致性"的反向锚点：
 * 任何**非标准入口**的宇宙若与之高度重合，说明 clean-room 重写还没做。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC = path.join(ROOT, 'src/lib/questions.ts');
const OUT_DIR = path.join(ROOT, 'docs/01-strategy/_audit');
const OUT = path.join(OUT_DIR, 'sbti-source-questions.json');

const src = await readFile(SRC, 'utf8');

// 解析 { id: N, text: '...', dimension: 'XX' }
const items = [];
const re = /\bid:\s*(\d+)\s*,\s*text:\s*(['"`])((?:\\.|(?!\2).)*)\2\s*,\s*dimension:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = re.exec(src))) {
  const text = m[3].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
  items.push({ id: `S-${m[1]}`, text, dimension: m[4], source: 'src/lib/questions.ts' });
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, JSON.stringify(items, null, 2), 'utf8');
console.log(`[extract] 写入 ${path.relative(ROOT, OUT)} (${items.length} 题)`);
