import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path === '/signup' || 
    path.startsWith('/waitlist') || 
    path.includes('/_next') || 
    path.includes('/api/');

  // Get the token from the cookies
  const token = request.cookies.get('access_token')?.value || '';

  // If the path requires authentication and there's no token, redirect to login
  if (!isPublicPath && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated but trying to access login/signup, redirect to home
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. All static files (e.g. favicon.ico, robots.txt, manifest.json)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
