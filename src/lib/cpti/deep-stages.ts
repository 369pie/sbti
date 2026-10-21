/** Public stage labels for the CPTI deep stage selector (no paid copy here). */
export type RelationshipStage =
  | 'dating'
  | 'cohabiting'
  | 'married'
  | 'long-distance'
  | 'parenting'
  | 'open';

export const RELATIONSHIP_STAGES: ReadonlyArray<{
  id: RelationshipStage;
  label: string;
  desc: string;
}> = [
  { id: 'dating',        label: '约会期',     desc: '还在试探 · 暧昧 · 情侣 < 6 个月' },
  { id: 'cohabiting',    label: '同居期',     desc: '住在一起 · 还没领证' },
  { id: 'married',       label: '已婚 / 长期', desc: '婚姻或 ≥ 2 年稳定关系' },
  { id: 'long-distance', label: '异地',       desc: '不同城市 / 国家' },
  { id: 'parenting',     label: '育儿期',     desc: '孩子 0–10 岁，关系被吞噬' },
  { id: 'open',          label: '开放 / 多元', desc: 'Open / poly / queer / DINK' },
];

