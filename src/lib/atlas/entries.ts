/**
 * W5 · E5.2 · 「她词条」atlas v0
 * 编辑部主笔 + 命理引擎给坐标 + SALON 留言精选 + AI 共写助手
 * 首批 5 词条；暂不开放投稿（邀请制）。
 *
 * 数据为内置 v0；后续接入 hermosa_messages + 命理引擎 v2 后改为聚合生成。
 */

export type AtlasCoordinate = {
  star: string; // 紫微主星
  moon: string; // 月相
  wuxing: string; // 五行偏向
};

export type AtlasEntry = {
  slug: string;
  title: string;
  short: string; // 一句副标
  pillar: 'life' | 'kin' | 'work' | 'self' | 'love'; // 内部分类
  pillar_label: string;
  body: string; // 编辑部主笔，约 300-450 字
  coords: AtlasCoordinate;
  voices: { text: string; signature: string }[]; // 来自沙龙的精选回声 v0
  also_known_as: string[]; // 别名 / 同义说法
  edit_status: 'draft-v0' | 'co-writing'; // 共写状态
};

export const ATLAS_ENTRIES: AtlasEntry[] = [
  {
    slug: 'unsent-words',
    title: '撤回的话',
    short: '一句没发出去就被删掉的话，去哪儿了？',
    pillar: 'self',
    pillar_label: '自我',
    body: '撤回的话不是消失，是被收纳。她在打字、删字、再打字之间，做了一次很小的命理动作——她在替自己做选择。心理学叫「自我编辑」，命理叫「太阴守命」：月亮在内宫，话不说出去，是因为月亮还没亮。\n\n值得记下的不是「最终发出的那句」，而是「被你按住的那句」。前者是社交资产，后者才是你自己的。如果你愿意，可以把它写在沙龙里——不是为了被回应，是为了让它有一个被存起来的地方。撤回不是怯懦。撤回是你愿意先把它拿在手里看一会儿，再决定要不要给出去。',
    coords: { star: '太阴', moon: '初月 · 朔', wuxing: '水偏旺' },
    voices: [
      { text: '我打了三遍又删掉，最后只发了一个「嗯」。', signature: '某个加班到 11 点的女孩' },
      { text: '撤回不是没说，是说给自己听了一遍。', signature: '编辑部 · L' },
    ],
    also_known_as: ['没发出去的微信', '草稿里的那一段', '我打了又删的话'],
    edit_status: 'draft-v0',
  },
  {
    slug: 'mom-generation',
    title: '妈妈那一代',
    short: '你想懂她，但你又不想变成她。',
    pillar: 'kin',
    pillar_label: '亲缘',
    body: '「妈妈那一代」不是一个年龄段，是一种被反复写进我们身体里的版本：她忍、她省、她把好的留给别人。我们想感谢她，但我们也害怕——感谢得太用力，会不会就变成她？命理学里这叫「天同坐父母宫」：温柔是遗产，但温柔不能是唯一的遗产。\n\n你可以同时存在两件事：心疼她、又不必复制她。允许自己活得比她更松一点，不是背叛——是你替她，把她当年没机会松下来的那部分，活了出来。',
    coords: { star: '天同', moon: '上弦 · 望前', wuxing: '土带湿' },
    voices: [
      { text: '我开始想你了，妈妈。但我不想变成你。', signature: 'Anonymous' },
      { text: '原来她忍的那些事，我可以选择不忍。', signature: '某个学会拒绝的女孩' },
    ],
    also_known_as: ['上一代女性', '我妈那个年代', '原生家庭里的那个母亲版本'],
    edit_status: 'co-writing',
  },
  {
    slug: 'ai-changed-my-work',
    title: 'AI 让我的工作变了',
    short: '当机器把你最熟练的那部分接走之后。',
    pillar: 'work',
    pillar_label: '事业',
    body: 'AI 来到你工位的那一天，最先消失的不是工作，是「熟练带来的安全感」。你过去靠速度赢的那一部分，现在被一个不会累的同事接走了。命理学说这是「七杀冲事业宫」——刀光一闪，旧的护城河塌了。\n\n但这不是你被淘汰，是你被请去做更难的事：判断、品味、关系、情绪劳动。这些事 AI 暂时学不会，因为它没有身体，也没有过被同事冷落、被领导否定、被家里催婚的经历。你的不可替代性，从来不在熟练，而在你这一身经历过的东西。',
    coords: { star: '七杀', moon: '望后 · 缺始', wuxing: '金主断' },
    voices: [
      { text: '我做得最快的那部分，现在 ChatGPT 三秒就完了。', signature: '某个文案策划' },
      { text: '原来我值钱的不是写得快，是判断得准。', signature: '编辑部 · M' },
    ],
    also_known_as: ['AI 焦虑', '会不会被取代', '我的技能贬值了'],
    edit_status: 'co-writing',
  },
  {
    slug: 'i-stopped-explaining',
    title: '我决定不再解释',
    short: '把力气，留给真的会听的人。',
    pillar: 'self',
    pillar_label: '自我',
    body: '解释这件事，需要两个前提：对方愿意听，并且，你愿意被听见之后还和他在一起。如果其中任何一个不在，解释就只是消耗。命理学讲「贪狼化忌入交友宫」——你越想把自己说清楚，越被误读。\n\n停止解释不是冷漠，是你终于愿意承认：不是所有人都该懂你。有些人留在不懂你的版本里，比一定要把你拉过来好。把你的力气、你的字、你的那些只想和懂你的人说的句子，留给真的会接住的那几个人。',
    coords: { star: '贪狼', moon: '满月 · 望', wuxing: '木带火' },
    voices: [
      { text: '我决定不再解释。我把这份力气留给我自己。', signature: '某个终于愿意把门关上的女孩' },
      { text: '不被理解不是错，错是为了被理解把自己折叠。', signature: 'Anonymous' },
    ],
    also_known_as: ['不想再解释了', '懒得说了', '随便他们怎么想吧'],
    edit_status: 'draft-v0',
  },
  {
    slug: 'rest-without-guilt',
    title: '允许自己休息',
    short: '不是奖励，是基础设施。',
    pillar: 'life',
    pillar_label: '生活',
    body: '我们这一代女孩学到的「休息」是一种奖励：你做完了，你赢了，所以你被允许休息。但身体并不按这套规则运行——身体只在累之前休息时，才真的恢复。命理学讲「天同守命」：温柔自养，是命格的根基，不是奖品。\n\n所以试着把休息从「reward」改成「infrastructure」：今天什么都没完成，也可以休息；今天什么都搞砸了，更要休息。真正可怕的不是你没做完，是你把自己耗到只剩任务、没有人。',
    coords: { star: '天同', moon: '下弦 · 缺末', wuxing: '土守中' },
    voices: [
      { text: '原来我可以在没做完之前就休息。', signature: '某个不再加班的女孩' },
      { text: '休息不是奖励。休息是工作能继续的前提。', signature: '编辑部 · J' },
    ],
    also_known_as: ['理直气壮地躺平', '我也可以累', '我不是机器'],
    edit_status: 'draft-v0',
  },
];

export function findEntryBySlug(slug: string): AtlasEntry | null {
  return ATLAS_ENTRIES.find((e) => e.slug === slug) ?? null;
}
