// ─── XPTI 恋爱XP体质 · 全卡面模式（文字烘焙进图） ───
// 16 种恋爱XP体质角色，充气潮玩Q版盲盒风
// 粉紫色调为主，女性向传播友好
// 使用 cardMode: 人格名、代号、标签、金句等文案烘焙在图里

function type(slug, concept, card) {
  return { slug, ref: `love-${slug}.png`, concept, card };
}

// 部分 slug 没有对应 love-* 图，用其他 ref 代替
function typeWithRef(slug, ref, concept, card) {
  return { slug, ref, concept, card };
}

const xptiImageModule = {
  displayName: 'XPTI 恋爱XP体质 Card Generator',
  seriesLabel: 'XPTI 恋爱XP体质',
  outputPrefix: 'xpti',
  artStyle: 'inflatable-vinyl',
  cardMode: true,
  aspectRatio: '3:4',
  themeColor: '粉紫渐变暖色调',
  seriesTone:
    '把角色语境切到恋爱XP世界。所有角色都是漂亮精致的年轻女生形象——纤细苗条身材、精致五官、时尚穿搭，' +
    '让女性用户看了会觉得"好美好想当她"的审美水平。' +
    '每张图都要像"恋爱体质 × 潮玩盲盒"的原创梗图角色：可爱Q版但不丑化、粉紫色系、浪漫道具和自嘲感同时成立。' +
    '服装、表情、配色和道具要一眼看懂这个角色的恋爱XP是什么，适合女性用户截图分享到小红书。' +
    '整体风格像 Popmart/Molly 盲盒收藏卡片，角色精致漂亮，不要复杂背景，不要 logo。',
  types: [
    // ═══════ D (主导) + S (氛围) ═══════
    typeWithRef(
      'queen', 'love-emperor.png',
      '一个精致漂亮的女生充气手办角色，纤细修长身材，瓜子脸大眼睛。深紫玫瑰金色收腰小西装裙勾勒曲线，头戴精致小皇冠，长卷发披肩。一手叉腰一手举着爱心权杖，下巴微抬表情自信迷人。脚边躺着一份写好的恋爱排期表。',
      {
        name: '霸总体质',
        number: '#01',
        code: 'D.S.P.F',
        backronym: 'Dominant · Sensory · Planned · Fantasy',
        tagline: '恋爱版甲方，这段感情我来排期',
        tags: ['👑 约会前做PPT', '📋 甲方式恋爱', '📊 分手写复盘'],
        quote: '「这段感情，我来排期。」',
      },
    ),
    typeWithRef(
      'love-pm', 'boss.png',
      '一个干练美丽的女生充气手办角色，纤细高挑身材，精致五官。珊瑚粉色修身小西装配白色真丝衬衫，露出纤细锁骨，微卷中长发。手持爱心打勾的清单板，另一手指向进度表。表情认真又略带得意的俏皮笑。',
      {
        name: '恋爱项目经理',
        number: '#02',
        code: 'D.S.P.R',
        backronym: 'Dominant · Sensory · Planned · Reality',
        tagline: '有条件的浪漫，心动要过风控',
        tags: ['📊 心里默默打分', '💰 浪漫但先算账', '🏠 看房比表白管用'],
        quote: '「爱你，但要看KPI。」',
      },
    ),
    typeWithRef(
      'pre-green', 'love-fish.png',
      '一个妩媚迷人的女生充气手办角色，纤细身材蜂腰长腿，精致猫系五官。黑色配亮粉色潮感短裙套装，性感又俏皮，波浪卷长发。一手抛起粉色爱心，另一手拿着冒出多个聊天气泡的手机。眨眼俏皮撩人表情。',
      {
        name: '渣女预备役',
        number: '#03',
        code: 'D.S.C.F',
        backronym: 'Dominant · Sensory · Chaotic · Fantasy',
        tagline: '刺激才是氧气，暧昧期的女王',
        tags: ['💬 同时三人聊天', '🏃 确定就想跑', '🃏 暧昧巅峰期'],
        quote: '「我没渣，只是选项太多。」',
      },
    ),
    typeWithRef(
      'sober-queen', 'ctrl.png',
      '一个气质清冷的美女充气手办角色，纤细挺拔身材，鹅蛋脸高鼻梁。白色配冰蓝色优雅修身套装，精致珍珠耳饰，利落短发或低马尾。一手拿放大镜审视小爱心，另一手做出"停"的手势。表情冷静高贵不屑。',
      {
        name: '清醒女王',
        number: '#04',
        code: 'D.S.C.R',
        backronym: 'Dominant · Sensory · Chaotic · Reality',
        tagline: '从不吃亏型，智商恋爱两不误',
        tags: ['💅 标准绝不降', '🧮 分手前算好账', '🧊 理性是最大魅力'],
        quote: '「这段关系我亏了吗？没有，继续。」',
      },
    ),

    // ═══════ D (主导) + I (直觉) ═══════
    typeWithRef(
      'screenwriter', 'love-sweet.png',
      '一个梦幻甜美的女生充气手办角色，纤细柔和身材，圆眼樱桃唇。梦幻紫粉色飘带连衣裙轻盈如仙女，长直发末端微卷。一手捂胸口做戏剧化心动状，另一手伸向远处想象中的人。眼睛含星星，嘴巴微张叹息。身边飘着电影打板器。',
      {
        name: '恋爱编剧',
        number: '#05',
        code: 'D.I.P.F',
        backronym: 'Dominant · Intuitive · Planned · Fantasy',
        tagline: '脑内已拍完8集，含导演评论音轨',
        tags: ['🎬 脑内8集连续剧', '🎵 自动配BGM', '💭 想象力是最大情敌'],
        quote: '「他朝我笑了，大结局我写好了。」',
      },
    ),
    typeWithRef(
      'sober-brain', 'love-balance.png',
      '一个温柔知性的女生充气手办角色，苗条身材，柔美五官戴着精致细框眼镜。暖粉色V领毛衣配米色A字裙，温柔中带一丝聪慧。微卷中长发柔顺垂落。一手举着发光的小脑袋，另一手捂着胸口的爱心。表情温柔但带着无奈的笑。',
      {
        name: '人间清醒恋爱脑',
        number: '#06',
        code: 'D.I.P.R',
        backronym: 'Dominant · Intuitive · Planned · Reality',
        tagline: '矛盾共同体，明知是坑还想跳',
        tags: ['📝 恋爱前做SWOT', '🧠 理性感性同在线', '😤 嘴上说不要'],
        quote: '「明知是坑还是想跳，但我量好了深度。」',
      },
    ),
    typeWithRef(
      'adventurer', 'love-bomb.png',
      '一个帅气飒爽的美女充气手办角色，纤细有力的身材，剑眉星目英气五官。红色配黑色修身皮夹克短裙，长靴露出笔直纤细小腿，马尾随风飘。姿态前倾充满冲劲，一手够向燃烧的心形火焰，另一手握着指南针。表情兴奋闪亮。',
      {
        name: '恋爱冒险家',
        number: '#07',
        code: 'D.I.C.F',
        backronym: 'Dominant · Intuitive · Chaotic · Fantasy',
        tagline: '直觉选人型，要的不是安全感是心跳',
        tags: ['⚡ 第一面定生死', '🎲 冲动飞去见人', '🎢 平淡免疫体质'],
        quote: '「我要的不是安全感，是心跳。」',
      },
    ),
    typeWithRef(
      'ice', 'love-freeze.png',
      '一个冰山美人的女生充气手办角色，高挑纤细身材，高冷精致脸庞。海军蓝配冰蓝色修身西装裙，精致钻石耳钉，乌黑长直发如缎面。双臂交叉审视姿态，下巴微抬挑眉。手边飘着只给3颗星的评分卡。表情礼貌但美丽中带疏远感。',
      {
        name: '高冷甲方',
        number: '#08',
        code: 'D.I.C.R',
        backronym: 'Dominant · Intuitive · Chaotic · Reality',
        tagline: '你行你上，能入眼的凤毛麟角',
        tags: ['🧊 气场自动筛人', '❄️ 从不主动出击', '🔒 通过审核才认真'],
        quote: '「不是我要求高，是你们太拉了。」',
      },
    ),

    // ═══════ A (配合) + S (氛围) ═══════
    typeWithRef(
      'vibes', 'love-sweet.png',
      '一个甜美浪漫的女生充气手办角色，娇小纤细身材，娃娃脸水汪汪大眼。蜜桃色配薰衣草色波西米亚碎花裙，蕾丝花边，编发花环。双手摆弄小蜡烛和花朵布置场景。眼睛半闭甜蜜微笑，睫毛弯弯，沉浸在自己的浪漫世界里。',
      {
        name: '恋爱氛围组',
        number: '#09',
        code: 'A.S.P.F',
        backronym: 'Accepting · Sensory · Planned · Fantasy',
        tagline: '被撩就倒型，氛围感是我的氧气',
        tags: ['☂️ 递伞就心动', '🫧 氛围感启动器', '🎵 一首歌引爆回忆'],
        quote: '「他给我塞了一颗糖，我想了三天。」',
      },
    ),
    typeWithRef(
      'contract', 'love-spy.png',
      '一个优雅端庄的女生充气手办角色，纤细匀称身材，温婉知性五官。米色配薄荷绿修身商务连衣裙，精致腰带勾勒纤腰，珍珠项链点缀。中分低马尾干净清爽。一手递出合同文件，另一手拿笔。表情认真端正又漂亮，像在提议"先签协议再恋爱"。',
      {
        name: '合约恋人',
        number: '#10',
        code: 'A.S.P.R',
        backronym: 'Accepting · Sensory · Planned · Reality',
        tagline: '浪漫要有边界，安全锁恋爱',
        tags: ['📜 浪漫有安全锁', '🔐 边界感拉满', '⚖️ 纯爱配风控'],
        quote: '「我可以被宠，但别失控。」',
      },
    ),
    typeWithRef(
      'mood', 'love-bomb.png',
      '一个灵动俏丽的女生充气手办角色，纤瘦苗条身材，精致鬼马精灵五官。衣服一半粉色一半蓝灰色的撞色设计短裙，过膝袜，双色渐变长发。一手举小太阳，另一手举小乌云。左脸笑右脸撅嘴，戏剧性拉满。整体可爱又灵气。',
      {
        name: '情绪过山车',
        number: '#11',
        code: 'A.S.C.F',
        backronym: 'Accepting · Sensory · Chaotic · Fantasy',
        tagline: '坐享其成型，不波折不算爱情',
        tags: ['🎢 吵完和好更上头', '💥 平淡过敏体质', '📈 感情线像心电图'],
        quote: '「我什么都不用做，自有人为我疯。」',
      },
    ),
    typeWithRef(
      'partner', 'love-buddy.png',
      '一个清新自然的女生充气手办角色，苗条舒展身材，素颜感清秀五官。橄榄绿oversize卫衣配牛仔短裤露出纤细长腿，白球鞋，慵懒丸子头。悠闲坐在小沙发上，一手拿游戏手柄，另一手端着奶茶。翘着腿表情轻松自在，笑容干净。',
      {
        name: '搭子人格',
        number: '#12',
        code: 'A.S.C.R',
        backronym: 'Accepting · Sensory · Chaotic · Reality',
        tagline: '低糖恋爱，我自己就是花',
        tags: ['🧋 低糖陪伴刚好', '🎮 约会跟朋友差不多', '🌊 来去不焦虑'],
        quote: '「恋爱是锦上添花，我自己就是花。」',
      },
    ),

    // ═══════ A (配合) + I (直觉) ═══════
    typeWithRef(
      'pure', 'love-lick.png',
      '一个纯真美丽的女生充气手办角色，纤细柔软身材，圆圆鹿眼无辜清纯五官。白色配粉色爱心图案天使风格蓬蓬裙，头顶精致光环，蝴蝶结长发。双手紧紧捧着一颗巨大发光的心贴在胸口，眼里星星闪闪，嘴巴坚定。身边飘着爱心盾牌和可爱小翅膀。',
      {
        name: '纯爱战士',
        number: '#13',
        code: 'A.I.P.F',
        backronym: 'Accepting · Intuitive · Planned · Fantasy',
        tagline: '赌上一切型，只认一个人',
        tags: ['💗 喜欢以年为单位', '🛡️ 绝不将就', '💎 每段刻骨铭心'],
        quote: '「你是我的，我也只要你。」',
      },
    ),
    typeWithRef(
      'wait-n-see', 'love-sleepy.png',
      '一个文艺清冷的女生充气手办角色，苗条纤细身材，冷白皮淡妆精致侧颜。灰色配鼠尾草绿的文艺针织裙，长筒袜，细银耳环。单手托腮思考姿态坐在小板凳上，另一手拿放大镜。表情微眯审视冷淡美，嘴巴微撅。身边有沙漏和加载圈。',
      {
        name: '等等党恋人',
        number: '#14',
        code: 'A.I.P.R',
        backronym: 'Accepting · Intuitive · Planned · Reality',
        tagline: '爱可以但你先证明，超长验证期',
        tags: ['⏳ 超长验证期', '🔍 只看做了什么', '💯 确定就all in'],
        quote: '「感动不是心动，别偷换概念。」',
      },
    ),
    typeWithRef(
      'cat', 'love-chill.png',
      '一个慵懒妩媚的猫系女生充气手办角色，纤细柔软身材，上挑猫眼精致小脸。黑色配粉色猫耳帽衫连衣裙，露出纤细手腕脚踝，尾巴发箍可爱。蜷缩成猫的撩人姿势，一只手慵懒地拨弄毛线心形球。半眯的眼睛魅惑，若即若离。身边飘着猫爪和小鱼干。',
      {
        name: '恋爱猫猫',
        number: '#15',
        code: 'A.I.C.F',
        backronym: 'Accepting · Intuitive · Chaotic · Fantasy',
        tagline: '被吸引就凑近，无聊就走开',
        tags: ['🐱 凑近又走开', '🌙 若即若离大师', '🦋 好奇心驱动'],
        quote: '「我不是花心，我是好奇心。」',
      },
    ),
    typeWithRef(
      'buddha', 'love-monk.png',
      '一个仙气飘飘的女生充气手办角色，苗条纤细身材，淡颜系清冷仙女五官。薰衣草色配云白色宽松禅风薄纱长裙，若隐若现纤细身形，头发半扎飘逸。盘腿打坐双手结印。闭眼嘴角带一丝微笑，如仙子般超然。旁边躺着一颗没人理的小爱心。身边飘着莲花和祥云。',
      {
        name: '佛系恋爱',
        number: '#16',
        code: 'A.I.C.R',
        backronym: 'Accepting · Intuitive · Chaotic · Reality',
        tagline: '来去自由型，恋爱排第七',
        tags: ['☁️ 云淡风轻本人', '🧘 安全感自给自足', '🐢 优先级排第七'],
        quote: '「有你很好，没你也行。」',
      },
    ),
  ],
};

export default xptiImageModule;
