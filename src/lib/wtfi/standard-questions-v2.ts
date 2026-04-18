/**
 * Standard Entry · Clean-Room Rewrite v2 (W2 首批)
 *
 * 目的：
 *   逐步替换 src/lib/questions.ts 中那些"句式与 SBTI 原题相近、易触发文本相似"的题目，
 *   以**场景投射式 (scenario projection)** 题型重写——把抽象自我评估转化为
 *   具体场景中的反应选择。每题保留 SBTI 15 维 + 三选项 (1/2/3) 兼容计分。
 *
 * 不替换原 questions.ts；是 v2 候选池，用于：
 *   - W2 主重写批次的 PR 单元
 *   - A/B 体感测试（用 ?bank=v2 切换）
 *
 * 写作原则（来自 docs/01-strategy/wtfti-standard-rewrite-spec-2026-04-18.md）：
 *   1. 不出现"我不够好 / 我很清楚自己 / 一定要不断变强"这类直接自陈句
 *   2. 每题描述一个**可被画面化的小场景**（30-50 字）
 *   3. 三选项都是合理选择，避免"明显高分项"
 *   4. 至少 1/3 题型为反向计分 (reversed: true) 以打散答题模式
 *   5. 避免"做决定的时候——/ 看到别人做得好——"等已被审计标记的开场结构
 */

import type { Question } from '../questions';

export const STANDARD_QUESTIONS_V2: Question[] = [
  // ── S · 自我模型 ───────────────────────────────────────────
  {
    id: 1001, text: '上司在群里点名表扬同组的另一位同事，没提你。下班路上你的内心戏是：',
    dimension: 'S1', model: 'self', reversed: true,
    options: [
      { value: 3, label: '"果然我做得不够好"，开始反复对比对方的产出。', key: 'A' },
      { value: 2, label: '稍微在意一下，但回家洗个澡就忘了。', key: 'B' },
      { value: 1, label: '"今天 ta 出彩，明天就轮到我"，没什么内耗。', key: 'C' },
    ],
  },
  {
    id: 1002, text: '朋友在小红书发了一条吐槽你的小作文，没点名但你认得出。你：',
    dimension: 'S1', model: 'self', reversed: false,
    options: [
      { value: 1, label: '当晚翻来覆去，第二天找 ta 摊开聊。', key: 'A' },
      { value: 2, label: '点个赞表示"我看到了"，自己消化。', key: 'B' },
      { value: 3, label: '正常吃饭睡觉，过几天才想起来这回事。', key: 'C' },
    ],
  },
  {
    id: 1003, text: '出租车师傅闲聊问你"你是做什么的呀"。你：',
    dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '愣两秒，含糊地说"就普通上班"。', key: 'A' },
      { value: 2, label: '说个职业关键词，看 ta 接不接得上再展开。', key: 'B' },
      { value: 3, label: '自动开启自我介绍模式，能聊到下车。', key: 'C' },
    ],
  },
  {
    id: 1004, text: '深夜 2 点，你刷到一条"30 岁前必须做的 10 件事"。你：',
    dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '一条都不想做，划走继续刷。', key: 'A' },
      { value: 2, label: '存下来，明天起床就忘。', key: 'B' },
      { value: 3, label: '截图发给自己，第二天真的开始排进度。', key: 'C' },
    ],
  },
  {
    id: 1005, text: '同期入职的同事跳槽涨薪 50%。听到消息的瞬间你：',
    dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '替 ta 高兴，没想自己。', key: 'A' },
      { value: 2, label: '心里一紧，但很快接受"各有节奏"。', key: 'B' },
      { value: 3, label: '当晚就开始更新简历。', key: 'C' },
    ],
  },

  // ── E · 情感模型 ───────────────────────────────────────────
  {
    id: 1006, text: '你和暧昧对象聊了三周，今晚 ta 的回复明显变慢。你：',
    dimension: 'E1', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '反复检查对话记录，开始预演分手剧本。', key: 'A' },
      { value: 2, label: '有点失落，但提醒自己"对方也有事"。', key: 'B' },
      { value: 1, label: '没察觉，反正你今天也忙。', key: 'C' },
    ],
  },
  {
    id: 1007, text: '在一段长期关系里，对方说"我们谈谈"。你的第一反应：',
    dimension: 'E1', model: 'emotion', reversed: true,
    options: [
      { value: 3, label: '心跳加速，先在脑内排查"哪里出问题了"。', key: 'A' },
      { value: 2, label: '稍微紧张，但坐下来听 ta 说。', key: 'B' },
      { value: 1, label: '"行啊"，无所谓，没事就早点睡。', key: 'C' },
    ],
  },
  {
    id: 1008, text: '认识 3 个月的朋友突然发来一段长语音哭诉。你：',
    dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '回个"抱抱"表情，不知道再说什么。', key: 'A' },
      { value: 2, label: '认真听完，给点建议，但不会跟着难过。', key: 'B' },
      { value: 3, label: '当场打回去陪 ta 哭一场。', key: 'C' },
    ],
  },
  {
    id: 1009, text: '伴侣周末想留你陪，但你已经约了独处计划。你：',
    dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '取消独处，担心 ta 不开心。', key: 'A' },
      { value: 2, label: '商量一下，半天陪 ta 半天给自己。', key: 'B' },
      { value: 1, label: '坚持原计划，"我也需要我自己"。', key: 'C' },
    ],
  },
  {
    id: 1010, text: '你在异地，三天没收到家人的消息。你：',
    dimension: 'E3', model: 'emotion', reversed: true,
    options: [
      { value: 3, label: '心里发慌，主动打电话过去确认。', key: 'A' },
      { value: 2, label: '想起来时发个"在干嘛"。', key: 'B' },
      { value: 1, label: '完全没注意，直到 ta 们找你。', key: 'C' },
    ],
  },

  // ── A · 态度模型 ───────────────────────────────────────────
  {
    id: 1011, text: '看到一条"普通人努力一辈子也买不起房"的推文，你：',
    dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '点头赞同，世界本来就不公平。', key: 'A' },
      { value: 2, label: '部分认同，但也想反驳作者举的例子。', key: 'B' },
      { value: 3, label: '划走，"卖惨没意义，能做点啥才重要"。', key: 'C' },
    ],
  },
  {
    id: 1012, text: '公司新出一条规定明显不合理。你的反应：',
    dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '执行就是了，吐槽两句完事。', key: 'A' },
      { value: 2, label: '私下找 leader 反馈，看能不能改。', key: 'B' },
      { value: 3, label: '直接在群里 @ HR 问"这个规定的依据是什么"。', key: 'C' },
    ],
  },
  {
    id: 1013, text: '一个完全自由的周末，你最可能在做什么？',
    dimension: 'A3', model: 'attitude', reversed: true,
    options: [
      { value: 3, label: '在做一件"不做也没事但我就是想做"的小项目。', key: 'A' },
      { value: 2, label: '看剧、躺平、吃外卖。', key: 'B' },
      { value: 1, label: '什么都没做，时间流走了，但我也不愧疚。', key: 'C' },
    ],
  },

  // ── Ac · 行动模型 ──────────────────────────────────────────
  {
    id: 1014, text: '你接了一个新项目，启动会上让你说目标。你说出口的是：',
    dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '"先把活干完不出错"。', key: 'A' },
      { value: 2, label: '"做出能让自己满意的版本"。', key: 'B' },
      { value: 3, label: '"做成我们这块今年的标杆"。', key: 'C' },
    ],
  },
  {
    id: 1015, text: '同事拉你一起买一支高风险股票，需要 5 分钟内决定。你：',
    dimension: 'Ac2', model: 'action', reversed: false,
    options: [
      { value: 1, label: '"我研究一下"——基本就是不买了。', key: 'A' },
      { value: 2, label: '问几个关键问题，再决定。', key: 'B' },
      { value: 3, label: '"行，跟"，事后再补功课。', key: 'C' },
    ],
  },
  {
    id: 1016, text: '有一项任务 deadline 还有两周。你的真实状态是：',
    dimension: 'Ac3', model: 'action', reversed: true,
    options: [
      { value: 3, label: '今天就拆好计划，每天稳定推进。', key: 'A' },
      { value: 2, label: '前一周做点准备，后一周冲刺。', key: 'B' },
      { value: 1, label: '最后两天通宵搞定，每次都说"下次绝不"。', key: 'C' },
    ],
  },

  // ── So · 社交模型 ──────────────────────────────────────────
  {
    id: 1017, text: '小区电梯里只有你和邻居。整段路你：',
    dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '低头看手机假装很忙。', key: 'A' },
      { value: 2, label: '点头微笑，不主动开口。', key: 'B' },
      { value: 3, label: '"今天天气真不错诶"，主动起话头。', key: 'C' },
    ],
  },
  {
    id: 1018, text: '相处不到一个月的同事说"加我个人微信吧"。你：',
    dimension: 'So2', model: 'social', reversed: true,
    options: [
      { value: 3, label: '默默给一个工作微信号，避免私域被打扰。', key: 'A' },
      { value: 2, label: '加了，但置顶设个免打扰。', key: 'B' },
      { value: 1, label: '加了，第二天就开始发表情包。', key: 'C' },
    ],
  },
  {
    id: 1019, text: '聚会上有人吹一段你知道是假的经历，气氛还在嗨。你：',
    dimension: 'So3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '配合笑笑，回家在备忘录里写小作文。', key: 'A' },
      { value: 2, label: '会后单独跟 ta 求证一下。', key: 'B' },
      { value: 3, label: '当场就说"诶不对吧，我记得不是这样"。', key: 'C' },
    ],
  },

  // ── 第二轮：每个 model 各补 2 题（场景更日常化） ──────────────
  {
    id: 1020, text: '换发型那天，路上没人提、同事也没说。你：',
    dimension: 'S1', model: 'self', reversed: true,
    options: [
      { value: 3, label: '一整天都在想"是不是难看"。', key: 'A' },
      { value: 2, label: '小失落，下班自己再照镜子确认。', key: 'B' },
      { value: 1, label: '"我自己看着喜欢就行"，没在意。', key: 'C' },
    ],
  },
  {
    id: 1021, text: '写自我介绍 PPT 的"一句话自我描述"，你的草稿是：',
    dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '"一个想清楚自己要什么的普通人"——感觉空。', key: 'A' },
      { value: 2, label: '"喜欢 X、做过 Y、想成为 Z"——具体但不太抓人。', key: 'B' },
      { value: 3, label: '一句很有辨识度的金句，自己都觉得满意。', key: 'C' },
    ],
  },
  {
    id: 1022, text: '前任结婚的消息传到你的朋友圈。当晚你：',
    dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '正常睡，没什么感觉。', key: 'A' },
      { value: 2, label: '翻一下旧聊天记录，然后关掉睡觉。', key: 'B' },
      { value: 3, label: '辗转反侧，写了一篇没发出去的长文。', key: 'C' },
    ],
  },
  {
    id: 1023, text: '父母要给你介绍对象。你：',
    dimension: 'E3', model: 'emotion', reversed: true,
    options: [
      { value: 3, label: '为了不让 ta 们伤心，去见一面再说。', key: 'A' },
      { value: 2, label: '婉拒，但留个台阶。', key: 'B' },
      { value: 1, label: '"我自己的事我自己来"，直接挡回去。', key: 'C' },
    ],
  },
  {
    id: 1024, text: '你坚持的一个生活习惯（早起 / 健身 / 不喝奶茶）被朋友嘲笑。你：',
    dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '动摇一下，回家照常该干嘛干嘛。', key: 'A' },
      { value: 2, label: '解释几句，但其实在意 ta 怎么看。', key: 'B' },
      { value: 3, label: '更想坚持下去，"你笑你的，我练我的"。', key: 'C' },
    ],
  },
  {
    id: 1025, text: '一项重要决定，理性分析和直觉打架。你最终：',
    dimension: 'Ac2', model: 'action', reversed: true,
    options: [
      { value: 3, label: '听理性，把直觉当成噪音。', key: 'A' },
      { value: 2, label: '两边都听一下，再睡一觉看哪个更稳。', key: 'B' },
      { value: 1, label: '听直觉——"它从来没骗过我"。', key: 'C' },
    ],
  },
  {
    id: 1026, text: '你的待办清单里，三项任务同时到 deadline。你的处理：',
    dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '盯最重要那一项，其余先延期沟通。', key: 'A' },
      { value: 2, label: '快速扫一遍，挑最容易先清掉的那项。', key: 'B' },
      { value: 3, label: '一边焦虑一边在三项之间来回切。', key: 'C' },
    ],
  },
  {
    id: 1027, text: '群聊有 200 人，没人说话。你：',
    dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '潜水到底，不觉得需要发言。', key: 'A' },
      { value: 2, label: '别人开了头，再跟两句。', key: 'B' },
      { value: 3, label: '发个梗或表情包打破沉默。', key: 'C' },
    ],
  },
  {
    id: 1028, text: '你正经历一段低谷期。被熟人问"最近怎么样"。你：',
    dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '"还行"——把事情留给自己消化。', key: 'A' },
      { value: 2, label: '说一点点，看 ta 怎么接。', key: 'B' },
      { value: 1, label: '直说"挺烂的"，不演。', key: 'C' },
    ],
  },

  // ── 第三轮：象征性 / 反差挖掘题（打散模式） ──────────────────
  {
    id: 1029, text: '如果给你一天可以"完全成为另一个版本的自己"，你会选：',
    dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '一个比现在更安静、更隐形的版本。', key: 'A' },
      { value: 2, label: '一个把缺点稍微弱化的版本。', key: 'B' },
      { value: 3, label: '一个张扬到现在不敢做的版本。', key: 'C' },
    ],
  },
  {
    id: 1030, text: '你在朋友圈里的呈现，跟真实生活的差距大吗？',
    dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '差很多——朋友圈是精修版的我。', key: 'A' },
      { value: 2, label: '有差距，但能对得上号。', key: 'B' },
      { value: 1, label: '基本一致，懒得维持人设。', key: 'C' },
    ],
  },
  {
    id: 1031, text: '深夜回放今天发生的事，最容易反复想的是：',
    dimension: 'E1', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '哪句话说错了 / 别人是不是不开心。', key: 'A' },
      { value: 2, label: '今天哪一刻做得不错值得记下来。', key: 'B' },
      { value: 1, label: '一般不会回放，倒头就睡。', key: 'C' },
    ],
  },
  {
    id: 1032, text: '一年后看自己，你最希望听到的评价是：',
    dimension: 'A3', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '"ta 看起来真的过得很舒服。"', key: 'A' },
      { value: 2, label: '"ta 比一年前更像自己了。"', key: 'B' },
      { value: 3, label: '"ta 真的做成了想做的事。"', key: 'C' },
    ],
  },

  // ── W2 batch-2 补充题（1033 – 1050） ────────────────────────
  {
    id: 1033, text: '镜子里的自己今天看起来有点不对劲。你心里冒出来的第一句话是：',
    dimension: 'S1', model: 'self', reversed: true,
    options: [
      { value: 3, label: '"果然又胖/老/憔悴了，唉。"', key: 'A' },
      { value: 2, label: '"今天没睡好而已，过去了就好。"', key: 'B' },
      { value: 1, label: '"挺鲜活的，今天走进人群也不输谁。"', key: 'C' },
    ],
  },
  {
    id: 1034, text: '相亲对象问"你觉得自己最大的缺点是什么"。你：',
    dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '愣半天说"想不起来，可能挺多的"。', key: 'A' },
      { value: 2, label: '挑一个无伤大雅的小毛病讲。', key: 'B' },
      { value: 3, label: '直接讲一个真的会影响关系的点，并解释自己怎么管它。', key: 'C' },
    ],
  },
  {
    id: 1035, text: '工作内容如果让你觉得"在背叛自己的某个底线"，你最可能：',
    dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '继续做，先活下来再说。', key: 'A' },
      { value: 2, label: '边做边找下一份。', key: 'B' },
      { value: 3, label: '当下就开始想退路，哪怕短期收入掉一档。', key: 'C' },
    ],
  },
  {
    id: 1036, text: '伴侣临时改了周末的计划没和你商量。你：',
    dimension: 'E1', model: 'emotion', reversed: true,
    options: [
      { value: 3, label: '心里咯噔一下："是不是不在乎我了。"', key: 'A' },
      { value: 2, label: '不太开心，但相信 ta 有自己的理由。', key: 'B' },
      { value: 1, label: '觉得很正常，自己也常常临时改主意。', key: 'C' },
    ],
  },
  {
    id: 1037, text: '一段持续半年的暧昧突然被对方喊停。你：',
    dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '低落一阵，复盘几个晚上，再慢慢出来。', key: 'A' },
      { value: 2, label: '难过两天，第三天约朋友吃饭。', key: 'B' },
      { value: 1, label: '"哦"，第二天就翻篇，注意力切回别的事。', key: 'C' },
    ],
  },
  {
    id: 1038, text: '室友总是借你东西不打招呼。你：',
    dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '忍着，不想为这种小事撕破脸。', key: 'A' },
      { value: 2, label: '在群里阴阳一句，看 ta 反应。', key: 'B' },
      { value: 3, label: '直接当面把规则讲清楚，"以后问一下我"。', key: 'C' },
    ],
  },
  {
    id: 1039, text: '世界的本质，你私底下更倾向于认为：',
    dimension: 'A1', model: 'attitude', reversed: true,
    options: [
      { value: 3, label: '大家都有自己的难，恶意只是被生活逼出来的。', key: 'A' },
      { value: 2, label: '善恶各半，看你遇到谁。', key: 'B' },
      { value: 1, label: '人是趋利的，能保护自己最重要。', key: 'C' },
    ],
  },
  {
    id: 1040, text: '商场里有人插队插到你前面。你：',
    dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '心里骂一句，但不出声。', key: 'A' },
      { value: 2, label: '提醒一句"麻烦排队哈"。', key: 'B' },
      { value: 3, label: '直接挤回去，"我先来的"。', key: 'C' },
    ],
  },
  {
    id: 1041, text: '群里组织 AA，有人少付了 5 块。你：',
    dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '私下提醒 ta，账目要清。', key: 'A' },
      { value: 2, label: '群里 @ ta 一下，开个玩笑。', key: 'B' },
      { value: 3, label: '算了，5 块不至于。', key: 'C' },
    ],
  },
  {
    id: 1042, text: '深夜刷到一条"35 岁裸辞环游世界"的视频，你的真实反应是：',
    dimension: 'A3', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '"挺好的故事，看完接着睡觉。"', key: 'A' },
      { value: 2, label: '"羡慕，但我大概率做不到。"', key: 'B' },
      { value: 3, label: '"我也想清楚自己到底为什么活着了。"', key: 'C' },
    ],
  },
  {
    id: 1043, text: '同事约你周末加班赶项目，你周末本来什么也没安排。你：',
    dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '答应，"反正闲着也是闲着"。', key: 'A' },
      { value: 2, label: '看具体是什么活，挑能为自己加分的去。', key: 'B' },
      { value: 3, label: '婉拒，周末是自己的修复时间。', key: 'C' },
    ],
  },
  {
    id: 1044, text: '健身 / 早起 / 写作这种"长期主义"的事，你坚持的状态通常是：',
    dimension: 'Ac1', model: 'action', reversed: true,
    options: [
      { value: 3, label: '三天打鱼两天晒网，看心情。', key: 'A' },
      { value: 2, label: '一阵猛一阵停，整体在前进。', key: 'B' },
      { value: 1, label: '一旦开始就接近每天打卡，不打卡浑身难受。', key: 'C' },
    ],
  },
  {
    id: 1045, text: '点外卖时菜单滑了 10 分钟。你最常的状态是：',
    dimension: 'Ac2', model: 'action', reversed: true,
    options: [
      { value: 3, label: '反复在两三家之间横跳，最后随便选一家。', key: 'A' },
      { value: 2, label: '看一眼评分高的就下单。', key: 'B' },
      { value: 1, label: '直接点上次吃的，不再选了。', key: 'C' },
    ],
  },
  {
    id: 1046, text: '老板突然布置一个"明早九点要"的紧急任务。你：',
    dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '焦虑到先刷 20 分钟手机，再硬着头皮开干。', key: 'A' },
      { value: 2, label: '边抱怨边开始拆任务。', key: 'B' },
      { value: 3, label: '关掉所有通知，按优先级快速过一遍就动手。', key: 'C' },
    ],
  },
  {
    id: 1047, text: '公司年会要求每人上台讲一段。你：',
    dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '提前一周开始焦虑，能不上就不上。', key: 'A' },
      { value: 2, label: '硬着头皮讲，下台就放空。', key: 'B' },
      { value: 3, label: '主动报名，顺手把观众逗笑两次。', key: 'C' },
    ],
  },
  {
    id: 1048, text: '关系不远不近的同事问你工资多少。你：',
    dimension: 'So2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '含糊一句"还行"带过。', key: 'A' },
      { value: 2, label: '说一个区间数。', key: 'B' },
      { value: 3, label: '直接说"这个我不太想聊"。', key: 'C' },
    ],
  },
  {
    id: 1049, text: '你失恋了，朋友约你吃饭。饭桌上你：',
    dimension: 'So2', model: 'social', reversed: true,
    options: [
      { value: 3, label: '一句不提，全程聊别的。', key: 'A' },
      { value: 2, label: '被问到才讲一点点。', key: 'B' },
      { value: 1, label: '主动展开聊，把情绪摊开。', key: 'C' },
    ],
  },
  {
    id: 1050, text: '在不熟的人面前，你笑到肚子疼的几率是：',
    dimension: 'So3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '基本为零，最多礼貌微笑。', key: 'A' },
      { value: 2, label: '看气氛，对了就笑出来。', key: 'B' },
      { value: 3, label: '挺常见的，我笑点本来就低。', key: 'C' },
    ],
  },
];

/**
 * 维度覆盖矩阵（自检）：
 *   S1 ×4: 1001 / 1002 / 1020 / 1033       ✅
 *   S2 ×4: 1003 / 1021 / 1029 / 1034       ✅
 *   S3 ×3: 1004 / 1005 / 1035              ✅
 *   E1 ×4: 1006 / 1007 / 1031 / 1036       ✅
 *   E2 ×3: 1008 / 1022 / 1037              ✅
 *   E3 ×4: 1009 / 1010 / 1023 / 1038       ✅
 *   A1 ×3: 1011 / 1039 / 1040              ✅
 *   A2 ×3: 1012 / 1024 / 1041              ✅
 *   A3 ×3: 1013 / 1032 / 1042              ✅
 *   Ac1 ×3: 1014 / 1043 / 1044             ✅
 *   Ac2 ×3: 1015 / 1025 / 1045             ✅
 *   Ac3 ×3: 1016 / 1026 / 1046             ✅
 *   So1 ×3: 1017 / 1027 / 1047             ✅
 *   So2 ×3: 1018 / 1048 / 1049             ✅
 *   So3 ×4: 1019 / 1028 / 1030 / 1050      ✅
 *   总计：50 题，15/15 维度 ≥ 3 题
 */
