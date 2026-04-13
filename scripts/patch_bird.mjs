import fs from 'fs';
import path from 'path';

const file = path.resolve('src/lib/bird/personalities.ts');
let content = fs.readFileSync(file, 'utf8');

const updates = {
  'boss': { code: 'BOSS', backronym: 'Busy Ordering Stupid Staff' },
  'nerd': { code: 'READ', backronym: 'Read Everything, Answer Delayed' },
  'ctrl': { code: 'CARE', backronym: 'Cannot Avoid Regulating Everyone' },
  'mum': { code: 'GIVE', backronym: 'Generously Ignored Victim Everyday' },
  'simp': { code: 'SHOW', backronym: 'Seeking High Observation Willingly' },
  'solo': { code: 'COLD', backronym: 'Cannot Openly Love Dummies' },
  'sleep': { code: 'IDLE', backronym: "I Don't Like Effort" },
  'game-r': { code: 'KEEP', backronym: 'Keeping Every Empty Package' },
  'drunk': { code: 'BLAH', backronym: 'Babbling Loudly About Half-truths' },
  'rebel': { code: 'NOPE', backronym: "Not Obeying People's Expectations" },
  'oh-no': { code: 'SWIM', backronym: 'Secretly Worrying In Mind' },
  'thin-k': { code: 'PLAY', backronym: 'Performing Loudly All Year' },
  'drama': { code: 'PAIN', backronym: 'Persistently Attacking Immovable Nodes' },
  'chill': { code: 'WAIT', backronym: "We'll Arrange It Tomorrow" },
  'emo': { code: 'DEEP', backronym: 'Daytime Exhaustion, Evening Panic' },
  'than-k': { code: 'NICE', backronym: 'Never Ignoring Crying Eyes' },
  'woc': { code: 'DARK', backronym: 'Detecting All Rumors Keenly' },
  'party': { code: 'WILD', backronym: 'Waking Idiots Loudly Daily' },
  'talk-er': { code: 'CHAT', backronym: "Can't Hide Any Thoughts" },
  'love-r': { code: 'LOVE', backronym: 'Losing Objectivity Very Easily' },
  'food-ie': { code: 'BITE', backronym: 'Belly Is Totally Empty' },
  'atm-er': { code: 'BUSY', backronym: 'Burning Up Stamina Yearly' },
  'dior-s': { code: 'STAR', backronym: 'Seeing True Aesthetics Regularly' },
  'sexy': { code: 'FIRE', backronym: 'Flirting Is Really Easy' },
  'fake': { code: 'FREE', backronym: 'Finding Resources Easily Everywhere' },
  'malo': { code: 'NUMB', backronym: 'Never Unlocking My Brain' },
  'luck-y': { code: 'LUCK', backronym: 'Living Under Certain Karma' },
  'joke-r': { code: 'JOKE', backronym: 'Just Overlooking Keen Emotions' },
  'shy': { code: 'HIDE', backronym: 'Hoping I Disappear Everyday' },
};

// Add backronym to interface
content = content.replace(/  code: string;\n/, "  code: string;\n  backronym: string;\n");

// Update each record
for (const [slug, data] of Object.entries(updates)) {
  const regex = new RegExp(`(slug: '${slug}',[\\s\\S]*?)code: '([^']+)',`);
  content = content.replace(regex, `$1code: '${data.code}',\n    backronym: '${data.backronym.replace(/'/g, "\\'")}',`);
}

fs.writeFileSync(file, content);
console.log('Done!');
