import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getAdminTokenFromRequest,
  isCreatorAdminTokenValid,
  isCreatorApplicationStatus,
  normalizeCreatorApplicationInput,
  validateCreatorApplicationInput,
} from '@/lib/creator/applications';

const TABLE_NAME = 'creator_applications';

function isServerEnvMisconfigured(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes('Missing Supabase') || error.message.includes('Missing CREATOR_ADMIN_TOKEN');
}

function getServerEnvErrorResponse(error: unknown) {
  const details = error instanceof Error ? error.message : 'Missing required server environment variables';
  return NextResponse.json(
    {
      error: '服务端环境变量未配置完整，请联系管理员',
      code: 'SERVER_ENV_MISSING',
      details,
    },
    { status: 500 }
  );
}

function requireCreatorAdminTokenConfigured() {
  if (!process.env.CREATOR_ADMIN_TOKEN?.trim()) {
    throw new Error('Missing CREATOR_ADMIN_TOKEN. Set this in local env or deployment settings.');
  }
}

function getPagination(searchParams: URLSearchParams) {
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') ?? '20', 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 1), 100) : 20;

  return {
    page: safePage,
    pageSize: safePageSize,
    from: (safePage - 1) * safePageSize,
    to: safePage * safePageSize - 1,
  };
}

export async function POST(req: NextRequest) {
  try {
    requireCreatorAdminTokenConfigured();

    const rawBody = await req.json();
    const input = normalizeCreatorApplicationInput(rawBody);
    const validationError = validateCreatorApplicationInput(input);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await admin
      .from(TABLE_NAME)
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        wechat_id: input.wechatId ?? null,
        xiaohongshu_handle: input.xiaohongshuHandle ?? null,
        content_vertical: input.contentVertical ?? null,
        wants_free: input.wantsFree,
        wants_paid: input.wantsPaid,
        intro: input.intro ?? null,
        source_page: input.sourcePage ?? null,
        status: 'new',
        created_at: now,
        updated_at: now,
      })
      .select('id, status, created_at')
      .single();

    if (error) {
      console.error('[creator-applications POST] Insert failed:', error);
      return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        applicationId: data.id,
        status: data.status,
        createdAt: data.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[creator-applications POST] Unexpected error:', error);
    if (isServerEnvMisconfigured(error)) {
      return getServerEnvErrorResponse(error);
    }
    return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    requireCreatorAdminTokenConfigured();

    const token = getAdminTokenFromRequest(req);
    if (!isCreatorAdminTokenValid(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.trim();
    const { page, pageSize, from, to } = getPagination(searchParams);

    const admin = createAdminSupabaseClient();
    let query = admin
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all' && isCreatorApplicationStatus(status)) {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.or(
        [
          `name.ilike.%${q}%`,
          `email.ilike.%${q}%`,
          `wechat_id.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
          `xiaohongshu_handle.ilike.%${q}%`,
        ].join(',')
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[creator-applications GET] Query failed:', error);
      return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
    }

    return NextResponse.json({
      items: data ?? [],
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
      },
    });
  } catch (error) {
    console.error('[creator-applications GET] Unexpected error:', error);
    if (isServerEnvMisconfigured(error)) {
      return getServerEnvErrorResponse(error);
    }
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireCreatorAdminTokenConfigured();

    const token = getAdminTokenFromRequest(req);
    if (!isCreatorAdminTokenValid(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: string;
      status?: string;
      adminNote?: string;
    };

    const id = body.id?.trim();
    const status = body.status?.trim();
    const adminNote = body.adminNote?.trim() ?? '';

    if (!id) {
      return NextResponse.json({ error: '缺少申请 ID' }, { status: 400 });
    }

    if (!isCreatorApplicationStatus(status)) {
      return NextResponse.json({ error: '无效状态' }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();

    const { data, error } = await admin
      .from(TABLE_NAME)
      .update({
        status,
        admin_note: adminNote.length > 0 ? adminNote.slice(0, 2000) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[creator-applications PATCH] Update failed:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('[creator-applications PATCH] Unexpected error:', error);
    if (isServerEnvMisconfigured(error)) {
      return getServerEnvErrorResponse(error);
    }
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
