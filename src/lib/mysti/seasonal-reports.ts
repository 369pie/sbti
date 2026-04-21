/**
 * mysti · 节气年中报内容（W4-W5 / E6）
 *
 * 围绕 24 节气的"季节叙事 + 暮光仪式"内容卡片库。
 * v1（2026-04-21）只精写 4 个关键节气：
 *  - lixia   立夏（5月5日）—— 上半年中场
 *  - xiazhi  夏至（6月21日）—— 全年正午
 *  - liqiu   立秋（8月7日）—— 转折点
 *  - dongzhi 冬至（12月22日）—— 全年阴极阳生
 *
 * 其他 20 个节气走 fallback（通用模板 + 自动切换基色）。
 *
 * 页面入口：`/mysti/seasonal/`（依据当前日期自动展示当下节气）。
 *
 * 与品牌词汇统一：Editorial Atelier × 暮光博物笔记
 */

import { getSeasonInfo, type SeasonId } from '@/lib/museum/season';

export interface SeasonalReportSection {
  /** 章节罗马数字 */
  numeral: 'I' | 'II' | 'III' | 'IV' | 'V';
  /** 英文 eyebrow */
  eyebrow: string;
  /** 中文小标题 */
  title: string;
  /** 主体段落（2-4 行，<200 字） */
  body: string;
}

export interface SeasonalReport {
  id: SeasonId;
  /** 中文节气名（与 museum/season.ts 一致） */
  label: string;
  /** 一行节气宜忌 */
  signLine: string;
  /** 顶部封面引文（Le Guin/Carson 调性原创） */
  epigraph: string;
  epigraphAttr?: string;
  /** 节气主色（叠加在 twilight 之上） */
  accentHex: string;
  /** 5 章节正文 */
  sections: SeasonalReportSection[];
  /** 底部仪式建议（3 条 micro-action） */
  rituals: string[];
}

// ─────────────────────────────────────────────
// 精写节气库
// ─────────────────────────────────────────────

const LIXIA: SeasonalReport = {
  id: 'lixia',
  label: '立夏',
  signLine: '宜出门见光 · 忌再次复盘',
  epigraph: '你已经熬过了所有"还没准备好"的日子。',
  epigraphAttr: '— 暮光的中场提醒',
  accentHex: '#C9A676',
  sections: [
    {
      numeral: 'I',
      eyebrow: 'OF MID-YEAR',
      title: '上半年的总结写在身体里',
      body: '立夏不是开始，也不是结束，是一次身体的称重。把这五个月你说过的"再等等"摞在一起，看看它们今天还剩多少质量。轻的就让它走；重的，留下来跟着你过夏天。',
    },
    {
      numeral: 'II',
      eyebrow: 'OF LIGHT',
      title: '允许自己在更亮的光里被看见',
      body: '春天教你"等待"，立夏教你"出场"。这一个月，把那条压箱底的裙子拿出来，把口红的颜色调亮一档，把推迟的合影补上。不是为了别人看见你，是让你重新看见你自己。',
    },
    {
      numeral: 'III',
      eyebrow: 'OF RELATIONS',
      title: '关系的中场清算',
      body: '今年遇见的人，有的应该被升格，有的应该被礼貌地降格。立夏适合做这件事——温度上升时，做减法不那么残忍。把"消耗大于回应"的关系，先静音三周看看。',
    },
    {
      numeral: 'IV',
      eyebrow: 'OF AMBITION',
      title: '把一个 H1 的小目标重新写成动词',
      body: '不要再说"我想成为一个 X"。改成"我每周做 Y 三次"。立夏的暮光偏向那些把名词换成动词的人。今天就把一件你年初写下的"我想"翻译成下周的具体动作。',
    },
    {
      numeral: 'V',
      eyebrow: 'OF SELF',
      title: '一封写给立夏的自己的信',
      body: '今晚找十分钟，给"立夏的自己"写三行字：(1) 谢谢你扛过的事；(2) 我准许你现在放下的事；(3) 我想在夏至之前看见你做到的事。把信存起来，夏至那天回头读一遍。',
    },
  ],
  rituals: [
    '今晚 21:00 前出一次门，哪怕只是绕楼下散十分钟。',
    '把通讯录里联系频率明显失衡的一个人，今天先静音三周。',
    '在备忘录新建一条「立夏 → 夏至」清单，只允许写 3 件事。',
  ],
};

const XIAZHI: SeasonalReport = {
  id: 'xiazhi',
  label: '夏至',
  signLine: '宜直视光 · 忌讨好',
  epigraph: '今天的太阳是全年最长的一句话，听完就好。',
  accentHex: '#D4B58A',
  sections: [
    {
      numeral: 'I',
      eyebrow: 'OF NOON',
      title: '全年的正午',
      body: '夏至不是夏天的开始，是太阳到达你今年所能给到的最高点。从今晚起，白天会一寸一寸变短。这不是坏消息——它意味着你今年最热烈的部分已经被支付完了，剩下的可以慢慢花。',
    },
    {
      numeral: 'II',
      eyebrow: 'OF EXCESS',
      title: '允许自己在最高点拒绝一件事',
      body: '夏至的暮光偏向那些"在巅峰说不"的人。如果手里有一件你最近被推着做的事，今天是说"我不接"的好时机。理由不必充分，时令本身就是理由。',
    },
    {
      numeral: 'III',
      eyebrow: 'OF BODY',
      title: '身体进入了一个被低估的状态',
      body: '夏至之后，身体的代谢、情绪的波幅、皮肤的耐光度都会进入一个新的曲线。把上半年的运动节奏减半，把睡眠提前半小时，把咖啡换成第一口冷茶。',
    },
    {
      numeral: 'IV',
      eyebrow: 'OF DESIRE',
      title: '把一个未说出口的愿望写下来',
      body: '夏至适合写愿望，但不是因为它会"应验"。是因为今夜的天光最长，足够让一个被你压抑很久的句子有空间慢慢成形。写下来，折好，放进一本不会被翻动的书里。',
    },
    {
      numeral: 'V',
      eyebrow: 'OF GRATITUDE',
      title: '今天给三个人发一句话',
      body: '不解释、不寒暄，只一句："今天是夏至，想到你。" 这是一种古老的礼物——你在全年最长的一天，把对方排进了你的视线。',
    },
  ],
  rituals: [
    '今晚 19:00 前看一次正南方向的天空，看够 30 秒。',
    '把今年最想说"不"的那件事，今天 18:00 前发出去。',
    '给三个人发"今天是夏至，想到你"，不解释。',
  ],
};

const LIQIU: SeasonalReport = {
  id: 'liqiu',
  label: '立秋',
  signLine: '宜先收一收 · 忌新立 flag',
  epigraph: '风换了一种走法，你也允许自己换一种姿态。',
  accentHex: '#A85A6E',
  sections: [
    {
      numeral: 'I',
      eyebrow: 'OF TURNING',
      title: '从外向收回内',
      body: '立秋不是夏天的尾巴，是身体开始把热量收回来的第一天。这个月不必再追新目标，把上半年发散出去的东西——精力、人际、注意力——慢慢收回来一寸。',
    },
    {
      numeral: 'II',
      eyebrow: 'OF HARVEST',
      title: '今年到目前为止的"收成"',
      body: '盘点一下：这一年到现在，你真正完成的事有哪几件？不必很大，三件足矣。把它们写在便签上，贴在你早上必经之处。秋天靠这三件事过冬。',
    },
    {
      numeral: 'III',
      eyebrow: 'OF GRIEF',
      title: '允许某种小小的告别',
      body: '立秋的暮光偏向"放下"。这一年里有没有一段感情、一份工作、一个版本的自己，到此为止比硬撑更体面？今天可以写一封不寄出的告别信，仅供你看。',
    },
    {
      numeral: 'IV',
      eyebrow: 'OF SKIN',
      title: '换一套基础护肤',
      body: '皮肤是身体最诚实的日历。立秋之后开始用更滋润的乳液、更厚的面霜、更慢的洁面。不是变老，是开始把自己当作一件需要保养的物件——这本身就是一种成熟。',
    },
    {
      numeral: 'V',
      eyebrow: 'OF QUIET',
      title: '把今晚的灯调暗一格',
      body: '立秋适合在更暗的灯光下读半小时书。任何一本，纸质优先。让眼睛先于身体进入秋天，剩下的会跟着调整。',
    },
  ],
  rituals: [
    '今晚把家里至少一盏灯换成 2700K 暖光。',
    '在便签上写下今年到目前为止真正完成的 3 件事，贴在早上必经处。',
    '把夏天的衣服收三件起来，给秋衣腾出位置。',
  ],
};

const DONGZHI: SeasonalReport = {
  id: 'dongzhi',
  label: '冬至',
  signLine: '宜静坐 · 宜围炉',
  epigraph: '黑暗到达谷底，光开始悄悄折返。',
  accentHex: '#9C7CFF',
  sections: [
    {
      numeral: 'I',
      eyebrow: 'OF SOLSTICE',
      title: '全年最长的一夜',
      body: '冬至不是结束，是一种古老的换班。今晚之后，白天每天会多一分钟。这一分钟不会立刻被你感觉到，但它已经发生。你不必现在就庆祝，先承认它在发生就够了。',
    },
    {
      numeral: 'II',
      eyebrow: 'OF GATHERING',
      title: '把一桌人围在一起',
      body: '今晚是适合围炉的夜。哪怕只有自己一个人，也煮一锅热的东西。喝下第一口的瞬间，身体会替你回顾整个一年。听就好，不必回答。',
    },
    {
      numeral: 'III',
      eyebrow: 'OF DEBT',
      title: '原谅一个未完成的小目标',
      body: '今年没做到的事，今晚把它从清单上划掉。不是放弃，是承认时令。冬至的暮光偏向那些"敢于结账"的人——把今年的小账合起来，明年再开一本。',
    },
    {
      numeral: 'IV',
      eyebrow: 'OF MEMORY',
      title: '挑出今年的三张照片',
      body: '不用按"最美"或"最重要"挑。按"今天回看心里有微微暖流"的标准挑。打印出来，明早夹在你常翻的书里。这是给来年的自己留的一道暗门。',
    },
    {
      numeral: 'V',
      eyebrow: 'OF WISH',
      title: '只许一个愿，不必告诉任何人',
      body: '冬至适合许愿，但不要发朋友圈。把愿望写在一张白纸上，对着灯举三秒，再折起来。明年同一天再打开。许过的愿不必复述，宇宙在听。',
    },
  ],
  rituals: [
    '今晚煮一锅热的东西（汤、粥、酒酿圆子皆可）。',
    '从今年照片里挑 3 张"看了心里有暖流"的，明早打印。',
    '在白纸上写下一个愿望，举到灯前 3 秒，折起放进抽屉。',
  ],
};

const FALLBACK_TEMPLATE = (id: SeasonId, label: string, signLine: string): SeasonalReport => ({
  id,
  label,
  signLine,
  epigraph: `${label}的暮光，是为还没说完的话留的位置。`,
  accentHex: '#C07A8E',
  sections: [
    {
      numeral: 'I',
      eyebrow: 'OF SEASON',
      title: `${label}是一个被低估的中场`,
      body: '不是每一个节气都需要一句"宜什么"。有时候，承认"我此刻不知道该做什么"也是一种节气仪式。今天可以什么都不决定，把这一天还给身体。',
    },
    {
      numeral: 'II',
      eyebrow: 'OF BODY',
      title: '身体是最准的日历',
      body: '比起手机日历，身体更早知道节气换了。今天留意三件事：第一口水的温度、午后的瞌睡、入睡前的姿势——它们已经替你换季了。',
    },
    {
      numeral: 'III',
      eyebrow: 'OF QUIET',
      title: '允许一段安静',
      body: `${label}适合做一件不发朋友圈的小事。读一本短诗、煮一杯茶、给一个人发一条不需要回的消息。今天的暮光偏向不被看见的温柔。`,
    },
    {
      numeral: 'IV',
      eyebrow: 'OF NEXT',
      title: '为下一节气留一个位置',
      body: '不要把今天填满。下一节气在两周后，那时你会需要今天的余量。把今晚的某个 30 分钟空出来，让它什么都不做地等下一段时间。',
    },
    {
      numeral: 'V',
      eyebrow: 'OF SELF',
      title: '在备忘录里记一句',
      body: `今晚在备忘录里记一句话："${label}时，我感觉到 ___。" 不必让任何人看见。这是给来年同一节气的自己的一封短信。`,
    },
  ],
  rituals: [
    '今天做一件不发朋友圈的小事。',
    '在备忘录里写下：「' + label + '时，我感觉到 ___」。',
    '今晚把日历翻到下一节气，先不安排任何事。',
  ],
});

const PRECRAFTED: Partial<Record<SeasonId, SeasonalReport>> = {
  lixia: LIXIA,
  xiazhi: XIAZHI,
  liqiu: LIQIU,
  dongzhi: DONGZHI,
};

/** 当前时间下的节气报告 */
export function getCurrentSeasonalReport(now: Date = new Date()): SeasonalReport {
  const info = getSeasonInfo(now);
  if (PRECRAFTED[info.season]) return PRECRAFTED[info.season]!;
  return FALLBACK_TEMPLATE(info.season, info.seasonLabel, info.signLine);
}

/** 给定 id 拿（用于路由 / SEO；目前仅页面内部用） */
export function getSeasonalReport(id: SeasonId, label = '', sign = ''): SeasonalReport {
  if (PRECRAFTED[id]) return PRECRAFTED[id]!;
  return FALLBACK_TEMPLATE(id, label, sign);
}

export const PRECRAFTED_SEASONS = Object.keys(PRECRAFTED) as SeasonId[];
