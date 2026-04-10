import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export interface WorkPersonalityType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getWorkTypeImage(slug: string): string {
  return withBasePath(`/images/types/work-${slug}.png`);
}

export const WORK_PERSONALITY_TYPES: WorkPersonalityType[] = [
  {
    slug: 'juan', code: 'JUAN', name: '卷王', tagline: '你卷你的，我已经卷完了。',
    color: '#ef4444', emoji: '💪',
    description: '你不是在工作，你是在拼命。别人朝九晚六，你朝九晚九。不是因为公司要求，而是你每天打开电脑的那一刻就自动进入了"卷模式"。你的待办清单永远比别人长两倍，不是因为你工作多，而是因为你会主动给自己加活。同事们佩服你的精力，但更佩服你的意志力——毕竟谁也不知道你晚上回家还要再学两个小时网课。',
    profile: { W1: 'H', W2: 'L', W3: 'H', W4: 'L', W5: 'M' },
  },
  {
    slug: 'fish', code: 'FISH', name: '摸鱼王', tagline: '带薪拉屎是一种信仰。',
    color: '#06b6d4', emoji: '🐟',
    description: '你把摸鱼发展成了一门艺术。不是不干活，是你总能用最少的精力达到及格线。你的屏幕永远分成两半——一半是工作文档，一半是看起来像工作文档的东西。你的浏览器书签栏里藏着一个叫"技术文档"的文件夹，点开全是漫画。摸鱼不丢人，活干完了就行。况且你的效率真到了，只是你不愿意让领导知道你其实半天就能做完。',
    profile: { W1: 'L', W2: 'M', W3: 'H', W4: 'H', W5: 'L' },
  },
  {
    slug: '996', code: '996', name: '加班战神', tagline: '公司没有我不灭的灯。',
    color: '#7c3aed', emoji: '⏰',
    description: '公司楼里最晚熄灭的那盏灯，属于你。你不是不想回家，而是回去了也不知道干什么——还不如在公司产出几份报告。你的微信步数永远不超过两千，因为你从早到晚都坐在工位上。你的外卖订单比你的社交记录还长。提醒你一句：身体是革命的本钱，加班不是目的，别把自己加废了。',
    profile: { W1: 'H', W2: 'L', W3: 'M', W4: 'L', W5: 'H' },
  },
  {
    slug: 'ppt', code: 'PPT', name: '汇报侠', tagline: '干活的不如做PPT的。',
    color: '#f59e0b', emoji: '📊',
    description: '你深谙职场生存第一法则：干得好不如说得好。你的PPT做得比你的实际工作精彩十倍，你的周报读起来像一篇获奖演讲。你不是不干活，你只是把"展示成果"这件事做到了极致。每次汇报你都自带BGM气场，让领导觉得整个项目全靠你撑着。虽然同事偶尔会嘀咕，但不得不承认——你确实是个presentation天才。',
    profile: { W1: 'M', W2: 'H', W3: 'M', W4: 'M', W5: 'H' },
  },
  {
    slug: 'ddl', code: 'DDL', name: '死线战士', tagline: 'DDL是第一生产力。',
    color: '#f97316', emoji: '⚡',
    description: '你的生产力和deadline的距离成反比——deadline越远你越闲，deadline越近你越猛。平时你是一条悠哉悠哉的咸鱼，但到了最后三天你就变身成超级赛亚人。一夜之间写完一万字报告对你来说是基本操作。你的同事不理解你怎么做到的，你也不理解自己平时为什么做不到。人类最伟大的发明就是deadline——至少对你来说是这样。',
    profile: { W1: 'L', W2: 'L', W3: 'H', W4: 'H', W5: 'M' },
  },
  {
    slug: 'tea', code: 'TEA', name: '茶水间之光', tagline: '我不在工位，就在茶水间。',
    color: '#22c55e', emoji: '☕',
    description: '你是公司的"人形Wi-Fi"——信号覆盖全楼层。谁跳槽了、谁要升职了、谁和谁在一起了，你都知道。不是因为你爱八卦，而是因为大家都爱找你聊。你在茶水间的停留时间比在工位上还长，但奇怪的是你的工作也没落下多少。你的社交天赋是天生的，换个岗位你就是公关经理。',
    profile: { W1: 'L', W2: 'H', W3: 'M', W4: 'H', W5: 'L' },
  },
  {
    slug: 'ghost', code: 'GHOST', name: '透明人', tagline: '来了三年，隔壁不知道有我。',
    color: '#94a3b8', emoji: '👻',
    description: '你在公司存在了三年，隔壁工位的人还不知道你叫什么。你不是高冷，你只是……存在感天生就低。开会的时候你永远坐最角落，群里发言你永远是"收到"两个字。但你有一个别人不知道的超能力：你能在所有人不注意的时候把活干完。你是公司里最稳定的螺丝钉，虽然没人知道这颗螺丝钉在哪。',
    profile: { W1: 'L', W2: 'L', W3: 'M', W4: 'M', W5: 'L' },
  },
  {
    slug: 'meet', code: 'MEET', name: '会议之王', tagline: '今天又开了八个会。',
    color: '#6366f1', emoji: '📅',
    description: '你的日历比你的人生还满。上午三个会，下午四个会，晚上还有个复盘。你永远在"上一个会刚结束，下一个会马上开始"的状态里穿梭。你已经练就了在会议中同时回邮件、看文档、偷偷吃零食的多线程能力。你不一定喜欢开会，但你已经被练成了开会专家——至少你知道在什么时候点头、什么时候说"我同意"。',
    profile: { W1: 'M', W2: 'H', W3: 'M', W4: 'M', W5: 'M' },
  },
  {
    slug: 'run', code: 'RUN', name: '准点下班侠', tagline: '六点零一秒我在电梯里了。',
    color: '#10b981', emoji: '🚀',
    description: '六点零一秒，你已经在电梯里了。不是你不敬业，是你深刻理解一个道理：到点下班是劳动法赋予我的权利。你的工作效率其实很高——因为你知道拖拖拉拉的后果就是加班，而加班是不可接受的。你的时间管理能力比大多数人都强，你只是把节省下来的时间全部投入了生活。工作是生活的一部分，不是全部。',
    profile: { W1: 'M', W2: 'M', W3: 'H', W4: 'H', W5: 'L' },
  },
  {
    slug: 'zen', code: 'ZEN', name: '佛系打工人', tagline: '升不升职都行，别裁我。',
    color: '#78716c', emoji: '🧘',
    description: '升职？好的。不升？也行。加薪？不错。没加？够花就行。你是公司里最不焦虑的人，不是因为你没追求，而是你已经把"接受"这个技能点满了。你的同事在为KPI焦虑的时候，你在想中午吃什么。你的领导在讲愿景的时候，你在想周末去哪玩。佛系不是躺平，是你早就看透了——工作而已，没必要太上头。',
    profile: { W1: 'M', W2: 'M', W3: 'H', W4: 'M', W5: 'L' },
  },
  {
    slug: 'quit', code: 'QUIT', name: '精神离职人', tagline: '人在工位，心在马尔代夫。',
    color: '#ec4899', emoji: '💭',
    description: '你每天至少想辞职三次：起床的时候一次、被领导叫去的时候一次、加班的时候一次。你已经精神上离开了这家公司，但身体还在工位上坚持着。你的辞职信在心里改了八百遍，但存款余额每次都把你拉回了现实。你是全公司最想走的人，也是最走不了的人。但谁知道呢，也许哪天你就真走了。',
    profile: { W1: 'L', W2: 'L', W3: 'L', W4: 'H', W5: 'L' },
  },
  {
    slug: 'climb', code: 'CLIMB', name: '野心家', tagline: '这个位子迟早是我的。',
    color: '#eab308', emoji: '📈',
    description: '你不是来打工的，你是来升职的。每一次对话你都在有意无意地展示自己，每一个项目你都在计算能给履历加多少分。你的LinkedIn更新频率比朋友圈还高，你的学习清单比KPI清单还长。你的同事分三种：对你有用的、暂时没用的、和碍事的。你不是冷酷，你只是比大多数人都清楚自己要什么。',
    profile: { W1: 'H', W2: 'H', W3: 'M', W4: 'L', W5: 'H' },
  },
  {
    slug: 'tool', code: 'TOOL', name: '工具人', tagline: '什么都会干，什么都没升。',
    color: '#3b82f6', emoji: '🔧',
    description: '什么活都找你，什么忙都帮，什么都会但什么都没升职。你是全公司最好用的那把瑞士军刀——打印机坏了找你，Excel不会了找你，尾牙策划也找你。你的能力毋庸置疑，但你最大的问题是不会拒绝，也不会邀功。在职场里，会做的不如会说的，你就是那个"会做"的典型。',
    profile: { W1: 'H', W2: 'L', W3: 'L', W4: 'L', W5: 'L' },
  },
  {
    slug: 'snack', code: 'SNACK', name: '零食续命者', tagline: '没有零食解决不了的bug。',
    color: '#ea580c', emoji: '🍪',
    description: '你的工位抽屉打开就是一个小型超市。你相信一个真理：没有零食解决不了的工作问题，如果有，那就再来一包。你的工作节奏是"干一会儿→吃点东西→再干一会儿→再吃点"的完美循环。同事每次路过你的工位都会忍不住伸手摸一把——在这个每个人都焦虑的职场里，你就是那颗最甜的巧克力。',
    profile: { W1: 'M', W2: 'H', W3: 'L', W4: 'M', W5: 'M' },
  },
  {
    slug: 'drama', code: 'DRAMA', name: '职场戏精', tagline: '上班如上戏，全靠演技。',
    color: '#d946ef', emoji: '🎭',
    description: '你是同事眼中的实力派演员。领导面前你是最积极的那个，同事面前你是最亲和的那个，独处的时候你是最摆烂的那个。你的表情管理和情绪切换堪比影帝——上一秒还在吐槽加班，下一秒领导走过来你就秒变"我超爱工作"脸。你不是虚伪，你这叫"职场求生技能"。',
    profile: { W1: 'M', W2: 'H', W3: 'L', W4: 'M', W5: 'H' },
  },
  {
    slug: 'ceo', code: 'CEO', name: '未来老板', tagline: '打工是暂时的，当老板才是归宿。',
    color: '#dc2626', emoji: '👔',
    description: '你打工的每一天都在为未来当老板做准备。你研究商业模式比研究KPI认真十倍，你在公司学到的最有价值的东西不是业务能力而是管理经验。你已经在脑海里注册了八百次公司，虽然还没迈出第一步。你的同事觉得你是个异类，但你知道——所有的伟大故事都是从给别人打工开始的。',
    profile: { W1: 'H', W2: 'M', W3: 'H', W4: 'L', W5: 'H' },
  },
];

export function getWorkPersonalityBySlug(slug: string): WorkPersonalityType | undefined {
  return WORK_PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getAllWorkSlugs(): string[] {
  return WORK_PERSONALITY_TYPES.map(p => p.slug);
}
