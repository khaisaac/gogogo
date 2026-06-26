import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Autentikasi admin ditangani langsung via sesi MySQL + JWT lokal (session_token).
  // Tidak perlu melakukan panggilan proxy Supabase di sini.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
