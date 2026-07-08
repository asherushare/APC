import { NextResponse } from 'next/server';

export function middleware() {
  // Bypassed middleware-level cookie authentication checks since the frontend Vercel deployment 
  // cannot read the cross-origin HttpOnly 'refreshToken' cookie set on the Render backend domain.
  // Gating and route protection are fully handled client-side in layout.tsx and individual page views.
  return NextResponse.next();
}

export const config = {
  matcher: ['/staff-portal/:path*'],
};
