import { NextResponse, type NextRequest } from 'next/server';
import {
  ApimartImageError,
  isApimartConfigured,
  pollApimartTask,
} from '@/lib/mirror/apimart';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ taskId: string }> };

const TASK_ID_PATTERN = /^[A-Za-z0-9_-]{4,180}$/;

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });
}

export async function GET(request: NextRequest, { params }: Params) {
  if (!isApimartConfigured()) {
    return json({ ok: false, error: '图像生成服务未配置' }, { status: 503 });
  }

  const { taskId } = await params;
  if (!TASK_ID_PATTERN.test(taskId)) {
    return json({ ok: false, error: '任务 ID 不正确' }, { status: 400 });
  }

  maybeCleanup();
  const limit = rateLimit(`mirror-task:${resolveRateLimitKey(request)}`, {
    limit: 90,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return json(
      { ok: false, error: '查询过于频繁，请稍后再试' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) },
      },
    );
  }

  try {
    const task = await pollApimartTask(taskId);
    if (task.status === 'failed' || task.status === 'cancelled') {
      return json({
        ok: false,
        status: task.status,
        progress: task.progress,
        error: task.errorMessage || '图像生成任务失败',
      });
    }

    return json({
      ok: true,
      status: task.status,
      progress: task.progress,
      imageUrl: task.imageUrl,
      expiresAt: task.expiresAt,
    });
  } catch (error) {
    if (error instanceof ApimartImageError) {
      return json(
        { ok: false, error: `图像任务查询失败：${error.message}` },
        { status: error.statusCode },
      );
    }

    return json({ ok: false, error: '图像任务查询失败，请稍后重试' }, { status: 502 });
  }
}
