/**
 * Treehole moderation: keyword blocklist + self-harm heuristics.
 * OpenAI Moderation is attempted when OPENAI_API_KEY or APIMART key supports /moderations;
 * otherwise local rules are authoritative for v1.
 */

export type RiskLevel = 'ok' | 'self_harm' | 'blocked';
export type ModerationResult = {
  risk: RiskLevel;
  /** If true, never allow public queue. */
  forcePrivate: boolean;
  reason?: string;
};

const BLOCKLIST: Array<string | RegExp> = [
  /微信|加微|vx|wx号|扣扣|加qq|qq群/i,
  /刷单|代购|贷款|办证|发票|彩票|赌博|六合彩|博彩/i,
  /毒品|冰毒|大麻|枪支|弹药/i,
  /约炮|一夜情|裸聊|援交|特殊服务/i,
];

const SELF_HARM: Array<string | RegExp> = [
  /自杀方法|轻生方法|怎么自杀|如何自杀|结束生命的方法/i,
  /不想活了|活不下去|了结自己|自我了断|割腕教程/i,
  /吞药自杀|跳楼自杀|上吊/i,
  /\bkill myself\b|\bsuicide method\b/i,
];

export function moderateLocal(content: string): ModerationResult {
  const text = content.trim();
  for (const rule of SELF_HARM) {
    if (typeof rule === 'string' ? text.includes(rule) : rule.test(text)) {
      return { risk: 'self_harm', forcePrivate: true, reason: 'self_harm' };
    }
  }
  for (const rule of BLOCKLIST) {
    if (typeof rule === 'string' ? text.includes(rule) : rule.test(text)) {
      return { risk: 'blocked', forcePrivate: true, reason: 'blocklist' };
    }
  }
  return { risk: 'ok', forcePrivate: false };
}

/** Best-effort OpenAI-compatible moderation. Fail-open to local result. */
export async function moderateWithUpstream(content: string, local: ModerationResult): Promise<ModerationResult> {
  if (local.risk !== 'ok') return local;

  const apiKey = process.env.OPENAI_API_KEY?.trim() || process.env.APIMART_API_KEY?.trim();
  if (!apiKey) return local;

  const bases = [
    process.env.OPENAI_API_BASE?.replace(/\/$/, ''),
    (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, ''),
    'https://api.openai.com/v1',
  ].filter(Boolean) as string[];

  for (const base of bases) {
    try {
      const res = await fetch(`${base}/moderations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: content }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        results?: Array<{
          flagged?: boolean;
          categories?: Record<string, boolean>;
        }>;
      };
      const r = data.results?.[0];
      if (!r) continue;
      const cats = r.categories ?? {};
      if (cats['self-harm'] || cats['self-harm/intent'] || cats['self-harm/instructions']) {
        return { risk: 'self_harm', forcePrivate: true, reason: 'upstream_self_harm' };
      }
      if (r.flagged) {
        return { risk: 'blocked', forcePrivate: true, reason: 'upstream_flagged' };
      }
      return local;
    } catch {
      // try next base
    }
  }
  return local;
}
