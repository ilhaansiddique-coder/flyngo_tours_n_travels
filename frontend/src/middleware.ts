import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isAdminRoute) return NextResponse.next();

  const authCookie = request.cookies.get('flyngo-auth');
  if (!authCookie?.value) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const parsed = JSON.parse(authCookie.value);
    if (!parsed?.state?.accessToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = parsed.state?.user?.role;
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
