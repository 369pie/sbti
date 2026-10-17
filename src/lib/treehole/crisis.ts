/**
 * Crisis / self-harm support copy shown when risk_level = self_harm.
 * Keep post private; never publish. Warm sister tone, no lecture.
 */

export const CRISIS_HEADLINE = '先把你自己护住';

export const CRISIS_BODY =
  '听起来你现在真的很难受。你写的这些，我们先只留给你自己看，不会公开。如果此刻很危险，请先联系身边信任的人，或拨打下面的援助热线——他们是专门接这类电话的。';

/** Mainland CN + overseas-friendly lines (no affiliation). */
export const CRISIS_HOTLINES: Array<{ region: string; name: string; contact: string }> = [
  { region: '中国大陆', name: '希望24热线', contact: '400-161-9995' },
  { region: '中国大陆', name: '北京心理危机研究与干预中心', contact: '010-82951332' },
  { region: '国际 / 多地', name: 'IASP 资源页（查本地热线）', contact: 'https://www.iasp.info/suicidalthoughts/' },
  { region: '美国', name: '988 Suicide & Crisis Lifeline', contact: '拨打或短信 988' },
];

export function crisisPayload() {
  return {
    headline: CRISIS_HEADLINE,
    body: CRISIS_BODY,
    hotlines: CRISIS_HOTLINES,
  };
}
