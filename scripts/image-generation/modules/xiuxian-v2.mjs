import { XIUXIAN_V2_TYPES, XIUXIAN_V2_STYLE, buildXiuxianV2Prompt } from '../../xiuxian-v2-prompts.mjs';

const REF = 'xiuxian-v2-seed.png';

const xiuxianV2ImageModule = {
  displayName: 'Xiuxian 2.0 Image Generator',
  seriesLabel: '修仙 2.0 首发图鉴',
  outputPrefix: 'xiuxian-v2',
  seriesTone: XIUXIAN_V2_STYLE,
  types: XIUXIAN_V2_TYPES.map((type) => ({
    slug: type.slug,
    ref: REF,
    prompt: buildXiuxianV2Prompt(type.concept),
  })),
};

export default xiuxianV2ImageModule;