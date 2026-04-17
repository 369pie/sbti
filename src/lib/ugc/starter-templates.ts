import type { SupabaseClient } from '@supabase/supabase-js';
import type { ScoringMode } from './flexible-scoring';
import { addPersonality, addQuestion, upsertAxes } from './db';

type TemplateAxis = {
  axisKey: string;
  name: string;
  lowLabel: string;
  highLabel: string;
};

type TemplateQuestion = {
  text: string;
  options: {
    text: string;
    scores: Record<string, number>;
  }[];
};

type TemplatePersonality = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  quote: string;
  copyHit: string;
  copyOs: string;
  copySymptoms: string[];
  copyCloser: string;
  profile: Record<string, 'H' | 'L'>;
};

export interface StarterTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bestFor: string;
  defaultName: string;
  defaultSlug: string;
  primaryColor: string;
  scoringMode: ScoringMode;
  axes: TemplateAxis[];
  questions: TemplateQuestion[];
  personalities: TemplatePersonality[];
}

export interface StarterTemplateCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bestFor: string;
  defaultName: string;
  defaultSlug: string;
  primaryColor: string;
  counts: {
    axes: number;
    questions: number;
    personalities: number;
  };
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'hot-topic-drama',
    name: '热点剧情人格模板',
    emoji: '🎬',
    description: '适合热剧、综艺、IP 角色型测试，先把角色阵营快速搭起来。',
    bestFor: '追热点、角色代入、站队型内容',
    defaultName: '我的热点角色人格',
    defaultSlug: 'my-drama-persona',
    primaryColor: '#ff6b6b',
    scoringMode: 'dimension',
    axes: [
      { axisKey: 'spotlight', name: '存在感', lowLabel: '低调', highLabel: '高调' },
      { axisKey: 'strategy', name: '行动风格', lowLabel: '直觉', highLabel: '布局' },
      { axisKey: 'emotion', name: '情绪表达', lowLabel: '克制', highLabel: '外放' },
    ],
    questions: [
      {
        text: '当全场注意力都落到你身上时，你更像？',
        options: [
          { text: '先稳住场面，再决定要不要出手', scores: { spotlight: -1, strategy: 1, emotion: -1 } },
          { text: '先接住视线，顺势把气氛点燃', scores: { spotlight: 1, strategy: 0, emotion: 1 } },
        ],
      },
      {
        text: '遇到关系里的风波，你第一反应通常是？',
        options: [
          { text: '先观察局势，看谁在说真话', scores: { spotlight: -1, strategy: 1, emotion: -1 } },
          { text: '先表达态度，让别人知道你不接受什么', scores: { spotlight: 1, strategy: -1, emotion: 1 } },
        ],
      },
      {
        text: '如果必须在一群人里选一个最像你的角色定位，你会选？',
        options: [
          { text: '不抢镜，但关键时刻能翻盘的人', scores: { spotlight: -1, strategy: 1, emotion: 0 } },
          { text: '走到哪都能成为场上中心的人', scores: { spotlight: 1, strategy: 0, emotion: 1 } },
        ],
      },
      {
        text: '别人最容易从你身上感受到什么？',
        options: [
          { text: '你有自己的打算，不会轻易表露', scores: { spotlight: -1, strategy: 1, emotion: -1 } },
          { text: '你情绪鲜明，气场很难被忽视', scores: { spotlight: 1, strategy: -1, emotion: 1 } },
        ],
      },
      {
        text: '如果必须赢下一局，你更依赖？',
        options: [
          { text: '提前布局和稳稳推进', scores: { spotlight: -1, strategy: 1, emotion: -1 } },
          { text: '临场爆发和强势拿下', scores: { spotlight: 1, strategy: -1, emotion: 1 } },
        ],
      },
      {
        text: '你的魅力更像哪种类型？',
        options: [
          { text: '越相处越上头的隐藏款', scores: { spotlight: -1, strategy: 1, emotion: -1 } },
          { text: '一出场就让人记住的明牌款', scores: { spotlight: 1, strategy: -1, emotion: 1 } },
        ],
      },
    ],
    personalities: [
      {
        slug: 'hidden-chessmaster',
        name: '暗线操盘手',
        emoji: '♟️',
        tagline: '你不抢戏，但很多局都是你悄悄收的。',
        color: '#d9485f',
        quote: '真正厉害的人，往往看起来并不着急。',
        copyHit: '你最强的地方不是声音最大，而是每次都踩在节奏点上。',
        copyOs: '你适合那种“越看越有后劲”的角色原型，也适合热点型宇宙里承担反转位。',
        copySymptoms: ['擅长观察关系网', '不轻易暴露底牌', '容易成为关键剧情推动者'],
        copyCloser: '建议先保留这个骨架，把它替换成你想做的角色名和剧情梗。',
        profile: { spotlight: 'L', strategy: 'H', emotion: 'L' },
      },
      {
        slug: 'front-row-volcano',
        name: '前排火山体',
        emoji: '🌋',
        tagline: '你自带剧情推进力，气氛一冷就会被你点燃。',
        color: '#ff6b6b',
        quote: '有些人一出现，故事就开始加速。',
        copyHit: '你的优势是存在感和冲击力，非常适合爆点型内容。',
        copyOs: '如果你要做的是高互动测试，这个人格骨架适合承接“主角感”“高能量”结果。',
        copySymptoms: ['容易成为全场焦点', '情绪表达直接', '擅长把平静局面搅热'],
        copyCloser: '把这里换成你的角色宇宙专属文案，就能很快做出第一版。',
        profile: { spotlight: 'H', strategy: 'L', emotion: 'H' },
      },
      {
        slug: 'silent-core',
        name: '冷静核心派',
        emoji: '🧊',
        tagline: '你负责稳，别人负责热闹。',
        color: '#6c8ef5',
        quote: '没有人注意到的那部分，往往才是真正的根基。',
        copyHit: '你在人群里看似克制，实际上很有掌控感。',
        copyOs: '这类人格适合写成“白切黑”“冷感支柱”“理性守门员”等角色路线。',
        copySymptoms: ['不轻易表态', '能扛压', '处理混乱时反而更清醒'],
        copyCloser: '先保留结构，再把它换成更符合你内容世界观的语言。',
        profile: { spotlight: 'L', strategy: 'H', emotion: 'L' },
      },
      {
        slug: 'rose-storm',
        name: '玫瑰风暴型',
        emoji: '🌹',
        tagline: '锋利和浪漫同时长在你身上。',
        color: '#ff4d6d',
        quote: '你不是温和地出现，你是带着情绪和立场来的。',
        copyHit: '你天然适合“高辨识度 + 高情绪价值”的结果类型。',
        copyOs: '对热点内容创作者来说，这种人格很适合承接评论区站队和分享截图。',
        copySymptoms: ['有鲜明态度', '能给人强烈记忆点', '适合承担爆款结果位'],
        copyCloser: '把原型和文案换成你的 IP 角色后，这类结果很容易成为分享主力。',
        profile: { spotlight: 'H', strategy: 'L', emotion: 'H' },
      },
    ],
  },
  {
    id: 'emotion-relationship',
    name: '情感关系人格模板',
    emoji: '💞',
    description: '适合情感号、关系观察、亲密关系人格测试，强调被理解和共鸣。',
    bestFor: '情感、恋爱、关系内耗、自我理解',
    defaultName: '我的情感关系人格',
    defaultSlug: 'my-relationship-persona',
    primaryColor: '#ff8fab',
    scoringMode: 'dimension',
    axes: [
      { axisKey: 'closeness', name: '亲密距离', lowLabel: '慢热', highLabel: '靠近' },
      { axisKey: 'boundary', name: '边界感', lowLabel: '柔软', highLabel: '清晰' },
      { axisKey: 'intuition', name: '关系感知', lowLabel: '后知后觉', highLabel: '很敏锐' },
    ],
    questions: [
      {
        text: '有人突然变冷淡时，你通常会？',
        options: [
          { text: '先退一步，不想把话说太满', scores: { closeness: -1, boundary: 1, intuition: 0 } },
          { text: '会立刻感受到变化，想知道发生了什么', scores: { closeness: 1, boundary: -1, intuition: 1 } },
        ],
      },
      {
        text: '在关系里你更怕哪件事？',
        options: [
          { text: '自己过度投入，最后失去分寸', scores: { closeness: 1, boundary: -1, intuition: 0 } },
          { text: '自己太清醒，错过真正的连接', scores: { closeness: -1, boundary: 1, intuition: 1 } },
        ],
      },
      {
        text: '你更像哪种陪伴方式？',
        options: [
          { text: '安静在场，等对方开口', scores: { closeness: -1, boundary: 1, intuition: -1 } },
          { text: '先捕捉到情绪，再主动靠近', scores: { closeness: 1, boundary: -1, intuition: 1 } },
        ],
      },
      {
        text: '你最常被别人评价成？',
        options: [
          { text: '看起来温柔，但其实有自己的边界', scores: { closeness: -1, boundary: 1, intuition: 0 } },
          { text: '很容易共情，也很容易被情绪带走', scores: { closeness: 1, boundary: -1, intuition: 1 } },
        ],
      },
      {
        text: '如果关系里出现误会，你更倾向？',
        options: [
          { text: '整理好自己再说，避免把场面弄乱', scores: { closeness: -1, boundary: 1, intuition: -1 } },
          { text: '马上沟通，哪怕过程有点情绪化', scores: { closeness: 1, boundary: -1, intuition: 1 } },
        ],
      },
      {
        text: '你真正需要的关系通常是？',
        options: [
          { text: '尊重边界，但又不会离得太远', scores: { closeness: -1, boundary: 1, intuition: 0 } },
          { text: '高浓度理解和不需要解释的默契', scores: { closeness: 1, boundary: -1, intuition: 1 } },
        ],
      },
    ],
    personalities: [
      {
        slug: 'soft-boundary',
        name: '温柔边界派',
        emoji: '🫶',
        tagline: '你不是冷淡，你只是知道关系也需要秩序。',
        color: '#ff8fab',
        quote: '真正稳定的靠近，不会让你失去自己。',
        copyHit: '你很适合成为情感类宇宙里“看似柔软，实则很稳”的结果位。',
        copyOs: '这类结果容易让用户觉得被理解，也很适合做成长图文案。',
        copySymptoms: ['愿意照顾他人', '不会无限退让', '需要安全但不粘人'],
        copyCloser: '继续改成你自己的语言系统，就能成为非常稳的情感向模板结果。',
        profile: { closeness: 'L', boundary: 'H', intuition: 'L' },
      },
      {
        slug: 'destiny-sensor',
        name: '宿命感雷达',
        emoji: '🔮',
        tagline: '你对关系气氛的变化，往往比别人先感觉到。',
        color: '#a56eff',
        quote: '有些人不是会算命，只是太会感受。',
        copyHit: '这类人格自带“说中我了”的命中感，很适合做用户截图传播。',
        copyOs: '如果你的内容偏灵性、情绪和命运感，这会是非常适合保留的一型。',
        copySymptoms: ['能感知关系微妙变化', '很容易共情', '直觉在关系里总是很忙'],
        copyCloser: '你可以把它进一步改造成你的关系宇宙里的高人气主角。',
        profile: { closeness: 'H', boundary: 'L', intuition: 'H' },
      },
      {
        slug: 'clear-eyed-exit',
        name: '清醒止损派',
        emoji: '✂️',
        tagline: '你知道爱很重要，但自我更重要。',
        color: '#f28482',
        quote: '及时离开不是输，是在给自己留出口。',
        copyHit: '这类结果特别适合情感号的“清醒文学”路线。',
        copyOs: '如果你内容偏自救、自尊、关系边界，这个人格能直接拿来改。',
        copySymptoms: ['恢复速度快', '会做利弊判断', '很难长期沉没在失衡关系里'],
        copyCloser: '把词汇换成更贴合你受众的语言，用户就会很容易带入。',
        profile: { closeness: 'L', boundary: 'H', intuition: 'H' },
      },
      {
        slug: 'slow-burn-heart',
        name: '慢热心焰型',
        emoji: '🕯️',
        tagline: '你不是不靠近，只是靠近前会先确认安全。',
        color: '#ffb4a2',
        quote: '真正的靠近，对你来说要慢一点才算真。',
        copyHit: '它适合承接“看起来淡，实则很深”的情感型用户。',
        copyOs: '这类结果在恋爱、友情和自我理解内容里都很泛用。',
        copySymptoms: ['慢热', '珍惜稳定关系', '不轻易示弱但一旦信任就很深'],
        copyCloser: '先用它做第一版，后面再逐步换成更有你个人辨识度的版本。',
        profile: { closeness: 'L', boundary: 'L', intuition: 'L' },
      },
    ],
  },
  {
    id: 'mystic-archetype',
    name: '灵性神谕人格模板',
    emoji: '🌙',
    description: '适合塔罗、神秘学、灵性人格内容，结果自带仪式感和截图传播气质。',
    bestFor: '塔罗、神谕、月相、灵性人格',
    defaultName: '我的灵性神谕人格',
    defaultSlug: 'my-mystic-persona',
    primaryColor: '#7b61ff',
    scoringMode: 'dimension',
    axes: [
      { axisKey: 'intuition', name: '直觉强度', lowLabel: '现实', highLabel: '灵感' },
      { axisKey: 'ritual', name: '仪式感', lowLabel: '轻盈', highLabel: '庄重' },
      { axisKey: 'shadow', name: '暗面亲密度', lowLabel: '明亮', highLabel: '深夜感' },
    ],
    questions: [
      {
        text: '你更相信哪种指引？',
        options: [
          { text: '现实里的细节和证据', scores: { intuition: -1, ritual: -1, shadow: -1 } },
          { text: '突然闪过的一种感应', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
      {
        text: '你最容易在什么时刻感到自己和世界连上了？',
        options: [
          { text: '清晨、光线刚刚亮起来的时候', scores: { intuition: 0, ritual: -1, shadow: -1 } },
          { text: '夜晚、一个人和情绪待在一起的时候', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
      {
        text: '如果你有一张属于自己的牌，它更像？',
        options: [
          { text: '一张温柔却稳定的光牌', scores: { intuition: -1, ritual: 0, shadow: -1 } },
          { text: '一张会在深夜发亮的影牌', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
      {
        text: '你更偏爱哪种力量感？',
        options: [
          { text: '柔和、疗愈、像把人稳稳接住', scores: { intuition: 0, ritual: -1, shadow: -1 } },
          { text: '锋利、预感强、像提前看见结局', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
      {
        text: '你做选择时更依赖？',
        options: [
          { text: '先让自己落地，再看现实条件', scores: { intuition: -1, ritual: -1, shadow: 0 } },
          { text: '先听内心那一下震动，再决定怎么走', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
      {
        text: '你的神秘气质更接近哪一类？',
        options: [
          { text: '白昼疗愈型，像会安抚人的光', scores: { intuition: -1, ritual: 0, shadow: -1 } },
          { text: '深夜召唤型，像会看穿人的雾', scores: { intuition: 1, ritual: 1, shadow: 1 } },
        ],
      },
    ],
    personalities: [
      {
        slug: 'moon-guide',
        name: '月光引路人',
        emoji: '🌔',
        tagline: '你像一张会把人慢慢引回内心的牌。',
        color: '#7b61ff',
        quote: '不是所有力量都需要轰鸣，有些力量只是静静发亮。',
        copyHit: '你适合承接“被理解”“被安抚”“被看见”的灵性型结果。',
        copyOs: '如果你做的是女性向神谕内容，这会是一张很稳的入口卡。',
        copySymptoms: ['共情力强', '适合安抚型文案', '容易让人愿意截图收藏'],
        copyCloser: '继续把名称、意象和神谕语句换成你的世界观，就能快速成型。',
        profile: { intuition: 'L', ritual: 'L', shadow: 'L' },
      },
      {
        slug: 'sigil-keeper',
        name: '符咒收藏家',
        emoji: '🪬',
        tagline: '你习惯在混乱里寻找隐藏的符号。',
        color: '#9d4edd',
        quote: '你以为自己只是在感受，其实你已经在读取暗线。',
        copyHit: '它很适合承担神秘学宇宙里的高辨识度结果位。',
        copyOs: '如果你要做的是月相、占卜、符号学内容，这一型非常通用。',
        copySymptoms: ['容易对细节有预感', '喜欢象征和隐喻', '常常能在别人忽略处读到信息'],
        copyCloser: '保留骨架，再逐步增加你的牌阵、元素和神谕设定。',
        profile: { intuition: 'H', ritual: 'H', shadow: 'H' },
      },
      {
        slug: 'mist-reader',
        name: '夜雾占读者',
        emoji: '🌫️',
        tagline: '你不是在逃离现实，你是在靠近更深的感受层。',
        color: '#5a189a',
        quote: '夜色不是让你迷路，而是让你看见平时看不见的东西。',
        copyHit: '这型适合偏深夜、情绪、暗面修复的灵性内容。',
        copyOs: '如果你希望结果页更有诗意和氛围感，这一型会很好用。',
        copySymptoms: ['喜欢深夜独处', '对情绪波动敏感', '更容易在安静时有答案'],
        copyCloser: '你可以把它继续发展成一张很适合小红书截图传播的神谕卡。',
        profile: { intuition: 'H', ritual: 'H', shadow: 'H' },
      },
      {
        slug: 'sun-healer',
        name: '白昼疗愈师',
        emoji: '☀️',
        tagline: '你是那种看起来轻盈，却能给人安全感的存在。',
        color: '#ffd166',
        quote: '真正的疗愈，不是抹掉阴影，而是让光有地方落下。',
        copyHit: '这型适合承接“温柔、恢复、重新对齐”的结果内容。',
        copyOs: '它能很好地平衡神秘学内容里过重的夜色感，适合做入口型结果。',
        copySymptoms: ['给人稳定感', '不抢戏但有存在感', '适合做温柔疗愈向表达'],
        copyCloser: '先用它做发布骨架，后面再叠加更精细的神谕语言。',
        profile: { intuition: 'L', ritual: 'L', shadow: 'L' },
      },
    ],
  },
];

export const STARTER_TEMPLATE_CARDS: StarterTemplateCard[] = STARTER_TEMPLATES.map((template) => ({
  id: template.id,
  name: template.name,
  emoji: template.emoji,
  description: template.description,
  bestFor: template.bestFor,
  defaultName: template.defaultName,
  defaultSlug: template.defaultSlug,
  primaryColor: template.primaryColor,
  counts: {
    axes: template.axes.length,
    questions: template.questions.length,
    personalities: template.personalities.length,
  },
}));

export function getStarterTemplate(templateId?: string | null): StarterTemplate | null {
  if (!templateId) return null;
  return STARTER_TEMPLATES.find((template) => template.id === templateId) ?? null;
}

export async function seedUniverseFromStarterTemplate(
  supabase: SupabaseClient,
  universeId: string,
  templateId: string,
): Promise<boolean> {
  const template = getStarterTemplate(templateId);
  if (!template) return false;

  const axesOk = await upsertAxes(supabase, universeId, template.axes);
  if (!axesOk) return false;

  for (const [index, question] of template.questions.entries()) {
    const questionId = await addQuestion(supabase, universeId, {
      text: question.text,
      sortOrder: index,
      options: question.options.map((option) => ({
        text: option.text,
        scores: option.scores,
      })),
    });

    if (!questionId) return false;
  }

  for (const [index, personality] of template.personalities.entries()) {
    const personalityId = await addPersonality(supabase, universeId, {
      slug: personality.slug,
      name: personality.name,
      emoji: personality.emoji,
      tagline: personality.tagline,
      color: personality.color,
      quote: personality.quote,
      copyHit: personality.copyHit,
      copyOs: personality.copyOs,
      copySymptoms: personality.copySymptoms,
      copyCloser: personality.copyCloser,
      profile: personality.profile,
      sortOrder: index,
    });

    if (!personalityId) return false;
  }

  return true;
}