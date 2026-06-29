import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken');

  const publicPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

  // Guard all admin routes except public ones
  if (pathname.startsWith('/admin') && !publicPaths.includes(pathname)) {
    if (!refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      // Preserve current URL to redirect back after login if desired
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if logged-in user visits any public screen
  if (publicPaths.includes(pathname)) {
    if (refreshToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
