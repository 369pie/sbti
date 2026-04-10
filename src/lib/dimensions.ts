export interface Dimension {
  id: string;
  name: string;
  model: ModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type ModelType = 'self' | 'emotion' | 'attitude' | 'action' | 'social';
export type DimensionLevel = 'H' | 'M' | 'L';

export const MODEL_NAMES: Record<ModelType, string> = {
  self: '自我模型',
  emotion: '情感模型',
  attitude: '态度模型',
  action: '行动驱力模型',
  social: '社交模型',
};

export const MODEL_COLORS: Record<ModelType, { base: string; light: string; bg: string }> = {
  self: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  emotion: { base: '#f43f5e', light: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
  attitude: { base: '#10b981', light: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  action: { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  social: { base: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
};

export const DIMENSIONS: Dimension[] = [
  {
    id: 'S1', name: '自尊自信', model: 'self',
    description: '看你对自己的评价是否稳定',
    levels: {
      H: '心里对自己大致有数，不太会被路人一句话打散。',
      M: '时好时坏，状态好的时候觉得自己天下无敌，低谷的时候怀疑人生。',
      L: '经常觉得自己不够好，别人一句话就能让你内耗半天。',
    },
  },
  {
    id: 'S2', name: '自我清晰度', model: 'self',
    description: '认不认识自己',
    levels: {
      H: '对自己的脾气、欲望和底线都算门儿清。',
      M: '有时候清楚自己要什么，有时候又很迷茫。',
      L: '经常搞不懂自己为什么生气、为什么难过。',
    },
  },
  {
    id: 'S3', name: '核心价值', model: 'self',
    description: '内心到底有没有特别要紧的东西',
    levels: {
      H: '很容易被目标、成长或某种重要信念推着往前。',
      M: '有想要的东西，但不至于为它拼命。',
      L: '活着就行，没什么非做不可的事。',
    },
  },
  {
    id: 'E1', name: '依恋安全感', model: 'emotion',
    description: '在关系里容易焦虑还是安心',
    levels: {
      H: '更愿意相信关系本身，不会被一点风吹草动吓散。',
      M: '大体安心，但偶尔也会有点不确定感冒出来。',
      L: '很容易在关系里不安，总觉得对方可能会离开。',
    },
  },
  {
    id: 'E2', name: '情感投入度', model: 'emotion',
    description: '投入到什么程度',
    levels: {
      H: '爱就全情投入，眼里只有对方。',
      M: '会投入，但会给自己留后手，不至于全盘梭哈。',
      L: '感情上比较克制，很少让自己深陷。',
    },
  },
  {
    id: 'E3', name: '边界与依赖', model: 'emotion',
    description: '是否需要独立空间',
    levels: {
      H: '空间感很重要，再爱也得留一块属于自己的地。',
      M: '黏一点也行，独处一下也行，看心情。',
      L: '很需要另一半的陪伴，离开久了会焦虑。',
    },
  },
  {
    id: 'A1', name: '世界观倾向', model: 'attitude',
    description: '怎么看这个世界',
    levels: {
      H: '相信世界基本是善良的，事情总会变好。',
      M: '既不天真也不彻底阴谋论，观望是你的本能。',
      L: '觉得这个世界挺操蛋的，不太信任外界。',
    },
  },
  {
    id: 'A2', name: '规则与灵活度', model: 'attitude',
    description: '是谨慎守序还是灵活冲动',
    levels: {
      H: '秩序感较强，能按流程来就不爱即兴炸场。',
      M: '该守规矩守规矩，必要的时候也能灵活一下。',
      L: '规则就是用来打破的，框架里待着太憋屈。',
    },
  },
  {
    id: 'A3', name: '人生意义感', model: 'attitude',
    description: '有没有方向感',
    levels: {
      H: '做事更有方向，知道自己大概要往哪边走。',
      M: '大方向有，但经常走着走着就拐弯了。',
      L: '活一天算一天，意义什么的想多了头疼。',
    },
  },
  {
    id: 'Ac1', name: '动机导向', model: 'action',
    description: '做事更偏进攻还是规避',
    levels: {
      H: '更容易被成果、成长和推进感点燃。',
      M: '有动力但不持久，容易被别的事带走注意力。',
      L: '做事主要为了避免出问题，不太追求极致。',
    },
  },
  {
    id: 'Ac2', name: '决策风格', model: 'action',
    description: '做决定果不果断',
    levels: {
      H: '拍板速度快，决定一下就不爱回头磨叽。',
      M: '大事会想想，小事随便选，取决于情况。',
      L: '选择困难症晚期，能让别人决定就不自己拍板。',
    },
  },
  {
    id: 'Ac3', name: '执行模式', model: 'action',
    description: '计划能不能落下来',
    levels: {
      H: '推进欲比较强，事情不落地心里都像卡了根刺。',
      M: '能做但不急，时间线弹性比较大。',
      L: '计划是不可能做计划的，做了也是摆设。',
    },
  },
  {
    id: 'So1', name: '社交主动性', model: 'social',
    description: '会不会主动靠近人',
    levels: {
      H: '人群就是我的主场，主动出击是基本操作。',
      M: '有人来就接，没人来也不硬凑，社交弹性一般。',
      L: '能线上解决的事绝不见面，社恐本恐。',
    },
  },
  {
    id: 'So2', name: '人际边界感', model: 'social',
    description: '边界感强不强',
    levels: {
      H: '边界感偏强，靠太近会先本能性后退半步。',
      M: '分人分场合，熟了边界就松了。',
      L: '和谁都能自来熟，边界感这东西不太有。',
    },
  },
  {
    id: 'So3', name: '表达与真实度', model: 'social',
    description: '在不同关系里有多真实',
    levels: {
      H: '表里如一，在谁面前都差不多，不太会演。',
      M: '会看气氛说话，真实和体面通常各留一点。',
      L: '人前人后完全两样，社交面具切换自如。',
    },
  },
];

export function getDimensionById(id: string): Dimension | undefined {
  return DIMENSIONS.find(d => d.id === id);
}

export function getDimensionsByModel(model: ModelType): Dimension[] {
  return DIMENSIONS.filter(d => d.model === model);
}
