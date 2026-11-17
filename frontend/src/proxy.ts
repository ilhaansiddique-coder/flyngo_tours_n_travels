import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPrivateImageSource } from './lib/private-file-policy';

const adminRoutes = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/_next/image' && isPrivateImageSource(request.nextUrl.searchParams.get('url') || '')) {
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isAdminRoute) return NextResponse.next();

  const authCookie = request.cookies.get('__Host-flyngo-refresh') || request.cookies.get('flyngo-refresh');
  if (!authCookie?.value) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie presence is only a navigation hint. AdminLayout and the API verify the session and role.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/_next/image'],
};
