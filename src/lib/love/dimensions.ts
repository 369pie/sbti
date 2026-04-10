export interface LoveDimension {
  id: string;
  name: string;
  model: LoveModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type LoveModelType = 'depend' | 'jealous' | 'brain' | 'secure' | 'drama';
export type DimensionLevel = 'H' | 'M' | 'L';

export const LOVE_MODEL_NAMES: Record<LoveModelType, string> = {
  depend: '依赖度',
  jealous: '吃醋指数',
  brain: '恋爱脑等级',
  secure: '安全感',
  drama: '作妖指数',
};

export const LOVE_MODEL_COLORS: Record<LoveModelType, { base: string; light: string; bg: string }> = {
  depend: { base: '#f43f5e', light: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
  jealous: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  brain: { base: '#ec4899', light: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  secure: { base: '#10b981', light: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  drama: { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
};

export const LOVE_DIMENSIONS: LoveDimension[] = [
  {
    id: 'L1', name: '依赖度', model: 'depend',
    description: '你在恋爱里有多黏人',
    levels: {
      H: '24小时想和对方待在一起，手机不回秒慌。',
      M: '需要陪伴但也能独处，关键时刻必须在。',
      L: '独立到让人怀疑你是不是单身，恋爱也不影响自我空间。',
    },
  },
  {
    id: 'L2', name: '吃醋指数', model: 'jealous',
    description: '你的醋坛子有多大',
    levels: {
      H: '对方跟路人多说一句话你都能写三千字小作文。',
      M: '该吃的醋还是要吃，但不至于疑神疑鬼。',
      L: '你把另一半借给朋友逗乐都不带眨眼的。',
    },
  },
  {
    id: 'L3', name: '恋爱脑等级', model: 'brain',
    description: '恋爱对你来说有多重要',
    levels: {
      H: '恋爱就是全世界，为了对方可以放弃一切。',
      M: '爱情很重要，但不至于丢了自己。',
      L: '搞事业！恋爱是锦上添花，不是必需品。',
    },
  },
  {
    id: 'L4', name: '安全感', model: 'secure',
    description: '你在亲密关系里有多踏实',
    levels: {
      H: '内心稳如老狗，不太会因为小事焦虑。',
      M: '大部分时候还好，偶尔也会胡思乱想。',
      L: '24小时原地焦虑，已读不回等于被甩。',
    },
  },
  {
    id: 'L5', name: '作妖指数', model: 'drama',
    description: '你在感情里有多能折腾',
    levels: {
      H: '没事找事是本能，觉得不作不是真感情。',
      M: '偶尔小作怡情，大部分时候还是讲道理的。',
      L: '佛系恋爱，能沟通就绝不吵架。',
    },
  },
];

export function getLoveDimensionById(id: string): LoveDimension | undefined {
  return LOVE_DIMENSIONS.find(d => d.id === id);
}
