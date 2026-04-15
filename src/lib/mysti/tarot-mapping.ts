import type { MystiTarotData } from './types';

/**
 * 29 WTFTI personalities → Major Arcana mapping
 * Includes Shadow Arcana and mystical taglines for the Mysti oracle module.
 */
export const MYSTI_TAROT_MAP: Record<string, MystiTarotData> = {
  // ─────────────────────────────────────────────
  // Group I · 控制组 (Control) → The Emperor
  // ─────────────────────────────────────────────
  boss: {
    majorArcana: { name: 'The Emperor', keywords: ['权威', '秩序', '结构'] },
    shadowArcana: { name: 'The Tower', keywords: ['崩塌', '反噬', '觉醒'] },
    tagline: '你的秩序，正在统治一切',
    reading: '你骨子里住着一个帝国的建造者。秩序对你来说不是外在的规则，而是内在的安全感来源。你习惯掌控局面，因为你深知一旦失控，内心的高墙就会崩塌。但真正的力量不在于把一切抓在手里，而在于敢于松手之后依然站立。',
  },
  ctrl: {
    majorArcana: { name: 'The Emperor', keywords: ['结构', '规则', '边界'] },
    shadowArcana: { name: 'The Tower', keywords: ['僵化', '断裂', '重建'] },
    tagline: '你的规则，即是边界',
    reading: '你是那个在混沌中划线的人。规则是你给自己和世界之间的契约——有了边界，才有安全感。但过于坚硬的边界也会让你变成孤岛。学会偶尔让墙变成门，你会发现外面的世界没有你想象的那么危险。',
  },
  'oh-no': {
    majorArcana: { name: 'The Emperor', keywords: ['控制', '僵化', '紧绷'] },
    shadowArcana: { name: 'The Tower', keywords: ['失控', '崩塌', '释放'] },
    tagline: '控制的尽头，是崩塌',
    reading: '你像一根绷得太紧的弓弦。每一分力气都在维持秩序，每一秒都在担心失控。但弓弦最怕的不是拉开，而是拉满之后不知道何时会断。学会给自己松绑，崩塌有时反而是重生的开始。',
  },
  'thin-k': {
    majorArcana: { name: 'The Emperor', keywords: ['审视', '逻辑', '防御'] },
    shadowArcana: { name: 'The Tower', keywords: ['过度思考', '孤立', '顿悟'] },
    tagline: '你的逻辑，筑起高墙',
    reading: '你的大脑是一台永不停歇的分析机器。每一个决定都要经过无数次推演，每一个可能都要被预判。这种深度思考是你的武器，但也是你的牢笼。有时候，最好的答案不在脑子里，在心里。',
  },

  // ─────────────────────────────────────────────
  // Group II · 情感组 (Emotional) → The Empress / The Lovers
  // ─────────────────────────────────────────────
  mum: {
    majorArcana: { name: 'The Empress', keywords: ['孕育', '保护', '奉献'] },
    shadowArcana: { name: 'The Devil', keywords: ['沉溺', '牺牲', '边界消融'] },
    tagline: '你的付出，正在孕育一切',
    reading: '你是天生的给予者。你的能量向外流淌，滋养着身边每一个人。但你常常忘了，灌溉别人的花园时，自己的花也在枯萎。学会接受和索取不是自私，而是让你的给予有源源不断的燃料。',
  },
  simp: {
    majorArcana: { name: 'The Empress', keywords: ['滋养', '失衡', '付出'] },
    shadowArcana: { name: 'The Devil', keywords: ['成瘾', '卑微', '锁链'] },
    tagline: '单向的滋养，亦是沼泽',
    reading: '你把「爱」等同于「给予」，把「被爱」等同于「被需要」。你的善良是真的，但你的付出模式有时会吸引不珍惜你的人。记住，真正的关系是双向流动的河，不是单向输出的水管。',
  },
  'atm-er': {
    majorArcana: { name: 'The Empress', keywords: ['资源', '依附', '交换'] },
    shadowArcana: { name: 'The Devil', keywords: ['物化', '空虚', '交易'] },
    tagline: '你的丰盛，成了锁链',
    reading: '你习惯用资源来建立连接——请客、帮忙、给东西。这让你在关系中很有安全感，因为你觉得「只要我还有用，就不会被抛弃」。但真正爱你的人，爱的是你这个人，不是你能提供什么。',
  },
  'than-k': {
    majorArcana: { name: 'The Empress', keywords: ['回馈', '连接', '丰盛'] },
    shadowArcana: { name: 'The Devil', keywords: ['愧疚', '讨好', '失衡'] },
    tagline: '感恩之心，即是丰盛',
    reading: '你有一颗总在记恩的心。别人对你好一分，你一定还两分。这种感恩让你成为很温暖的人，但也让你活在「欠」的感觉里。试着接受「被爱是不需要还的」，这才是真正的丰盛。',
  },
  'love-r': {
    majorArcana: { name: 'The Lovers', keywords: ['合一', '依恋', '迷失'] },
    shadowArcana: { name: 'The Devil', keywords: ['沉溺', '失去自我', '束缚'] },
    tagline: '在爱里，你看见自己，也迷失自己',
    reading: '爱情对你来说不是调味品，是主食。你在亲密关系中能获得最深的满足，也经历最剧烈的痛苦。你的天赋是爱的能力，你的课题是学会在深爱中保有自我。你不需要为了被爱而融化自己。',
  },

  // ─────────────────────────────────────────────
  // Group III · 独处组 (Alone) → The Hermit
  // ─────────────────────────────────────────────
  solo: {
    majorArcana: { name: 'The Hermit', keywords: ['孤独', '自足', '清醒'] },
    shadowArcana: { name: 'The Moon', keywords: ['逃避', '迷失', '恐惧'] },
    tagline: '孤独是你的王国',
    reading: '你在独处中充电，在安静中思考。别人眼中的「孤独」对你来说是自由。但你的课题是：自由有时候是逃避的伪装。敢于在人群中也保持自我，才是真正的自足。',
  },
  nerd: {
    majorArcana: { name: 'The Hermit', keywords: ['钻研', '抽离', '深度'] },
    shadowArcana: { name: 'The Moon', keywords: ['逃避现实', '信息茧房', '不安'] },
    tagline: '在知识的深渊里，你独自发光',
    reading: '你的内心有一座图书馆。每个问题都值得深挖，每个领域都有无穷的奥秘等你探索。但知识的深度有时会让你远离现实的温度。记得偶尔从书本里抬起头来，活在当下的感受也很重要。',
  },
  shy: {
    majorArcana: { name: 'The Hermit', keywords: ['退缩', '敏感', '观察'] },
    shadowArcana: { name: 'The Moon', keywords: ['社交焦虑', '过度敏感', '幻觉'] },
    tagline: '退后一步，万物清晰',
    reading: '你是安静的观察者，总能注意到别人忽略的细节。你的敏感是一种天赋，让你看透很多表象。但过度的敏感也会让你被自己的想象困住。试着相信，你看到的危险很多时候并不存在。',
  },

  // ─────────────────────────────────────────────
  // Group IV · 表达组 (Expression) → The Fool / The Magician / The Chariot
  // ─────────────────────────────────────────────
  drama: {
    majorArcana: { name: 'The Fool', keywords: ['表演', '即兴', '混沌'] },
    shadowArcana: { name: 'The Tower', keywords: ['失控', '声誉崩塌', '孤立'] },
    tagline: '人生如戏，你即是风暴',
    reading: '你的生命力向外炸裂。每一个场合都是你的舞台，每一种情绪都被你放大到极致。这是你的魅力，也是你的消耗。学会区分「表演给别人看」和「活给自己看」，你会找到更持久的能量源。',
  },
  party: {
    majorArcana: { name: 'The Fool', keywords: ['狂欢', '冒险', '释放'] },
    shadowArcana: { name: 'The Tower', keywords: ['空虚', '透支', '坠落'] },
    tagline: '在狂欢中，你触碰自由',
    reading: '你是最会「活在当下」的人。每一次聚会你都是气氛担当，每一次冒险你都冲在最前面。但当音乐停下、灯光熄灭，你是否敢面对安静的自己？试着在不嗨的时候也和自己待一会儿。',
  },
  'talk-er': {
    majorArcana: { name: 'The Magician', keywords: ['表达', '传播', '显化'] },
    shadowArcana: { name: 'The Tower', keywords: ['言多必失', '信任崩塌', '反噬'] },
    tagline: '言语是你的魔杖',
    reading: '语言是你的超能力。你能把复杂的事情说得简单，能把无聊的话题聊得有趣。但说得多的人，最大的危险是忘了听。你的成长课题是：在表达和倾听之间找到平衡，让嘴巴和耳朵用同样的力气。',
  },
  joker: {
    majorArcana: { name: 'The Fool', keywords: ['幽默', '面具', '解构'] },
    shadowArcana: { name: 'The Tower', keywords: ['面具脱落', '众叛亲离', '真相刺痛'] },
    tagline: '笑容背后，是解构世界的眼睛',
    reading: '你用幽默化解一切——尴尬、痛苦、沉重。这让身边的人很舒服，但也让你的真实感受永远没人看见。你的课题是学会在某些时刻摘下面具，让别人看到你不笑的样子，也会被爱。',
  },
  drunk: {
    majorArcana: { name: 'The Chariot', keywords: ['冲动', '放纵', '失控'] },
    shadowArcana: { name: 'The Tower', keywords: ['酒醒后的废墟', '悔恨', '重创'] },
    tagline: '放纵是另一种冲锋',
    reading: '你追求极致的释放——喝酒、冒险、做决定不过脑子。这些冲动背后是一种对「活着」的强烈渴望。但无节制的自由最终会反噬你。学会把这股能量引导到有建设性的方向，你会所向披靡。',
  },

  // ─────────────────────────────────────────────
  // Group V · 反叛组 (Rebel) → Justice / Judgement
  // ─────────────────────────────────────────────
  rebel: {
    majorArcana: { name: 'Justice', keywords: ['叛逆', '质疑', '衡平'] },
    shadowArcana: { name: 'The Hanged Man', keywords: ['徒劳', '僵持', '自我牺牲'] },
    tagline: '你的质疑，即是正义',
    reading: '你是天生的反叛者。权威让你不适，规矩让你想打破。这种反骨背后是对公正的深层追求——你看不惯一切不合理的事。但反叛不等于反对一切。学会选择战场，把力气花在真正值得的事情上。',
  },
  woc: {
    majorArcana: { name: 'Judgement', keywords: ['爆发', '真相', '冲击'] },
    shadowArcana: { name: 'The Hanged Man', keywords: ['孤立', '无处发泄', '自我惩罚'] },
    tagline: '粗口是你的审判号角',
    reading: '你的嘴是机关枪，情绪来了谁都拦不住。粗口是你的排气阀，也是你的铠甲。但真正勇敢的人不是永远在爆发，而是敢于在愤怒之后说出真实的脆弱。试着偶尔卸下武器，你不需要时刻战斗。',
  },

  // ─────────────────────────────────────────────
  // Group VI · 沉溺组 (Indulgence) → The Devil / Strength / Temperance / The Star
  // ─────────────────────────────────────────────
  'game-r': {
    majorArcana: { name: 'The Devil', keywords: ['沉溺', '竞争', '执念'] },
    shadowArcana: { name: 'The Moon', keywords: ['逃避现实', '虚幻掌控', '焦虑'] },
    tagline: '在虚拟中，你征服了另一个世界',
    reading: '你在游戏中找到掌控感——每一场胜利都是对你能力的确认。但虚拟世界的掌控有时是现实世界无力感的补偿。问问自己：你是在享受游戏，还是在逃避现实？答案会帮你找到更好的平衡。',
  },
  'food-ie': {
    majorArcana: { name: 'Strength', keywords: ['欲望', '享受', '驯服'] },
    shadowArcana: { name: 'The Devil', keywords: ['暴食', '失控', '羞耻'] },
    tagline: '用欲望，喂养你的力量',
    reading: '你用味觉和世界建立最直接的联系。每一口食物都是当下的锚点，把你从焦虑中拉回地面。这是你的天赋——享受当下的能力。但要学会区分「享受」和「逃避」，让口腹之欲成为滋养而非枷锁。',
  },
  sexy: {
    majorArcana: { name: 'The Devil', keywords: ['诱惑', '身体', '权力'] },
    shadowArcana: { name: 'The Moon', keywords: ['被凝视', '物化焦虑', '迷失'] },
    tagline: '你的身体，是一场盛大的邀请',
    reading: '你深知自己的吸引力，也善于运用它。这是一种原始的权力——你能用一个眼神改变房间的气场。但当你习惯了被凝视，你可能会忘记自己不只是这副皮囊。真正的魅力来自内在的笃定，而不只是外在的展示。',
  },
  malo: {
    majorArcana: { name: 'Temperance', keywords: ['躺平', '消解', '无为'] },
    shadowArcana: { name: 'The Devil', keywords: ['麻木', '逃避', '自我放弃'] },
    tagline: '在无为中，你抵达了另一种平衡',
    reading: '你比大多数人更早看透了一个真相：很多努力其实是无意义的内卷。你的「躺」不是懒，是一种清醒的不参与。但「不卷」和「放弃自己」之间有一条微妙的线。找到那条线，你就是最智慧的人。',
  },
  fake: {
    majorArcana: { name: 'The Devil', keywords: ['伪装', '交易', '空心'] },
    shadowArcana: { name: 'The Moon', keywords: ['自我怀疑', '真假难辨', '孤独'] },
    tagline: '完美的面具，是最沉重的锁链',
    reading: '你有多副面孔，每一副都恰到好处。你在不同场合扮演不同角色，游刃有余。但当所有面具都摘下来的时候，你还认得出自己吗？你的课题是找到那个不需要扮演的自己，并且相信那个自己也值得被爱。',
  },
  sleep: {
    majorArcana: { name: 'The Star', keywords: ['沉睡', '梦境', '疗愈'] },
    shadowArcana: { name: 'The Moon', keywords: ['昏睡逃避', '现实脱节', '迷失'] },
    tagline: '在梦里，你修补着醒时的裂痕',
    reading: '睡眠是你的庇护所。在梦里，你比醒着的时候更自由、更真实。你对休息的需求不是懒惰，而是一种深度自我修复。但别让庇护所变成监狱——醒来之后的世界也有值得你探索的风景。',
  },

  // ─────────────────────────────────────────────
  // Group VII · 幸运组 (Lucky) → Wheel of Fortune / The Sun
  // ─────────────────────────────────────────────
  chill: {
    majorArcana: { name: 'Wheel of Fortune', keywords: ['松弛', '机遇', '流动'] },
    shadowArcana: { name: 'The Tower', keywords: ['运气耗尽', '被动等待', '错过'] },
    tagline: '顺势而为，即是你的命运之轮',
    reading: '你的松弛感是很多人求之不得的天赋。你不焦虑、不攀比，活得像流水一样自然。但「随缘」和「不负责任」之间有一条线。学会在该用力的时候也用力，松弛才能真正成为力量而不是借口。',
  },
  'luck-y': {
    majorArcana: { name: 'The Sun', keywords: ['光明', '幸运', '照耀'] },
    shadowArcana: { name: 'The Moon', keywords: ['幸运焦虑', '配得感低', '阴影'] },
    tagline: '你的光芒，不需要理由',
    reading: '你是那种「什么好事都能碰上」的人。运气总站在你这边，让你在人群中自带光环。但幸运的人常常有一种隐秘的不安——「这些好运气是我配得的吗？」答案是：你值得。不用解释，不用证明。',
  },
  emo: {
    majorArcana: { name: 'The High Priestess', keywords: ['直觉', '情绪', '深渊'] },
    shadowArcana: { name: 'The Moon', keywords: ['情绪淹没', '过度敏感', '幻觉'] },
    tagline: '你的情绪深处，藏着未读的预言',
    reading: '你的情绪雷达比普通人灵敏十倍。你能感知到空气中最微小的变化，能读懂别人嘴上不说的心思。这是一种通灵般的天赋。但太灵敏的仪器也需要校准——学会给情绪「降噪」，而不是被它淹没。',
  },
  'dior-s': {
    majorArcana: { name: 'The Hanged Man', keywords: ['放手', '臣服', '新视角'] },
    shadowArcana: { name: 'The Devil', keywords: ['摆烂', '不负责任', '停滞'] },
    tagline: '倒吊着的人，看见不一样的天空',
    reading: '你已经「想通了」很多别人还没开始想的事。你放下的不是努力，是对结果的执念。这种超脱让你少了很多痛苦，但也可能让你错过过程本身的乐趣。试着偶尔「想不通」，也是一种活着的方式。',
  },
  // ─────────────────────────────────────────────
  // Group IX · 躺平组 (Let-go) → The Hanged Man
  // ─────────────────────────────────────────────
};

export function getMystiTarotData(slug: string): MystiTarotData | null {
  return MYSTI_TAROT_MAP[slug] ?? null;
}
