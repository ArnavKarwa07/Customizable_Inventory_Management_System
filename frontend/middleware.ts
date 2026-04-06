import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("inventory_access_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
