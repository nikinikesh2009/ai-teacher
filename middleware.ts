import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_PROTECTED_PATHS = ["/dashboard", "/board"];
const ADMIN_PATH_PREFIX = "/admin";

function getTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim() || null;
  }
  return request.cookies.get("tutorflow_token")?.value ?? null;
}

function getAdminTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim() || null;
  }
  return request.cookies.get("tutorflow_admin_token")?.value ?? null;
}

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: require admin cookie (except /admin/login). Token is verified in API routes (Node).
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    if (isAdminLoginPath(pathname)) {
      return NextResponse.next();
    }
    const adminToken = getAdminTokenFromRequest(request);
    if (!adminToken || adminToken.length === 0) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // User routes: require user token
  if (USER_PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix))) {
    const token = getTokenFromRequest(request);
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/board/:path*", "/admin/:path*"],
};
