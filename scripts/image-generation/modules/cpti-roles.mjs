import { buildCptiRoleCardPrompt, CPTI_ROLE_CARD_TYPES } from '../../cpti-role-prompts.mjs';

const cptiRoleImageModule = {
  displayName: 'CPTI CP角色图鉴 · 日系乙女角色卡',
  seriesLabel: 'CPTI CP角色图鉴',
  outputPrefix: 'cpti',
  text2imgMode: true,
  seriesTone: '单人CP角色图鉴卡，强调可截图分享的角色识别度、恋爱张力与女性向日系审美，画面干净，文案直接烘焙在卡面里。',
  aspectRatio: '3:4',
  types: CPTI_ROLE_CARD_TYPES.map((type) => ({
    slug: type.slug,
    prompt: buildCptiRoleCardPrompt(type),
  })),
};

export default cptiRoleImageModule;