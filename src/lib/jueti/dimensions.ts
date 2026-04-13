export interface JuetiDimension {
  id: string;
  name: string;
  model: JuetiModelType;
  description: string;
  poleA: string;
  poleB: string;
  poleALabel: string;
  poleBLabel: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type JuetiModelType = 'tide' | 'root' | 'edge' | 'spark';
export type DimensionLevel = 'H' | 'M' | 'L';

export const JUETI_MODEL_NAMES: Record<JuetiModelType, string> = {
  tide: '潮汐轴',
  root: '锚定轴',
  edge: '界限轴',
  spark: '火焰轴',
};

export const JUETI_MODEL_COLORS: Record<JuetiModelType, { base: string; light: string; bg: string }> = {
  tide:  { base: '#5b8a72', light: '#7eb09a', bg: 'rgba(91,138,114,0.10)' },
  root:  { base: '#8b7355', light: '#b09a78', bg: 'rgba(139,115,85,0.10)' },
  edge:  { base: '#7a6b8a', light: '#a090b0', bg: 'rgba(122,107,138,0.10)' },
  spark: { base: '#b07850', light: '#d09a70', bg: 'rgba(176,120,80,0.10)' },
};

export const JUETI_DIMENSIONS: JuetiDimension[] = [
  {
    id: 'J1', name: '潮汐轴', model: 'tide',
    description: '你的能量是向外涌动还是向内沉淀',
    poleA: 'T', poleB: 'S',
    poleALabel: '涌', poleBLabel: '静',
    levels: {
      H: '你像涨潮——能量向外，先行动再感受，靠输出充电。',
      M: '有时向外有时向内，取决于当天的状态和场合。',
      L: '你像退潮——能量向内，先感受再行动，靠独处充电。',
    },
  },
  {
    id: 'J2', name: '锚定轴', model: 'root',
    description: '你需要确定性的锚还是拥抱未知',
    poleA: 'R', poleB: 'W',
    poleALabel: '根', poleBLabel: '风',
    levels: {
      H: '你需要扎根——计划、确定感、可预期的轨迹让你安心。',
      M: '大方向要有，但细节可以随机应变。',
      L: '你拥抱风——不确定性不是威胁，是自由的另一个名字。',
    },
  },
  {
    id: 'J3', name: '界限轴', model: 'edge',
    description: '你的边界是柔和的还是清晰的',
    poleA: 'O', poleB: 'B',
    poleALabel: '融', poleBLabel: '壁',
    levels: {
      H: '你的边界柔软——容易共情、容易代入、先给予再考虑自己。',
      M: '你可以共情也能抽离，看关系深浅和自己的状态。',
      L: '你的边界清晰——先稳住自己，再决定让谁进来。',
    },
  },
  {
    id: 'J4', name: '火焰轴', model: 'spark',
    description: '你的内在能量是恒定的还是间歇的',
    poleA: 'F', poleB: 'E',
    poleALabel: '焰', poleBLabel: '烬',
    levels: {
      H: '你的火是持续的——慢慢烧、稳定输出，像壁炉里的火。',
      M: '有时候持续有时候间歇，看这件事有多重要。',
      L: '你的火是爆发的——来了倾尽全力，走了就暗下去。',
    },
  },
];

export function getJuetiDimensionById(id: string): JuetiDimension | undefined {
  return JUETI_DIMENSIONS.find(d => d.id === id);
}
