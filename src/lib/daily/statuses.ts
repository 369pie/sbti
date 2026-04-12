import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export interface DailyStatusType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getDailyTypeImage(slug: string): string {
  return withBasePath(`/images/types/daily-${slug}.png`);
}

export function getDailyTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/daily-${slug}.webp`);
}

export const DAILY_STATUS_TYPES: DailyStatusType[] = [
  {
    slug: 'supercharged', code: 'MAX', name: '电量暴走', tagline: '今天谁都别拦我。',
    color: '#22c55e', emoji: '⚡',
    description: '你今天简直像充满了核能——精力拉满、心情大好、脑子清醒得像刚格式化过。如果今天有一百件事要做，你大概能做完一百二十件还行有余。这种状态请截图保存，因为它不会天天有。趁今天把那些拖了很久的事情做了吧，此时不做更待何时。',
    profile: { D1: 'H', D2: 'H', D3: 'H', D4: 'H', D5: 'L' },
  },
  {
    slug: 'zombie', code: 'ZZZ', name: '尸体开机', tagline: '人在运行，魂在缓冲。',
    color: '#78716c', emoji: '🧟',
    description: '今天的你像一台进了水的老电脑——能开机但什么都跑不动。精力是空的，心情是灰的，脑子里全是浆糊。别为难自己了，这种日子谁都有。给自己点一杯奶茶，找一个沙发角落，或者干脆请半天假。没有人能每天都满血，今天就让自己当一天NPC吧。',
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'L', D5: 'H' },
  },
  {
    slug: 'butterfly', code: 'FLY', name: '蝴蝶精', tagline: '到处飞，到处聊。',
    color: '#ec4899', emoji: '🦋',
    description: '你今天的社交能力直接开了外挂，见谁都能聊、跟谁都能嗨。朋友圈点赞评论不停手，群聊永远第一个回复，遇到陌生人都能搭两句。你今天是朋友们的快乐源泉，但代价是注意力可能有点散——不过谁在乎呢？开心就完了！',
    profile: { D1: 'H', D2: 'H', D3: 'H', D4: 'L', D5: 'L' },
  },
  {
    slug: 'cave', code: 'CAVE', name: '已读勿扰', tagline: '别找我，我在偷偷回血。',
    color: '#6366f1', emoji: '🦇',
    description: '今天你只想缩进自己的小世界里。不是心情不好，只是社交电量归零了。你更想一个人戴着耳机做自己的事情，不被打扰地进入深度工作模式。别人可能觉得你今天有点冷，但其实你只是在给自己充电。告诉他们：不是不喜欢你们，是今天需要独处。',
    profile: { D1: 'M', D2: 'M', D3: 'L', D4: 'H', D5: 'L' },
  },
  {
    slug: 'chill', code: 'ZEN', name: '差不多活着', tagline: '今天主打一个别太较真。',
    color: '#14b8a6', emoji: '🧘',
    description: '你今天什么都是"还行""差不多""无所谓"——不是摆烂，是真的心如止水。能量不高不低、心情不好不坏、不想社交也不排斥。这种状态其实挺健康的，不用每天都打了鸡血。今天就顺其自然吧，该来的会来，该做的慢慢做。',
    profile: { D1: 'M', D2: 'M', D3: 'M', D4: 'M', D5: 'M' },
  },
  {
    slug: 'bomb', code: 'BOOM', name: '定时炸弹', tagline: '别惹我，我今天不好惹。',
    color: '#ef4444', emoji: '💣',
    description: '今天的你压力值拉满，心情也跌到了谷底。就像一个定时炸弹，看起来还好但内部已经倒计时了。别人一句无心的话可能就是导火索。建议今天减少不必要的社交和任务，给自己一点喘息的空间。如果可以的话，找一个你信任的人聊聊——光憋着会更难受。',
    profile: { D1: 'M', D2: 'L', D3: 'L', D4: 'L', D5: 'H' },
  },
  {
    slug: 'dreamer', code: 'DREAM', name: '白日梦游', tagline: '人在现实，心在外太空。',
    color: '#a78bfa', emoji: '☁️',
    description: '今天你的思维像脱了缰的野马，到处乱跑就是不走正道。手上在做事A，脑子已经飞到了事Z。专注力约等于零，但你的想象力和创意可能在高峰——说不定能冒出什么绝妙的点子。今天不适合做需要精确的工作，倒是适合发呆、画画、或者随便写点什么。',
    profile: { D1: 'L', D2: 'M', D3: 'M', D4: 'L', D5: 'L' },
  },
  {
    slug: 'machine', code: 'AUTO', name: '待办清空机', tagline: '别跟我说话，我在疯狂收尾。',
    color: '#3b82f6', emoji: '🤖',
    description: '你今天进入了高效模式——脑子飞转、手速拉满、专注力在线，像一台被精密调校过的机器。社交？不需要。闲聊？浪费时间。今天的你只想把事情做完做好。如果你有什么重要的项目或者棘手的问题，就是今天了。不过记得喝水和吃饭，机器也需要保养。',
    profile: { D1: 'H', D2: 'M', D3: 'L', D4: 'H', D5: 'M' },
  },
  {
    slug: 'sunshine', code: 'SUN', name: '小太阳', tagline: '走到哪儿亮到哪儿。',
    color: '#f59e0b', emoji: '☀️',
    description: '你今天自带阳光属性——心情好、社交欲高、见谁都笑脸相迎。你的好心情是会传染的，今天身边的人都会被你感染到积极的情绪。虽然精力不一定拉到最满，但快乐就是你今天最大的能量来源。趁今天心情好，去做那些你一直想做但懒得做的社交——约人、打电话、发消息。',
    profile: { D1: 'M', D2: 'H', D3: 'H', D4: 'M', D5: 'L' },
  },
  {
    slug: 'lowbat', code: 'LOW', name: '省电模式', tagline: '不是不想动，是真的快关机了。',
    color: '#f97316', emoji: '🪫',
    description: '今天你像手机剩5%电量——还在亮着但随时可能关机。心情倒不至于很差，就是身体不给力。能躺着绝不坐着，能坐着绝不站着。别给自己安排太多事了，今天的主题是"活着就好"。晚上早点睡，明天也许就满血了。',
    profile: { D1: 'L', D2: 'M', D3: 'L', D4: 'L', D5: 'M' },
  },
  {
    slug: 'edge', code: 'EDGE', name: '绷不住了', tagline: '表面淡定，内心已经炸了三轮。',
    color: '#dc2626', emoji: '😵',
    description: '你今天就像一根绷到极限的橡皮筋——看起来还完整但随时可能断。压力大、心情不好、还得强撑着社交和工作。这种状态很累，但你一直在扛着。请注意：你不需要一直坚强。今天能减则减、能推则推，给自己留一点缓冲的余地。你已经做得很好了。',
    profile: { D1: 'L', D2: 'L', D3: 'M', D4: 'M', D5: 'H' },
  },
  {
    slug: 'vibe', code: 'VIBE', name: '灵魂挂机', tagline: '人在线，脑子暂时离席。',
    color: '#06b6d4', emoji: '🎵',
    description: '你今天的状态像一首LoFi音乐——慢慢的、懒懒的、但很舒服。不想用力做任何事，只想窝在一个舒服的地方放空。不是消沉，是真的想慢下来。适合今天做的事：听歌、看窗外、泡一杯茶、刷一刷没营养但很快乐的短视频。记住，发呆也是一种休息。',
    profile: { D1: 'L', D2: 'M', D3: 'L', D4: 'L', D5: 'L' },
  },
];

export function getDailyStatusBySlug(slug: string): DailyStatusType | undefined {
  return DAILY_STATUS_TYPES.find(s => s.slug === slug);
}

export function getAllDailySlugs(): string[] {
  return DAILY_STATUS_TYPES.map(s => s.slug);
}
