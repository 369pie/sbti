/**
 * XPTI 场景化对话脚本 ── 12 个真实场景 × 3-4 轮对答
 *
 * 替代 24 条孤立的 OPENERS。每个脚本是一组完整的"我说 → ta 接 → 我回"对话，
 * 让用户拿到的不是「一句话」而是「一段可演练的剧本」——这是付费深档相对于
 * 免费摘要的核心增值。
 */

export interface DialogueTurn {
  speaker: 'you' | 'them';
  line: string;
  /** Optional director's note shown in italics under the line. */
  note?: string;
}

export interface DialogueScript {
  id: string;
  scenario: string;
  /** Eyebrow line — short context tag, e.g. "FIRST DATE · 试探". */
  eyebrow: string;
  /** Outcome / what this script is trying to achieve. */
  goal: string;
  turns: DialogueTurn[];
}

export const DIALOGUE_SCRIPTS: DialogueScript[] = [
  {
    id: 'first-date-vulnerability',
    scenario: '初次约会 · 不靠技巧的破冰',
    eyebrow: 'FIRST DATE · 软裸露',
    goal: '在第一次见面就给对方一个"被信任"的瞬间，过滤掉只想表演的人。',
    turns: [
      { speaker: 'you', line: '我先说一件今天有点丢脸的事——出门前我换了三套衣服，最后还是穿了第一套。', note: '主动暴露一个无关紧要的小狼狈，邀请对方跟进。' },
      { speaker: 'them', line: '哈哈，那你现在这套挺好看的。' },
      { speaker: 'you', line: '谢谢。我换衣服那种纠结，其实是因为我有点想被你喜欢。你呢，今天有没有为见我做什么有点傻的事？', note: '把"想被喜欢"摆到桌上，不藏。' },
      { speaker: 'them', line: '……我提前一小时就到了，在隔壁咖啡店坐了一杯。' },
    ],
  },
  {
    id: 'first-date-boundary',
    scenario: '初次约会 · 提前划边界',
    eyebrow: 'FIRST DATE · 边界',
    goal: '在还没暧昧之前，把"我不喜欢什么"说清楚——比事后纠正轻松十倍。',
    turns: [
      { speaker: 'you', line: '我有个习惯——晚上 11 点之后基本不回消息了，不是冷淡，是我那个时段在写自己的日记。' },
      { speaker: 'them', line: '哦？日记还有什么内容？' },
      { speaker: 'you', line: '主要是把今天遇到的人和情绪整理一遍。所以如果以后我们在聊，我突然消失，是去赴自己的约，不是赴前任的约——这个我先讲清楚。', note: '把"消失"重新定义成"赴自己的约"，避免日后被误解。' },
    ],
  },
  {
    id: 'cold-war-restart',
    scenario: '冷战后 · 重新打开窗口',
    eyebrow: 'AFTER FIGHT · 主动重启',
    goal: '不道歉、不认输、但把对话拉回桌面——给冷战一个体面的出口。',
    turns: [
      { speaker: 'you', line: '我不是来道歉的——道歉等我们都说完话再决定。我现在只是想问你一句：你愿意听我把那天没说完的两句话讲完吗？', note: '把"道歉"和"对话"拆开，给对方台阶但不交底牌。' },
      { speaker: 'them', line: '……你说。' },
      { speaker: 'you', line: '第一句：那天我升级到你妈妈的话题，是我错。第二句：但我那时候真正想说的是——我害怕你又把我推开。', note: '一句认错 + 一句揭真实情绪，节奏 1:1。' },
      { speaker: 'them', line: '……我也害怕。' },
    ],
  },
  {
    id: 'request-affection',
    scenario: '想被夸 · 但不想做猜谜游戏',
    eyebrow: 'EVERYDAY · 直球求爱',
    goal: '把"我想被夸"从隐性需求变成明示请求——训练对方接住你的小请求。',
    turns: [
      { speaker: 'you', line: '我有一个很小但很傻的请求——我今天想被夸今天好看，可以吗？' },
      { speaker: 'them', line: '哈哈当然可以——你今天穿得很温柔。' },
      { speaker: 'you', line: '谢谢。我以前很难说出"我想被夸"这种话，因为觉得自己很不酷。但我发现你接住它的样子，反而让我更想下次还告诉你。', note: '完成"请求 → 接住 → 反馈"闭环，训练成习惯。' },
    ],
  },
  {
    id: 'sexual-script-revision',
    scenario: '亲密关系 · 修订脚本',
    eyebrow: 'INTIMACY · 改剧本',
    goal: '把"今晚不行"从冷场升级成"我们换一个剧本"——保护双方的体面感。',
    turns: [
      { speaker: 'you', line: '我今晚有点没在状态——但我不想直接关灯睡觉。我们换一个剧本好不好？' },
      { speaker: 'them', line: '什么剧本？' },
      { speaker: 'you', line: '你来读那本你上次买的诗集，我躺你旁边听。如果我中途睡着，就当今天的谢幕。', note: '给"不行"一个升华版，不是拒绝是替代方案。' },
    ],
  },
  {
    id: 'long-distance-checkin',
    scenario: '异地 · 不靠刷屏的连接',
    eyebrow: 'LONG DISTANCE · 报情绪',
    goal: '建立"情绪温度报告"机制，比每天问"在干嘛"高级一百倍。',
    turns: [
      { speaker: 'you', line: '我今天的天气是阴转小雨——不是难过，就是脑子有点湿。你呢？', note: '用天气类比情绪，比直接问"心情怎么样"低压。' },
      { speaker: 'them', line: '我是晴。下午开了个会有点上头。' },
      { speaker: 'you', line: '收到。那今晚我不来抢你的晴，我们各自高质量晚安。明天我换个心情再来找你。', note: '尊重对方此刻的好状态，不强行进场。' },
    ],
  },
  {
    id: 'jealousy-disclosure',
    scenario: '吃醋 · 不发酵直接说',
    eyebrow: 'JEALOUSY · 提前止血',
    goal: '把"我吃醋了"从内心戏变成轻量公告——避免沉默累积成大爆。',
    turns: [
      { speaker: 'you', line: '我有个事先告诉你——你刚才提到 ___ 那个人的时候，我有一秒钟不舒服。' },
      { speaker: 'them', line: '啊？为什么？' },
      { speaker: 'you', line: '我不知道。我也没要你解释，我只是在练习——以后只要这种感觉冒出来，我就第一时间告诉你，而不是忍三天再爆。', note: '把吃醋"工具化"——它是练习不是指控。' },
      { speaker: 'them', line: '好，那我也告诉你——其实那个人对我来说真的就是普通同事。' },
    ],
  },
  {
    id: 'apology-real',
    scenario: '真道歉 · 不带"但是"',
    eyebrow: 'APOLOGY · 不打折',
    goal: '示范一个不夹辩护的道歉模板——大多数关系崩在"道歉里塞理由"。',
    turns: [
      { speaker: 'you', line: '昨天我那句话伤到你了。我没有任何"但是"——我说错了，对不起。', note: '一句话三件事：定义事件 + 不辩护 + 真道歉。' },
      { speaker: 'them', line: '……谢谢你这么说。' },
      { speaker: 'you', line: '我会记住的——下次我那种情绪上来时，我会先离开两分钟再说话。这是我对你的承诺，不是借口。', note: '道歉之后给一个具体行动承诺，把空话换成约定。' },
    ],
  },
  {
    id: 'reject-without-cold',
    scenario: '拒绝 · 但不冷冻',
    eyebrow: 'REJECT · 软拒',
    goal: '说"不"但保留温度——避免每次拒绝都让对方质疑关系。',
    turns: [
      { speaker: 'them', line: '今晚一起吃饭吧？' },
      { speaker: 'you', line: '今晚不行——但不是不想见你，是我答应自己今晚要写完那篇东西。明天晚上呢？我给你留整晚。', note: '"不"+理由+主动反向邀请，缺一不可。' },
      { speaker: 'them', line: '好，那明天见。' },
    ],
  },
  {
    id: 'first-i-want-you',
    scenario: '第一次说"我想要你"',
    eyebrow: 'INTIMACY · 第一次裸露',
    goal: '把"我想要你"从生理表达升级为情感声明——更高浓度，更难被忽略。',
    turns: [
      { speaker: 'you', line: '我有件事一直没敢说——我想要你。不是某个具体的动作，是想要你这个人在我身边的样子。', note: '把"想要"重新定义成对人的渴望，不只是身体。' },
      { speaker: 'them', line: '……我也是。' },
      { speaker: 'you', line: '那我们就把这句话当成今天的小仪式——以后每个月找一天再讲一遍，看看会不会变。', note: '用"仪式化复述"避免初次表白后归于沉默。' },
    ],
  },
  {
    id: 'partner-emo-hold',
    scenario: '陪 emo · 不解决问题',
    eyebrow: 'EMO · 只是陪着',
    goal: '抵抗"立刻给方案"的冲动，把陪伴变成主菜不是配菜。',
    turns: [
      { speaker: 'them', line: '我今天真的太烂了，什么都做不好。' },
      { speaker: 'you', line: '我现在不打算劝你，也不分析。我先在这里陪你 20 分钟，你想说就说，不想说就靠着我。', note: '提前明确"我不分析"，关闭对方的防御机制。' },
      { speaker: 'them', line: '……谢谢。' },
      { speaker: 'you', line: '嗯。20 分钟之后如果你想要我说什么，我再说；如果你想自己消化，我就继续陪着不出声。', note: '把陪伴拆成两段，让对方有节奏感。' },
    ],
  },
  {
    id: 'breakup-final',
    scenario: '提分手 · 不诅咒不挽留',
    eyebrow: 'BREAK UP · 体面收尾',
    goal: '提供一个不带恨意的告别脚本——日后偶遇时还能正常打招呼。',
    turns: [
      { speaker: 'you', line: '我想我们走到了一个需要重新做选择的时刻。我想停在这里，不是因为你不好，是因为我们的节奏已经不再合拍了。', note: '不归咎对方人品，只承认"节奏"。' },
      { speaker: 'them', line: '……为什么？' },
      { speaker: 'you', line: '具体的我不打算逐条复盘——再讲一遍只会变成相互伤害。我只想说一句：谢谢你曾经走进来过。剩下的我希望我们各自留点体面。', note: '拒绝复盘 = 拒绝二次伤害，是一种保护对方的成熟。' },
    ],
  },
];

/**
 * Pick N scripts deterministically by personality slug.
 * Uses a simple FNV-1a-style mix to keep pick stable across renders.
 */
export function pickDialogueScripts(slug: string, count = 6): DialogueScript[] {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const seed = Math.abs(h);
  const offset = seed % DIALOGUE_SCRIPTS.length;
  return Array.from({ length: count }, (_, i) =>
    DIALOGUE_SCRIPTS[(offset + i) % DIALOGUE_SCRIPTS.length],
  );
}
