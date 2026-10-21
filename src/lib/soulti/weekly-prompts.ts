/** SoulTI weekly mirror prompts (free, shown outside the paywall). Split from deep-report.ts so paid copy is not bundled. */

// ────────────────────────────────────────────────────────────
//  4. Weekly Mirror Data · 每周镜像回看
// ────────────────────────────────────────────────────────────

export interface WeeklyMirrorPrompt {
  /** Week number (1-52, cycles) */
  week: number;
  /** Brief reflection prompt */
  prompt: string;
  /** Related axis */
  axis: string;
}

/** 12 weekly prompts (one quarter, then cycle) */
export const WEEKLY_MIRROR_PROMPTS: WeeklyMirrorPrompt[] = [
  { week: 1,  axis: 'J3', prompt: '这周有没有一个你说了"好"但其实想说"不"的时刻？' },
  { week: 2,  axis: 'J4', prompt: '你这周的能量，更像持续燃烧的壁炉，还是偶尔闪烁的烟花？' },
  { week: 3,  axis: 'J1', prompt: '这周你充电的方式是靠人群还是靠独处？和你以为的一样吗？' },
  { week: 4,  axis: 'J5', prompt: '最近有什么让你受伤的事吗？你是在伤口上长出了新东西，还是变硬了一点？' },
  { week: 5,  axis: 'J2', prompt: '这周有没有一个"计划外"的事情让你开心了——还是让你焦虑了？' },
  { week: 6,  axis: 'J3', prompt: '这周你照顾了谁？有人照顾你吗？' },
  { week: 7,  axis: 'J4', prompt: '你这周对什么事投入了超出预期的能量？值得吗？' },
  { week: 8,  axis: 'J1', prompt: '如果这周只能做一件让自己开心的事，你做了吗？' },
  { week: 9,  axis: 'J5', prompt: '想一想上个月你受的伤。它现在是长出了什么，还是硬成了什么？' },
  { week: 10, axis: 'J2', prompt: '你的生活里，最近有增加"确定感"还是"不确定感"？你现在更需要哪一种？' },
  { week: 11, axis: 'J3', prompt: '这周有没有人越过了你的边界？你是怎么处理的？下次呢？' },
  { week: 12, axis: 'J4', prompt: '如果给你这周的内在能量打个分（1-10），你给几分？比上周高还是低？' },
];

/** Get the mirror prompt for the current week */
export function getCurrentWeeklyPrompt(): WeeklyMirrorPrompt {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const idx = (weekNum - 1) % WEEKLY_MIRROR_PROMPTS.length;
  return WEEKLY_MIRROR_PROMPTS[idx];
}

// ────────────────────────────────────────────────────────────
//  4b. Per-personality weekly prompt (paid-tier personalization)
// ────────────────────────────────────────────────────────────

/**
 * Per-personality weekly prompt pools.
 * Indexed by axis letter that maps to a SoulTI dimension.
 * Each axis has 8 prompts; combined with weekNumber for variety.
 *
 * Axis letters use the SoulTI 5-axis model:
 *   I/E (J1 内向/外向), N/S (J2 直觉/感官), F/T (J3 情感/思考),
 *   J/P (J4 计划/弹性), O/D (J5 开放/防御)
 */
const PERSONALITY_PROMPT_BANK: Record<string, string[]> = {
  // J1 · 充电方式
  I: [
    '这周你独处时最爱去的地方/姿势是什么？它给你补了什么？',
    '有没有一个本来想自己消化的情绪，最后被你硬塞给别人了？',
    '如果连续 48h 不见任何人，你这周会比现在更舒展吗？',
    '你这周哪一刻最像"被插上电"了？是因为人，还是因为没有人？',
    '上一次你拒绝了一个邀约——是真的累，还是开始累？',
    '你给自己留的"独处保护期"，被谁/什么打破了？',
    '在最吵的那一天，你心里有没有一句话没说出口？',
    '如果今晚你的电量只有 20%，你会优先充给谁？',
  ],
  E: [
    '这周哪一次见人，让你比见之前更亮了？',
    '你有没有强撑着出门，结果回来更累了？',
    '人群里你的位置——是中心、边缘、还是漂浮？变了吗？',
    '哪一段对话让你觉得"对，我就是要被这样听见"？',
    '这周你主动给谁充电了？对方知道吗？',
    '什么时候你最想被一群人围住，最想被一个人单独听？',
    '社交里有没有一个角色你已经演腻了？',
    '如果取消所有社交，留 1 个，你留谁？',
  ],
  // J2 · 感知频道
  N: [
    '这周你脑子里出现过几个"如果……会怎样"的画面？哪个最久？',
    '你最近被哪个还没发生的事拽走过？',
    '如果你的直觉是一只动物，这周它在做什么？',
    '哪一个细节，别人都没在意，你却记到现在？',
    '你这周有没有过"这事会成"或"这事不对"的预感？后来呢？',
    '你想去的下一个地方/状态，是什么样的画面？',
    '当现实和你脑内剧本错位时，这周你修了哪个？',
    '你最近被哪个长远的可能性偷偷照亮过？',
  ],
  S: [
    '这周你身体最舒服的一刻是什么？为什么？',
    '你吃过、摸过、闻过最让你回神的东西是什么？',
    '你的环境（光、温度、声音）有没有在悄悄影响你心情？',
    '你这周做完后立刻有"完成感"的事是哪件？',
    '什么是你这周给身体留的礼物？什么是欠的债？',
    '你重复做了哪件让你舒服的小动作？',
    '当大脑乱时，是哪件具体的事把你拽回了当下？',
    '你最近最相信的"眼见为实"是什么？',
  ],
  // J3 · 边界与共情
  F: [
    '这周你为谁的情绪让出了一次自己的位置？值吗？',
    '有没有一次你说"没事"，其实有事？',
    '你这周心里替谁哭过，但没让对方知道？',
    '什么人/事让你心里那条柔软的线被踩到了？',
    '你照顾别人的时候，谁照顾了你？',
    '哪一次共情让你觉得是滋养，哪一次像是失血？',
    '你最近最想说的一句"对不起"是给谁的？包括自己。',
    '如果只能保护一个人的感受，是你自己还是 ta？',
  ],
  T: [
    '这周哪个决定，你用脑子赢了，但心里有点疼？',
    '你最近对谁做了"客观但冷"的判断？事后回看公平吗？',
    '在情绪和事实之间，你这周倾向了哪边？',
    '有没有一句你想说但忍住的真话？为什么忍？',
    '什么事让你觉得"对就是对"，哪怕代价不小？',
    '你这周给自己列了几条规则？破了几条？',
    '哪一刻你希望自己更心软一点？',
    '当别人激动时，你的"冷静"是工具，还是盔甲？',
  ],
  // J4 · 节奏
  J: [
    '这周你对哪件事的"不确定"，咬着牙忍下来了？',
    '哪个原本的计划被打乱后，结果反而更好？',
    '你这周写下又划掉了多少个 to-do？哪条最该划掉？',
    '你给自己留了多少"什么都不安排"的时间？',
    '哪一次你松手后，事情自己长出了形状？',
    '你的下一周已经被排满了吗？谁排的？',
    '有没有一件事，你"拖延"其实是直觉在拒绝？',
    '什么时候"完成"比"完美"更重要？这周做到了吗？',
  ],
  P: [
    '这周哪件计划外的事让你最快乐？最焦虑？',
    '你有没有强迫自己做了一件本可以再等等的事？',
    '哪一刻你希望生活有个时刻表？哪一刻又庆幸没有？',
    '你这周开了几个新坑？关了几个？',
    '弹性是你的力量，但什么时候它变成了逃避？',
    '当所有人都在赶进度，你的节奏在哪一格？',
    '哪个"再说吧"已经说了三周了？',
    '这周最让你回到当下的，是即兴还是结构？',
  ],
  // J5 · 开放/防御
  O: [
    '这周你让谁/什么进了你以为不会再开放的门？',
    '哪一句别人说的话，你本能想反驳，但留下来咀嚼了？',
    '你最近最大的"我可能错了"瞬间是什么？',
    '什么样的脆弱，你这周愿意说出来？什么还藏着？',
    '你身边有没有人帮你打开了一个一直不敢看的角落？',
    '有没有一份善意你本能拒绝了，事后后悔？',
    '你最近相信的一件事，跟一年前的你不一样了吗？',
    '当被冒犯时，你这周更想"守"还是更想"听"？',
  ],
  D: [
    '这周你筑了哪堵新墙？为谁/为什么？',
    '什么样的话，你听到第一秒就想关上门？',
    '你最近最警惕的是什么？这种警惕保护了谁？',
    '有没有一次你硬撑没流泪，是怕失去什么？',
    '你这周为自己挡掉了哪个本不该承受的事？',
    '"防御"和"自爱"对你而言，差别在哪？',
    '什么时候你想要的不是建议，而是站在你这边？',
    '你最近最大的"不"是对谁说的？说完之后呢？',
  ],
};

/** Map a SoulTI 5-letter code (e.g. 'I_F_O') to its dominant axis letter. */
function pickDominantAxisLetter(code: string): string {
  // SoulTI codes are 5 chars, one per axis. Use first non-underscore letter found,
  // but bias toward the rare/strong end if multiple letters present. For now: take
  // the first letter — keeps it deterministic and bound to the personality identity.
  for (const ch of code) {
    if (ch !== '_' && /[A-Z]/.test(ch) && PERSONALITY_PROMPT_BANK[ch]) {
      return ch;
    }
  }
  return 'F'; // fallback
}

/**
 * Per-personality weekly mirror prompt.
 * Personalizes by:
 *   - picking an axis letter from the personality's code
 *   - rotating within that axis's pool by ISO week number
 *   - injecting the personality's name into a contextual sentence
 *
 * This makes the paid weekly prompt feel "written for this code", not global.
 */
export function getWeeklyPromptForPersonality(input: {
  code: string;
  name: string;
  slug?: string;
}): WeeklyMirrorPrompt {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );

  const axisLetter = pickDominantAxisLetter(input.code);
  const pool = PERSONALITY_PROMPT_BANK[axisLetter] ?? PERSONALITY_PROMPT_BANK.F;
  // Bias rotation by personality slug so two codes sharing the same dominant axis
  // still see different prompts on the same week.
  const slugSeed = (input.slug ?? input.code)
    .split('')
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
  const idx = (weekNum + slugSeed) % pool.length;

  return {
    week: weekNum,
    axis: `${input.code} · ${axisLetter} 轴`,
    prompt: pool[idx],
  };
}
