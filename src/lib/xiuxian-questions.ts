/**
 * 修仙版答题皮肤 — 题库完全重写
 *
 * 设计原则：
 * 1. 不是原版题目的「换皮翻译」，而是用修仙世界观重新设计测试场景
 * 2. 每题仍对应原维度的测试角度，value 分值完全一致
 * 3. 风格：玩梗 + 搞怪 + 自嘲，贴近读修仙小说的年轻女性
 * 4. 修仙设定参考凡人修仙传 & 仙逆，但不要求读过原著也能看懂
 */

import type { AnswerOption } from './questions';

export interface XiuxianQuestionSkin {
  id: number;
  text: string;
  options?: AnswerOption[];
}

/** 修仙版默认选项 — 没有自定义选项时回退使用 */
export const XIUXIAN_DEFAULT_OPTIONS: AnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '说不好', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

/**
 * 修仙版题面映射表
 * key = 原题 id，value = 修仙版 text + options
 */
export const XIUXIAN_QUESTION_SKINS: Record<number, XiuxianQuestionSkin> = {
  // ══════════════════════════════════════
  //  心境 · Self
  // ══════════════════════════════════════

  // S1 · 自尊自信
  1: {
    id: 1,
    text: '同期入门的师兄妹都结金丹了，你还在炼气期给灵田除草。',
    options: [
      { value: 3, label: '破大防了，我果然是废灵根。', key: 'A' },
      { value: 2, label: '虽然有点酸，但我的路又不跟他们比。', key: 'B' },
      { value: 1, label: '急什么，韩立当年灵根还是伪的呢。', key: 'C' },
    ],
  },
  2: {
    id: 2,
    text: '坊市里有人当面说「就你这灵根，还修什么仙啊」——',
    options: [
      { value: 1, label: '回去之后道心碎了一地，灵力都不稳了。', key: 'A' },
      { value: 2, label: '看谁说的吧，杂鱼的话不值一颗灵石。', key: 'B' },
      { value: 3, label: '哦，说完了？我去炼丹了。', key: 'C' },
    ],
  },

  // S2 · 自我清晰度
  3: {
    id: 3,
    text: '你真的了解自己是修什么道的吗？剑道、符道、炼丹、还是摸鱼道？',
    options: [
      { value: 1, label: '我连自己几品灵根都没搞清楚。', key: 'A' },
      { value: 2, label: '大概知道方向，但总感觉还在迷雾里。', key: 'B' },
      { value: 3, label: '我的道就是我，门儿清。', key: 'C' },
    ],
  },
  4: {
    id: 4,
    text: '有人问「你觉得你自己是只什么样的灵兽」——',
    options: [
      { value: 1, label: '闭关想了七天也没想明白。', key: 'A' },
      { value: 2, label: '能说几句，但感觉怎么说都不太对。', key: 'B' },
      { value: 3, label: '这还不简单？我能写一篇本命灵兽自传。', key: 'C' },
    ],
  },

  // S3 · 核心价值
  5: {
    id: 5,
    text: '你心里有一条非走不可的大道吗？哪怕雷劫劈九次也要走那种？',
    options: [
      { value: 1, label: '摆烂修仙，活着就不错了。', key: 'A' },
      { value: 2, label: '有个模糊的方向，但没到玩命的程度。', key: 'B' },
      { value: 3, label: '有，这条道就是我的命。', key: 'C' },
    ],
  },
  6: {
    id: 6,
    text: '宗门月考又要卷了，别人往死里修炼，你——',
    options: [
      { value: 1, label: '卷不动了，在灵田里种点灵草就是我的极限。', key: 'A' },
      { value: 2, label: '偶尔卷一下，偶尔摆一下。', key: 'B' },
      { value: 3, label: '不突破不舒服，我就是天生的修炼狂。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  情劫 · Emotion
  // ══════════════════════════════════════

  // E1 · 依恋安全感
  7: {
    id: 7,
    text: '你的道侣五个时辰没回传音符，ta 说在渡小天劫——',
    options: [
      { value: 1, label: '渡劫用得了五个时辰？怕不是跟别的狐狸修士煲电话粥。', key: 'A' },
      { value: 2, label: '掐指算了一卦，信了一半。', key: 'B' },
      { value: 3, label: '渡劫确实不方便，等 ta 出来我送碗灵粥。', key: 'C' },
    ],
  },
  8: {
    id: 8,
    text: '你其实经常怕道侣哪天突然单方面解除灵契。',
    options: [
      { value: 3, label: 'ta 每次晚回消息我都在脑补解契画面。', key: 'A' },
      { value: 2, label: '偶尔想一下，不至于老想。', key: 'B' },
      { value: 1, label: '完全不会，我们灵契稳得很。', key: 'C' },
    ],
  },

  // E2 · 情感投入度
  9: {
    id: 9,
    text: '每一段灵契我都是认真的，对天道发誓！',
    options: [
      { value: 1, label: '天道：信你个鬼。', key: 'A' },
      { value: 2, label: '大概率？应该吧？', key: 'B' },
      { value: 3, label: '问心无愧！道心可鉴！', key: 'C' },
    ],
  },
  10: {
    id: 10,
    text: '遇到一个各方面都极好的灵兽——温柔、灵根佳、长得还好看——你会？',
    options: [
      { value: 1, label: '再好跟我也没关系，渣仙不会上头。', key: 'A' },
      { value: 2, label: '会心动两秒，但不会失去理智。', key: 'B' },
      { value: 3, label: '完蛋，要栽了，这不赶紧缔灵契？', key: 'C' },
    ],
  },

  // E3 · 边界感
  11: {
    id: 11,
    text: '道侣恨不得十二个时辰跟你贴一起修炼，你什么反应？',
    options: [
      { value: 1, label: '好耶，我也贴回去，双修效率翻倍。', key: 'A' },
      { value: 2, label: '随便吧，无所谓。', key: 'B' },
      { value: 3, label: '救命，我洞府的门在哪，让我关上。', key: 'C' },
    ],
  },
  12: {
    id: 12,
    text: '不管跟谁结灵契，你都需要属于自己的洞府和独处时间。',
    options: [
      { value: 1, label: '独处？我更想跟 ta 共享一个储物袋。', key: 'A' },
      { value: 2, label: '看情况吧。', key: 'B' },
      { value: 3, label: '必须的！我的洞府结界密码只有我知道。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  道心 · Attitude
  // ══════════════════════════════════════

  // A1 · 世界观
  13: {
    id: 13,
    text: '修仙界里大部分修士其实都是好人？',
    options: [
      { value: 1, label: '笑死，修仙界比宫斗剧还黑暗。', key: 'A' },
      { value: 2, label: '好人坏人五五开吧。', key: 'B' },
      { value: 3, label: '我觉得善良的修士还是多数。', key: 'C' },
    ],
  },
  14: {
    id: 14,
    text: '你在野外秘境捡到一枚来路不明的储物袋，没有禁制——',
    options: [
      { value: 1, label: '绝对有诈，不碰不碰，天上不会掉灵石。', key: 'A' },
      { value: 2, label: '先用灵识扫一遍再说。', key: 'B' },
      { value: 3, label: '发财了！一个亿！先打开！', key: 'C' },
    ],
  },

  // A2 · 规则 vs 灵活
  15: {
    id: 15,
    text: '明天就是宗门大比了，宗规要求今晚必须闭关，但闺蜜约你去灵泉泡澡——',
    options: [
      { value: 3, label: '去！宗门大比年年有，灵泉打折今天才有！', key: 'A' },
      { value: 2, label: '跟师尊请个假，两边都兼顾。', key: 'B' },
      { value: 1, label: '都大比了还泡什么澡，我去闭关了。', key: 'C' },
    ],
  },
  16: {
    id: 16,
    text: '你给自己定了修炼计划，接下来通常会——',
    options: [
      { value: 1, label: '计划是什么？能吃吗？', key: 'A' },
      { value: 2, label: '能执行一半算不错了。', key: 'B' },
      { value: 3, label: '我喜欢按表修炼，被打断会炸毛。', key: 'C' },
    ],
  },

  // A3 · 意义感
  17: {
    id: 17,
    text: '某天顿悟：修仙有啥意义？不过是被灵气驱动的仓鼠罢了。',
    options: [
      { value: 3, label: '说得对，你悟到了修仙界的本质。', key: 'A' },
      { value: 2, label: '好像有点道理，又好像不全对。', key: 'B' },
      { value: 1, label: '胡说！修仙精彩着呢！', key: 'C' },
    ],
  },
  18: {
    id: 18,
    text: '你觉得活着总得有个想要到达的境界或者想见的风景。',
    options: [
      { value: 1, label: '每天活着不被雷劈已经够累了。', key: 'A' },
      { value: 2, label: '有目标更好，没有也能晃。', key: 'B' },
      { value: 3, label: '当然！一辈子没有追求跟咸鱼灵兽有啥区别！', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  行功 · Action
  // ══════════════════════════════════════

  // Ac1 · 动机
  19: {
    id: 19,
    text: '你修炼是为了变强，还是单纯怕被天劫劈死？',
    options: [
      { value: 1, label: '不被劈死就是胜利，苟住苟住。', key: 'A' },
      { value: 2, label: '有时想变强，有时只想苟。', key: 'B' },
      { value: 3, label: '我要大乘飞升！苟着有什么意思？', key: 'C' },
    ],
  },
  20: {
    id: 20,
    text: '隔壁洞府的灵兽突破了新境界，漫天异象——你的反应？',
    options: [
      { value: 1, label: '关我什么事，拉上窗帘继续睡。', key: 'A' },
      { value: 2, label: '又酸又羡慕。', key: 'B' },
      { value: 3, label: '直接打了鸡血开始修炼，我也要突破！', key: 'C' },
    ],
  },

  // Ac2 · 决策风格
  21: {
    id: 21,
    text: '面前有三条秘境通道，选错就死——你怎么选？',
    options: [
      { value: 1, label: '纠结到通道塌了，直接原路返回。', key: 'A' },
      { value: 2, label: '小事纠结，大事冲，这种……这算大事吧？', key: 'B' },
      { value: 3, label: '跟着直觉走，犹豫就会败北！', key: 'C' },
    ],
  },
  22: {
    id: 22,
    text: '这道题没有题目，请凭灵觉盲选。',
    options: [
      { value: 1, label: '反复推演之后，我觉得选甲。', key: 'A' },
      { value: 2, label: '呃……选乙？', key: 'B' },
      { value: 3, label: '不会就选丙！闭眼冲！', key: 'C' },
    ],
  },

  // Ac3 · 执行
  23: {
    id: 23,
    text: '宗门任务贴了七天还没人接，你是那种会直接揭了去做的灵兽吗？',
    options: [
      { value: 1, label: '被扣灵石扣到最后一天我才会去……', key: 'A' },
      { value: 2, label: '看任务难度，简单的顺手接了。', key: 'B' },
      { value: 3, label: '当然，事情不做完我不舒服。', key: 'C' },
    ],
  },
  24: {
    id: 24,
    text: '你炼丹炸炉了，丹炉裂了个大口子，满屋烟——',
    options: [
      { value: 1, label: '坐在那发呆，等烟自己散。', key: 'A' },
      { value: 2, label: '一边骂一边扇：「破炉子！」', key: 'B' },
      { value: 3, label: '立刻掏出备用炉，重新来。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  缘法 · Social
  // ══════════════════════════════════════

  // So1 · 社交主动性
  25: {
    id: 25,
    text: '师兄带了个你不认识的修士来聚会——',
    options: [
      { value: 1, label: '对陌生人自动开启防御阵法，微笑点头就算社交了。', key: 'A' },
      { value: 2, label: '看气场，能聊就聊，不能就摸鱼。', key: 'B' },
      { value: 3, label: '师兄的朋友就是我朋友！过来坐！', key: 'C' },
    ],
  },
  26: {
    id: 26,
    text: '宗门论道大会上认识了不少道友，有人提议线下在坊市见面——',
    options: [
      { value: 1, label: '传音嘴炮可以，真见面就社恐发作了。', key: 'A' },
      { value: 2, label: '去也行吧，有人找我聊我就聊两句。', key: 'B' },
      { value: 3, label: '出门前换了三套法袍，兴高采烈赴约。', key: 'C' },
    ],
  },

  // So2 · 边界感
  27: {
    id: 27,
    text: '你跟人相处自带一层结界——靠太近就触发防御法阵。',
    options: [
      { value: 1, label: '不会啊，我巴不得跟大家挤在一个洞府。', key: 'A' },
      { value: 2, label: '看关系远近，熟的可以近一点。', key: 'B' },
      { value: 3, label: '是的，请保持三丈以外，谢谢配合。', key: 'C' },
    ],
  },
  28: {
    id: 28,
    text: '对于信任的人，你巴不得跟 ta 好到像同一窝出生的灵兽。',
    options: [
      { value: 1, label: '不认同', key: 'A' },
      { value: 2, label: '说不好', key: 'B' },
      { value: 3, label: '认同', key: 'C' },
    ],
  },

  // So3 · 真实度
  29: {
    id: 29,
    text: '你在师尊面前和在好朋友面前，完全是两只不同的灵兽。',
    options: [
      { value: 3, label: '标准切换，见仙说仙话见妖说妖话。', key: 'A' },
      { value: 2, label: '会调整语气，但本质没变。', key: 'B' },
      { value: 1, label: '不会，我在谁面前都一个熊样。', key: 'C' },
    ],
  },
  30: {
    id: 30,
    text: '你对宗门某项规矩有意见，但你选择闭嘴。多半因为什么？',
    options: [
      { value: 3, label: '怕被人知道自己心里的阴暗想法。', key: 'A' },
      { value: 2, label: '算了，不想得罪人，毕竟要在宗门混。', key: 'B' },
      { value: 1, label: '我不怎么忍，有话直接传音说。', key: 'C' },
    ],
  },

  // ── 隐藏触发题 ──
  31: {
    id: 31,
    text: '你闭关之余有什么爱好？',
    options: [
      { value: 1, label: '吃灵果、晒太阳、摸灵宠', key: 'A' },
      { value: 2, label: '弹琴 / 炼体 / 画符 / 别的', key: 'B' },
      { value: 3, label: '喝酒 🍺', key: 'C' },
    ],
  },

  // ── 饮酒分支 ──
  32: {
    id: 32,
    text: '灵酒下肚之后，你会变成一只完全不同的灵兽。',
    options: [
      { value: 3, label: '酒后判若两兽，连我自己都怕。', key: 'A' },
      { value: 2, label: '放开一点，但灵魂还是那个灵魂。', key: 'B' },
      { value: 1, label: '我喝不喝都一个样，酒后吐的全是真言。', key: 'C' },
    ],
  },
};
