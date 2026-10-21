import { listSoulLetterSlugs, getSoulLetter } from '@/lib/mysti/soul-letters';
import { writeFileSync } from 'node:fs';
const out: Record<string, { title: string; open: string; shadowHead: string }> = {};
for (const s of listSoulLetterSlugs()) { const l = getSoulLetter(s)!; out[s] = { title: l.title, open: l.open, shadowHead: l.shadow.slice(0, 60) }; }
writeFileSync('src/lib/mysti/soul-letter-teasers.ts', `/**\n * Public teasers for Mysti soul letters (title + opening + first 60 chars of shadow).\n * GENERATED from src/lib/mysti/soul-letters — the full letters are server-only (/api/deep/mysti-letter).\n */\nexport const SOUL_LETTER_TEASERS: Record<string, { title: string; open: string; shadowHead: string }> = ${JSON.stringify(out, null, 2)};\n\nexport function getSoulLetterTeaser(slug: string) {\n  return SOUL_LETTER_TEASERS[slug] ?? null;\n}\n`);
console.log(Object.keys(out).length);
