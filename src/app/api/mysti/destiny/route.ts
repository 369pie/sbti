/**
 * 命书馆 API — POST /api/mysti/destiny
 *
 * 内测期（2026-05-05~）：
 *  · APIMART_API_KEY 存在 → 调 OpenAI-compatible chat 端点（apimart.ai）
 *  · 否则 → 返回 stub 数据 + stub: true 标记
 *  · 不真实扣费（Q2 接顾问审稿后正式收费）
 */

import { NextResponse } from 'next/server';
import { buildDestinyPrompt, DESTINY_PROMPT_VERSION, type DestinyInput } from '@/lib/mysti/destiny/prompt';
import { STUB_DESTINY_REPORT } from '@/lib/mysti/destiny/stub';
import type { DestinyApiResponse, DestinyReport } from '@/lib/mysti/destiny/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TEXT_MODEL = process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

function isValidInput(body: unknown): body is DestinyInput {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (typeof b.solarDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.solarDate)) return false;
  if (typeof b.birthTime !== 'string' || !/^\d{2}:\d{2}$/.test(b.birthTime)) return false;
  if (typeof b.birthplace !== 'string' || b.birthplace.length === 0 || b.birthplace.length > 80) return false;
  if (b.gender !== 'female' && b.gender !== 'male') return false;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === 'string' && record[key].length > 0;
}

function hasArray(record: Record<string, unknown>, key: string): boolean {
  return Array.isArray(record[key]);
}

function isDomainCard(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return hasString(value, 'claim') && hasString(value, 'votes') && hasString(value, 'source');
}

function isDestinyReport(value: unknown): value is DestinyReport {
  if (!isRecord(value)) return false;

  const chart = value.chart;
  if (!isRecord(chart)) return false;
  const chartFields = [
    'fourPillars',
    'dayMaster',
    'monthlyOrder',
    'structure',
    'regulator',
    'trueSolarTimeNote',
  ];
  if (!chartFields.every((field) => hasString(chart, field))) return false;

  const blindReading = value.blindReading;
  if (!isRecord(blindReading) || !hasString(blindReading, 'summary') || !hasArray(blindReading, 'predictions')) {
    return false;
  }

  const validation = value.validation;
  if (!isRecord(validation) || !hasArray(validation, 'matchedEvents') || !hasArray(validation, 'conflicts')) {
    return false;
  }

  const currentReading = value.currentReading;
  if (
    !isRecord(currentReading) ||
    !isDomainCard(currentReading.career) ||
    !isDomainCard(currentReading.wealth) ||
    !isDomainCard(currentReading.relationship) ||
    !isDomainCard(currentReading.health)
  ) {
    return false;
  }

  const futureFlow = value.futureFlow;
  if (!isRecord(futureFlow) || !hasString(futureFlow, 'currentLuckCycle') || !hasArray(futureFlow, 'keyYears')) {
    return false;
  }

  return hasArray(value, 'uncertainties') && hasString(value, 'disclaimer');
}

function withMeta(report: DestinyReport, stub: boolean): DestinyReport {
  return {
    ...report,
    meta: {
      promptVersion: stub ? `${DESTINY_PROMPT_VERSION}-stub` : DESTINY_PROMPT_VERSION,
      generatedAt: Date.now(),
      stub,
      evidenceMode: stub ? 'stub' : 'model_cited',
      reviewStatus: 'unreviewed',
    },
  };
}

function tryExtractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    // try to find first { ... last }
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<DestinyApiResponse>({ ok: false, error: '无效的请求体' }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return NextResponse.json<DestinyApiResponse>(
      { ok: false, error: '请检查出生日期 / 时辰 / 出生地 / 性别' },
      { status: 400 },
    );
  }

  const apiKey = process.env.APIMART_API_KEY?.trim();

  // No API key → stub mode（演示）
  if (!apiKey) {
    return NextResponse.json<DestinyApiResponse>({
      ok: true,
      stub: true,
      report: withMeta(STUB_DESTINY_REPORT, true),
    });
  }

  const messages = buildDestinyPrompt(body);

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      // 命书生成可能耗时较久；不给硬超时，由 Vercel Function 默认超时控制
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[destiny] upstream error', res.status, errText.slice(0, 300));
      // upstream 失败 fallback stub，避免演示页空白
      return NextResponse.json<DestinyApiResponse>({
        ok: true,
        stub: true,
        report: withMeta({
          ...STUB_DESTINY_REPORT,
          uncertainties: [
            `LLM 上游调用失败（HTTP ${res.status}），返回演示数据。`,
            ...STUB_DESTINY_REPORT.uncertainties,
          ],
        }, true),
      });
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? '';
    const parsed = tryExtractJson(text);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('[destiny] could not parse JSON from LLM:', text.slice(0, 300));
      return NextResponse.json<DestinyApiResponse>({
        ok: true,
        stub: true,
        report: withMeta({
          ...STUB_DESTINY_REPORT,
          uncertainties: [
            'LLM 输出未通过 JSON 解析，已回退到演示数据。',
            ...STUB_DESTINY_REPORT.uncertainties,
          ],
        }, true),
      });
    }

    if (!isDestinyReport(parsed)) {
      console.warn('[destiny] parsed JSON failed report shape validation');
      return NextResponse.json<DestinyApiResponse>({
        ok: true,
        stub: true,
        report: withMeta({
          ...STUB_DESTINY_REPORT,
          uncertainties: [
            'LLM 输出结构未通过命书 schema 校验，已回退到演示数据。',
            ...STUB_DESTINY_REPORT.uncertainties,
          ],
        }, true),
      });
    }

    return NextResponse.json<DestinyApiResponse>({
      ok: true,
      stub: false,
      report: withMeta(parsed, false),
    });
  } catch (err) {
    console.warn('[destiny] fetch failed', err);
    return NextResponse.json<DestinyApiResponse>({
      ok: true,
      stub: true,
      report: withMeta({
        ...STUB_DESTINY_REPORT,
        uncertainties: [
          'LLM 网络请求异常，返回演示数据。',
          ...STUB_DESTINY_REPORT.uncertainties,
        ],
      }, true),
    });
  }
}
