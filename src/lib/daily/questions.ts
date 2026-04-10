import type { DailyModelType } from './dimensions';

export interface DailyAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface DailyQuestion {
  id: number;
  text: string;
  dimension: string;
  model: DailyModelType;
  reversed: boolean;
  options: DailyAnswerOption[];
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  // ══════════════════════════════════════
  //  能量值 (Energy)  D1
  // ══════════════════════════════════════
  {
    id: 1, text: '今天早上起床的时候，你是怎样的？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '闹钟响了八遍，灵魂还没回到身体。', key: 'A' },
      { value: 2, label: '挣扎了一会儿，勉强起来了。', key: 'B' },
      { value: 3, label: '闹钟没响就自然醒了，精神抖擞！', key: 'C' },
    ],
  },
  {
    id: 2, text: '你觉得今天你的电量大概是？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '15%，已经切到省电模式了。', key: 'A' },
      { value: 2, label: '55%，够用但别太折腾。', key: 'B' },
      { value: 3, label: '95%，今天直接电量暴走！', key: 'C' },
    ],
  },
  {
    id: 3, text: '午饭后你的状态更接近？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '直接趴桌上了，眼皮千斤重。', key: 'A' },
      { value: 2, label: '有点困，但还能撑。', key: 'B' },
      { value: 3, label: '完全不困，下午继续冲。', key: 'C' },
    ],
  },
  {
    id: 4, text: '如果现在需要你搬家，你的反应是？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '想想就累，直接原地去世。', key: 'A' },
      { value: 2, label: '能搬，但需要缓一缓。', key: 'B' },
      { value: 3, label: '来吧！今天精力正好用不完！', key: 'C' },
    ],
  },
  {
    id: 5, text: '今天你的身体在跟你说____', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '「求你了，让我躺一天。」', key: 'A' },
      { value: 2, label: '「凑合用吧，别太过分就行。」', key: 'B' },
      { value: 3, label: '「主人！我今天超能打！」', key: 'C' },
    ],
  },
  {
    id: 6, text: '下午三点了，你现在能？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '啥也干不了，只想瘫着。', key: 'A' },
      { value: 2, label: '干点轻松的还行。', key: 'B' },
      { value: 3, label: '继续高强度运转，不在话下。', key: 'C' },
    ],
  },
  {
    id: 7, text: '今天有人约你去跑步，你？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '跑步？你不如直接把我埋了。', key: 'A' },
      { value: 2, label: '散步可以，跑步再说。', key: 'B' },
      { value: 3, label: '走！我正好精力过剩！', key: 'C' },
    ],
  },
  {
    id: 8, text: '如果今天是一部电影，你的精力够演到？', dimension: 'D1', model: 'energy', reversed: false,
    options: [
      { value: 1, label: '片头曲还没放完我就睡着了。', key: 'A' },
      { value: 2, label: '大概能撑到中场。', key: 'B' },
      { value: 3, label: '演完全片还能加个彩蛋！', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  心情指数 (Mood)  D2
  // ══════════════════════════════════════
  {
    id: 9, text: '形容一下你此刻的心情？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '阴天，随时可能下雨。', key: 'A' },
      { value: 2, label: '多云，不好不坏。', key: 'B' },
      { value: 3, label: '大晴天，万里无云！', key: 'C' },
    ],
  },
  {
    id: 10, text: '如果今天的心情是一首歌，大概是？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '一首很丧的慢歌，循环播放中。', key: 'A' },
      { value: 2, label: '普通的背景音乐，不悲不喜。', key: 'B' },
      { value: 3, label: '一首超嗨的歌，恨不得原地蹦迪！', key: 'C' },
    ],
  },
  {
    id: 11, text: '路上捡到一百块钱（假设的），今天你会？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '捡了也高兴不起来，心情已读不回。', key: 'A' },
      { value: 2, label: '小惊喜，但也没多开心。', key: 'B' },
      { value: 3, label: '开心到转圈！今天运气也太好了吧！', key: 'C' },
    ],
  },
  {
    id: 12, text: '如果此刻有人无缘无故夸你好看，你？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '不信，今天照镜子都嫌自己丑。', key: 'A' },
      { value: 2, label: '谢谢，礼貌性微笑。', key: 'B' },
      { value: 3, label: '那当然！今天心情好说什么都信！', key: 'C' },
    ],
  },
  {
    id: 13, text: '今天你打开手机最想看到什么？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '不想看到任何消息，世界别来烦我。', key: 'A' },
      { value: 2, label: '无所谓，看到什么就是什么。', key: 'B' },
      { value: 3, label: '想看到好消息！今天啥都能接住！', key: 'C' },
    ],
  },
  {
    id: 14, text: '此刻你的嘴角是____', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '向下的，自带丧脸特效。', key: 'A' },
      { value: 2, label: '一条直线，面无表情。', key: 'B' },
      { value: 3, label: '微微上扬，藏不住的笑意。', key: 'C' },
    ],
  },
  {
    id: 15, text: '好朋友突然发来一个"在吗"，今天你？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '叹口气，不太想回复。', key: 'A' },
      { value: 2, label: '回一个"怎么了"，看情况。', key: 'B' },
      { value: 3, label: '秒回！今天心情好想找人唠嗑！', key: 'C' },
    ],
  },
  {
    id: 16, text: '今天走在路上，你更容易注意到？', dimension: 'D2', model: 'mood', reversed: false,
    options: [
      { value: 1, label: '所有让人烦躁的东西——噪音、垃圾……', key: 'A' },
      { value: 2, label: '没什么特别注意的，低头走路。', key: 'B' },
      { value: 3, label: '蓝天白云、路边的花，世界真美好。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  社交电量 (Social)  D3
  // ══════════════════════════════════════
  {
    id: 17, text: '今天有人约你出去玩，你的第一反应？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '编理由拒绝，今天不想见活人。', key: 'A' },
      { value: 2, label: '看心情，看是谁约。', key: 'B' },
      { value: 3, label: '冲！今天正好想出去嗨！', key: 'C' },
    ],
  },
  {
    id: 18, text: '打开手机，有99+条群消息，你？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '直接全部已读，不想看。', key: 'A' },
      { value: 2, label: '扫一眼，有趣的才点进去。', key: 'B' },
      { value: 3, label: '一条条翻，还时不时插两句嘴。', key: 'C' },
    ],
  },
  {
    id: 19, text: '今天你更想？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '一个人待着，谁也别找我。', key: 'A' },
      { value: 2, label: '和一两个亲近的人聊聊。', key: 'B' },
      { value: 3, label: '呼朋唤友，搞个局！', key: 'C' },
    ],
  },
  {
    id: 20, text: '电梯里只有你和一个邻居，今天你会？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '掏出手机假装很忙，绝不对视。', key: 'A' },
      { value: 2, label: '点头微笑，礼貌但不多说。', key: 'B' },
      { value: 3, label: '主动打招呼闲聊两句。', key: 'C' },
    ],
  },
  {
    id: 21, text: '今天你的社交电量____', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '已关机。请发短信，我也不一定回。', key: 'A' },
      { value: 2, label: '省电模式，仅限重要联系人。', key: 'B' },
      { value: 3, label: '满格！所有人都可以打进来！', key: 'C' },
    ],
  },
  {
    id: 22, text: '今天有人想跟你聊八卦，你？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '不感兴趣，我今天只想安静。', key: 'A' },
      { value: 2, label: '听一耳朵，不主动参与。', key: 'B' },
      { value: 3, label: '来来来！什么八卦快说！', key: 'C' },
    ],
  },
  {
    id: 23, text: '如果今天必须参加一个饭局，你能接受？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '去了也是全程玩手机，不如不去。', key: 'A' },
      { value: 2, label: '去可以，但别超过两小时。', key: 'B' },
      { value: 3, label: '太好了！正好想跟大家聊聊！', key: 'C' },
    ],
  },
  {
    id: 24, text: '朋友圈/微博今天对你来说？', dimension: 'D3', model: 'social', reversed: false,
    options: [
      { value: 1, label: '刷都不想刷，跟我无关。', key: 'A' },
      { value: 2, label: '默默刷一刷，偶尔点个赞。', key: 'B' },
      { value: 3, label: '疯狂互动+发动态，在线蹦迪！', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  专注力 (Focus)  D4
  // ══════════════════════════════════════
  {
    id: 25, text: '你今天打开电脑/手机后的状态？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '开了十个App，每个看了三秒就切走。', key: 'A' },
      { value: 2, label: '偶尔走神，但能拉回来。', key: 'B' },
      { value: 3, label: '目标明确，上来就知道要干什么。', key: 'C' },
    ],
  },
  {
    id: 26, text: '今天你的大脑更像？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '一锅粥，什么乱七八糟的都在里面翻滚。', key: 'A' },
      { value: 2, label: '普通电脑，能运行但偶尔卡顿。', key: 'B' },
      { value: 3, label: '超级计算机，处理速度拉满。', key: 'C' },
    ],
  },
  {
    id: 27, text: '今天需要你做一件需要高度集中的事，你？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '根本坐不住，五分钟就想摸手机。', key: 'A' },
      { value: 2, label: '能做，但需要时不时休息一下。', key: 'B' },
      { value: 3, label: '进入心流模式，抬头发现两小时过去了。', key: 'C' },
    ],
  },
  {
    id: 28, text: '做事做到一半被打断了，今天你会？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '被打断就不想继续了，算了。', key: 'A' },
      { value: 2, label: '有点烦，但处理完还能接回去。', key: 'B' },
      { value: 3, label: '快速处理然后秒回状态，不影响。', key: 'C' },
    ],
  },
  {
    id: 29, text: '今天你的注意力持续时间大概是？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '金鱼级别，七秒就忘了在干嘛。', key: 'A' },
      { value: 2, label: '二三十分钟，之后需要缓一缓。', key: 'B' },
      { value: 3, label: '至少一两个小时，今天专注力在线。', key: 'C' },
    ],
  },
  {
    id: 30, text: '今天你的思维可以用____来形容。', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '一团毛线球，拉哪儿都是乱的。', key: 'A' },
      { value: 2, label: '一条普通的路，走起来还算顺畅。', key: 'B' },
      { value: 3, label: '一支激光笔，指哪打哪。', key: 'C' },
    ],
  },
  {
    id: 31, text: '如果今天要学一个新东西，你？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '看了五分钟就走神了，学不进去。', key: 'A' },
      { value: 2, label: '需要点时间热身，但能学进去。', key: 'B' },
      { value: 3, label: '大脑在线！什么新知识直接吸收！', key: 'C' },
    ],
  },
  {
    id: 32, text: '你今天看文字的时候？', dimension: 'D4', model: 'focus', reversed: false,
    options: [
      { value: 1, label: '同一行看了三遍，一个字没进脑子。', key: 'A' },
      { value: 2, label: '能看进去，但长文就算了。', key: 'B' },
      { value: 3, label: '看啥记啥，理解力全开。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  压力值 (Stress)  D5  ← 高分=压力大
  // ══════════════════════════════════════
  {
    id: 33, text: '今天你的肩膀和后背感觉？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '超级放松，没有一丝紧绷感。', key: 'A' },
      { value: 2, label: '有一点点紧，但还好。', key: 'B' },
      { value: 3, label: '硬得像石头，感觉在扛一座山。', key: 'C' },
    ],
  },
  {
    id: 34, text: '如果今天再多来一件麻烦事，你会？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '来吧，今天心态稳得很。', key: 'A' },
      { value: 2, label: '有点烦，但还能处理。', key: 'B' },
      { value: 3, label: '会直接原地爆炸。', key: 'C' },
    ],
  },
  {
    id: 35, text: '今天深呼吸一下，你感觉？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '很舒服，整个人都是松弛的。', key: 'A' },
      { value: 2, label: '稍微好一点，但松不下来。', key: 'B' },
      { value: 3, label: '呼不动，感觉胸口有块石头。', key: 'C' },
    ],
  },
  {
    id: 36, text: '今天你最需要的是？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '什么都不缺，今天挺好的。', key: 'A' },
      { value: 2, label: '一杯奶茶让我缓缓。', key: 'B' },
      { value: 3, label: '一个拥抱和一整天的假期。', key: 'C' },
    ],
  },
  {
    id: 37, text: '有人跟今天的你说"放轻松"，你？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '我本来就挺轻松的呀。', key: 'A' },
      { value: 2, label: '道理我都懂，就是有点难。', key: 'B' },
      { value: 3, label: '你说放松就放松？你来试试？？', key: 'C' },
    ],
  },
  {
    id: 38, text: '今天你回复消息的速度更接近？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '正常回复，想回就回。', key: 'A' },
      { value: 2, label: '有时候拖一拖，不想处理。', key: 'B' },
      { value: 3, label: '看到就焦虑但又不想回，最后已读不回。', key: 'C' },
    ],
  },
  {
    id: 39, text: '今天脑子里跑出来的念头更多是？', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '平静的流水，想啥是啥。', key: 'A' },
      { value: 2, label: '有几件事在转，但还可控。', key: 'B' },
      { value: 3, label: '一万件事同时弹窗，全是待处理。', key: 'C' },
    ],
  },
  {
    id: 40, text: '形容今天你面对的事情____', dimension: 'D5', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '轻轻松松，没啥负担。', key: 'A' },
      { value: 2, label: '有一点点多，但还在能力范围内。', key: 'B' },
      { value: 3, label: '像叠叠乐叠到最高那层，再加就倒。', key: 'C' },
    ],
  },
];
