import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_ROUTES = ['/admin'];
const TECH_ROUTES = ['/technician'];
const USER_ROUTES = ['/dashboard', '/tickets'];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register');
  const protectedPaths = ADMIN_ROUTES.concat(TECH_ROUTES, USER_ROUTES);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const role = token?.role as 'USER' | 'ADMIN' | 'TECHNICIAN' | undefined;

  if (
    !token &&
    (protectedPaths.some((p) => nextUrl.pathname.startsWith(p)) ||
      nextUrl.pathname.startsWith('/chat'))
  ) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (role === 'ADMIN') return NextResponse.next();
  if (role === 'TECHNICIAN') {
    if (ADMIN_ROUTES.some((p) => nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/technician', nextUrl));
    }
    return NextResponse.next();
  }
  if (role === 'USER') {
    if (ADMIN_ROUTES.concat(TECH_ROUTES).some((p) => nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (isAuthRoute && token) {
    const target =
      role === 'ADMIN'
        ? '/admin'
        : role === 'TECHNICIAN'
          ? '/technician'
          : '/dashboard';
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};

