import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
const sessionCookie = "institute-management-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const hasSession = request.cookies.has(sessionCookie);

  if (!isPublicRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
