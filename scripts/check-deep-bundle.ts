import { DIALOGUE_SCRIPTS } from '@/lib/xpti/dialogue-scripts';
import { LANDMINE_POOL_V2, getPracticesForStage } from '@/lib/cpti/deep-pools';
import { getSoulLetter, listSoulLetterSlugs } from '@/lib/mysti/soul-letters';
import { getCrossReadingsForCode, getRepairForCode, getSoulLetterForCode } from '@/lib/soulti/deep-report';
import { getSoultiPersonalityBySlug, getAllSoultiSlugs } from '@/lib/soulti/personalities';
import { execSync } from 'node:child_process';
const samples: Record<string, string[]> = { xpti_dialogue: [], xpti_pool: ['把脑内剧本当成 ta 已经知道的事', '默契极高，但容易陷入彼此的盲点'], cpti: [], mysti_letter: [], soulti: [] };
DIALOGUE_SCRIPTS.slice(0, 5).forEach((d) => samples.xpti_dialogue.push(d.turns[0].line.slice(0, 18)));
LANDMINE_POOL_V2.slice(0, 5).forEach((l) => samples.cpti.push(l.slice(0, 18)));
getPracticesForStage('married').slice(0, 3).forEach((l) => samples.cpti.push(l.slice(0, 18)));
listSoulLetterSlugs().slice(0, 4).forEach((s) => samples.mysti_letter.push(getSoulLetter(s)!.neuro.slice(0, 18)));
getAllSoultiSlugs().slice(0, 4).forEach((s) => { const c = getSoultiPersonalityBySlug(s)!.code; const cr = getCrossReadingsForCode(c)[0]; if (cr) samples.soulti.push(cr.interpretation.slice(20, 38)); const sl = getSoulLetterForCode(c); if (sl) samples.soulti.push(sl.body[0].slice(0, 18)); const r = getRepairForCode(c); if (r) samples.soulti.push(r.metaphor.slice(0, 18)); });
const dir = process.argv[2];
for (const [k, arr] of Object.entries(samples)) for (const t of arr) {
  const esc = JSON.stringify(t).slice(1, -1);
  let hit = '';
  for (const needle of [t, esc]) { try { hit = execSync(`grep -rlF -- ${JSON.stringify(needle)} ${dir} | head -3`).toString().trim(); } catch { hit = hit || ''; } if (hit) break; }
  console.log(hit ? 'LEAK' : 'ok  ', k, t.slice(0, 12), hit.replace(/\n/g, ' '));
}
