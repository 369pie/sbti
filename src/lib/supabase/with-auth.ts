import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './middleware';
import type { User } from '@supabase/supabase-js';

type AuthedHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  user: User
) => Promise<NextResponse>;

export function withAuth(handler: AuthedHandler) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const { user, error } = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: error ?? 'Authentication required', needsAnonymousSignIn: true },
        { status: 401 }
      );
    }
    
    return handler(req, context, user);
  };
}
