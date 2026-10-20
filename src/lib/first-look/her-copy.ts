/**
 * 首测 · emotional-value copy (audit 2026-10-20 Phase 1).
 * Tone: 闺蜜说话 — no 灵魂 / 宇宙 / 神域. One line she wants to screenshot,
 * what she quietly carries, and what she deserves.
 */

export interface HerCopy {
  /** The screenshot line — "被说中了" */
  seen: string;
  /** 你的闪光点 */
  strengths: [string, string, string];
  /** 你默默在扛的 */
  carrying: string;
  /** 你值得 */
  deserve: string;
}

export const HER_COPY: Record<string, HerCopy> = {
  'moon-messenger': {
    seen: '你总是最后一个开口，却是大家最想听的那个。',
    strengths: ['看得清人心', '温柔但有分寸', '让人安心'],
    carrying: '你照顾所有人的情绪，却很少有人问你今天累不累。',
    deserve: '一个不用你先懂他，就会先懂你的人。',
  },
  'salt-witch': {
    seen: '你嘴上不饶人，可从来没在背后说过谁。',
    strengths: ['一眼看穿套路', '说真话的勇气', '护短'],
    carrying: '你习惯当那个“清醒的人”，所以连哭都要挑没人的时候。',
    deserve: '被人好好哄一次，不用你自己讲道理。',
  },
  'midnight-storyteller': {
    seen: '你在睡前把白天重讲一遍，才能真的放下它。',
    strengths: ['感受力满格', '会写会说', '记得每个小细节'],
    carrying: '你把很多话写在备忘录里，没有发出去。',
    deserve: '一个愿意听你把话说完、不急着给建议的人。',
  },
  'volcano-girl': {
    seen: '你不是情绪化，你是情绪丰沛，这是两回事。',
    strengths: ['真诚不装', '爱憎分明', '行动力超强'],
    carrying: '每次爆发完，你都会偷偷反省自己是不是太过了。',
    deserve: '接得住你的热烈，也接得住你的眼泪的关系。',
  },
  'tarot-translator': {
    seen: '你总能先一步感觉到“哪里不对劲”，而且往往是对的。',
    strengths: ['直觉很准', '想象力丰富', '懂得留白'],
    carrying: '你常被说“想太多”，于是把预感都咽了回去。',
    deserve: '相信你直觉的人，而不是让你怀疑自己的人。',
  },
  'stubborn-softie': {
    seen: '你说的“没事”，其实是“你快来哄我”。',
    strengths: ['刀子嘴豆腐心', '超级重感情', '靠得住'],
    carrying: '你怕给别人添麻烦，于是把委屈都说成了“还好”。',
    deserve: '一个能听懂你嘴硬背后那句话的人。',
  },
  'mist-traveler': {
    seen: '你不是没方向，是你拒绝把方向交给错的人。',
    strengths: ['温柔有主见', '不随大流', '慢慢来但很稳'],
    carrying: '身边人都在催你快点决定，你只是想再确认一下自己的心。',
    deserve: '按自己的节奏走，不被催、不被比较。',
  },
  'sigil-collector': {
    seen: '别人觉得你“玄”，其实你只是比谁都认真地对待自己。',
    strengths: ['好奇心旺盛', '钻研到底', '有自己的小世界'],
    carrying: '你的爱好常被当成“怪”，你也就懒得再解释。',
    deserve: '一个愿意走进你小世界、还觉得很有意思的人。',
  },
  'wildfire-lecturer': {
    seen: '你骂人的时候，其实是在替不敢说话的人出头。',
    strengths: ['正义感爆棚', '逻辑清楚', '敢站出来'],
    carrying: '你替别人冲在前面，回头才发现自己也受了伤。',
    deserve: '也有人愿意站在你前面，替你挡一次。',
  },
};

export function getHerCopy(slug: string): HerCopy {
  return (
    HER_COPY[slug] ?? {
      seen: '你比自己以为的更好。',
      strengths: ['真诚', '敏感', '有趣'],
      carrying: '你总在照顾别人的感受。',
      deserve: '被好好对待。',
    }
  );
}
