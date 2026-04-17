/**
 * 凡人TI · 凡人修仙传宇宙 — 主角/配角正典角色库
 *
 * 角色以「道心/功法/境界」三要素刻画。规避版权：
 * - 只使用角色名与修仙世界的通用意象，不使用作者授权的封面图
 * - 配色以「水墨 + 古典中国色」为主
 */

export type FrRealm = 'mortal' | 'foundation' | 'core' | 'nascent' | 'deity' | 'demon';

export interface FrRealmInfo {
  id: FrRealm;
  name: string;        // 炼气期
  emoji: string;
  accent: string;      // hex accent
  textAccent: string;
  bgTint: string;
  tagline: string;
}

export const FR_REALMS: Record<FrRealm, FrRealmInfo> = {
  mortal: {
    id: 'mortal',
    name: '炼气散修',
    emoji: '🍂',
    accent: '#8b6f47',
    textAccent: '#5a4528',
    bgTint: '#f5ede1',
    tagline: '活着是第一修为',
  },
  foundation: {
    id: 'foundation',
    name: '筑基修士',
    emoji: '🎋',
    accent: '#4a7a5c',
    textAccent: '#315540',
    bgTint: '#eff5ef',
    tagline: '稳中求进，不急不躁',
  },
  core: {
    id: 'core',
    name: '结丹真人',
    emoji: '🔥',
    accent: '#a62a3a',
    textAccent: '#7a1e28',
    bgTint: '#f9ebed',
    tagline: '道心已立，前路自知',
  },
  nascent: {
    id: 'nascent',
    name: '元婴老怪',
    emoji: '🌀',
    accent: '#3a4a7a',
    textAccent: '#253356',
    bgTint: '#edf0f7',
    tagline: '洞悉人心，阳谋在胸',
  },
  deity: {
    id: 'deity',
    name: '天仙化神',
    emoji: '🪷',
    accent: '#6a4a8a',
    textAccent: '#4a3266',
    bgTint: '#f1ecf5',
    tagline: '踏破虚空，回头是人',
  },
  demon: {
    id: 'demon',
    name: '魔道异类',
    emoji: '🔮',
    accent: '#3a2a3a',
    textAccent: '#251825',
    bgTint: '#efeaef',
    tagline: '人世规则之外的另一种道',
  },
};

export interface FrCharacter {
  id: string;              // 'hanli', 'nangongwan'…
  name: string;            // 韩立
  nameEn: string;          // Han Li
  realm: FrRealm;          // 境界归属（人物气质，非剧情实际境界）
  art: string;             // 功法 / 神通
  relic: string;           // 法宝 / 招牌物
  archetype: string;       // "老六散修"
  traits: [string, string, string];
  essence: string;
  hookLine: string;
  narrative: string;
  dialogueMarker: string;
  socialShare: string;
}

export const FR_CHARACTERS: FrCharacter[] = [
  {
    id: 'hanli',
    name: '韩立',
    nameEn: 'Han Li',
    realm: 'mortal',
    art: '大衍诀 + 青元剑诀',
    relic: '青竹蜂云剑',
    archetype: '老六散修之王',
    traits: ['装弱高手', '后手比脸多', '能跑就不打'],
    essence: '道友请留步，我是真不想打你，但我也真的不会输。',
    hookLine: '你最大的本事不是修为，是"能活下来"。',
    narrative:
      '你信奉"能跑就别硬刚"。别人修的是道，你修的是"怎么才能活到结算画面"。\n' +
      '你手里永远有底牌：备用功法、备用身份、备用逃命路线、备用演技。\n' +
      '别人觉得你木讷，其实你只是懒得社交；一旦动手，你比谁都狠、比谁都稳。',
    dialogueMarker: '"道友请留步。"',
    socialShare: '我在凡人修仙传被分成了韩立 · 老六散修 · 能跑就不打的类型',
  },
  {
    id: 'nangongwan',
    name: '南宫婉',
    nameEn: 'Nangong Wan',
    realm: 'core',
    art: '天一真水 + 冰魄神光',
    relic: '碧蚕冰丝',
    archetype: '冷面玉女型执念者',
    traits: ['认准就是一辈子', '外冷内炽', '独自扛事'],
    essence: '我不说很多，但我为你等得起一辈子。',
    hookLine: '你话不多，却是那个把承诺放在心里最深的人。',
    narrative:
      '你看起来冷淡，其实只是把情绪压得很深。你认定的人和事，可以等一个"轮回级别"的时间。\n' +
      '你不擅长讨好，但擅长"默默做完"。别人还在试探，你已经把事情办到一半了。\n' +
      '你最大的难，是"太容易一个人扛"。',
    dialogueMarker: '"我等你。"',
    socialShare: '我在凡人修仙传被分成了南宫婉 · 冷面但炽热 · 认定就是一辈子',
  },
  {
    id: 'yueyue',
    name: '银月',
    nameEn: 'Yue Yue',
    realm: 'demon',
    art: '月光秘术 + 妖族血脉',
    relic: '银月长剑',
    archetype: '忠诚的异类',
    traits: ['非人类视角', '单向忠诚', '情绪稳定到反常'],
    essence: '规则不适用我，但我选择对你适用。',
    hookLine: '你不太像"人"，但你对自己在意的人可靠到离谱。',
    narrative:
      '你总是跟别人不在一个频道，别人觉得天大的事你觉得还好。\n' +
      '你做选择不靠道德，靠"这是不是我的人"。一旦认主，你的忠诚是一体化的。\n' +
      '你在人群里总显得冷，因为你根本没在用人的坐标系。',
    dialogueMarker: '"主人说的便是道理。"',
    socialShare: '我在凡人修仙传被分成了银月 · 非人类视角 · 选择性地有情',
  },
  {
    id: 'liafeiyu',
    name: '厉飞雨',
    nameEn: 'Li Feiyu',
    realm: 'foundation',
    art: '剑修速成 + 兄弟同心',
    relic: '青钢剑',
    archetype: '热血兄弟派',
    traits: ['义字当先', '直来直去', '愿意为朋友押注'],
    essence: '兄弟要是有难，我这条命可以先借一借。',
    hookLine: '你是那种"一听是朋友的事，立马跳出来"的人。',
    narrative:
      '你最大的燃料是"江湖义气"。别人讲利害，你讲人情；别人算成本，你算兄弟。\n' +
      '你不是不聪明，只是不屑于在朋友身上算计。\n' +
      '你最容易吃的亏：为了不想负人，先把自己耗空。',
    dialogueMarker: '"你小子别磨叽！跟我走！"',
    socialShare: '我在凡人修仙传被分成了厉飞雨 · 义字当头 · 为朋友押命的那种',
  },
  {
    id: 'ziling',
    name: '紫灵',
    nameEn: 'Zi Ling',
    realm: 'foundation',
    art: '符修 + 五行遁术',
    relic: '紫金符',
    archetype: '娇蛮但靠谱',
    traits: ['嘴硬心软', '关键时刻顶上', '能担责'],
    essence: '嘴上嫌你麻烦，身体比谁都先把你挡在后面。',
    hookLine: '你嘴硬，但总是在最关键的时候出手。',
    narrative:
      '你平时看起来骄傲任性，但真遇事你比谁都担得起。\n' +
      '你讨厌装深沉，喜欢用怼人掩盖自己在乎。\n' +
      '你最让人心动的瞬间，是那种"我明明在骂你，但我已经在帮你了"。',
    dialogueMarker: '"啰啰嗦嗦！要我说几遍？"',
    socialShare: '我在凡人修仙传被分成了紫灵 · 嘴硬心软 · 关键时刻会顶上的那种',
  },
  {
    id: 'modoctor',
    name: '墨大夫',
    nameEn: 'Doctor Mo',
    realm: 'nascent',
    art: '炼药傀儡 + 夺舍阴谋',
    relic: '墨玉符纸',
    archetype: '慈眉善目的老阴',
    traits: ['笑里藏刀', '目的驱动', '长线布局'],
    essence: '我对你好，是真的——但我也真的有自己的目的。',
    hookLine: '你笑着递过来的东西，别人不敢第一口就吃。',
    narrative:
      '你是那种"表面特别温和"的人，但脑子里永远在同时跑三条计划线。\n' +
      '你相信"所有善意都得有价码"，不是你冷血，是你太懂人了。\n' +
      '你最大的孤独是：你看得太清了，反而没有人能骗到你。',
    dialogueMarker: '"小子，莫怕，师傅在。"',
    socialShare: '我在凡人修仙传被分成了墨大夫 · 笑里藏刀 · 三条计划线型选手',
  },
  {
    id: 'quhun',
    name: '曲魂',
    nameEn: 'Qu Hun',
    realm: 'demon',
    art: '傀儡术 + 尸魂契约',
    relic: '刻纹骨刀',
    archetype: '沉默的执行者',
    traits: ['零情绪输出', '绝对执行', '专注力爆表'],
    essence: '我不说废话，你交给我，我会做完。',
    hookLine: '你不解释、不抱怨，就是把事情默默干完。',
    narrative:
      '你是团队里那种"最不像人"的 nsper：没有八卦、没有怨气、没有多余情绪。\n' +
      '别人喊累的时候，你已经干完下一件事了。别人觉得你冷，你只是不想浪费口水。\n' +
      '你最容易被低估，也最容易在关键战役里证明"他才是关键那一环"。',
    dialogueMarker: '"嗯。"',
    socialShare: '我在凡人修仙传被分成了曲魂 · 沉默执行者 · 不说话但把事做完',
  },
  {
    id: 'dongxuaner',
    name: '董萱儿',
    nameEn: 'Dong Xuaner',
    realm: 'mortal',
    art: '医术 + 药修',
    relic: '百草囊',
    archetype: '温柔的锚点',
    traits: ['治愈他人', '默默吸纳情绪', '家人型'],
    essence: '你在外面再累，回到我这里都能喘口气。',
    hookLine: '你不吵不闹，但所有人都把你当"能回去的地方"。',
    narrative:
      '你的人格底色是"安放感"。别人吵闹一天之后，都想找你坐一会。\n' +
      '你很少主动索取，但你的存在本身就稀缺。\n' +
      '你最大的隐形成本：默默吸了太多情绪，却没有人问你"你最近还好吗"。',
    dialogueMarker: '"累了就歇一会，没人催你。"',
    socialShare: '我在凡人修仙传被分成了董萱儿 · 温柔锚点 · 谁都想回来的那种人',
  },
  {
    id: 'yuanyao',
    name: '元瑶',
    nameEn: 'Yuan Yao',
    realm: 'nascent',
    art: '冰魄神功 + 仙族血脉',
    relic: '玉简传音符',
    archetype: '自带仙气的高冷玩家',
    traits: ['天赋在线', '情绪低控但气场强', '利落'],
    essence: '我站在这里，不需要多解释什么。',
    hookLine: '你不争不吵，但场子自然就是你的。',
    narrative:
      '你天生带一种"拉开一点距离"的气场，让人既想靠近又不敢冒犯。\n' +
      '你做决定极利落，不拖泥带水。你不擅长撒娇，却擅长让别人主动愿意给你。\n' +
      '你最大的挑战：别把"独立"和"不需要任何人"混为一谈。',
    dialogueMarker: '"嗯，这件事我来办。"',
    socialShare: '我在凡人修仙传被分成了元瑶 · 自带仙气 · 场子自然是我的那种',
  },
  {
    id: 'bluemaster',
    name: '蓝大先生',
    nameEn: 'Master Lan',
    realm: 'deity',
    art: '洞悉人心 + 谋士术',
    relic: '折扇',
    archetype: '世故但仗义',
    traits: ['阅人无数', '留一线做事', '关键时刻够义气'],
    essence: '我知道你在想什么，但我不会当面拆穿你。',
    hookLine: '你把"人情世故"玩得明明白白，但对真朋友毫不吝啬。',
    narrative:
      '你看一眼就知道对方几斤几两，但你不声张。\n' +
      '你讲规矩讲面子，但底线极其清楚："对自己人绝不阴"。\n' +
      '你最怕的不是被骗，是"别人以为我只会混江湖"。',
    dialogueMarker: '"道友，此话暂且不提。"',
    socialShare: '我在凡人修仙传被分成了蓝大先生 · 世故但仗义 · 对朋友从不阴',
  },
  {
    id: 'yinying',
    name: '阴婴',
    nameEn: 'Yin Ying',
    realm: 'demon',
    art: '魔功 + 阴气吞噬',
    relic: '腐骨幡',
    archetype: '被压抑的另一个自己',
    traits: ['欲望更直白', '情绪放大', '不装'],
    essence: '我是你不想承认、但确实存在的那一面。',
    hookLine: '你内心有一个"早就受够了"的版本，偶尔冒出来。',
    narrative:
      '你大部分时候体面得体，但体面之下有一个"真的很想掀桌"的自己。\n' +
      '你不是坏人，你只是累了，想偶尔不顾别人感受活一次。\n' +
      '你的课题：接纳这个"坏一点"的版本，而不是彻底压下去或彻底放出来。',
    dialogueMarker: '"这一次，让我来选。"',
    socialShare: '我在凡人修仙传被分成了阴婴 · 想掀桌的自己 · 偶尔会冒头',
  },
  {
    id: 'sanxiu',
    name: '散修众生',
    nameEn: 'Wandering Cultivators',
    realm: 'mortal',
    art: '打零工功法 + 见缝插针',
    relic: '二手法器',
    archetype: '普通修士的集合体',
    traits: ['活下去最重要', '爱凑热闹', '有便宜就占'],
    essence: '没背景、没后台，只有一条命和一点小聪明。',
    hookLine: '你是那种"普通人的代表"，但你比谁都扛得起日常。',
    narrative:
      '你不是主角，但你是把主角身边的世界撑起来的人。\n' +
      '你务实、识趣、不爱抬杠，知道什么时候沉默、什么时候插话。\n' +
      '你最值得被看见的是："在没有背景加持的情况下，也能活出自己的节奏"。',
    dialogueMarker: '"嗨，日子么，总要过。"',
    socialShare: '我在凡人修仙传被分成了散修众生 · 普通人代表 · 把日子扛下来的那种',
  },
];

export function getFrCharacter(id: string): FrCharacter | undefined {
  return FR_CHARACTERS.find(c => c.id === id);
}

export function getFrRealm(id: FrRealm): FrRealmInfo {
  return FR_REALMS[id];
}
