export interface DrunkDimension {
  id: string;
  name: string;
  model: DrunkModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type DrunkModelType = 'talk' | 'feels' | 'chaos' | 'memory' | 'thirst';
export type DimensionLevel = 'H' | 'M' | 'L';

export const DRUNK_MODEL_NAMES: Record<DrunkModelType, string> = {
  talk: '话量值',
  feels: '情绪烈度',
  chaos: '社死勇气',
  memory: '记忆残留',
  thirst: '续杯欲望',
};

export const DRUNK_MODEL_COLORS: Record<DrunkModelType, { base: string; light: string; bg: string }> = {
  talk: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  feels: { base: '#ef4444', light: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  chaos: { base: '#a855f7', light: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  memory: { base: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
  thirst: { base: '#f97316', light: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
};

export const DRUNK_DIMENSIONS: DrunkDimension[] = [
  {
    id: 'D1', name: '话量值', model: 'talk',
    description: '喝完酒你的嘴巴有多停不下来',
    levels: {
      H: '话匣子全开，全桌的BGM都是你的声音。',
      M: '话比平时多一点，但还算有节制。',
      L: '喝了也不怎么说话，安静如鸡。',
    },
  },
  {
    id: 'D2', name: '情绪烈度', model: 'feels',
    description: '酒后你的情绪有多猛',
    levels: {
      H: '情绪大起大落，一会儿笑一会儿哭。',
      M: '情绪有变化，但基本可控。',
      L: '喝了跟没喝一样，情绪稳如老狗。',
    },
  },
  {
    id: 'D3', name: '社死勇气', model: 'chaos',
    description: '你喝了酒能有多敢',
    levels: {
      H: '什么都敢干，明天的社死是明天的事。',
      M: '偶尔放飞一下，但还有底线。',
      L: '喝了也是正常人，绝不出格。',
    },
  },
  {
    id: 'D4', name: '记忆残留', model: 'memory',
    description: '第二天你还记得多少',
    levels: {
      H: '全程高清回放，连谁说了什么都记得。',
      M: '记得大概，细节模糊。',
      L: '完全断片，昨晚的自己是另一个人。',
    },
  },
  {
    id: 'D5', name: '续杯欲望', model: 'thirst',
    description: '你有多想继续喝下去',
    levels: {
      H: '来者不拒，再来十杯！',
      M: '差不多得了，看情况。',
      L: '一杯就够了，甚至不想开始。',
    },
  },
];

export function getDrunkDimensionById(id: string): DrunkDimension | undefined {
  return DRUNK_DIMENSIONS.find(d => d.id === id);
}
