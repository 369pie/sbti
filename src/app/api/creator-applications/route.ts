import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/supabase/middleware';
import { withClaimedAuth } from '@/lib/supabase/with-auth';
import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';
import {
  CREATOR_APPLICATIONS_TABLE,
  getCreatorApplicationsSchemaDetails,
  isCreatorApplicationStatus,
  isCreatorApplicationsTableMissing,
  normalizeCreatorApplicationInput,
  validateCreatorApplicationInput,
} from '@/lib/creator/applications';

const TABLE_NAME = CREATOR_APPLICATIONS_TABLE;
const RESETTABLE_STATUSES = new Set(['rejected', 'archived']);

function isServerEnvMisconfigured(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes('Missing Supabase') || error.message.includes(`Missing ${ADMIN_USER_IDS_ENV}`);
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

function getMissingTableErrorResponse() {
  return NextResponse.json(
    {
      error: '当前环境尚未初始化创作者申请数据表，请先执行数据库 schema',
      code: 'DB_SCHEMA_MISSING',
      details: getCreatorApplicationsSchemaDetails(),
    },
    { status: 500 }
  );
}

async function requireAdminUser() {
  if (!hasConfiguredAdminUsers()) {
    return {
      response: NextResponse.json(
        {
          error: '服务端管理员白名单未配置',
          code: 'SERVER_ENV_MISSING',
          details:
            `Missing ${ADMIN_USER_IDS_ENV}. ` +
            'Set this to a comma-separated list of Supabase user IDs allowed to manage creator applications.',
        },
        { status: 500 }
      ),
    };
  }

  const { user } = await getAuthUser();
  if (!user || user.is_anonymous) {
    return {
      response: NextResponse.json({ error: '请先登录管理员账号' }, { status: 401 }),
    };
  }

  if (!isAdminUserId(user.id)) {
    return {
      response: NextResponse.json({ error: '仅管理员可访问' }, { status: 403 }),
    };
  }

  return { user };
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

export const POST = withClaimedAuth(async (req, _context, user) => {
  try {
    const rawBody = await req.json();
    const input = normalizeCreatorApplicationInput(rawBody);
    const validationError = validateCreatorApplicationInput(input);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { data: existingByUser, error: existingByUserError } = await admin
      .from(TABLE_NAME)
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingByUserError) {
      console.error('[creator-applications POST] Existing-by-user query failed:', existingByUserError);
      if (isCreatorApplicationsTableMissing(existingByUserError)) {
        return getMissingTableErrorResponse();
      }
      return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
    }

    let existing = existingByUser;

    if (!existing) {
      const { data: existingByEmail, error: existingByEmailError } = await admin
        .from(TABLE_NAME)
        .select('id, status, created_at')
        .eq('email', input.email)
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingByEmailError) {
        console.error('[creator-applications POST] Existing-by-email query failed:', existingByEmailError);
        if (isCreatorApplicationsTableMissing(existingByEmailError)) {
          return getMissingTableErrorResponse();
        }
        return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
      }

      existing = existingByEmail;
    }

    const nextStatus =
      existing && RESETTABLE_STATUSES.has(existing.status)
        ? 'new'
        : existing?.status ?? 'new';

    const payload = {
      user_id: user.id,
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
      status: nextStatus,
      updated_at: now,
    };

    const { data, error } = existing
      ? await admin
          .from(TABLE_NAME)
          .update(payload)
          .eq('id', existing.id)
          .select('id, status, created_at, updated_at')
          .single()
      : await admin
          .from(TABLE_NAME)
          .insert({
            ...payload,
            created_at: now,
          })
          .select('id, status, created_at, updated_at')
          .single();

    if (error) {
      console.error('[creator-applications POST] Save failed:', error);
      if (isCreatorApplicationsTableMissing(error)) {
        return getMissingTableErrorResponse();
      }
      return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        applicationId: data.id,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        alreadyExists: !!existing,
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('[creator-applications POST] Unexpected error:', error);
    if (isServerEnvMisconfigured(error)) {
      return getServerEnvErrorResponse(error);
    }
    return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
  }
});

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireAdminUser();
    if (response) {
      return response;
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
      if (isCreatorApplicationsTableMissing(error)) {
        return getMissingTableErrorResponse();
      }
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
    const { response } = await requireAdminUser();
    if (response) {
      return response;
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
    const { data: existing, error: existingError } = await admin
      .from(TABLE_NAME)
      .select('id, name, user_id, status')
      .eq('id', id)
      .single();

    if (existingError) {
      console.error('[creator-applications PATCH] Existing item lookup failed:', existingError);
      if (isCreatorApplicationsTableMissing(existingError)) {
        return getMissingTableErrorResponse();
      }
      return NextResponse.json({ error: '未找到对应申请' }, { status: 404 });
    }

    if (status === 'approved') {
      if (!existing.user_id) {
        return NextResponse.json({ error: '该申请未绑定用户账号，无法开通创作者工作台' }, { status: 400 });
      }

      const { data: creator, error: creatorLookupError } = await admin
        .from('creators')
        .select('id')
        .eq('user_id', existing.user_id)
        .limit(1)
        .maybeSingle();

      if (creatorLookupError) {
        console.error('[creator-applications PATCH] Creator lookup failed:', creatorLookupError);
        return NextResponse.json({ error: '开通创作者身份失败，请稍后重试' }, { status: 500 });
      }

      if (!creator) {
        const creatorName = (existing.name || '').trim() || '新创作者';
        const { error: creatorCreateError } = await admin
          .from('creators')
          .insert({
            user_id: existing.user_id,
            name: creatorName.slice(0, 80),
          });

        if (creatorCreateError) {
          console.error('[creator-applications PATCH] Creator auto-provision failed:', creatorCreateError);
          return NextResponse.json({ error: '开通创作者身份失败，请稍后重试' }, { status: 500 });
        }
      }
    }

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
      if (isCreatorApplicationsTableMissing(error)) {
        return getMissingTableErrorResponse();
      }
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
