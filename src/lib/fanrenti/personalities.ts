/**
 * 凡人TI · 29 型 slug → 凡人修仙传角色映射
 */

import { withBasePath } from '../site';
import type { FrCharacter } from './characters';
import { getFrCharacter, FR_REALMS } from './characters';

export interface FanrentiPersonality {
  slug: string;
  number: string;
  characterId: string;
  tagline: string;
  tags: [string, string, string];
  emoji: string;
  copy: {
    wtfHit: string;
    osTranslation: string;
    symptoms: string[];
    closer: string;
  };
}

// ─── 29 型映射表 ────────────────────────────────────────────────
const MAP: Array<[string, string, string]> = [
  ['ctrl',   '#001', 'nangongwan'],  // 拿捏者 → 南宫婉（冷控）
  ['atm-er', '#002', 'dongxuaner'],  // 送钱者 → 董萱儿（默默付出）
  ['dior-s', '#003', 'hanli'],       // 屌丝 → 韩立（散修逆袭）
  ['boss',   '#004', 'yuanyao'],     // 控场王 → 元瑶（气场派）
  ['than-k', '#005', 'liafeiyu'],    // 谢天侠 → 厉飞雨（兄弟情深）
  ['oh-no',  '#006', 'yinying'],     // 哦不人 → 阴婴（内心震荡）
  ['mum',    '#007', 'dongxuaner'],  // 妈妈 → 董萱儿
  ['sexy',   '#008', 'yuanyao'],     // 钓系人 → 元瑶（不演自带）
  ['love-r', '#009', 'nangongwan'],  // 心动 → 南宫婉（深情款）
  ['thin-k', '#010', 'modoctor'],    // 想太多 → 墨大夫（三条计划线）
  ['malo',   '#011', 'hanli'],       // 吗喽 → 韩立（老六）
  ['woc',    '#012', 'liafeiyu'],    // 握草人 → 厉飞雨（热血一惊一乍）
  ['nerd',   '#013', 'bluemaster'],  // 书呆子 → 蓝大先生（阅人）
  ['drama',  '#014', 'yinying'],     // 戏精 → 阴婴（情绪放大）
  ['chill',  '#015', 'yueyue'],      // 无所谓先生 → 银月（钝感异类）
  ['emo',    '#016', 'yinying'],     // emo → 阴婴
  ['simp',   '#017', 'nangongwan'],  // 舔狗 → 南宫婉（等一辈子）
  ['luck-y', '#018', 'hanli'],       // 锦鲤 → 韩立（命硬）
  ['solo',   '#019', 'yueyue'],      // 自带结界 → 银月
  ['party',  '#020', 'liafeiyu'],    // 气氛组 → 厉飞雨
  ['sleep',  '#021', 'sanxiu'],      // 平躺 → 散修众生
  ['food-ie','#022', 'sanxiu'],      // 干饭 → 散修众生
  ['game-r', '#023', 'hanli'],       // 肝帝 → 韩立（闭关党）
  ['talk-er','#024', 'bluemaster'],  // 话痨 → 蓝大先生
  ['shy',    '#025', 'quhun'],       // 人群过敏 → 曲魂（沉默）
  ['rebel',  '#026', 'yinying'],     // 反骨仔 → 阴婴（想掀桌）
  ['drunk',  '#027', 'bluemaster'],  // 酒鬼 → 蓝大先生（折扇饮）
  ['fake',   '#028', 'modoctor'],    // 假面 → 墨大夫
  ['joker',  '#029', 'ziling'],      // 陪笑 → 紫灵（嘴硬心软）
];

// ─── 每个 slug 的完整文案 ─────────────────────────────────────────
// 精简原则：tagline + 3 tag + wtfHit + osTranslation + 3 症状 + closer
const COPY: Record<string, {
  tagline: string;
  tags: [string, string, string];
  emoji: string;
  wtfHit: string;
  osTranslation: string;
  symptoms: [string, string, string];
  closer: string;
}> = {
  ctrl: {
    tagline: '冷面之下，是精算过的每一步。',
    tags: ['掌控感', '稳手', '不动声色'],
    emoji: '❄️',
    wtfHit: '你从不摆明要控场，但整件事最后都按你的节奏走。',
    osTranslation:
      '在你这里，"控制" 不等于霸道，而是 "我提前把风险都算过一遍"。\n你不急着开口，你在等那个只需要一句话就能定局的时机。\n你最稀缺的不是能力，是"愿意把选择权让出去"的那一瞬间。',
    symptoms: [
      '开会前已经预演了三种走向',
      '别人还在情绪里时，你已经在收拾残局',
      '有时候觉得自己活得太"算"',
    ],
    closer: '稳如冰湖 —— 看似凉薄，其实替所有人挡住了风。',
  },
  'atm-er': {
    tagline: '你给出的那些，从不计回报。',
    tags: ['贴心', '不计较', '默默给'],
    emoji: '🎋',
    wtfHit: '你不是不会要，是"开口要"这件事让你觉得别扭。',
    osTranslation:
      '你天生就觉得"别人的不容易"比自己的重要。\n所以你更像一块默默发热的石头，而不是索要关注的火焰。\n课题：学会告诉别人"我也希望被照顾一下"。',
    symptoms: [
      '朋友缺什么你早就默默准备好',
      '表扬塞给别人，问题揽到自己',
      '很少让别人知道你在硬扛',
    ],
    closer: '药香之人 —— 别人路过都能暖一阵。',
  },
  'dior-s': {
    tagline: '没背景，但每一步都算数。',
    tags: ['散修', '逆袭', '不认命'],
    emoji: '🍂',
    wtfHit: '你是那种"被世界轻视过，但偏偏自己走上来"的人。',
    osTranslation:
      '你不吵不闹，因为你知道吵也没人听。\n你选择一件一件把事情做扎实，等到某天别人回头，发现你早就不是之前那个。\n你最大的底气是："我已经熬过更难的版本"。',
    symptoms: [
      '习惯性低调，实则极其倔强',
      '被小看时反而更冷静',
      '从不把底牌一次性甩出来',
    ],
    closer: '散修走完整条山路，其实比谁都有故事。',
  },
  boss: {
    tagline: '你一开口，场子自然就安静了。',
    tags: ['气场', '高位', '利落'],
    emoji: '🌀',
    wtfHit: '你不用刻意管谁，大家自己对齐你的节奏。',
    osTranslation:
      '你不是喜欢控场，是你脑子里一直有一条"事情该怎么跑"的线。\n你做决定干净利落，受不了反复拉扯。\n你要小心的是："所有人都听你的"之后，反而没人敢告诉你真话。',
    symptoms: [
      '会议里最后那句话通常是你说的',
      '讨厌议而不决',
      '习惯一个人把大头扛掉',
    ],
    closer: '元婴级场控 —— 不凶，却谁也不敢含糊。',
  },
  'than-k': {
    tagline: '义气这两个字，你是真吃。',
    tags: ['兄弟派', '重情', '讲义气'],
    emoji: '🗡️',
    wtfHit: '只要是朋友的事，你基本不问"值不值"。',
    osTranslation:
      '你相信的是"江湖不是规则，是人情"。\n别人讨价还价的时候你已经出手了，别人秋后算账的时候你早就忘了自己垫过多少。\n你的软肋：太容易把"被需要"当成价值。',
    symptoms: [
      '哥们一句话你就出门',
      '花钱花力气不算账',
      '偶尔被利用，心里清楚但不揭穿',
    ],
    closer: '义气型筑基 —— 江湖靠你这种人撑着。',
  },
  'oh-no': {
    tagline: '心里那一下震荡，外人看不见。',
    tags: ['敏感', '内耗', '复盘狂'],
    emoji: '🌧️',
    wtfHit: '别人一句话，你能回放一整晚。',
    osTranslation:
      '你不是玻璃心，是"雷达太敏感"。\n别人没注意的细节你全接收了，然后在睡前一个人慢慢消化。\n你的修炼方向：学会告诉自己"这条信息可以不接收"。',
    symptoms: [
      '睡前自动开启名场面回放',
      '别人无意的话被你解读成三层',
      '下一次相处又会主动示好',
    ],
    closer: '心魔型修士 —— 渡完这关，就是真的自在。',
  },
  mum: {
    tagline: '你是团队里默默擦屁股的那个。',
    tags: ['照顾', '操心', '补锅'],
    emoji: '🍵',
    wtfHit: '你嘴上说"不是我的事"，手上已经在补了。',
    osTranslation:
      '你的本能反应是"别人不舒服我先不舒服"。\n所以你总是在收拾、提醒、兜底，哪怕你自己其实也累。\n你该练的是："有些锅可以摆着不补"。',
    symptoms: [
      '看到混乱手就痒',
      '习惯提前预判别人需要什么',
      '很少敢把"我也撑不住了"说出口',
    ],
    closer: '温室药田 —— 大家都靠你，可你没人问。',
  },
  sexy: {
    tagline: '你不演，但场子自带气息。',
    tags: ['自然', '松弛', '气场'],
    emoji: '🪷',
    wtfHit: '你什么都没做，只是站着，就已经让人多看两眼。',
    osTranslation:
      '你的"钓系"不是刻意，是"自洽"的副产品。\n你做自己的事，情绪不往外溢，反而让人想靠近。\n注意：别人越主动，你越要守住自己的节奏。',
    symptoms: [
      '不经意的动作被记很久',
      '被追的时候反而更冷静',
      '比起被喜欢，你更在意"不被打扰"',
    ],
    closer: '仙族气场 —— 安静地占领一片场域。',
  },
  'love-r': {
    tagline: '你嘴上说不在乎，其实早就上心了。',
    tags: ['深情', '慢热', '上头型'],
    emoji: '🌙',
    wtfHit: '你不是"容易喜欢人"，是"一旦喜欢就很难收"。',
    osTranslation:
      '你外人看是冷淡，其实是在筛。\n真正被你认定，就会得到一种"你自己都没意识到的" 持续、安静、结实的好。\n风险：容易把"等到"美化成"值得"。',
    symptoms: [
      '暗地里记得对方说过的话',
      '表面不主动，手里在默默做事',
      '很容易一个人把关系走完',
    ],
    closer: '玉女型守候 —— 安静、坚定、时间长得过境界。',
  },
  'thin-k': {
    tagline: '你脑子里永远同时在跑三条线。',
    tags: ['多线程', '阴谋脑', '前置布局'],
    emoji: '🧠',
    wtfHit: '你不是想多，是你总预判到第三步。',
    osTranslation:
      '你觉得"表面笑一笑"能省掉解释成本，但背后每一句你都已经推演过。\n你的长项：同时维持多条关系线、多套方案。\n你的隐患：有时候想得太远，自己先把自己绕进去。',
    symptoms: [
      '对话一结束就开始复盘',
      '答应之前，备用方案已经想好',
      '讨厌被人看穿',
    ],
    closer: '墨大夫式头脑 —— 慈眉善目，脑里三盘棋。',
  },
  malo: {
    tagline: '能跑就不打，这是你的核心修为。',
    tags: ['滑手', '老六', '保命第一'],
    emoji: '🌾',
    wtfHit: '你最大的本事不是狠，是"能活下来"。',
    osTranslation:
      '你信奉"命比脸重要"。能用话解决的不动手，能跑的不硬刚。\n别人觉得你不够勇，其实你只是算得特别清楚。\n你最被低估的点：一旦被逼到墙角，你出手比谁都稳。',
    symptoms: [
      '第一反应是"怎么脱身"',
      '不屑于无意义争口气',
      '真要出手，后手比脸还多',
    ],
    closer: '散修之王 —— 苟是一种修为，稳才是境界。',
  },
  woc: {
    tagline: '你一次次被震惊，又一次次撑过去。',
    tags: ['一惊一乍', '热血', '生动'],
    emoji: '🔥',
    wtfHit: '你情绪很直接，所以你身边的人不会无聊。',
    osTranslation:
      '你不擅长装酷，别人觉得你"反应大"，其实你是"真在投入地活"。\n你的情绪像烟花，炸完就清空，不记仇。\n你要修的是："情绪先过一秒再反应"。',
    symptoms: [
      '说话带大量语气词',
      '表情和声音比内容先到',
      '情绪快进快出，不搞冷战',
    ],
    closer: '热血剑修 —— 被你带着的人都觉得故事精彩。',
  },
  nerd: {
    tagline: '你是那种"懂得多但从不吹"的人。',
    tags: ['阅人', '研究派', '冷静'],
    emoji: '📜',
    wtfHit: '你不显摆，但真讨论起来，每个人都想听你一句。',
    osTranslation:
      '你喜欢观察胜过表达。你对人对事都有一套属于自己的"解构方式"。\n你看起来淡，实际上留意了更多人忽略的细节。\n你的课题：别把"看透"变成"不参与"。',
    symptoms: [
      '默默收集信息，关键时刻抛出',
      '不喜欢无意义寒暄',
      '会为了搞清一个问题熬夜',
    ],
    closer: '蓝大先生型 —— 折扇一开，局势尽收。',
  },
  drama: {
    tagline: '你把情绪推到顶，也真的活在顶上。',
    tags: ['戏剧感', '浓度高', '情绪派'],
    emoji: '🎭',
    wtfHit: '你不是演，你是真的相信自己此刻的剧本。',
    osTranslation:
      '别人过日子，你过叙事。\n每一件事在你这里都有一个"场面"，这让你极富感染力，也让你很累。\n需要练习：把情绪"降半格"，你依然精彩。',
    symptoms: [
      '一句话能被你讲出三幕',
      '别人平静的事你能哭能笑',
      '睡前复盘今天的"高光和低谷"',
    ],
    closer: '阴婴型浓度 —— 别人怕你，其实你只是太认真。',
  },
  chill: {
    tagline: '别人崩的时候，你还在淡定喝茶。',
    tags: ['钝感', '松弛', '自洽'],
    emoji: '🍃',
    wtfHit: '你不装，你是真的没那么在乎。',
    osTranslation:
      '你天生对"外部噪音"过滤能力强。别人在着急，你在想午饭。\n你不是冷，是"这件事在我心里排序靠后"。\n唯一风险：偶尔让身边的人觉得"他是不是不上心"。',
    symptoms: [
      '被催时语速更慢',
      '情绪不随环境起伏',
      '内心有一整套自己的节奏',
    ],
    closer: '银月钝感 —— 风浪里睡得最香的那只。',
  },
  emo: {
    tagline: '你把情绪藏得很深，但偶尔还是会露一角。',
    tags: ['深情', '反刍', '夜聊型'],
    emoji: '🌙',
    wtfHit: '白天你体面得体，夜里你是自己世界的皇帝。',
    osTranslation:
      '你习惯"不让别人看到脆弱的我"，所以夜晚是你唯一不演的时间。\n你不是悲观，你只是太会感受。\n你该学的是：让某个人看到你低潮的样子，而不是独自整理完。',
    symptoms: [
      '歌单里有一半不敢公开',
      '朋友圈凌晨发完又删',
      '白天照常工作照常笑',
    ],
    closer: '阴婴的夜 —— 偶尔露一面就够治愈自己了。',
  },
  simp: {
    tagline: '你的执念有一种很深的温度。',
    tags: ['执念', '一根筋', '长情'],
    emoji: '🕯️',
    wtfHit: '你不是不清醒，你是清醒还选择继续。',
    osTranslation:
      '你的喜欢是"一眼定终身"型的，哪怕对方早已往前走。\n你不傻，你只是觉得"自己选择的心意"比"值不值得"更重要。\n修炼课题：让自己也被照顾到。',
    symptoms: [
      '记得对方每一个小细节',
      '明知没结果还愿意出手',
      '对别人的示好反而很钝',
    ],
    closer: '南宫婉式执念 —— 一辈子为一个答案。',
  },
  'luck-y': {
    tagline: '你不是运气最好，是你"命硬"。',
    tags: ['韧劲', '命硬', '关键时刻上'],
    emoji: '🌟',
    wtfHit: '别人看你运气好，其实你每次都是硬扛下来的。',
    osTranslation:
      '你不信"老天会救我"，你信"我再撑一下就能熬出来"。\n所以每次危机之后，你看起来像锦鲤，其实你自己最清楚是怎么过的关。\n你要做的：别让"能扛"变成"必须一直扛"。',
    symptoms: [
      '从来不在危机第一秒崩',
      '越难的事越集中',
      '事后从不炫耀过程',
    ],
    closer: '韩立式命硬 —— 锦鲤其实是修出来的。',
  },
  solo: {
    tagline: '你一个人，就是一整个完整的世界。',
    tags: ['自洽', '独处', '内循环'],
    emoji: '🌌',
    wtfHit: '你不是孤僻，你是"自己能陪自己很好"。',
    osTranslation:
      '你有一套完整的精神内循环：阅读、想事情、独处、做手头的事。\n别人觉得你孤独，你觉得终于安静。\n你要练的是：允许有人进来，不等于失去结界。',
    symptoms: [
      '周末一个人就是最佳状态',
      '不需要靠群聊确认存在',
      '讨厌无意义社交',
    ],
    closer: '银月结界 —— 一个人就是一支队伍。',
  },
  party: {
    tagline: '有你在，饭局气氛立刻就来了。',
    tags: ['气氛组', '带动力', '热闹'],
    emoji: '🎇',
    wtfHit: '你是那种"走到哪里，哪里就活起来"的存在。',
    osTranslation:
      '你天生懂得"怎么让别人舒服"。这不是讨好，是一种高级的社交直觉。\n你自己也享受那种"场子被我带起来"的感觉。\n隐患：散场之后的安静对你来说有时候很空。',
    symptoms: [
      '天生是 toast 发起人',
      '很会抛梗也会接梗',
      '散场后心里会空一下',
    ],
    closer: '厉飞雨式气氛 —— 没你在，江湖都冷清。',
  },
  sleep: {
    tagline: '躺平是你的修为，不是摆烂。',
    tags: ['慢活', '节能', '低耗型'],
    emoji: '🛏️',
    wtfHit: '你比谁都清楚"不动"比"乱动"更省事。',
    osTranslation:
      '你不懒，你是把力气留给真正重要的事。\n别人把体力耗在"显得很努力"上，你把体力留给"真的需要"。\n你要小心的是：别把"省劲"变成"逃避"。',
    symptoms: [
      '一眼就能分辨"值不值得卷"',
      '休息这件事从不内疚',
      '爆发力比耐力强',
    ],
    closer: '散修众生 —— 把日子过稳，已是大本事。',
  },
  'food-ie': {
    tagline: '对你来说，"先吃饱"本身就是道心。',
    tags: ['干饭王', '快乐具体', '当下派'],
    emoji: '🍲',
    wtfHit: '你是那种"难过也要先吃一顿"的健康人。',
    osTranslation:
      '你把快乐建立在"具体的食物"上，这让你的情绪复原速度非常快。\n你不擅长空谈未来，但你擅长过好今晚这顿。\n你最不该做的事：为了所谓的境界委屈自己的嘴。',
    symptoms: [
      '心情不好先点外卖',
      '旅行线路围绕餐厅定',
      '记别人爱吃什么比记生日更准',
    ],
    closer: '散修烟火 —— 吃饱了，天就没那么塌了。',
  },
  'game-r': {
    tagline: '你一旦开始肝，就真的停不下来。',
    tags: ['专注狂', '闭关型', '高投入'],
    emoji: '🔥',
    wtfHit: '你不是卷，你是"进入状态了就不想出来"。',
    osTranslation:
      '你的心流阈值比别人低，一旦进入，就能连续输出几个小时。\n别人以为你刻苦，其实你在享受。\n但课题是：学会主动出关，不然关到最后气血虚空。',
    symptoms: [
      '通宵一件事从不内疚',
      '讨厌被打断',
      '一件事没闭环睡不着',
    ],
    closer: '闭关型散修 —— 出关那刻，整个人换皮。',
  },
  'talk-er': {
    tagline: '你话多，但你的话值得一听。',
    tags: ['健谈', '语速快', '信息量大'],
    emoji: '🫗',
    wtfHit: '你是那种"开口前已经在脑子里跑完结构"的人。',
    osTranslation:
      '你的表达欲本质是"我想让你更快理解这件事"。\n你不是话痨，是你觉得沉默在浪费时间。\n你要练：学会把一部分话"留着不说"，别人会更想靠近。',
    symptoms: [
      '说话自带小标题',
      '喜欢把概念讲给别人听',
      '听别人讲慢会忍不住接',
    ],
    closer: '蓝大先生式健谈 —— 话多，但含金量高。',
  },
  shy: {
    tagline: '你不是冷，你只是需要一点时间。',
    tags: ['慢热', '专注', '社交节能'],
    emoji: '🌑',
    wtfHit: '你见一面不熟没关系，见够三次你能成为那个人最稳的朋友。',
    osTranslation:
      '你在陌生环境里先观察、不表达，这不是怯，是在做"心理布阵"。\n一旦你觉得安全，你比谁都投入、谁都真诚。\n你要做的：让对方看到你的"启动中"状态，而不是误以为你冷淡。',
    symptoms: [
      '人群里先沉默',
      '聊熟之后话很多',
      '害怕被硬拉进团',
    ],
    closer: '曲魂沉默 —— 不抢戏，但在的地方就稳。',
  },
  rebel: {
    tagline: '你不是反对，你是要"换一种方式"。',
    tags: ['反骨', '独立判断', '不服从'],
    emoji: '⚡',
    wtfHit: '你受不了"因为规矩所以要听"，你要知道"为什么"。',
    osTranslation:
      '你天生对"权威"祛魅。别人说什么你先过一下自己的滤网。\n你不是来找茬，你是在找"更合理的版本"。\n你要注意的是：别把"反"变成"为了反而反"。',
    symptoms: [
      '讨厌被命令',
      '对上级意见先反问',
      '宁愿单干也不妥协',
    ],
    closer: '阴婴心火 —— 你在心里早就翻过这张桌了。',
  },
  drunk: {
    tagline: '你喝的不是酒，是"终于可以放下今天"。',
    tags: ['独酌', '夜话', '自疗'],
    emoji: '🍶',
    wtfHit: '别人喝酒是社交，你喝酒是仪式。',
    osTranslation:
      '你的酒杯里装的是"白天不能说的那些话"。\n你需要一个独处或极度信任的场景，才肯把情绪放下来。\n你最该记住的：真正的休息，不一定要靠酒才够理由。',
    symptoms: [
      '一杯进喉情绪才肯露',
      '和少数人喝更自在',
      '最真的话是最后一杯说的',
    ],
    closer: '蓝大先生独酌 —— 折扇一收，天下不管了。',
  },
  fake: {
    tagline: '你的"合群"其实是高级的护身术。',
    tags: ['社交铠甲', '表里切换', '自我保护'],
    emoji: '🎴',
    wtfHit: '你会演，不是为了骗人，是为了保护那个真的你。',
    osTranslation:
      '你早看懂"把真心全暴露只会被消耗"，于是练成一身体面。\n体面背后是一个挺脆弱的内核。\n你真正的修行：找一个人，允许自己不演给他看。',
    symptoms: [
      '会议里笑得很职业',
      '回家换一张脸',
      '很少在社交场合吐苦水',
    ],
    closer: '墨大夫式体面 —— 笑意背后是一个完整的自己。',
  },
  joker: {
    tagline: '你用玩笑化解了大多数尴尬时刻。',
    tags: ['冷场杀手', '自嘲', '人间润滑剂'],
    emoji: '🎋',
    wtfHit: '你用一句"哈哈"挡掉了很多本来会伤人的话。',
    osTranslation:
      '你玩笑的底色其实很温柔：你在帮别人也帮自己，避开伤害。\n你嘴上拆自己，心里对别人的事非常上心。\n你要警惕的是："每次都靠玩笑"会让真情实感没处放。',
    symptoms: [
      '气氛凝固时第一个自爆',
      '最会用梗接别人情绪',
      '一个人时比谁都安静',
    ],
    closer: '紫灵型嘴硬 —— 怼你归怼你，事还是我来办。',
  },
};

// ─── 构造 FANRENTI_PERSONALITIES ─────────────────────────────────
export const FANRENTI_PERSONALITIES: FanrentiPersonality[] = MAP.map(
  ([slug, number, characterId]) => {
    const c = COPY[slug];
    if (!c) throw new Error(`Missing fanrenti copy for slug: ${slug}`);
    return {
      slug,
      number,
      characterId,
      tagline: c.tagline,
      tags: c.tags,
      emoji: c.emoji,
      copy: {
        wtfHit: c.wtfHit,
        osTranslation: c.osTranslation,
        symptoms: c.symptoms,
        closer: c.closer,
      },
    };
  }
);

// ─── Helpers ────────────────────────────────────────────────────
export function getFanrentiPersonality(slug: string): FanrentiPersonality | undefined {
  return FANRENTI_PERSONALITIES.find(p => p.slug === slug);
}

export function getFanrentiSlugs(): string[] {
  return FANRENTI_PERSONALITIES.map(p => p.slug);
}

export function getFanrentiCharacter(slug: string): FrCharacter | undefined {
  const p = getFanrentiPersonality(slug);
  if (!p) return undefined;
  return getFrCharacter(p.characterId);
}

export function getFanrentiTypeImage(slug: string): string {
  return withBasePath(`/images/types/${slug}.png`);
}

export function getFanrentiTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/${slug}.png`);
}

export function getFanrentiTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/${slug}.png`);
}

/** Realm accent color for a slug (used by gallery-data) */
export function getFanrentiItemColor(slug: string): string {
  const char = getFanrentiCharacter(slug);
  if (!char) return '#2a4d4f';
  return FR_REALMS[char.realm]?.accent ?? '#2a4d4f';
}

/** Realm emoji for a slug (used by gallery-data) */
export function getFanrentiItemEmoji(slug: string): string {
  const char = getFanrentiCharacter(slug);
  if (!char) return '🪷';
  return FR_REALMS[char.realm]?.emoji ?? '🪷';
}

/** Character display name for a slug */
export function getFanrentiCharacterName(slug: string): string {
  const char = getFanrentiCharacter(slug);
  return char?.name ?? slug;
}
