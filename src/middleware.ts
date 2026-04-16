import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, favicon.svg
     * - public folder assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|images/).*)',
  ],
};
