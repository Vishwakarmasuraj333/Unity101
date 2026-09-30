import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'unity101_admin_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'unity101_default_fallback_session_secret_2026'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* paths except /admin/login
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // If user is accessing login page while already authenticated, redirect to dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // If user is accessing protected admin page while NOT authenticated, redirect to login
  if (!isLoginPage && !isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete(COOKIE_NAME);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
