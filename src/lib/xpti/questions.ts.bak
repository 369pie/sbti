import { shuffleArray } from '../question-pool';
import type { XptiModelType } from './dimensions';

export interface XptiAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface XptiQuestion {
  id: number;
  text: string;
  dimension: string;
  model: XptiModelType;
  reversed: boolean;
  options?: XptiAnswerOption[];
}

export const XPTI_DEFAULT_OPTIONS: XptiAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

function opts(a: string, b: string, c: string): XptiAnswerOption[] {
  return [
    { value: 3, label: a, key: 'A' },
    { value: 2, label: b, key: 'B' },
    { value: 1, label: c, key: 'C' },
  ];
}

const POWER_QUESTIONS: XptiQuestion[] = [
  {
    id: 1,
    text: '今晚临时要见面，约会地点通常谁来拍板？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('我来定。你人来就行。', '谁顺手谁定，不值得拉扯太久。', '你定吧，我跟着走也很舒服。'),
  },
  {
    id: 2,
    text: '对方安排了一个你明确说过不喜欢的项目，你会？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('我会直接改，省得两个人都硬演。', '先接住这份心意，回头再补一句我的偏好。', '算了，别扫兴，他开心也行。'),
  },
  {
    id: 3,
    text: '我在关系里最舒服的状态是——',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('大方向我来拍板，细节可以一起补。', '谁擅长谁上，不用硬分高低。', '对方来统筹，我会更放松。'),
  },
  {
    id: 4,
    text: '吵架卡住的时候，你通常更像哪种？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('先别散，我想把这事聊明白。', '缓一缓再聊，不想当场炸掉。', '我一般先顺着，后面再说。'),
  },
  {
    id: 5,
    text: '第一次一起出游，你最像——',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('路线、吃什么、住哪儿，我大概率已经开好备忘录了。', '关键项我会管，剩下随缘。', '别人做攻略，我负责出门和夸夸。'),
  },
  {
    id: 6,
    text: '带对象去见朋友之前，你会怎么处理？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('我会先给双方打个底，免得场子跑偏。', '正常见面就行，别太像项目启动会。', '随他自己发挥，我不太想控场。'),
  },
  {
    id: 7,
    text: '菜单递过来的那一刻，你通常是什么状态？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('菜单到我手里，基本这顿就有结果了。', '各点各的，或者一起挑几个。', '谁更会点谁来，我没意见。'),
  },
  {
    id: 8,
    text: '对方老说“都行”，你第一反应会是？',
    dimension: 'X1',
    model: 'power',
    reversed: false,
    options: opts('别端水，给我一个明确答案。', '我会直接丢两个选项过去。', '那就都行吧，我真能接受。'),
  },
  {
    id: 9,
    text: '只要对方安排得明白，我其实很享受被带着走。',
    dimension: 'X1',
    model: 'power',
    reversed: true,
    options: opts('对，我就喜欢对方把事情都想好。', '偶尔这样挺爽，但不能次次都这样。', '不太行，长期被带节奏我会烦。'),
  },
  {
    id: 10,
    text: '遇到更强势的人，我通常懒得抢主导权。',
    dimension: 'X1',
    model: 'power',
    reversed: true,
    options: opts('是，我会自动往后撤半步。', '要看这件事值不值得我争。', '不会，我该说还是会说。'),
  },
  {
    id: 11,
    text: '关系推进这种事，有人带着我反而更轻松。',
    dimension: 'X1',
    model: 'power',
    reversed: true,
    options: opts('对，我不爱管节奏。', '一半一半吧，我也得看是谁在带。', '不，我更想自己决定往哪走。'),
  },
  {
    id: 12,
    text: '只要结果不错，过程中谁说了算我没那么在意。',
    dimension: 'X1',
    model: 'power',
    reversed: true,
    options: opts('是，别折腾我做决定就行。', '小事无所谓，大事还是要商量。', '不是，我会在意自己有没有参与感。'),
  },
];

const SENSE_QUESTIONS: XptiQuestion[] = [
  {
    id: 13,
    text: '什么瞬间最容易让你一下子心动？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('灯光、音乐、香味都对上了，那一下。', '得综合看，不会只吃一个点。', '一句话突然戳中我，比什么布置都猛。'),
  },
  {
    id: 14,
    text: '第一次约会，最影响你体验的通常是？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('场子。环境不对，我很难入戏。', '人和场子都重要，谁也别拖后腿。', '聊得来最重要，路边坐着都行。'),
  },
  {
    id: 15,
    text: '收到礼物时，你最容易被哪个点打动？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('被认真包装、被记住细节。', '只要不是太敷衍，我都会开心。', '那句“我一看到就想到你”。'),
  },
  {
    id: 16,
    text: '以下哪种偏爱最戳你？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('我爱喝什么、忌口什么，他都记得。', '都加分，主要看整体。', '我没开口，他先看出我情绪不对。'),
  },
  {
    id: 17,
    text: '你理想中的约会地点更像哪种？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('好看、舒服、有点氛围，最好还能拍。', '别太糟就行，关键还是相处感。', '坐哪儿都行，只要对话里有火花。'),
  },
  {
    id: 18,
    text: '哪种消息最容易让你反复看？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('认真准备的小作文、歌单、行程。', '看是谁发的，也看当天状态。', '一条很短，但明显在说我。'),
  },
  {
    id: 19,
    text: '你理解的“浪漫”更接近哪一种？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('被精心布置出来的瞬间。', '自然和设计，我都吃。', '某个完全没准备但就是很来电的时刻。'),
  },
  {
    id: 20,
    text: '对方来接你下班，最戳你的会是？',
    dimension: 'X2',
    model: 'sense',
    reversed: false,
    options: opts('车里热饮、座椅加热、歌单都备好了。', '有人来接这件事本身就挺加分。', '他看我一眼就说“你今天累坏了吧”。'),
  },
  {
    id: 21,
    text: '只要能聊到点上，路边摊也能让我很上头。',
    dimension: 'X2',
    model: 'sense',
    reversed: true,
    options: opts('对，聊天一对味，塑料凳我都能坐开心。', '要是人对了，环境确实没那么重要。', '还是不太行，场子太差会让我出戏。'),
  },
  {
    id: 22,
    text: '我不太吃那种“仪式感套餐”，反而更看对方有没有一下看懂我。',
    dimension: 'X2',
    model: 'sense',
    reversed: true,
    options: opts('是，花活可以少点，别不懂我。', '两样都想要，最好别让我二选一。', '不是，仪式感本身就很重要。'),
  },
  {
    id: 23,
    text: '再漂亮的布置，如果没那种来电感，我也很难心动。',
    dimension: 'X2',
    model: 'sense',
    reversed: true,
    options: opts('对，没电流就是没电流。', '会觉得用心，但不一定上头。', '布置到位本来就很容易让我沦陷。'),
  },
  {
    id: 24,
    text: '我很少因为环境和氛围动心，更多是某句话某个眼神突然击中。',
    dimension: 'X2',
    model: 'sense',
    reversed: true,
    options: opts('对，我的心动点一直挺玄的。', '一半一半，具体得看人。', '不是，我很容易被整体氛围拿下。'),
  },
];

const FOCUS_QUESTIONS: XptiQuestion[] = [
  {
    id: 25,
    text: '暧昧期的你通常更像哪种？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('很快就只盯一个人了。', '嘴上说留余地，心里还是会偏一个。', '先别单押，大家都还在观察期。'),
  },
  {
    id: 26,
    text: '关系里哪件事最让你下头？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('对方到处留口子，谁都想试一下。', '忽冷忽热、说不清楚。', '一上来就把一切说死，压得我喘不过气。'),
  },
  {
    id: 27,
    text: '如果你已经对一个人上头了，别人再出现会怎样？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('基本自动静音，看都懒得看。', '会比较一下，但不至于乱。', '该认识还是会认识，没必要自我设限。'),
  },
  {
    id: 28,
    text: '你更想要哪种恋爱节奏？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('慢一点没关系，但一旦确定就要稳。', '看相处，有感觉再慢慢推进。', '边走边看，别太早把门关上。'),
  },
  {
    id: 29,
    text: '刷到 crush 跟异性单独看展，你第一反应是？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('心里立刻拉警报。', '先看看他们到底什么关系。', '只要没说定，这也正常吧。'),
  },
  {
    id: 30,
    text: '前任突然回头找你，你现在又刚好有在喜欢的人。你会？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('不回，窗口已经关了。', '礼貌处理，但不会给太多空间。', '聊两句也无妨，反正还没定。'),
  },
  {
    id: 31,
    text: '你对“只谈一个”这件事更接近哪句？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('这不就是默认设置吗。', '确定关系后我会这样。', '别把话说太满，先看状态。'),
  },
  {
    id: 32,
    text: '下面哪句话更像你？',
    dimension: 'X3',
    model: 'focus',
    reversed: false,
    options: opts('我一旦认真，分心真的很难。', '先别立旗，顺其自然。', '新鲜感对我来说也很重要。'),
  },
  {
    id: 33,
    text: '关系没说定之前，我不会自动把注意力只放在一个人身上。',
    dimension: 'X3',
    model: 'focus',
    reversed: true,
    options: opts('对，我会给自己留窗口。', '理智上会留，情绪上不一定。', '不是，我很容易不自觉就只看一个。'),
  },
  {
    id: 34,
    text: '我其实挺吃暧昧期那种不稳定感，太快确定反而少了点意思。',
    dimension: 'X3',
    model: 'focus',
    reversed: true,
    options: opts('对，确定了有时候反而没那么好玩。', '暧昧好吃，但也不能无限期。', '不是，我还是更想早点说清楚。'),
  },
  {
    id: 35,
    text: '只要还没正式在一起，我默认彼此都可以继续认识别人。',
    dimension: 'X3',
    model: 'focus',
    reversed: true,
    options: opts('对，这很合理。', '能理解，但我自己未必做得到。', '不太能接受，我会默认彼此该收一收。'),
  },
  {
    id: 36,
    text: '比起“天长地久”，我更在意这段关系当下够不够有感觉。',
    dimension: 'X3',
    model: 'focus',
    reversed: true,
    options: opts('对，先活在现在。', '现在和以后，我都会想。', '不是，我还是会看长线。'),
  },
];

const IMAGINE_QUESTIONS: XptiQuestion[] = [
  {
    id: 37,
    text: '闺蜜问你理想型什么样，你更像会怎么答？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('先说感觉和画面，再说人。', '看感觉，真的很难一句话概括。', '先说稳定、靠谱、能不能过日子。'),
  },
  {
    id: 38,
    text: '认识一个人没多久时，你通常会？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('脑子里已经偷偷写了点后续剧情。', '偶尔会想一下，但不敢想太远。', '先别演连续剧，看看现实匹不匹配。'),
  },
  {
    id: 39,
    text: '哪种爱情故事最容易把你看哭？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('兜兜转转还是你、命里注定那种。', '只要写得好，我都能哭。', '两个人把日子一点点过稳的那种。'),
  },
  {
    id: 40,
    text: '遇到一个很会给情绪价值、但现实条件一般的人，你会？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('还是会很容易心动。', '先纠结一阵子。', '先把心动按住，现实也得算。'),
  },
  {
    id: 41,
    text: '如果对方半夜发来一句“想带你逃去海边”，你第一反应是？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('我已经在想穿哪件外套了。', '先笑，再看他是不是认真的。', '先问时间、路线、预算。'),
  },
  {
    id: 42,
    text: '哪种承诺更容易打动你？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('以后每年初雪都陪你看。', '话要看是谁说，也看当时氛围。', '下周我把计划和时间腾出来。'),
  },
  {
    id: 43,
    text: '喜欢一个人时，你更常先爱上什么？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('那个故事感。', '人和感觉一起。', '他能不能把生活过明白。'),
  },
  {
    id: 44,
    text: '如果一个人很普通，但跟他在一起总有电影感，你会？',
    dimension: 'X4',
    model: 'imagine',
    reversed: false,
    options: opts('完了，我很吃这一套。', '会上头，但还会继续观察。', '电影散场还得回生活，我知道。'),
  },
  {
    id: 45,
    text: '心动归心动，条件不合适我会提醒自己及时刹车。',
    dimension: 'X4',
    model: 'imagine',
    reversed: true,
    options: opts('对，我会硬把自己拉回来。', '知道该刹，但不一定每次都刹得住。', '我通常会先冲了再说。'),
  },
  {
    id: 46,
    text: '我很少给人加太多滤镜，能不能落地比感觉更重要。',
    dimension: 'X4',
    model: 'imagine',
    reversed: true,
    options: opts('是，我会先看现实面。', '感觉和现实，我会一起看。', '不是，我经常先被感觉带走。'),
  },
  {
    id: 47,
    text: '与其听漂亮话，我更想知道他准备怎么把话兑现。',
    dimension: 'X4',
    model: 'imagine',
    reversed: true,
    options: opts('对，方法比情话值钱。', '两样都要，不然总觉得差点什么。', '我其实很容易先被漂亮话打动。'),
  },
  {
    id: 48,
    text: '喜欢归喜欢，但情绪稳定、责任感和生活能力对我来说更加分。',
    dimension: 'X4',
    model: 'imagine',
    reversed: true,
    options: opts('对，这些才是长期加分项。', '重要，但不能完全替代心动。', '我还是更容易先被那种感觉拉走。'),
  },
];

export const XPTI_QUESTIONS: XptiQuestion[] = [
  ...POWER_QUESTIONS,
  ...SENSE_QUESTIONS,
  ...FOCUS_QUESTIONS,
  ...IMAGINE_QUESTIONS,
];

const XPTI_QUESTIONS_PER_DIMENSION = 5;
const XPTI_REVERSED_PER_DIMENSION = 2;

function sampleXptiDimension(questions: readonly XptiQuestion[], random: () => number): XptiQuestion[] {
  const reversed = questions.filter(question => question.reversed);
  const forward = questions.filter(question => !question.reversed);
  const sampled: XptiQuestion[] = [];
  const sampledIds = new Set<number>();

  const reversedTarget = Math.min(
    XPTI_REVERSED_PER_DIMENSION,
    reversed.length,
    XPTI_QUESTIONS_PER_DIMENSION
  );
  const forwardTarget = Math.min(XPTI_QUESTIONS_PER_DIMENSION - reversedTarget, forward.length);

  for (const question of shuffleArray(forward, random).slice(0, forwardTarget)) {
    sampled.push(question);
    sampledIds.add(question.id);
  }

  for (const question of shuffleArray(reversed, random).slice(0, reversedTarget)) {
    sampled.push(question);
    sampledIds.add(question.id);
  }

  if (sampled.length < XPTI_QUESTIONS_PER_DIMENSION) {
    const remainder = shuffleArray(
      questions.filter(question => !sampledIds.has(question.id)),
      random
    ).slice(0, XPTI_QUESTIONS_PER_DIMENSION - sampled.length);

    sampled.push(...remainder);
  }

  return shuffleArray(sampled, random);
}

export function shuffleXptiQuestions(questions: XptiQuestion[]): XptiQuestion[] {
  const dimensionBuckets = new Map<string, XptiQuestion[]>();

  for (const question of questions) {
    const bucket = dimensionBuckets.get(question.dimension) ?? [];
    bucket.push(question);
    dimensionBuckets.set(question.dimension, bucket);
  }

  const sampled: XptiQuestion[] = [];
  for (const bucket of dimensionBuckets.values()) {
    sampled.push(...sampleXptiDimension(bucket, Math.random));
  }

  return shuffleArray(sampled, Math.random);
}
