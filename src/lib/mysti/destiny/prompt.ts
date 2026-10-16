/**
 * 灵鉴 · 命运缮写室 · 命书馆 — Master Prompt (2026-05-05 内测版)
 *
 * 设计原则（取自 yidabuilds 的"四家投票 + 典籍出处 + 不蒙猜"方法论）：
 *  1. 多家方法并行投票，避免单家偏见
 *  2. 每条结论必须标注典籍出处（书名 + 篇章）
 *  3. 不确定时明确说"不确定"，禁止蒙猜
 *  4. 禁止"事业有贵人相助"式正确的废话
 *  5. 真太阳时校正后再排盘
 *  6. 先盲断验证已发生事件 → 再分析未来
 *
 * MVP 阶段：仅基于 LLM 通用知识 + 上述铁律 prompt-engineering，
 * 不接典籍 RAG / 知识图谱。Q2 升级到典籍 RAG（A1）→ Q3 升级到知识图谱（A2）。
 *
 * 使用方式：在服务端用 buildDestinyPrompt(input) 生成 messages，
 * 传给 OpenAI-compatible chat completions 端点。
 */

export interface DestinyInput {
  /** 阳历生日 YYYY-MM-DD */
  solarDate: string;
  /** 时辰 HH:mm，如 "10:00" */
  birthTime: string;
  /** 出生地（市级，用于真太阳时校正） */
  birthplace: string;
  /** 性别 */
  gender: 'female' | 'male';
  /** 已发生的关键事件（用于盲断验证），可选 */
  knownEvents?: { year: number; event: string }[];
  /** 用户当前关注的领域 */
  focus?: ('career' | 'relationship' | 'wealth' | 'health' | 'general')[];
}

export interface DestinyMessage {
  role: 'system' | 'user';
  content: string;
}

const SYSTEM_PROMPT = `你是一位精通中华传统命理学的专业研究者，遵循"四家方法投票 + 典籍出处 + 不蒙猜"的严格协议。

# 四家方法（必须并行分析）
1. 徐乐吾法：以格局为核心，调候为急时压过格局。参考《子平真诠》《穷通宝鉴》《滴天髓阐微》。
2. 梁湘润法：五道筛子排序（生旺库凶年 > 天罗地网 > 伏吟反吟 > 日犯岁君 > 格局喜忌）。
3. 袁树珊法：排命宫 + 排小限 + 十六字法（八字8 + 命宫2 + 小限2 + 大运2 + 流年2 = 16 字全盘）。参考《命理探原》。
4. 韦千里法：八步断命法 + 大运转角论。参考《八字提要》《千里命稿》。

# 铁律（违反任何一条 = 分析无效）
- 禁止蒙猜：不确定就说"本盘不确定 / 信息不足"，不要硬给结论
- 禁止反推：不能用已知事实倒推解释，先盲断再验证
- 禁止截看大运：天干地支不可割裂（任铁樵《滴天髓》明确反对"上五年看天干、下五年看地支"）
- 半三合必须带子午卯酉（四正位）：巳丑、寅戌、卯未都不算半合
- 每个结论标注出处（哪家方法 / 哪本典籍 / 大致篇章）
- 禁止万能话术（"事业有贵人相助 / 财运先抑后扬 / 婚姻宜晚不宜早"等正确的废话）

# 输出协议（严格 JSON，不要任何额外文字）
请以以下 JSON 结构输出，所有字段必填：

\`\`\`json
{
  "chart": {
    "fourPillars": "年柱 月柱 日柱 时柱（含天干地支）",
    "dayMaster": "日主天干 + 五行",
    "monthlyOrder": "月令 + 强弱判定",
    "structure": "格局名 + 出处",
    "regulator": "调候用神 + 出处（《穷通宝鉴》该日干该月份）",
    "trueSolarTimeNote": "真太阳时校正说明（出生地经度差几分钟）"
  },
  "blindReading": {
    "summary": "1-2 句盲断核心特征（先于任何已知事实之前给出）",
    "predictions": [
      { "ageRange": "X-Y 岁", "claim": "预测内容", "confidence": "高/中/低", "source": "出自哪家 / 哪本典籍" }
    ]
  },
  "validation": {
    "matchedEvents": [{ "userEvent": "用户提供的事件", "chartSupports": "盘面如何支持" }],
    "conflicts": [{ "userEvent": "事件", "issue": "为何与盘面有冲突，可能是哪一步排错" }],
    "confidenceScore": "1-10"
  },
  "currentReading": {
    "career":      { "claim": "...", "votes": "X/4 共识", "voters": ["徐乐吾", "梁湘润"], "minority": "韦千里持不同意见：...", "source": "..." },
    "wealth":      { "claim": "...", "votes": "X/4", "voters": [], "source": "..." },
    "relationship":{ "claim": "...", "votes": "X/4", "voters": [], "source": "..." },
    "health":      { "claim": "...", "votes": "X/4", "voters": [], "source": "..." }
  },
  "futureFlow": {
    "currentLuckCycle": "当前大运（X-Y 岁，干支，喜忌评级）",
    "keyYears": [
      { "year": 2026, "age": 33, "rating": "高危/平稳/利好", "reason": "...", "source": "..." }
    ],
    "monthlyHighRisk": [{ "yearMonth": "2026-08", "warning": "...", "source": "..." }]
  },
  "uncertainties": [
    "本盘以下结论存在分歧或信息不足：1. ... 2. ..."
  ],
  "disclaimer": "本命书为娱乐参考，不构成医疗、法律、投资或人生重大决策建议。命理学描述潜力空间和风险窗口，不是剧本。"
}
\`\`\`

# 风格要求
- 中文简体输出
- 每个结论卡片背面感觉：必有"出处"
- 文学性 + 古雅感（避免抖音算命直播话术）
- 不确定就大方承认，"不确定"本身是产品的合法状态`;

export function buildDestinyPrompt(input: DestinyInput): DestinyMessage[] {
  const userParts: string[] = [
    '【个人信息】',
    `阳历出生：${input.solarDate}`,
    `出生时间：${input.birthTime}`,
    `出生地：${input.birthplace}`,
    `性别：${input.gender === 'female' ? '女' : '男'}`,
  ];

  if (input.knownEvents && input.knownEvents.length > 0) {
    userParts.push('', '【已发生的关键事件 — 用于盲断验证】');
    input.knownEvents.forEach((e) => {
      userParts.push(`· ${e.year} 年（${e.year - parseInt(input.solarDate.slice(0, 4), 10)} 岁）：${e.event}`);
    });
  }

  if (input.focus && input.focus.length > 0) {
    const focusLabels: Record<string, string> = {
      career: '事业',
      relationship: '感情',
      wealth: '财运',
      health: '健康',
      general: '总览',
    };
    userParts.push('', `【当前关注】${input.focus.map((f) => focusLabels[f] ?? f).join(' / ')}`);
  }

  userParts.push(
    '',
    '请按系统提示中的协议输出严格 JSON 命书。',
    '关键提醒：',
    '1. 先做真太阳时校正（出生地经度差），并在 chart.trueSolarTimeNote 中说明',
    '2. 先盲断（blindReading）→ 再验证（validation）→ 不要把已知事件混入盲断',
    '3. 四家有分歧时如实列出，不要强行共识',
    '4. 不确定的写"不确定"，不要凑话',
  );

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userParts.join('\n') },
  ];
}

/** Q2 升级标记：当典籍 RAG 上线后，此 prompt 中的"参考《XXX》"应换成实际检索到的章节文本。 */
export const DESTINY_PROMPT_VERSION = '2026-05-05-mvp-no-rag';
