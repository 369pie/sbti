import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { computeCompletenessPct } from '@/lib/her/profile-flags';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, nickname, birthYear } = body as {
      username?: string;
      password?: string;
      email?: string;
      nickname?: string;
      birthYear?: number;
    };

    // ── Validate ──
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: '请输入用户名' }, { status: 400 });
    }
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return NextResponse.json({ error: '用户名需要2-20个字符' }, { status: 400 });
    }
    if (!/^[\w\u4e00-\u9fff\u3040-\u30ff]+$/.test(trimmedUsername)) {
      return NextResponse.json({ error: '用户名只能包含字母、数字、下划线或中文' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }
    if (password.length < 6 || password.length > 72) {
      return NextResponse.json({ error: '密码需要6-72位' }, { status: 400 });
    }

    const trimmedEmail = email?.trim() || '';
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    const trimmedNickname = nickname?.trim() || '';
    if (trimmedNickname.length > 30) {
      return NextResponse.json({ error: '昵称最多30个字符' }, { status: 400 });
    }

    // 14+ only (docs/01-strategy/wtfti-her-refocus-2026-10.md §8).
    const thisYear = new Date().getFullYear();
    if (!Number.isInteger(birthYear) || birthYear! < thisYear - 100 || birthYear! > thisYear) {
      return NextResponse.json({ error: '请填写出生年份' }, { status: 400 });
    }
    if (thisYear - birthYear! < 14) {
      return NextResponse.json({ error: 'WTFTI 目前只对 14 岁以上开放' }, { status: 403 });
    }

    // ── Create user via admin client (bypasses email confirmation) ──
    const authEmail = trimmedEmail || `${trimmedUsername}@wtfti.local`;
    const admin = createAdminSupabaseClient();

    // Anonymous archive (one-tap from /start) — carry it into the new account.
    let anonArchive: {
      has_persona?: boolean;
      has_color_season?: boolean;
      has_palm?: boolean;
      has_face?: boolean;
      color_season?: string | null;
      palm_summary?: Record<string, unknown> | null;
    } | null = null;
    // Test results saved on the anonymous archive (POST /api/her/archive) travel with it.
    let anonTests: { wtfti_tests?: unknown; wtfti_persona?: unknown } = {};
    try {
      const preSession = await createServerSupabaseClient();
      const { data: pre } = await preSession.auth.getUser();
      if (pre.user?.is_anonymous) {
        const { data: row } = await admin
          .from('her_profiles')
          .select('has_persona, has_color_season, has_palm, has_face, color_season, palm_summary')
          .eq('user_id', pre.user.id)
          .maybeSingle();
        anonArchive = (row as typeof anonArchive) ?? null;
        const meta = pre.user.user_metadata ?? {};
        if (meta.wtfti_tests) anonTests = { wtfti_tests: meta.wtfti_tests, wtfti_persona: meta.wtfti_persona };
      }
    } catch {
      anonArchive = null;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: trimmedUsername,
        nickname: trimmedNickname,
        display_name: trimmedNickname || trimmedUsername,
        has_real_email: !!trimmedEmail,
        birth_year: birthYear,
        ...anonTests,
      },
    });

    if (error) {
      if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
        return NextResponse.json({ error: '该用户名已被注册' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || '注册失败' }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
    }

    // P0 archive stub: upsert her_profiles so birth_year lives on a real table.
    const { error: profileError } = await admin.from('her_profiles').upsert(
      {
        user_id: data.user.id,
        birth_year: birthYear,
        nickname: trimmedNickname || trimmedUsername,
        ...(anonArchive ?? {}),
        completeness_pct: computeCompletenessPct({ birth_year: birthYear, ...(anonArchive ?? {}) }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (profileError) {
      // Non-fatal: user exists; ops can backfill. Log for migration readiness.
      console.error('[api/auth/register] her_profiles upsert failed', profileError.message);
    }

    const supabase = await createServerSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (signInError) {
      return NextResponse.json({
        success: true,
        userId: data.user.id,
        autoSignedIn: false,
        archiveCreated: !profileError,
      archiveCarried: !!anonArchive,
      });
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      autoSignedIn: true,
      archiveCreated: !profileError,
      archiveCarried: !!anonArchive,
    });
  } catch (err) {
    console.error('[api/auth/register] unexpected error:', err);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
