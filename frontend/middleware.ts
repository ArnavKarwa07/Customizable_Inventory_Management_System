import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/"];

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/products",
  "/inventory",
  "/orders",
  "/warehouses",
  "/profile",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get token from cookie or headers
  const accessToken = request.cookies.get("inventory_access_token")?.value;

  // If accessing protected route without token, redirect to login
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !accessToken
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing public auth routes with token, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If on home page with token, redirect to dashboard
  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
