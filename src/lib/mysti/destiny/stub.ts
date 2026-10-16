/**
 * 命书馆 stub 数据 — 当 LLM API 不可用时的 fallback 演示数据
 * 仅用于 MVP 内测期；正式上线后应移除
 */
import type { DestinyReport } from './types';

export const STUB_DESTINY_REPORT: DestinyReport = {
  chart: {
    fourPillars: '丁未 辛亥 壬辰 甲辰',
    dayMaster: '壬水（阳水）',
    monthlyOrder: '亥月得令通根，身强偏旺',
    structure: '食神生财格（出自《子平真诠》卷二格局篇）',
    regulator: '亥月壬水以丁火为调候用神，年干丁火透出（出自《穷通宝鉴》壬水亥月篇）',
    trueSolarTimeNote: '出生地经度差 +14 分钟，已校正为真太阳时',
  },
  blindReading: {
    summary: '天干一路相生（辛→壬→甲→丁），印生身、身生食、食生财，飞轮天生贯通；地支无冲无刑，主长寿稳健。',
    predictions: [
      { ageRange: '24-33 岁', claim: '事业起势期，宜进不宜守，重大职业转折出现在大运交接年', confidence: '高', source: '徐乐吾《子平粹言》卷三 大运论' },
      { ageRange: '34-43 岁', claim: '财运上升期，但需警惕合化导致的责任牵引', confidence: '中', source: '梁湘润《子平基础概要》生旺库篇' },
    ],
  },
  validation: {
    matchedEvents: [],
    conflicts: [],
    confidenceScore: '6.5',
  },
  currentReading: {
    career: {
      claim: '当前大运食神生财，适合做"个人创造力 → 商业转化"的工作（写作、设计、独立产品）',
      votes: '3/4',
      voters: ['徐乐吾', '梁湘润', '袁树珊'],
      minority: '韦千里持不同意见：身强食神略泄，建议借助合作而非单打独斗',
      source: '《子平真诠》食神篇 + 《八字提要》强弱平衡章',
    },
    wealth: {
      claim: '财源稳定但不爆发，长线投资优于短线',
      votes: '4/4',
      voters: ['徐乐吾', '梁湘润', '袁树珊', '韦千里'],
      source: '《滴天髓阐微》财官篇',
    },
    relationship: {
      claim: '丁壬合化木为喜，关系中宜以柔承刚；正官未透，需主动经营',
      votes: '2/4',
      minority: '袁树珊与韦千里认为夫妻宫辰土被合，配偶性格强势',
      source: '《命理探原》夫妻宫篇 / 《千里命稿》合化论',
      voters: ['徐乐吾', '梁湘润'],
    },
    health: {
      claim: '水旺需注意肾、膀胱、内分泌；调候用丁火不可缺，注意保暖',
      votes: '4/4',
      voters: ['徐乐吾', '梁湘润', '袁树珊', '韦千里'],
      source: '《穷通宝鉴》壬水亥月调候篇',
    },
  },
  futureFlow: {
    currentLuckCycle: '当前大运 甲寅（34-43 岁），食神坐禄，整体利好',
    keyYears: [
      { year: 2026, age: 33, rating: '利好', reason: '丙午流年，财星明透，逢食神生发', source: '《滴天髓》流年论' },
      { year: 2027, age: 34, rating: '高危', reason: '丁未流年与原局丁未年柱伏吟，注意合作变动', source: '梁湘润五道筛子 · 伏吟篇' },
      { year: 2028, age: 35, rating: '平稳', reason: '戊申流年印星帮身，适合稳扎稳打', source: '《子平真诠》流年论' },
    ],
    monthlyHighRisk: [
      { yearMonth: '2026-08', warning: '丙申月与流年丙午合化，财动则身忙，注意健康', source: '袁树珊十六字法 · 流月推演' },
    ],
  },
  uncertainties: [
    '感情维度四家分歧较大（2/4 共识），建议结合实际情感经历再判定',
    '大运起算法各家略有差异（顺逆排），本盘按主流男命阳年顺排女命阴年逆排处理',
    '本命书未接入典籍 RAG（Q2 升级），出处描述基于通用命理知识，精确度待提升',
  ],
  disclaimer: '本命书为娱乐参考，不构成医疗、法律、投资或人生重大决策建议。命理学描述潜力空间和风险窗口，不是剧本。梁湘润有言："命理大约只有百分之六、七十的或然律。"',
  meta: {
    promptVersion: '2026-05-05-stub',
    generatedAt: Date.now(),
    stub: true,
  },
};
