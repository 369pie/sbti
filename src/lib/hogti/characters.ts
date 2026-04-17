/**
 * 霍格沃茨TI · HP 宇宙 — 15 主角正典角色库
 *
 * 这是 hogti 宇宙的"角色锚点层"：每一个 29 型 slug 都会映射到其中一个 character。
 * 多个 slug 可以共享同一个 character（如"指挥型/学霸型"都归赫敏）。
 *
 * 规避版权：
 * - 只使用角色名与通用魔法意象，不使用官方院徽 PNG、不使用电影剧照
 * - 学院配色使用"致敬但非完全一致"的色系（略降饱和、偏哑光）
 */

export type HogHouse = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff' | 'faculty';

export interface HogHouseInfo {
  id: HogHouse;
  name: string;           // 格兰芬多
  nameEn: string;         // Gryffindor
  emoji: string;          // 🦁
  accent: string;         // Hex accent (院色)
  textAccent: string;     // 深色文字对照色（保证对比度）
  bgTint: string;         // 浅背景 tint
  tagline: string;        // 一句话学院气质
}

export const HOG_HOUSES: Record<HogHouse, HogHouseInfo> = {
  gryffindor: {
    id: 'gryffindor',
    name: '格兰芬多',
    nameEn: 'Gryffindor',
    emoji: '🦁',
    accent: '#a62b1f',       // 绯红（略降饱和）
    textAccent: '#7a1d14',
    bgTint: '#fdf2ef',
    tagline: '勇气、莽撞、情义第一位',
  },
  slytherin: {
    id: 'slytherin',
    name: '斯莱特林',
    nameEn: 'Slytherin',
    emoji: '🐍',
    accent: '#1f4d3a',       // 墨绿
    textAccent: '#173a2c',
    bgTint: '#eef5f1',
    tagline: '野心、智谋、忠于自己人',
  },
  ravenclaw: {
    id: 'ravenclaw',
    name: '拉文克劳',
    nameEn: 'Ravenclaw',
    emoji: '🦅',
    accent: '#2a3a7a',       // 深蓝
    textAccent: '#1f2d5f',
    bgTint: '#eff1f8',
    tagline: '智识、好奇、独处自洽',
  },
  hufflepuff: {
    id: 'hufflepuff',
    name: '赫奇帕奇',
    nameEn: 'Hufflepuff',
    emoji: '🦡',
    accent: '#b38728',       // 金黄
    textAccent: '#7e5e1b',
    bgTint: '#fbf5e6',
    tagline: '温柔、可靠、稳定的那束光',
  },
  faculty: {
    id: 'faculty',
    name: '教职席',
    nameEn: 'Faculty',
    emoji: '🕯️',
    accent: '#3f3a52',       // 烛台紫
    textAccent: '#2d2940',
    bgTint: '#f2f0f5',
    tagline: '在规则之上，看大局的人',
  },
};

export interface HogCharacter {
  id: string;              // kebab: 'harry', 'hermione', 'snape'…
  name: string;            // 哈利·波特
  nameEn: string;          // Harry Potter
  house: HogHouse;
  wand: string;            // 魔杖/标志物
  patronus: string;        // 守护神/象征
  archetype: string;       // "命运承担者"
  traits: [string, string, string];  // 3 条人格关键词
  essence: string;         // 一句话人格本质
  hookLine: string;        // 结果页 hero 下的 punch line
  narrative: string;       // 2-3 段深描（结果页主体）
  dialogueMarker: string;  // 角色口头禅 / 名场面
  socialShare: string;     // 分享文案（小红书/朋友圈）
}

export const HOG_CHARACTERS: HogCharacter[] = [
  {
    id: 'harry',
    name: '哈利·波特',
    nameEn: 'Harry Potter',
    house: 'gryffindor',
    wand: '冬青木 + 凤凰羽',
    patronus: '牡鹿',
    archetype: '命运承担者',
    traits: ['共情过载', '反权威直觉', '挡在朋友身前'],
    essence: '被选中的人，最后是自己选择了继续走。',
    hookLine: '你不是最聪明的，但你是那个一定会挡在前面的。',
    narrative:
      '你身上有一种"别人把事情扔给你，你也真的接住了"的钝感力。不是勇敢，是来不及害怕。\n' +
      '你对"不对劲的权威"有天然排斥，你会为了一件事跟整个体系撕起来——哪怕你自己都不确定赢得了。\n' +
      '你最大的温柔是：总是比自己先担心别人。你最大的痛是：总觉得"这事应该是我扛"。',
    dialogueMarker: '"Always."（但你是那个先说的人）',
    socialShare: '我在霍格沃茨被分成了哈利 · 牡鹿守护神 · 挡在朋友前面那种人',
  },
  {
    id: 'hermione',
    name: '赫敏·格兰杰',
    nameEn: 'Hermione Granger',
    house: 'gryffindor',
    wand: '葡萄藤木 + 龙心弦',
    patronus: '水獭',
    archetype: '秩序改良派学霸',
    traits: ['规则 + 改良', '情绪高控', '朋友的发动机'],
    essence: '不是卷，是"这件事值得被做对"。',
    hookLine: '你是那种会在图书馆哭完擦干净，继续把事情做完的人。',
    narrative:
      '你不是"天生学霸"，你是"我必须搞懂这件事不然今晚睡不着"的人。\n' +
      '你对规则的态度是：可以改，但必须先读一遍再骂。你在朋友圈是那个"提醒截止日期的人"，但真到事发你也是第一个扛的。\n' +
      '你最大的秘密是：你怕的不是考试，是"别人觉得你没那么努力"。',
    dialogueMarker: '"Books, and cleverness. There are more important things — friendship, and bravery."',
    socialShare: '我在霍格沃茨被分成了赫敏 · 水獭守护神 · 先读完规则再骂的学霸',
  },
  {
    id: 'ron',
    name: '罗恩·韦斯莱',
    nameEn: 'Ron Weasley',
    house: 'gryffindor',
    wand: '柳木 + 独角兽毛',
    patronus: '杰克罗素梗',
    archetype: '忠诚靠谱型朋友',
    traits: ['外强内弱', '关键时刻稳', '自嘲救场'],
    essence: '看起来是配角，到点总是在场。',
    hookLine: '你不是最亮的，但你是朋友真出事时唯一还在的那个。',
    narrative:
      '你有一个隐秘的对比焦虑：身边的人看起来都比你更优秀、更聪明、更被关注。\n' +
      '但你不抱怨，你用幽默兜着——你是朋友圈里那个"哎真的吗我信了"的人，大家笑着笑着就放松了。\n' +
      '你最大的优点是：你从不装。你最大的代价是：你总觉得自己"不够"。',
    dialogueMarker: '"Bloody hell."（附带一个真诚的表情）',
    socialShare: '我在霍格沃茨被分成了罗恩 · 朋友真出事才看出我靠谱那种',
  },
  {
    id: 'neville',
    name: '纳威·隆巴顿',
    nameEn: 'Neville Longbottom',
    house: 'gryffindor',
    wand: '樱桃木 + 独角兽毛',
    patronus: '狮子',
    archetype: '低开高走型英雄',
    traits: ['慢热', '温柔底色', '关键时刻硬核'],
    essence: '被低估一整个前期，到后期突然长出刺。',
    hookLine: '没人想到最后拔剑的会是你。',
    narrative:
      '你一路都在被低估：家里、学校、朋友圈。你习惯了"我可能不行"这种内心台词。\n' +
      '但你有一种很慢但不回头的成长速度——别人长得快的地方你也慢，别人停下的地方你还在走。\n' +
      '所以某一天你会发现：那些看不起你的事你都做完了，而且你不需要向任何人证明。',
    dialogueMarker: '"It\'s easy. Just... don\'t underestimate me."',
    socialShare: '我在霍格沃茨被分成了纳威 · 前期废柴后期拔剑那种',
  },
  {
    id: 'ginny',
    name: '金妮·韦斯莱',
    nameEn: 'Ginny Weasley',
    house: 'gryffindor',
    wand: '紫杉木 + 凤凰羽',
    patronus: '马',
    archetype: '明朗果敢型',
    traits: ['直接', '情绪在线', '不迎合'],
    essence: '你喜欢就喜欢、不喜欢就走、不解释。',
    hookLine: '你不是强势，你只是不太会演。',
    narrative:
      '你不是"社交力满级"，你是"不愿意为了让别人舒服而委屈自己"。\n' +
      '你对关系的判断很快：喜欢就靠近，讨厌就远离，中间选项你没有。\n' +
      '朋友觉得你酷，其实你只是活得比大多数人诚实——你不习惯"假装还好"。',
    dialogueMarker: '"The thing about growing up with Fred and George is that you start thinking anything\'s possible."',
    socialShare: '我在霍格沃茨被分成了金妮 · 直来直去不会演那种',
  },
  {
    id: 'luna',
    name: '卢娜·洛夫古德',
    nameEn: 'Luna Lovegood',
    house: 'ravenclaw',
    wand: '银椴木 + 独角兽毛',
    patronus: '兔子',
    archetype: 'i 人天选 · 钝感灵媒',
    traits: ['看得见别人看不见', '钝感自洽', '温柔孤独'],
    essence: '世界再怪，你都能过得很好。',
    hookLine: '你不是怪，你只是频道不一样。',
    narrative:
      '你在任何一个群里都像"从另一个宇宙来旅游的"——不是不合群，是你的参考系不一样。\n' +
      '你说的话别人经常听不懂，但你不焦虑；你被排挤过很多次，但你不记仇。\n' +
      '你最大的超能力是：你能让在你身边的人，突然变得不那么紧绷。',
    dialogueMarker: '"Things we lose have a way of coming back to us in the end."',
    socialShare: '我在霍格沃茨被分成了卢娜 · 频道对不上但活得最松的那种',
  },
  {
    id: 'cho',
    name: '秋·张',
    nameEn: 'Cho Chang',
    house: 'ravenclaw',
    wand: '未记录',
    patronus: '天鹅',
    archetype: '高共情敏感型',
    traits: ['情绪细腻', '在意他人眼光', '容易内耗'],
    essence: '你不是矫情，你只是感受比别人多三倍。',
    hookLine: '你是群里那个"她怎么没回消息"会影响你一整天的人。',
    narrative:
      '你对情绪的感受比大部分人丰富得多，一个眼神、一句语气不对，你都会在脑内反复回放。\n' +
      '你会觉得"我是不是太在意了"，但其实是你真实地在接收所有信号。\n' +
      '你最大的礼物是——你能让别人觉得"我被看见了"；你最大的课题是：也允许自己被看见。',
    dialogueMarker: '"I don\'t know how to...""（然后眼圈就红了）',
    socialShare: '我在霍格沃茨被分成了秋张 · 别人一句话我脑内剧场三小时',
  },
  {
    id: 'cedric',
    name: '塞德里克·迪戈里',
    nameEn: 'Cedric Diggory',
    house: 'hufflepuff',
    wand: '白蜡木 + 独角兽毛',
    patronus: '雪鸮',
    archetype: '黄金团宠型',
    traits: ['情商在线', '公平正派', '不动声色地优秀'],
    essence: '你不用抢 C 位，你一到就自然是 C 位。',
    hookLine: '你就是那种"大家都说他挺好"的人——而且是真的挺好。',
    narrative:
      '你是那种"群里一说某某真的挺好"所有人都会点头的人。你不炫耀、不抢话，但关键时刻你的名字会被第一个想起。\n' +
      '你的优秀是低成本的——不是你没用力，是你从不拿优秀当武器。\n' +
      '你最大的隐痛是：别人对你的期待太高，你偶尔也想"我也可以普通一次吗"。',
    dialogueMarker: '"Take it. Take it and win."',
    socialShare: '我在霍格沃茨被分成了塞德里克 · 大家都说我挺好但我也很累',
  },
  {
    id: 'newt',
    name: '纽特·斯卡曼德',
    nameEn: 'Newt Scamander',
    house: 'hufflepuff',
    wand: '山梨木 + 独角兽毛',
    patronus: '未记录',
    archetype: '动物系 · 温柔研究者',
    traits: ['眼神躲闪但心意笃定', '对万物温柔', '讨厌人群'],
    essence: '人难理解，动物懂我。',
    hookLine: '你对人客气，对动物/兴趣是真爱。',
    narrative:
      '你可能社交恐惧，但你对一件事可以专注到让所有人闭嘴。\n' +
      '你不需要"被认可"这种东西，你需要的是"别人别打扰我搞我的"。\n' +
      '你最大的魅力是：你把温柔给了所有生命（除了人），你最大的代价是：别人觉得你"不好接近"。',
    dialogueMarker: '"My philosophy is that worrying means you suffer twice."',
    socialShare: '我在霍格沃茨被分成了纽特 · 对人客气对兴趣死磕那种',
  },
  {
    id: 'draco',
    name: '德拉科·马尔福',
    nameEn: 'Draco Malfoy',
    house: 'slytherin',
    wand: '山楂木 + 独角兽毛',
    patronus: '未习得',
    archetype: '体面焦虑 · 家族重负',
    traits: ['表面傲', '内心怕', '被身份绑架'],
    essence: '你不是坏，你是被压得太久。',
    hookLine: '你挑剔别人的时候，其实是在挑剔自己。',
    narrative:
      '你从小被教育"你必须是某种人"，你用刻薄当壳子，因为那是你最快保护自己的方式。\n' +
      '你看起来自信，其实你很怕失控——你怕"被看穿"，怕"原来我也没那么特别"。\n' +
      '你最大的转变时刻，是你第一次承认"其实我不想这样"。',
    dialogueMarker: '"I have to do this. He\'ll kill me."',
    socialShare: '我在霍格沃茨被分成了德拉科 · 表面高傲内心慌那种',
  },
  {
    id: 'snape',
    name: '西弗勒斯·斯内普',
    nameEn: 'Severus Snape',
    house: 'slytherin',
    wand: '未记录',
    patronus: '牝鹿',
    archetype: '外冷内热 · 执念型深情',
    traits: ['嘴刀', '长情', '一个人扛'],
    essence: '你记仇、你挑剔，但你从没放弃过你真正在乎的那个人。',
    hookLine: '你不主动、不解释，但你一直都在。',
    narrative:
      '你有一种别人看不懂的"爱法"——刻薄是你的盾，沉默是你的表白。\n' +
      '你不擅长开心地跟人相处，你擅长的是"在你看不到的地方替你扛一件很重的事"。\n' +
      '别人说你情商低，只有一个人明白：你的情商全用在"把自己的感情藏起来"这件事上了。',
    dialogueMarker: '"Always."',
    socialShare: '我在霍格沃茨被分成了斯内普 · 嘴最毒的那个其实爱得最深',
  },
  {
    id: 'bellatrix',
    name: '贝拉特里克斯·莱斯特兰奇',
    nameEn: 'Bellatrix Lestrange',
    house: 'slytherin',
    wand: '胡桃木 + 龙心弦',
    patronus: '未记录',
    archetype: '疯批 · 极端忠诚',
    traits: ['浓度高', '用力过猛', '爱恨分明'],
    essence: '你不做中间态，你只做 0 或 100。',
    hookLine: '你喜欢谁，就是把命都给出去那种喜欢。',
    narrative:
      '你是朋友圈里"浓度最高"的那个人——爱起来吓人、恨起来也吓人。\n' +
      '别人觉得你"疯"，但你知道你只是"真"到不管不顾。\n' +
      '你最吸引人的地方是：你把所有感情都拉到肉眼可见。你最危险的是：你也会因此反噬自己。',
    dialogueMarker: '(大笑三声)',
    socialShare: '我在霍格沃茨被分成了贝拉 · 爱与恨都开到最大那种',
  },
  {
    id: 'dumbledore',
    name: '阿不思·邓布利多',
    nameEn: 'Albus Dumbledore',
    house: 'faculty',
    wand: '接骨木魔杖',
    patronus: '凤凰',
    archetype: '操盘手 · 理想主义智者',
    traits: ['看全局', '带着旧伤做决定', '温柔但狠'],
    essence: '你不是最强的，你是最能背锅的。',
    hookLine: '你是朋友圈里被当作"主心骨"的那个——连你自己都没办法。',
    narrative:
      '你被很多人当"大人"——但你也有一个没人知道的、年轻时做错过的事情。\n' +
      '你做决定时会把更多人、更长远的代价都算进去，所以你显得"冷"。\n' +
      '你最大的孤独是：你永远知道全局，却永远不能把全局完整地告诉任何人。',
    dialogueMarker: '"It is our choices that show what we truly are."',
    socialShare: '我在霍格沃茨被分成了邓布利多 · 看全局但一个人扛的那种',
  },
  {
    id: 'mcgonagall',
    name: '米勒娃·麦格',
    nameEn: 'Minerva McGonagall',
    house: 'faculty',
    wand: '松木',
    patronus: '虎斑猫',
    archetype: '严母型领导',
    traits: ['刀子嘴豆腐心', '秩序守护', '最后出手'],
    essence: '你骂人最凶，但真事发生你第一个挡在学生前面。',
    hookLine: '大家怕你，但大家也只信你。',
    narrative:
      '你对规则有宗教般的坚持，但你更坚持"规则是为人服务的，不是反过来"。\n' +
      '你骂人的时候锋利得像刀，替人挡事的时候安静得像墙。\n' +
      '你最怕的不是敌人，是"自己人把事情做不好"——你不会说出口，但你会替他们擦三次屁股。',
    dialogueMarker: '"Have a biscuit, Potter."',
    socialShare: '我在霍格沃茨被分成了麦格教授 · 骂得最狠护得最紧',
  },
  {
    id: 'hagrid',
    name: '鲁伯·海格',
    nameEn: 'Rubeus Hagrid',
    house: 'faculty',
    wand: '橡木伞杖',
    patronus: '未记录',
    archetype: '稳定情绪大型金毛',
    traits: ['大嗓门', '情绪稳定', '无条件爱人'],
    essence: '你不聪明，但你是所有朋友的情绪基石。',
    hookLine: '你在，大家就心安；你在笑，大家就敢笑。',
    narrative:
      '你是那种"聊两句就觉得被接住了"的人。你不擅长给建议，你擅长给"没关系"。\n' +
      '你不算精明，但你有一种不可替代的东西：你让周围人敢暴露脆弱。\n' +
      '你最大的委屈是：你对所有人都温柔，但总觉得"没人真的懂你"。',
    dialogueMarker: '"Yer a wizard, Harry."',
    socialShare: '我在霍格沃茨被分成了海格 · 朋友都在我这躲雨的大型金毛',
  },
];

export function getHogCharacter(id: string): HogCharacter | undefined {
  return HOG_CHARACTERS.find(c => c.id === id);
}

export function getHogHouse(house: HogHouse): HogHouseInfo {
  return HOG_HOUSES[house];
}
