import { getHermosaTopicWeek, isHermosaTopicWeek } from './tags';

export interface HermosaTopicConfig {
  week: string;
  question: string;
  shortTitle: string;
  bookTitle: string;
  wallpaperTitle: string;
  aiLabTitle: string;
  xhsPrompt: string;
  // HER AURORA · W2 · 守光人主持卡：可选守光人代号（如 ARIA / IRIS / NOVA），
  // 用于 topic band 显示「守光人 · X 提问」。无值时 fallback 为「守光人」。
  host?: string;
  // 守光人主持时的一句话引语（可空）；显示于问题下方，aurora-keeper 灰。
  hostNote?: string;
}

export const HERMOSA_TOPIC_CONFIGS: HermosaTopicConfig[] = [
  {
    week: '2026-W19',
    question: '女性如何用 AI 增加自己的选择权？',
    shortTitle: 'AI 与选择权',
    bookTitle: '关于选择权的她的书架',
    wallpaperTitle: '把选择权写成壁纸',
    aiLabTitle: 'AI 选择权问题池',
    xhsPrompt: '写下一句你希望 AI 帮女性夺回选择权的场景。',
    host: 'ARIA',
    hostNote: '不评价、不打分。我会把这一周里被我挂念过的光，挑七束写进五月号「极光来信」。',
  },
];

const FALLBACK_TOPIC: HermosaTopicConfig = {
  week: getHermosaTopicWeek(),
  question: '女性如何把自己的经验变成可共享的知识？',
  shortTitle: '经验成为知识',
  bookTitle: '她的共读书架',
  wallpaperTitle: '她说周精选',
  aiLabTitle: 'AI 共学问题池',
  xhsPrompt: '写下一个值得被更多女性保存的问题或句子。',
};

export function getHermosaTopic(week: string | null | undefined): HermosaTopicConfig {
  if (week && isHermosaTopicWeek(week)) {
    return HERMOSA_TOPIC_CONFIGS.find((topic) => topic.week === week) ?? {
      ...FALLBACK_TOPIC,
      week,
    };
  }
  return getCurrentHermosaTopic();
}

export function getCurrentHermosaTopic(date = new Date()): HermosaTopicConfig {
  const week = getHermosaTopicWeek(date);
  return HERMOSA_TOPIC_CONFIGS.find((topic) => topic.week === week) ?? {
    ...FALLBACK_TOPIC,
    week,
  };
}
