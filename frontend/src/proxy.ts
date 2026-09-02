import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminRoutes = ['/admin'];

export function proxy(request: NextRequest) {
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
    // A *known* non-admin role is a definite no.
    if (userRole && userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // A *missing* role is not. The cookie only caches the profile after the
    // post-login /users/me call succeeds, so a network blip there left a real
    // admin holding a valid token with no role — and this redirected them to
    // the homepage forever, with no way to reach their own panel. Fall through
    // and let AdminLayout resolve the role against the API; it renders nothing
    // and redirects to /auth/login if the check fails.
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
