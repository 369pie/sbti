import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withClaimedAuth } from '@/lib/supabase/with-auth';
import {
  CREATOR_APPLICATIONS_TABLE,
  getCreatorApplicationsSchemaDetails,
  isCreatorApplicationsTableMissing,
} from '@/lib/creator/applications';

const TABLE_NAME = CREATOR_APPLICATIONS_TABLE;

function isServerEnvMisconfigured(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Missing Supabase');
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

export const GET = withClaimedAuth(async (_req, _context, user) => {
  try {
    const admin = createAdminSupabaseClient();
    const [applicationResult, creatorResult] = await Promise.all([
      admin
        .from(TABLE_NAME)
        .select(
          'id, name, email, phone, wechat_id, xiaohongshu_handle, content_vertical, wants_free, wants_paid, intro, source_page, status, created_at, updated_at'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
    ]);

    const data = applicationResult.data;
    const error = applicationResult.error;

    if (error) {
      console.error('[creator-applications/me GET] Query failed:', error);
      if (isCreatorApplicationsTableMissing(error)) {
        return getMissingTableErrorResponse();
      }
      return NextResponse.json({ error: '获取申请状态失败' }, { status: 500 });
    }

    if (creatorResult.error) {
      console.error('[creator-applications/me GET] Creator lookup failed:', creatorResult.error);
      return NextResponse.json({ error: '获取创作者开通状态失败' }, { status: 500 });
    }

    const creator = creatorResult.data;

    return NextResponse.json({
      creatorAccess: {
        hasCreator: Boolean(creator),
        creatorId: creator?.id ?? null,
      },
      item: data
        ? {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            wechatId: data.wechat_id,
            xiaohongshuHandle: data.xiaohongshu_handle,
            contentVertical: data.content_vertical,
            wantsFree: data.wants_free,
            wantsPaid: data.wants_paid,
            intro: data.intro,
            sourcePage: data.source_page,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : null,
    });
  } catch (error) {
    console.error('[creator-applications/me GET] Unexpected error:', error);
    if (isServerEnvMisconfigured(error)) {
      return getServerEnvErrorResponse(error);
    }
    return NextResponse.json({ error: '获取申请状态失败' }, { status: 500 });
  }
});
