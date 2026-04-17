import fs from 'node:fs';

function loadEnv() {
  const text = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    env[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
  }

  return env;
}

const env = loadEnv();
const baseUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}/${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function clearUniverse(universeId) {
  const questions = await request(`creator_questions?select=id&universe_id=eq.${universeId}`);
  const questionIds = questions.map((item) => item.id);

  if (questionIds.length > 0) {
    await request(`creator_options?question_id=in.(${questionIds.join(',')})`, {
      method: 'DELETE',
    });
  }

  await request(`creator_questions?universe_id=eq.${universeId}`, { method: 'DELETE' });
  await request(`creator_personalities?universe_id=eq.${universeId}`, { method: 'DELETE' });
  await request(`creator_axes?universe_id=eq.${universeId}`, { method: 'DELETE' });
}

async function replaceUniverseContent(config) {
  await clearUniverse(config.id);

  await request(`creator_universes?id=eq.${config.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(config.universe),
  });

  await request('creator_personalities', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(
      config.personalities.map((item, index) => ({
        universe_id: config.id,
        sort_order: index,
        profile: {},
        ...item,
      })),
    ),
  });

  const insertedQuestions = await request('creator_questions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(
      config.questions.map((item, index) => ({
        universe_id: config.id,
        text: item.text,
        sort_order: index,
      })),
    ),
  });

  const options = [];
  for (const insertedQuestion of insertedQuestions) {
    const question = config.questions.find((item) => item.text === insertedQuestion.text);
    if (!question) continue;

    question.options.forEach((option, index) => {
      options.push({
        question_id: insertedQuestion.id,
        text: option.text,
        sort_order: index,
        target_personality: option.target_personality,
      });
    });
  }

  await request('creator_options', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(options),
  });
}

const now = new Date().toISOString();

await request('creators?id=eq.212d4666-191a-4779-8b9f-7c51e40e05ea', {
  method: 'PATCH',
  headers: { Prefer: 'return=representation' },
  body: JSON.stringify({
    name: 'test1',
    bio: '偏神秘感与戏剧张力的人格测试创作者，用高识别度结果做截图传播。',
    social_link: 'https://example.com/test1',
    is_verified: true,
  }),
});

await replaceUniverseContent({
  id: 'da26127a-7fea-498d-9d10-15a2ff5aabac',
  universe: {
    slug: 'my-mystic-persona',
    name: '我的灵性神谕人格',
    emoji: '🌙',
    description: '一个偏神秘直觉与夜色感的轻量人格测试，用来验证公开创作者链路。',
    primary_color: '#7b61ff',
    scoring_mode: 'direct',
    status: 'published',
    published_at: now,
    submitted_at: now,
    review_note: null,
    total_tests: 18,
    total_shares: 6,
  },
  personalities: [
    {
      slug: 'moon-guide',
      name: '月光引路人',
      emoji: '🌔',
      tagline: '你像一张会把人慢慢引回内心的牌。',
      color: '#7b61ff',
      quote: '不是所有力量都需要轰鸣，有些力量只是静静发亮。',
      copy_hit: '你更擅长给人一种被轻轻托住的感觉。',
      copy_os: '你的结果气质偏柔和安抚型，很适合被人截图收藏。',
      copy_symptoms: ['共情力强', '容易让人安心', '适合疗愈向分享'],
      copy_closer: '这是一个适合公开结果页和社交传播的温柔型人格。',
    },
    {
      slug: 'sigil-keeper',
      name: '符咒收藏家',
      emoji: '🪬',
      tagline: '你习惯在混乱里寻找隐藏的符号。',
      color: '#9d4edd',
      quote: '你以为自己只是在感受，其实你已经在读取暗线。',
      copy_hit: '你身上有一种会提前感觉到剧情走向的神秘雷达。',
      copy_os: '这个结果更偏深夜感、直觉感和一点点危险的吸引力。',
      copy_symptoms: ['对细节敏感', '直觉先于解释', '容易成为分享主角'],
      copy_closer: '它更像一张夜间发亮的牌，适合承担高辨识度的截图位。',
    },
  ],
  questions: [
    {
      text: '深夜一个人待着时，你更容易进入哪种状态？',
      options: [
        { text: '安静疗愈，像把自己慢慢抱住', target_personality: 'moon-guide' },
        { text: '灵感翻涌，像在和看不见的线索对话', target_personality: 'sigil-keeper' },
      ],
    },
    {
      text: '做重大选择时，你第一反应更像？',
      options: [
        { text: '先感受内心是否安定', target_personality: 'moon-guide' },
        { text: '先抓住那一下最强的直觉', target_personality: 'sigil-keeper' },
      ],
    },
    {
      text: '别人最容易从你身上感觉到哪种氛围？',
      options: [
        { text: '柔和、会让人想靠近', target_personality: 'moon-guide' },
        { text: '神秘、会让人忍不住多看一眼', target_personality: 'sigil-keeper' },
      ],
    },
    {
      text: '如果你是一张牌，你更像哪种功能？',
      options: [
        { text: '把人引回自己的中心', target_personality: 'moon-guide' },
        { text: '照见暗线，提前预警', target_personality: 'sigil-keeper' },
      ],
    },
    {
      text: '你会把自己的敏感更多用在哪？',
      options: [
        { text: '安抚别人，也安抚自己', target_personality: 'moon-guide' },
        { text: '解读气氛，读取隐藏信息', target_personality: 'sigil-keeper' },
      ],
    },
  ],
});

await replaceUniverseContent({
  id: 'f3c6e83c-d4ca-4dec-a2ed-5f973158bce9',
  universe: {
    slug: 'sang',
    name: '三国杀人格',
    emoji: '🀄',
    description: '一套用于后台审核联调的关系与阵营感人格测试。',
    primary_color: '#d9485f',
    scoring_mode: 'direct',
    status: 'review',
    published_at: null,
    submitted_at: now,
    review_note: null,
    total_tests: 0,
    total_shares: 0,
  },
  personalities: [
    {
      slug: 'open-blade',
      name: '明牌突击手',
      emoji: '⚔️',
      tagline: '你习惯把态度摆在桌面上。',
      color: '#d9485f',
      quote: '有些牌不藏，反而更有压迫感。',
      copy_hit: '你更像会把节奏主动拉到自己手上的人。',
      copy_os: '这种人格适合承担高冲突、高表态感的结果位。',
      copy_symptoms: ['存在感强', '不爱兜圈子', '容易在群体里成为前排'],
      copy_closer: '适合做角色代入和阵营站队型测试。',
    },
    {
      slug: 'shadow-operator',
      name: '暗线控场者',
      emoji: '🕶️',
      tagline: '你不需要高调，也能慢慢把局势拧向自己。',
      color: '#6c8ef5',
      quote: '真正的优势，不一定第一时间被看见。',
      copy_hit: '你更像会先读懂场面，再决定什么时候出手的人。',
      copy_os: '它适合承接观察局势、后手翻盘型用户。',
      copy_symptoms: ['节奏感强', '擅长观察', '不轻易暴露底牌'],
      copy_closer: '适合审核流程里验证结构化驳回和通过动作。',
    },
  ],
  questions: [
    {
      text: '开局拿到关键牌时，你第一反应更像？',
      options: [
        { text: '直接亮态度，先把场面打热', target_personality: 'open-blade' },
        { text: '先观察，等更值钱的时机', target_personality: 'shadow-operator' },
      ],
    },
    {
      text: '队友节奏开始乱时，你更可能？',
      options: [
        { text: '先发话，把队伍重新聚起来', target_personality: 'open-blade' },
        { text: '先记信息，再找更稳的翻盘点', target_personality: 'shadow-operator' },
      ],
    },
    {
      text: '你在局里更想扮演哪种位置？',
      options: [
        { text: '前排压迫位', target_personality: 'open-blade' },
        { text: '暗线运营位', target_personality: 'shadow-operator' },
      ],
    },
    {
      text: '别人最怕你哪一点？',
      options: [
        { text: '你一旦出手就很难被忽视', target_personality: 'open-blade' },
        { text: '你总能比别人早一步看懂局势', target_personality: 'shadow-operator' },
      ],
    },
    {
      text: '如果只能留一个优势，你会留？',
      options: [
        { text: '爆发和存在感', target_personality: 'open-blade' },
        { text: '耐心和控场', target_personality: 'shadow-operator' },
      ],
    },
  ],
});

console.log('UGC smoke data seeded.');