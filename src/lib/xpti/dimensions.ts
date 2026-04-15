export interface XptiDimension {
  id: string;
  name: string;
  model: XptiModelType;
  description: string;
  poleHighLabel: string;
  poleLowLabel: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type XptiModelType =
  | 'dominance'
  | 'exposure'
  | 'sensory'
  | 'tempo'
  | 'mirror'
  | 'boundary'
  | 'fantasy'
  | 'attachment'
  | 'repetition';

export type DimensionLevel = 'H' | 'M' | 'L';

export const XPTI_MODEL_NAMES: Record<XptiModelType, string> = {
  dominance: '主导欲',
  exposure: '情感裸露度',
  sensory: '感官灵敏度',
  tempo: '节奏偏好',
  mirror: '自我镜像',
  boundary: '边界弹性',
  fantasy: '想象纵深',
  attachment: '依附模式',
  repetition: '新鲜 vs 回味',
};

export const XPTI_MODEL_COLORS: Record<XptiModelType, { base: string; light: string; bg: string }> = {
  dominance:  { base: '#9B2C3F', light: '#C2485E', bg: 'rgba(155,44,63,0.10)' },
  exposure:   { base: '#A3526E', light: '#C77B92', bg: 'rgba(163,82,110,0.10)' },
  sensory:    { base: '#B8860B', light: '#D4A843', bg: 'rgba(184,134,11,0.10)' },
  tempo:      { base: '#D06050', light: '#E08878', bg: 'rgba(208,96,80,0.10)' },
  mirror:     { base: '#7E5A8A', light: '#A07DB0', bg: 'rgba(126,90,138,0.10)' },
  boundary:   { base: '#4A8A7A', light: '#6EB0A0', bg: 'rgba(74,138,122,0.10)' },
  fantasy:    { base: '#6A3D9A', light: '#8F60C0', bg: 'rgba(106,61,154,0.10)' },
  attachment: { base: '#C06080', light: '#D88BA0', bg: 'rgba(192,96,128,0.10)' },
  repetition: { base: '#8B6538', light: '#B08860', bg: 'rgba(139,101,56,0.10)' },
};

export const XPTI_DIMENSIONS: XptiDimension[] = [
  {
    id: 'D1', name: '主导欲', model: 'dominance',
    description: '在亲密互动中，你倾向掌控还是交付',
    poleHighLabel: '掌舵者', poleLowLabel: '顺流派',
    levels: {
      H: '你清楚知道自己想要什么节奏，也习惯由你来安排。',
      M: '看对方给什么能量，你可以掌控也可以配合。',
      L: '被带着走的感觉让你更放松，你享受被安排的一切。',
    },
  },
  {
    id: 'D2', name: '情感裸露度', model: 'exposure',
    description: '在亲密关系里，你愿意暴露多少真实的自己',
    poleHighLabel: '直球派', poleLowLabel: '留白派',
    levels: {
      H: '你可以把最狼狈、最真实的那一面交给对方看。',
      M: '有些话可以说，但你会选择合适的时机。',
      L: '你永远保持体面，最深处的自己从不轻易示人。',
    },
  },
  {
    id: 'D3', name: '感官灵敏度', model: 'sensory',
    description: '你对触觉、气味、氛围等感官刺激的响应阈值',
    poleHighLabel: '通感型', poleLowLabel: '慢感型',
    levels: {
      H: '一次不经意的碰触就能让你过电，气味能把你拉回整个场景。',
      M: '你注意到这些细节，但不至于每次都被击中。',
      L: '感官刺激对你来说没那么强烈，你更在意内心的判断。',
    },
  },
  {
    id: 'D4', name: '节奏偏好', model: 'tempo',
    description: '你喜欢慢热铺垫，还是直接跳到最来电的那一刻',
    poleHighLabel: '即刻派', poleLowLabel: '慢热派',
    levels: {
      H: '来电了就要现在，等待对你来说是一种折磨。',
      M: '不急也不拖，顺其自然往前推进。',
      L: '你享受慢慢升温的过程，铺垫越久，到达的时刻越好。',
    },
  },
  {
    id: 'D5', name: '自我镜像', model: 'mirror',
    description: '你需要通过对方的反应来确认自我吸引力的程度',
    poleHighLabel: '镜子型', poleLowLabel: '自足型',
    levels: {
      H: '对方的一句"你好好看"能让你高兴到晚上。',
      M: '赞美会让你开心，但不是你的必需品。',
      L: '你不太需要别人的确认，自己就是自己的镜子。',
    },
  },
  {
    id: 'D6', name: '边界弹性', model: 'boundary',
    description: '在亲密关系里，你的"可以/不可以"边界有多灵活',
    poleHighLabel: '弹力绳', poleLowLabel: '铁闸门',
    levels: {
      H: '你对新体验持开放态度——试一次看看呢？',
      M: '要看具体是什么，以及跟谁。边界存在，但可以谈。',
      L: '不行就是不行。你的底线非常清晰且不可触碰。',
    },
  },
  {
    id: 'D7', name: '想象纵深', model: 'fantasy',
    description: '你脑内剧本的丰富程度，以及对幻想的依赖',
    poleHighLabel: '编剧魂', poleLowLabel: '现实派',
    levels: {
      H: '脑子里的版本永远比现实更精彩，而且有8K画质。',
      M: '偶尔会想一些场景，但不会太依赖幻想。',
      L: '你更关注眼前发生的事，脑子里不太会演连续剧。',
    },
  },
  {
    id: 'D8', name: '依附模式', model: 'attachment',
    description: '你对亲密连接感和陪伴频率的需求程度',
    poleHighLabel: '靠近派', poleLowLabel: '独处派',
    levels: {
      H: '你需要频繁的连接，对方不回消息你会开始编剧本。',
      M: '想念但能忍住，保持适当的距离和联系。',
      L: '个人空间是头等大事，你完全可以一个人过得很好。',
    },
  },
  {
    id: 'D9', name: '新鲜 vs 回味', model: 'repetition',
    description: '你偏好探索新刺激，还是在熟悉中反复深入',
    poleHighLabel: '回味派', poleLowLabel: '冒险派',
    levels: {
      H: '找到了一个好的方式就反复确认，越来越深。',
      M: '一半保留一半尝新，在稳定和新鲜之间取得平衡。',
      L: '你总想试试不一样的，重复对你来说是一种消耗。',
    },
  },
];

export function getXptiDimensionById(id: string): XptiDimension | undefined {
  return XPTI_DIMENSIONS.find(d => d.id === id);
}
