import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("session_token")?.value;

  const isAdminArea = path.startsWith("/admin");
  const isAdminLogin =
    path.startsWith("/admin/login") || path.startsWith("/admin-login");
  const isProtectedUserArea =
    path.startsWith("/dashboard") || path.startsWith("/my-bookings");

  // Skip public routes
  if (!isAdminArea && !isProtectedUserArea) {
    return NextResponse.next();
  }

  // Allow admin login page
  if (isAdminLogin) {
    return NextResponse.next();
  }

  // Check authentication
  let user = null;
  if (token) {
    user = await verifySessionToken(token);
  }

  // Redirect unauthenticated users
  if (!user && isAdminArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedUserArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check admin role for admin area
  if (user && isAdminArea && !isAdminLogin && user.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("error", "not_admin");
    url.searchParams.set("email", user.email);
    return NextResponse.redirect(url);
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
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     * - api (API routes handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
