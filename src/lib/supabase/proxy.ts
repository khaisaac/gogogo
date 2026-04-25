import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Fail-safe in production: do not crash every request when env is missing.
  if (!supabaseUrl || !supabasePublishableKey) {
    console.warn("Supabase env is missing in proxy. Skipping session update.");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Do NOT use getSession() here.
  // Use getUser() or getClaims() which validates the JWT.
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is not signed in, and they're trying to access a protected route,
  // redirect them to the login page.
  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin");
  const isAdminLogin =
    path.startsWith("/admin/login") || path.startsWith("/admin-login");
  const isProtectedUserArea = path.startsWith("/my-bookings");

  if (!user && isAdminArea && !isAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    return NextResponse.redirect(url);
  }

  if (
    !user &&
    !path.startsWith("/login") &&
    !path.startsWith("/auth") &&
    !path.startsWith("/book") &&
    !path.startsWith("/register") &&
    isProtectedUserArea
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
