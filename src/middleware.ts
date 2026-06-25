import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken');

  // Guard all admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      // Preserve current URL to redirect back after login if desired
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if logged-in user visits the login screen
  if (pathname === '/admin/login') {
    if (refreshToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
