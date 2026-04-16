import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, nickname } = body as {
      username?: string;
      password?: string;
      email?: string;
      nickname?: string;
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

    // ── Create user via admin client (bypasses email confirmation) ──
    const authEmail = trimmedEmail || `${trimmedUsername}@wtfti.local`;
    const admin = createAdminSupabaseClient();

    // Try to create — if the placeholder email already exists, Supabase will reject it
    // (getUserByEmail was removed in newer supabase-js versions)

    const { data, error } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true, // Auto-confirm — no verification email needed
      user_metadata: {
        username: trimmedUsername,
        nickname: trimmedNickname,
        display_name: trimmedNickname || trimmedUsername,
        has_real_email: !!trimmedEmail,
      },
    });

    if (error) {
      // Handle duplicate email
      if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
        return NextResponse.json({ error: '该用户名已被注册' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || '注册失败' }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
    }

    // ── Auto-sign in the new user via the regular client ──
    const supabase = await createServerSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (signInError) {
      // User created but auto-login failed — still redirect to login
      return NextResponse.json({
        success: true,
        userId: data.user.id,
        autoSignedIn: false,
      });
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      autoSignedIn: true,
    });
  } catch (err) {
    console.error('[api/auth/register] unexpected error:', err);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
