import { WTFTI_CLASSIC_TYPES, WTFTI_TONE, buildWtftiClassicPrompt } from '../../wtfti-classic-prompts.mjs';

// 种子图（先生成一张基准图后放到 public/images/types/ 目录下）
// 生成种子图的 prompt 见 docs/wtfti-classic-visual-spec.md § 5.2
const REF = 'wtfti-classic-seed.png';

const wtftiClassicImageModule = {
  displayName: 'WTFTI 经典宇宙 · 潮玩盲盒图鉴',
  seriesLabel: 'WTFTI 经典宇宙',
  outputPrefix: 'wtfti-classic',
  seriesTone: WTFTI_TONE,
  types: WTFTI_CLASSIC_TYPES.map((type) => ({
    slug: type.slug,
    ref: REF,
    prompt: buildWtftiClassicPrompt(type.concept),
  })),
};

export default wtftiClassicImageModule;
