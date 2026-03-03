import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/board", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim() || null;
  }

  const cookieToken = request.cookies.get("tutorflow_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/board/:path*", "/admin/:path*"],
};
